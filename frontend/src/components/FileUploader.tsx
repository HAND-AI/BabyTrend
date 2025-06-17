import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
  progress?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  title?: string;
  description?: string;
  compact?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onUpload,
  loading = false,
  progress = 0,
  acceptedTypes = ['.xlsx', '.xls'],
  maxSize = 16,
  title = 'Upload File',
  description = 'Select an Excel file to upload',
  compact = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      // Reset form after successful upload
      setSelectedFile(null);
      setError('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${compact ? '' : 'max-w-md'}`}>
      {!compact && (
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      )}

      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${compact ? 'p-3' : 'p-4'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {selectedFile ? (
          /* Selected File Display */
          <div className="text-center">
            <div className={compact ? 'flex items-center justify-center space-x-2' : 'mb-3'}>
              <div className={`text-green-500 ${compact ? 'text-xl' : 'mx-auto w-8 h-8 mb-1'}`}>
                📄
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {loading && (
              <div className={compact ? 'mt-2' : 'mb-3'}>
                <div className="bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">Uploading... {progress}%</p>
              </div>
            )}

            <div className={`flex justify-center space-x-2 ${compact ? 'mt-2' : ''}`}>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={handleRemoveFile}
                disabled={loading}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* File Selection Area */
          <div className="text-center">
            {!compact && (
              <div className="mx-auto w-8 h-8 text-gray-400 mb-2">
                📁
              </div>
            )}
            <div className={compact ? 'flex items-center justify-center space-x-2' : 'mb-3'}>
              <p className="text-sm text-gray-600">
                {compact ? 'Drop file here or' : 'Drag and drop your file here, or'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Browse
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {acceptedTypes.join(', ')} • Max {maxSize}MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 