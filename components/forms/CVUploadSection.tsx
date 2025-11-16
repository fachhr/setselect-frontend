'use client';

import React, { useCallback, useState } from 'react';
import { UploadIcon } from '../ui/icons/UploadIcon';
import { CheckCircleIcon } from '../ui/icons/CheckCircleIcon';
import { XIcon } from '../ui/icons/XIcon';

interface CVUploadSectionProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

export function CVUploadSection({
  onFileSelect,
  error,
  disabled = false
}: CVUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      return 'Please upload a PDF or DOCX file';
    }

    return null;
  }, []);

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);

    if (error) {
      setFileError(error);
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const displayError = error || fileError;

  return (
    <div className="space-y-3">
      <label className="label-base">
        Upload Your CV <span className="text-red-500">*</span>
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging && !disabled ? 'border-primary bg-primary-alpha scale-[1.02]' : ''}
          ${displayError ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-gray-50'}
          ${selectedFile && !displayError ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        {selectedFile && !displayError ? (
          // File selected state
          <div className="space-y-3">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Remove file
              </button>
            )}
          </div>
        ) : (
          // Upload prompt state
          <>
            <input
              type="file"
              id="cv-upload"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInput}
              disabled={disabled}
              className="sr-only"
            />
            <label
              htmlFor="cv-upload"
              className={`cursor-pointer ${disabled ? 'pointer-events-none' : ''}`}
            >
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-base font-medium text-gray-700">
                {isDragging ? 'Drop your CV here' : 'Drag and drop your CV here'}
              </p>
              <p className="mt-1 text-sm text-gray-500">or click to browse</p>
              <p className="mt-3 text-xs text-gray-400">
                PDF or DOCX • Maximum 5MB
              </p>
            </label>
          </>
        )}
      </div>

      {displayError && (
        <div className="flex items-start space-x-2 text-sm text-red-600">
          <XIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{displayError}</p>
        </div>
      )}
    </div>
  );
}
