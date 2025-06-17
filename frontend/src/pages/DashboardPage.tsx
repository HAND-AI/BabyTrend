import React, { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import RecordTable, { Pagination } from '../components/RecordTable';
import authService, { UploadRecord } from '../services/auth';

interface EditModalProps {
  isOpen: boolean;
  record: UploadRecord | null;
  itemIndex: number | null;
  itemData: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  record,
  itemIndex,
  itemData,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<any>(itemData);

  if (!isOpen || !record || itemIndex === null) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-medium mb-4">Edit Item #{itemIndex + 1}</h3>
        <form onSubmit={handleSubmit}>
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key}
              </label>
              <input
                type="text"
                value={value as string}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    record: UploadRecord | null;
    itemIndex: number | null;
    itemData: any;
  }>({
    isOpen: false,
    record: null,
    itemIndex: null,
    itemData: null
  });

  useEffect(() => {
    loadUploads();
  }, [currentPage, statusFilter]);

  const loadUploads = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.getUserUploads(currentPage, statusFilter || undefined);
      setUploads(response.uploads);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    // File selected - could show preview or validation info
    console.log('File selected:', file.name);
  };

  const handleUpload = async (file: File) => {
    setUploadLoading(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    try {
      const response = await authService.uploadPackingList(file, (progress) => {
        setUploadProgress(progress);
      });

      setSuccessMessage(`File uploaded successfully! Status: ${response.status}`);
      
      // Refresh the uploads list
      loadUploads();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (record: UploadRecord) => {
    try {
      const blob = await authService.downloadOriginalFile(record.id);
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid response format');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (record: UploadRecord) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }

    try {
      await authService.deleteUpload(record.id);
      setSuccessMessage('Upload deleted successfully');
      loadUploads();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditItem = (record: UploadRecord, itemIndex: number) => {
    setEditModal({
      isOpen: true,
      record,
      itemIndex,
      itemData: record.items[itemIndex]
    });
  };

  const handleSaveItem = async (data: any) => {
    if (!editModal.record || editModal.itemIndex === null) return;

    try {
      const response = await authService.updateUploadItem(
        editModal.record.id,
        editModal.itemIndex,
        data
      );
      setSuccessMessage('Item updated successfully');
      setEditModal({
        isOpen: false,
        record: null,
        itemIndex: null,
        itemData: null
      });
      loadUploads();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your packing lists and track their processing status.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700">
              ×
            </button>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <FileUploader
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
          loading={uploadLoading}
          progress={uploadProgress}
          title="Upload Packing List"
          description="Select an Excel file containing your packing list data"
        />
      </div>

      {/* Upload History Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Upload History</h2>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <RecordTable
          records={uploads}
          loading={loading}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onEditItem={handleEditItem}
          showUserColumn={false}
          showActions={true}
        />

        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
              hasNext={pagination.has_next}
              hasPrev={pagination.has_prev}
            />
          </div>
        )}
      </div>

      <EditModal
        isOpen={editModal.isOpen}
        record={editModal.record}
        itemIndex={editModal.itemIndex}
        itemData={editModal.itemData}
        onClose={() => setEditModal({
          isOpen: false,
          record: null,
          itemIndex: null,
          itemData: null
        })}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default DashboardPage; 