import React, { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import RecordTable, { Pagination } from '../components/RecordTable';
import authService, { UploadRecord, PriceListResponse, DutyRateResponse } from '../services/auth';

const AdminPage: React.FC = () => {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [priceList, setPriceList] = useState<PriceListResponse['prices']>([]);
  const [dutyRates, setDutyRates] = useState<DutyRateResponse['rates']>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [activeTab, setActiveTab] = useState<'uploads' | 'price-list' | 'duty-rates'>('uploads');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    record: UploadRecord | null;
    action: 'approve' | 'reject' | null;
    comment: string;
  }>({
    isOpen: false,
    record: null,
    action: null,
    comment: ''
  });

  useEffect(() => {
    if (activeTab === 'uploads') {
      loadUploads();
    } else if (activeTab === 'price-list') {
      loadPriceList();
    } else if (activeTab === 'duty-rates') {
      loadDutyRates();
    }
    loadStats();
  }, [currentPage, statusFilter, activeTab, searchTerm]);

  const loadUploads = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.getAllUploads(currentPage, statusFilter || undefined);
      setUploads(response.uploads);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPriceList = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.getPriceList(currentPage, searchTerm);
      setPriceList(response.prices);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDutyRates = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.getDutyRates(currentPage, searchTerm);
      setDutyRates(response.rates);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authService.getAdminStats();
      setStats(response);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
  };

  const handlePriceListUpload = async (file: File) => {
    setUploadLoading(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    try {
      const response = await authService.uploadPriceList(file, (progress) => {
        setUploadProgress(progress);
      });

      setSuccessMessage(`Price list updated successfully! ${response.updated_items} items updated.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDutyRateUpload = async (file: File) => {
    setUploadLoading(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    try {
      const response = await authService.uploadDutyRate(file, (progress) => {
        setUploadProgress(progress);
      });

      setSuccessMessage(`Duty rates updated successfully! ${response.updated_items} items updated.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  const handleViewDetails = (record: UploadRecord) => {
    // In a real app, this would open a detailed modal
    alert(`View details for ${record.filename}\nUser: ${(record as any).username}\nStatus: ${record.status}\nItems: ${record.items?.length || 0}`);
  };

  const handleReview = (record: UploadRecord) => {
    setReviewModal({
      isOpen: true,
      record,
      action: null,
      comment: ''
    });
  };

  const handleReviewSubmit = async () => {
    if (!reviewModal.record || !reviewModal.action) return;

    try {
      await authService.reviewUpload(
        reviewModal.record.id,
        reviewModal.action,
        reviewModal.comment || undefined
      );

      setSuccessMessage(`Upload ${reviewModal.action}d successfully!`);
      setReviewModal({ isOpen: false, record: null, action: null, comment: '' });
      
      // Refresh the uploads list
      loadUploads();
      loadStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const StatCard = ({ title, value, color = 'blue' }: { title: string; value: number; color?: string }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 bg-${color}-500 rounded-md flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">{value}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPriceList = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-lg">
            <h2 className="text-lg font-semibold mb-2">Price List</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search item code or description..."
                className="w-full px-3 py-2 border rounded-md pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <FileUploader
              onFileSelect={handleFileSelect}
              onUpload={handlePriceListUpload}
              acceptedTypes={['.xlsx', '.xls']}
              loading={uploadLoading}
              progress={uploadProgress}
              title="Update Price List"
              description="Upload new price list file"
              compact={true}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {priceList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No price list items found. Upload a file to get started.
                </td>
              </tr>
            ) : (
              priceList.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && priceList.length > 0 && (
        <div className="px-4 py-3 border-t">
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
  );

  const renderDutyRates = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-lg">
            <h2 className="text-lg font-semibold mb-2">Duty Rates</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search HS code or description..."
                className="w-full px-3 py-2 border rounded-md pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <FileUploader
              onFileSelect={handleFileSelect}
              onUpload={handleDutyRateUpload}
              acceptedTypes={['.xlsx', '.xls']}
              loading={uploadLoading}
              progress={uploadProgress}
              title="Update Duty Rates"
              description="Upload new duty rates file"
              compact={true}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HS Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dutyRates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No duty rates found. Upload a file to get started.
                </td>
              </tr>
            ) : (
              dutyRates.map((rate) => (
                <tr key={rate.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rate.hs_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rate.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rate.rate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rate.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && dutyRates.length > 0 && (
        <div className="px-4 py-3 border-t">
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
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage price lists, duty rates, and review user uploads.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Uploads" value={stats.total_uploads} color="blue" />
          <StatCard title="Pending Review" value={stats.pending_uploads} color="yellow" />
          <StatCard title="Approved" value={stats.approved_uploads} color="green" />
          <StatCard title="Total Users" value={stats.total_users} color="purple" />
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <div className="flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700">×</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`${
              activeTab === 'uploads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Upload Review
          </button>
          <button
            onClick={() => setActiveTab('price-list')}
            className={`${
              activeTab === 'price-list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Price List
          </button>
          <button
            onClick={() => setActiveTab('duty-rates')}
            className={`${
              activeTab === 'duty-rates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Duty Rates
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'uploads' && (
          <div className="bg-white shadow rounded-lg">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Upload Reviews</h2>
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-700">Filter by status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="success">Success</option>
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
              onReview={handleReview}
              showUserColumn={true}
              showActions={true}
            />
          </div>
        )}
        {activeTab === 'price-list' && renderPriceList()}
        {activeTab === 'duty-rates' && renderDutyRates()}
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Review Upload: {reviewModal.record?.filename}
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setReviewModal(prev => ({ ...prev, action: 'approve' }))}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    reviewModal.action === 'approve'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => setReviewModal(prev => ({ ...prev, action: 'reject' }))}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    reviewModal.action === 'reject'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Reject
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment {reviewModal.action === 'reject' && '*'}
                </label>
                <textarea
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter review comment..."
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setReviewModal({ isOpen: false, record: null, action: null, comment: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewModal.action || (reviewModal.action === 'reject' && !reviewModal.comment)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 