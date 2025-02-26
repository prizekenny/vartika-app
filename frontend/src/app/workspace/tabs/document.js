"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUpload, 
  FaSpinner,
  FaFile,
  FaChevronLeft,
  FaChevronRight,
  FaGripLines
} from 'react-icons/fa';

const DocumentTab = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsData, setDocumentsData] = useState({ documents: [], pagination: { itemsPerPage: 10, totalItems: 0 } });
  
  // 列宽状态
  const [columnWidths, setColumnWidths] = useState({
    fileName: 40,
    size: 20,
    type: 25,
    uploadTime: 15
  });
  
  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [startX, setStartX] = useState(0);
  const tableRef = useRef(null);

  // 加载文档数据
  useEffect(() => {
    const loadDocumentData = async () => {
      try {
        const response = await import("../../../../dummy_data/document.json");
        setDocumentsData(response);
        // 合并上传的文件和已有的文档
        setUploadedFiles(prev => [...prev, ...response.documents]);
      } catch (error) {
        console.error("Error loading document data:", error);
      }
    };
    loadDocumentData();
  }, []);

  // 处理拖拽开始
  const handleDragStart = (e, column) => {
    setIsDragging(true);
    setCurrentColumn(column);
    setStartX(e.clientX);
  };

  // 处理拖拽
  const handleDrag = (e) => {
    if (!isDragging || !currentColumn) return;
    
    const deltaX = e.clientX - startX;
    const tableWidth = tableRef.current?.offsetWidth || 1000;
    const percentageDelta = (deltaX / tableWidth) * 100;
    
    // 确保列宽不会太小
    const minWidth = 10;
    
    setColumnWidths(prev => {
      const newWidth = Math.max(prev[currentColumn] + percentageDelta, minWidth);
      
      // 调整其他列的宽度以保持总宽度为100%
      const otherColumns = Object.keys(prev).filter(col => col !== currentColumn);
      const totalOtherWidth = otherColumns.reduce((sum, col) => sum + prev[col], 0);
      const adjustmentFactor = (100 - newWidth) / totalOtherWidth;
      
      const newWidths = {};
      otherColumns.forEach(col => {
        newWidths[col] = prev[col] * adjustmentFactor;
      });
      
      return {
        ...newWidths,
        [currentColumn]: newWidth
      };
    });
    
    setStartX(e.clientX);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
    setCurrentColumn(null);
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, currentColumn, startX]);

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

        successfulUploads.push({
          name: files[i].name,
          size: `${(files[i].size / 1024).toFixed(2)} KB`,
          type: getFileType(files[i].name),
          uploadTime: new Date().toISOString()
        });
        
        setUploadProgress(((i + 1) / files.length) * 100);
      }

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

  // 分页计算
  const { itemsPerPage } = documentsData.pagination;
  const totalPages = Math.ceil(uploadedFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = uploadedFiles.slice(startIndex, endIndex);

  // 分页处理
  const handlePageChange = (page) => {
    setCurrentPage(page);
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

      {/* 文件列表 */}
      <div className="bg-white rounded-lg shadow" ref={tableRef}>
        {/* 表头 */}
        <div className="flex border-b border-gray-200 bg-gray-50 font-medium">
          <div 
            className="p-4 flex items-center relative" 
            style={{ width: `${columnWidths.fileName}%` }}
          >
            <span>File Name</span>
            <div 
              className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-col-resize hover:bg-gray-300"
              onMouseDown={(e) => handleDragStart(e, 'fileName')}
            >
              <FaGripLines className="text-gray-400" />
            </div>
          </div>
          
          <div 
            className="p-4 flex items-center relative" 
            style={{ width: `${columnWidths.size}%` }}
          >
            <span>Size</span>
            <div 
              className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-col-resize hover:bg-gray-300"
              onMouseDown={(e) => handleDragStart(e, 'size')}
            >
              <FaGripLines className="text-gray-400" />
            </div>
          </div>
          
          <div 
            className="p-4 flex items-center relative" 
            style={{ width: `${columnWidths.type}%` }}
          >
            <span>Type</span>
            <div 
              className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-col-resize hover:bg-gray-300"
              onMouseDown={(e) => handleDragStart(e, 'type')}
            >
              <FaGripLines className="text-gray-400" />
            </div>
          </div>
          
          <div 
            className="p-4 flex items-center relative" 
            style={{ width: `${columnWidths.uploadTime}%` }}
          >
            <span>Upload Time</span>
          </div>
        </div>
        
        {/* 文件列表内容 */}
        <div className="divide-y divide-gray-200">
          {currentFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No files uploaded yet
            </div>
          ) : (
            currentFiles.map((file, index) => (
              <div key={index} className="flex items-center hover:bg-gray-50">
                <div className="p-4 flex items-center" style={{ width: `${columnWidths.fileName}%` }}>
                  <FaFile className="mr-2 text-gray-400" />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="p-4" style={{ width: `${columnWidths.size}%` }}>
                  {file.size}
                </div>
                <div className="p-4" style={{ width: `${columnWidths.type}%` }}>
                  {file.type}
                </div>
                <div className="p-4" style={{ width: `${columnWidths.uploadTime}%` }}>
                  {new Date(file.uploadTime).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 分页控件 */}
        {uploadedFiles.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, uploadedFiles.length)} of {uploadedFiles.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 添加一些CSS来处理拖拽时的视觉反馈 */}
      <style jsx>{`
        .cursor-col-resize {
          cursor: col-resize;
        }
        
        ${isDragging ? `
          body {
            cursor: col-resize !important;
            user-select: none;
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default DocumentTab;
