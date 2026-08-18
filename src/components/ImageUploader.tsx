import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [isDragActiveState, setIsDragActiveState] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActiveState(true),
    onDragLeave: () => setIsDragActiveState(false),
    onDropAccepted: () => setIsDragActiveState(false),
  });

  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            onImageSelect(file);
            toast.success('Image pasted successfully!');
            return;
          }
        }
      }
    },
    [onImageSelect]
  );

  const active = isDragActive || isDragActiveState;

  return (
    <div
      {...getRootProps()}
      onPaste={handlePaste}
      tabIndex={0}
      className={`relative w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        active
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <input {...getInputProps()} />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="mb-4">
          {active ? (
            <Upload className="w-12 h-12 text-blue-500 animate-bounce" />
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          )}
        </div>
        <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-200">
          Drop your image here, or click to select
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can also paste an image from your clipboard (Ctrl+V / Cmd+V)
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <FileCheck className="w-4 h-4" />
          <span>Supports PNG, JPG, JPEG, GIF, WEBP</span>
        </div>
      </div>
    </div>
  );
}
