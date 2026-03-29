import { useState, useEffect } from "react";
import { Trash2, Eye } from "lucide-react";
import useAuth from '../../hooks/useAuth';
import useExpenses from '../../hooks/useExpenses';
import Sidebar from '../common/Sidebar';
import { useNavigate } from "react-router-dom";
import * as api from '../../services/api';
import CreateExpenseFromReceiptModal from './CreateExpenseFromReceiptModal';

function ReceiptGallery() {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();
  const { addExpense } = useExpenses();

  // fetch receipts
  useEffect(() => {
    loadReceipts();
  }, [page]);

  const loadReceipts = async () => {
    setLoading(true);

    try {
      const token = await getToken()
      const response = await api.getReceipts(page, token)
      if (response?.error) {
        throw new Error(response.error)
      }

      const rows = response?.data || [];
      const normalized = rows.map(r => ({
        id: r.id,
        image: r.fileUrl || r.image || r.file_url || (`/uploads/${r.savedFileName || r.file_name || ''}`),
        merchant: (r.extractedData && (r.extractedData.text || '').split('\n')[0]) || (r.extracted_data && (r.extracted_data.text || '').split('\n')[0]) || r.fileName || 'Receipt',
        date: (r.extractedData && r.extractedData.dates && r.extractedData.dates[0]) || (r.extracted_data && r.extracted_data.dates && r.extracted_data.dates[0]) || (r.uploadedAt || new Date().toISOString().split('T')[0]),
        amount: (r.extractedData && r.extractedData.total) || (r.extracted_data && r.extracted_data.total) || r.amount || null,
        ocr: r.extractedData || r.extracted_data || r.ocr || null,
      }))
      
      setReceipts((prev) => [...prev, ...normalized])
    } catch (error) {
      console.error("Failed to load receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    // delete receipts on backend then remove locally
    if (selected.length === 0) return

    try {
      const token = await getToken()  // ✅ Get fresh token for each operation
      const deleteResults = await Promise.all(selected.map(async (id) => {
        const res = await api.deleteReceipt(id, token)
        return { id, ok: !res?.error }
      }))

      const successCount = deleteResults.filter(r => r.ok).length
      if (successCount === selected.length) {
        setReceipts((prev) => prev.filter((r) => !selected.includes(r.id)))
        setSelected([])
      } else {
        alert(`Failed to delete ${selected.length - successCount} receipts`)    
      }
    } catch (err) {
      console.error('Failed to delete receipts', err)
      alert('Failed to delete some receipts')
    }
  };

  // Upload handling - now only via drag-drop in Dashboard
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReceiptForExpense, setSelectedReceiptForExpense] = useState(null);

  const updateCategory = (id, category) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, category } : r
      )
    );
  };

  const filtered = receipts.filter((r) =>
    r.merchant.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Receipt Gallery
        </h2>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search receipts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between mb-4 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg">
          <span className="text-sm text-indigo-700">
            {selected.length} selected
          </span>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1 text-red-500 text-sm"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="border rounded-xl overflow-hidden hover:shadow-md transition"
          >
            {/* image */}
            <div className="relative">
              <img
                src={r.fileUrl || r.image}
                alt={r.merchant}
                loading="lazy"
                className="h-40 w-full object-cover"
              />

              <input
                type="checkbox"
                checked={selected.includes(r.id)}
                onChange={() => toggleSelect(r.id)}
                className="absolute top-2 left-2 w-4 h-4"
              />

              <button
                onClick={() => setPreview(r)}
                className="absolute top-2 right-2 bg-white p-1 rounded shadow"
              >
                <Eye size={16} />
              </button>
            </div>

            {/* info */}
            <div className="p-4 space-y-1">
              <p className="font-medium text-gray-800">
                {r.merchant}
              </p>

              <p className="text-sm text-gray-400">{r.date}</p>

              <div className="flex justify-between items-center mt-2">
                <span className="text-indigo-600 font-semibold">
                  ₹{r.amount}
                </span>

                <select
                  value={r.category}
                  onChange={(e) =>
                    updateCategory(r.id, e.target.value)
                  }
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option>Food</option>
                  <option>Travel</option>
                  <option>Shopping</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-6">
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>

      {/* Preview Modal with Create Expense Action */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <img
              src={preview.fileUrl || preview.image}
              alt=""
              className="rounded-lg mb-4 w-full max-h-64 object-cover"
            />

            <h3 className="font-semibold text-lg">
              {preview.merchant}
            </h3>
            <p className="text-gray-500">{preview.date}</p>
            <p className="text-indigo-600 font-semibold mt-2">
              ₹{preview.amount?.toFixed(2) || 'N/A'}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPreview(null)
                  setShowCreateModal(true)
                  setSelectedReceiptForExpense(preview)
                }}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600"
              >
                Create Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Expense from Receipt Modal */}
      {showCreateModal && selectedReceiptForExpense && (
        <CreateExpenseFromReceiptModal
          receipt={selectedReceiptForExpense}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedReceiptForExpense(null)
          }}
          onCreate={async (payload) => {
            try {
              setLoading(true)
              await addExpense(payload)
              setShowCreateModal(false)
              setSelectedReceiptForExpense(null)
            } catch (err) {
              console.error('Create expense failed', err)
              alert('Failed to create expense from receipt')
            } finally {
              setLoading(false)
            }
          }}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-400 text-center mt-6">
          No receipts found.
        </p>
      )}
    </div>
  );
}

// ─── Wrapper with Sidebar ─────────────────────────────────────────────────────
export default function UploadsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        currentUser={user?.email || 'User'}
        onLogout={logout}
      />

      {/* Page content */}
      <main className={`flex-1 px-9 py-12 pb-20 transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-0 md:ml-64'}`}>
        <div className="max-w-6xl">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Uploads</h1>
          <p className="text-sm text-gray-400 mb-6">Manage your uploaded receipts</p>
          <ReceiptGallery />
        </div>
      </main>
    </div>
  );
}