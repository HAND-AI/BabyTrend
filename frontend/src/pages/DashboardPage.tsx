import React, { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import RecordTable, { Pagination } from '../components/RecordTable';
import authService, { UploadRecord } from '../services/auth';

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

  const handleViewDetails = (record: UploadRecord) => {
    // In a real app, this would open a modal or navigate to details page
    alert(`View details for ${record.filename}\nStatus: ${record.status}\nItems: ${record.items?.length || 0}`);
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
              </select>
            </div>
          </div>
        </div>

        <RecordTable
          records={uploads}
          loading={loading}
          onViewDetails={handleViewDetails}
          showUserColumn={false}
          showActions={true}
        />

        {pagination && pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            hasNext={pagination.has_next}
            hasPrev={pagination.has_prev}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 