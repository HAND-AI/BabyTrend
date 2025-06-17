import React from 'react';
import { UploadRecord } from '../services/auth';

interface UploadDetailsProps {
  record: UploadRecord;
  onClose: () => void;
  onDownload?: (record: UploadRecord) => void;
  onDelete?: (record: UploadRecord) => void;
  onEditItem?: (record: UploadRecord, itemIndex: number) => void;
}

const UploadDetails: React.FC<UploadDetailsProps> = ({
  record,
  onClose,
  onDownload,
  onDelete,
  onEditItem
}) => {
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 mx-auto p-5 w-full h-full">
        <div className="bg-white rounded-lg shadow-xl h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                {record.filename} - {getStatusBadge(record.status)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {record.has_original_file && onDownload && (
                <button
                  onClick={() => onDownload(record)}
                  className="px-3 py-2 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100"
                >
                  Download Original
                </button>
              )}
              {record.status !== 'success' && onDelete && (
                <button
                  onClick={() => onDelete(record)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Original File Preview */}
              <div className="p-6 border-r border-gray-200 overflow-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Original File</h3>
                {record.items && record.items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                          {Object.keys(record.items[0]).map((key) => (
                            <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {record.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                            {Object.values(item).map((value: any, i) => (
                              <td key={i} className="px-3 py-2 text-sm text-gray-900">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Extracted Data */}
              <div className="p-6 overflow-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted Data</h3>
                {record.validation_summary && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Validation Summary</h4>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-500">Total Items</span>
                        <p className="text-lg font-medium text-gray-900">{record.validation_summary.total_items}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Matched Items</span>
                        <p className="text-lg font-medium text-gray-900">{record.validation_summary.matched_items}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Unmatched Items</span>
                        <p className="text-lg font-medium text-gray-900">{record.validation_summary.unmatched_items}</p>
                      </div>
                    </div>
                    {record.validation_summary.error && (
                      <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        {record.validation_summary.error}
                      </div>
                    )}
                  </div>
                )}

                {record.items && record.items.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Processed Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                            {Object.keys(record.items[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                {key}
                              </th>
                            ))}
                            {record.status !== 'success' && onEditItem && (
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {record.items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                              {Object.values(item).map((value: any, i) => (
                                <td key={i} className="px-3 py-2 text-sm text-gray-900">
                                  {value}
                                </td>
                              ))}
                              {record.status !== 'success' && onEditItem && (
                                <td className="px-3 py-2 text-right text-sm">
                                  <button
                                    onClick={() => onEditItem(record, index)}
                                    className="text-primary-600 hover:text-primary-900"
                                  >
                                    Edit
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDetails; 