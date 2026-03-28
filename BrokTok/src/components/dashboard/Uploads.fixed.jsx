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
  const [selected, setSelected] = useState([]); // Track selected IDs
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getToken } = useAuth();
  const { addExpense } = useExpenses();

  // Fetch receipts when page changes
  useEffect(() => {
    loadReceipts();
  }, [page]);

  const loadReceipts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      console.log('📸 [Uploads] Loading receipts from API...');
      
      const response = await api.getReceipts(page, token);
      console.log('📸 [Uploads] API response:', response);
      
      if (response?.error) {
        throw new Error(response.error);
      }

      const rows = response?.data || [];
      console.log('📸 [Uploads] Raw receipts count:', rows.length);

      // Normalize receipt data - FIX: Extract _id properly and handle all field variations
      const normalized = rows.map((r, idx) => {
        try {
          // MongoDB returns _id, ensure we capture it
          const receiptId = r._id || r.id;
          if (!receiptId) {
            console.warn('⚠️ Receipt missing ID at index', idx);
            return null;
          }

          // Extract amount - check both old and new field names
          const amount = 
            r.extractedData?.amount !== undefined ? r.extractedData.amount :
            r.extractedData?.total !== undefined ? r.extractedData.total :
            r.extracted_data?.amount !== undefined ? r.extracted_data.amount :
            r.extracted_data?.total !== undefined ? r.extracted_data.total :
            r.amount || null;

          // Extract date - handle ISO strings and arrays
          let date = 
            r.extractedData?.date ||
            r.extractedData?.dates?.[0] ||
            r.extracted_data?.date ||
            r.extracted_data?.dates?.[0] ||
            r.uploadedAt;

          // Normalize date to YYYY-MM-DD format
          if (date) {
            if (typeof date === 'string') {
              if (date.includes('T')) {
                date = date.split('T')[0]; // ISO string to date only
              }
            } else if (date instanceof Date) {
              date = date.toISOString().split('T')[0];
            }
          } else {
            date = new Date().toISOString().split('T')[0];
          }

          // Extract merchant - try multiple sources
          let merchant = r.extractedData?.merchant;
          if (!merchant && r.extractedData?.text) {
            merchant = r.extractedData.text.split('\n')[0];
          }
          if (!merchant && r.extracted_data?.merchant) {
            merchant = r.extracted_data.merchant;
          }
          if (!merchant && r.extracted_data?.text) {
            merchant = r.extracted_data.text.split('\n')[0];
          }
          merchant = merchant || r.fileName || 'Receipt';

          // Extract category
          const category = 
            r.extractedData?.category ||
            r.extracted_data?.category ||
            'Other';

          const normalized = {
            id: receiptId,
            fileUrl: r.fileUrl || r.image || r.file_url || null,
            merchant: String(merchant).slice(0, 60),
            date: String(date),
            amount: amount ? parseFloat(amount) : null,
            category: String(category),
            ocr: r.extractedData || r.extracted_data || null,
            fileName: r.fileName,
            isProcessed: Boolean(r.isProcessed),
            createdAt: r.createdAt || r.uploadedAt
          };

          console.log('📸 Normalized receipt:', {
            id: normalized.id,
            amount: normalized.amount,
            date: normalized.date,
            merchant: normalized.merchant
          });
          
          return normalized;
        } catch (err) {
          console.error('Failed to normalize receipt at index', idx, ':', err);
          return null;
        }
      }).filter(Boolean); // Remove null entries

      console.log('📸 [Uploads] Normalized', normalized.length, 'receipts successfully');
      setReceipts((prev) => page === 1 ? normalized : [...prev, ...normalized]);
    } catch (error) {
      console.error('❌ [Uploads] Failed to load receipts:', error);
      setError(error.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  // Toggle checkbox - FIX: Properly track individual checkboxes by ID
  const toggleSelect = (id) => {
    console.log('Toggling select for ID:', id, 'Current selected:', selected);
    setSelected((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      console.log('New selected:', newSelected);
      return newSelected;
    });
  };

  // Delete selected receipts
  const deleteSelected = async () => {
    if (selected.length === 0) {
      alert('Please select receipts to delete');
      return;
    }

    if (!window.confirm(`Delete ${selected.length} receipt(s)? This cannot be undone.`)) {
      return;
    }

    try {
      const token = await getToken();
      console.log('🗑️ [Uploads] Deleting', selected.length, 'receipts:', selected);
      
      // Delete all selected in parallel
      const deleteResults = await Promise.all(
        selected.map(async (id) => {
          try {
            const res = await api.deleteReceipt(id, token);
            return { id, success: !res?.error, error: res?.error };
          } catch (err) {
            return { id, success: false, error: err.message };
          }
        })
      );

      const successful = deleteResults.filter(r => r.success);
      const failed = deleteResults.filter(r => !r.success);

      console.log('🗑️ Delete results:', { successful: successful.length, failed: failed.length });

      if (successful.length > 0) {
        // Remove successfully deleted receipts from state
        const deletedIds = successful.map(r => r.id);
        setReceipts((prev) => prev.filter((r) => !deletedIds.includes(r.id)));
        setSelected([]);
        
        if (failed.length > 0) {
          alert(`Deleted ${successful.length} receipts. Failed to delete ${failed.length} receipts.`);
        } else {
          alert(`Successfully deleted ${successful.length} receipts`);
        }
      } else {
        alert('Failed to delete receipts');
      }
    } catch (err) {
      console.error('❌ [Uploads] Error deleting receipts:', err);
      alert('Error deleting receipts: ' + err.message);
    }
  };

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
          Receipt Gallery ({receipts.length})
        </h2>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search receipts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => loadReceipts()}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}
      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between mb-4 bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-lg">
          <span className="text-sm font-medium text-indigo-700">
            {selected.length} item{selected.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm transition"
          >
            <Trash2 size={16} /> Delete Selected
          </button>
        </div>
      )}

      {/* Empty State */}
      {receipts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3 opacity-30">📄</div>
          <p className="text-gray-500 text-sm">No receipts uploaded yet. Upload a receipt to get started!</p>
        </div>
      )}

      {/* Grid */}
      {receipts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`border rounded-xl overflow-hidden transition cursor-pointer ${
                selected.includes(r.id)
                  ? 'ring-2 ring-indigo-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              {/* Image */}
              <div className="relative bg-gray-100 h-40 overflow-hidden">
                {r.fileUrl ? (
                  <img
                    src={r.fileUrl}
                    alt={r.merchant}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">📄</div>
                )}

                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => toggleSelect(r.id)}
                  className="absolute top-2 left-2 w-5 h-5 cursor-pointer"
                />

                {/* Preview Button */}
                <button
                  onClick={() => setPreview(r)}
                  className="absolute top-2 right-2 bg-white p-1.5 rounded shadow hover:shadow-md transition"
                >
                  <Eye size={16} />
                </button>

                {r.isProcessed && (
                  <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    ✓ Processed
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <p className="font-medium text-gray-800 truncate">
                  {r.merchant}
                </p>

                <p className="text-sm text-gray-500">{r.date}</p>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold text-indigo-600">
                    {r.amount ? `₹${r.amount.toFixed(2)}` : 'N/A'}
                  </span>

                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {r.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {receipts.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(page + 1)}
            disabled={loading}
            className="px-6 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
export default ReceiptGallery;
