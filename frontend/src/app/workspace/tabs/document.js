"use client";

import React, { useState } from 'react';
import { 
  FaUpload, 
  FaSpinner,
  FaFile,
} from 'react-icons/fa';

const DocumentTab = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // 获取文件类型
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const fileTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'txt': 'text/plain'
    };
    return fileTypes[extension] || 'application/octet-stream';
  };

  // 文件上传
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const successfulUploads = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('username', 'testuser'); 
        formData.append('fileType', getFileType(files[i].name));
        
        console.log('Uploading file:', {
          name: files[i].name,
          type: getFileType(files[i].name),
          size: files[i].size,
          username: 'testuser'
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/drive/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload error:', errorText);
          throw new Error(`Upload failed: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Upload result:', result);

        // 添加到上传历史
        successfulUploads.push({
          name: files[i].name,
          size: files[i].size,
          uploadTime: new Date().toLocaleString(),
          type: getFileType(files[i].name)
        });
        
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // 更新上传历史
      setUploadedFiles(prev => [...successfulUploads, ...prev]);
      alert('Files uploaded successfully to Google Drive!');
    } catch (error) {
      alert(`Failed to upload files: ${error.message}`);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upload to Google Drive</h2>
        
        <div className="flex space-x-4">
          <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors duration-150">
            <FaUpload className="mr-2" />
            Upload Files
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* 上传进度条 */}
      {isUploading && (
        <div className="mb-6">
          <div className="flex items-center">
            <FaSpinner className="animate-spin mr-2 text-blue-500" />
            <span>Uploading to Google Drive... {uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 上传历史 */}
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-medium">
          <div className="col-span-4">File Name</div>
          <div className="col-span-3">Size</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-2">Upload Time</div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {uploadedFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No files uploaded yet
            </div>
          ) : (
            uploadedFiles.map((file, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50">
                <div className="col-span-4 flex items-center">
                  <FaFile className="mr-2 text-gray-400" />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="col-span-3">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
                <div className="col-span-3">
                  {file.type}
                </div>
                <div className="col-span-2">
                  {file.uploadTime}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentTab;
