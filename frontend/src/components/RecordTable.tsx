import React, { useState } from 'react';
import { UploadRecord } from '../services/auth';
import UploadDetails from './UploadDetails';

interface RecordTableProps {
  records: UploadRecord[];
  loading?: boolean;
  onViewDetails?: (record: UploadRecord) => void;
  onReview?: (record: UploadRecord) => void;
  onDownload?: (record: UploadRecord) => void;
  onDelete?: (record: UploadRecord) => void;
  onEditItem?: (record: UploadRecord, itemIndex: number) => void;
  showUserColumn?: boolean;
  showActions?: boolean;
}

const RecordTable: React.FC<RecordTableProps> = ({
  records,
  loading = false,
  onViewDetails,
  onReview,
  onDownload,
  onDelete,
  onEditItem,
  showUserColumn = false,
  showActions = true
}) => {
  const [selectedRecord, setSelectedRecord] = useState<UploadRecord | null>(null);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      success: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      failed: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`${statusClasses[status as keyof typeof statusClasses]} px-2 py-1 rounded-full text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8 text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading records...</p>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500">Upload your first packing list to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showUserColumn && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <React.Fragment key={record.id}>
                  <tr className="hover:bg-gray-50">
                    {showUserColumn && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(record as any).username || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.filename}</div>
                      {record.review_comment && (
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Comment:</span> {record.review_comment}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.upload_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.items?.length || 0} items
                    </td>
                    {showActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </button>
                        {record.has_original_file && (
                          <button
                            onClick={() => onDownload?.(record)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Download
                          </button>
                        )}
                        {record.status !== 'success' && (
                          <button
                            onClick={() => onDelete?.(record)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                        {onReview && record.status === 'pending' && (
                          <button
                            onClick={() => onReview(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <UploadDetails
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onDownload={onDownload}
          onDelete={onDelete}
          onEditItem={onEditItem}
        />
      )}
    </>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrev}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default RecordTable; 