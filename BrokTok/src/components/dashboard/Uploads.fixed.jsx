import { useState, useEffect } from "react";
import { Trash2, Eye, Upload, Filter, Search } from "lucide-react";
import useAuth from '../../hooks/useAuth';
import useExpenses from '../../hooks/useExpenses';
import Sidebar from '../common/Sidebar';
import { useNavigate } from "react-router-dom";
import * as api from '../../services/api';
import CreateExpenseFromReceiptModal from './CreateExpenseFromReceiptModal';

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ReceiptGallery() {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        isCollapsed ? "ml-0" : "ml-0 md:ml-64"
      )}>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Receipt Gallery
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your uploaded receipts and expenses
            </p>
          </div>

          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search receipts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-full rounded-lg pl-10 pr-4 py-2.5 text-sm",
                    "border border-slate-200 bg-white text-slate-900 placeholder-slate-400",
                    "transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
                    "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500",
                    "dark:focus:border-indigo-500 dark:focus:ring-indigo-700"
                  )}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="rounded-lg bg-white px-4 py-2 shadow-sm dark:bg-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Total: </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {receipts.length}
                </span>
              </div>
              {loading && (
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loading...
                </span>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-950/30">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); loadReceipts(); }}
                className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* Bulk Actions */}
          {selected.length > 0 && (
            <div className="mb-6 flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {selected.length} item{selected.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={deleteSelected}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-all",
                  "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                )}
              >
                <Trash2 size={16} /> Delete Selected
              </button>
            </div>
          )}

          {/* Empty State */}
          {receipts.length === 0 && !loading && (
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-800">
              <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No receipts uploaded yet. Start by uploading your first receipt!
              </p>
            </div>
          )}

          {/* Grid */}
          {receipts.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "group rounded-lg border transition-all duration-200",
                    "bg-white dark:bg-slate-800",
                    selected.includes(r.id)
                      ? "ring-2 ring-indigo-500 shadow-lg border-indigo-200 dark:border-indigo-700"
                      : "border-slate-200 hover:shadow-md dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  {/* Image Container */}
                  <div className="relative bg-slate-100 dark:bg-slate-900 h-40 overflow-hidden rounded-t-lg">
                    {r.fileUrl ? (
                      <img
                        src={r.fileUrl}
                        alt={r.merchant}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                        <Upload size={32} />
                      </div>
                    )}

                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="absolute top-2 left-2 w-4 h-4 cursor-pointer accent-indigo-600"
                    />

                    {/* Preview Button */}
                    <button
                      onClick={() => setPreview(r)}
                      className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded shadow hover:shadow-md transition backdrop-blur-sm"
                    >
                      <Eye size={16} className="text-slate-600 dark:text-slate-300" />
                    </button>

                    {/* Processed Badge */}
                    {r.isProcessed && (
                      <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1">
                        ✓ Processed
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                        {r.merchant}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {r.date}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {r.amount ? `₹${r.amount.toFixed(2)}` : 'N/A'}
                      </span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded font-medium">
                        {r.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {receipts.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all",
                  "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95",
                  "dark:bg-indigo-500 dark:hover:bg-indigo-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  'Load More Receipts'
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 z-10"
            >
              ✕
            </button>
            {preview.fileUrl && (
              <img
                src={preview.fileUrl}
                alt={preview.merchant}
                className="w-full h-auto"
              />
            )}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {preview.merchant}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Date</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{preview.date}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Amount</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    ₹{preview.amount?.toFixed(2) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Category</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{preview.category}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Status</p>
                  <p className={cn(
                    "font-medium",
                    preview.isProcessed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  )}>
                    {preview.isProcessed ? "Processed" : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ReceiptGallery;
