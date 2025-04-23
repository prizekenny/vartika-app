"use client";

import React, { useState, useEffect } from "react";
import { FaUpload, FaSpinner, FaFile, FaExclamationTriangle, FaFolderOpen } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import { formatDateTime, formatFileSize } from "@/lib/format";
import { uploadFileToDrive, checkGoogleDriveAuthorization, getFileList } from "@/api/googleDrive";
import DataTable from "@/components/common/DataTable";

const DocumentTab = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [driveAuthorized, setDriveAuthorized] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [documentType, setDocumentType] = useState("");
  
  // 预定义的文档类型选项
  const documentTypes = [
    "Invoices", 
    "Contracts", 
    "Reports", 
    "Tax Documents", 
    "Receipts", 
    "Proposals",
    "Other"
  ];

  useEffect(() => {
    // 检查Google Drive授权状态
    checkDriveAuthorization();
  }, []);
  
  useEffect(() => {
    // 获取文件列表
    fetchFileList();
  }, [currentPage]);

  const fetchFileList = async () => {
    setIsLoading(true);
    try {
      const response = await getFileList(currentPage, itemsPerPage);
      
      if (response.success) {
        setUploadedFiles(response.files);
        setTotalPages(response.pagination.totalPages);
        setItemsPerPage(response.pagination.itemsPerPage);
      } else {
        console.error("Failed to fetch file list:", response.error);
        setErrorMessage("Failed to load file list. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
      setErrorMessage("Failed to load file list. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkDriveAuthorization = async () => {
    setIsCheckingAuth(true);
    setErrorMessage("");
    
    try {
      const response = await checkGoogleDriveAuthorization();
      console.log("Google Drive authorization status:", response);
      
      setDriveAuthorized(response.authorized);
      if (!response.authorized) {
        setErrorMessage("Google Drive is not authorized. Please connect your Google Drive account in settings.");
      } else if (response.user) {
        console.log("Authorized with Google account:", response.user);
      }
    } catch (error) {
      console.error("Error checking Google Drive authorization:", error);
      setDriveAuthorized(false);
      setErrorMessage("Could not verify Google Drive connection status.");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const openFileSelector = () => {
    document.getElementById("file-input").click();
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (!files.length) return;
    
    setSelectedFiles(Array.from(files));
    setShowUploadModal(true);
  };

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toLowerCase();
  };

  const getFileMimeType = (fileName) => {
    const extension = getFileExtension(fileName);
    const fileTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      txt: "text/plain",
    };
    return fileTypes[extension] || "application/octet-stream";
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    if (!companyName.trim()) {
      setErrorMessage("Please enter a company name");
      return;
    }
    if (!documentType) {
      setErrorMessage("Please select a document type");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage("");
    setShowUploadModal(false);

    try {
      const successfulUploads = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        // 使用公司名作为用户名
        formData.append("username", companyName);
        // 使用文档类型作为文件类型
        formData.append("fileType", documentType);
        // 添加文件大小
        formData.append("fileSize", formatFileSize(file.size));
        // 添加当前用户ID (如果有)
        // formData.append("userId", currentUser?.id);

        const response = await uploadFileToDrive(formData);
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Upload failed");
        
        if (!result.success) {
          throw new Error(result.error || "Upload failed");
        }

        successfulUploads.push({
          file_name: file.name,
          file_size: formatFileSize(file.size),
          mime_type: getFileMimeType(file.name),
          company_name: companyName,
          document_type: documentType,
          drive_file_id: result.fileId,
          upload_time: new Date().toISOString(),
        });

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      // 将新上传的文件添加到列表
      setUploadedFiles((prev) => [...successfulUploads, ...prev]);
      
      // 刷新文件列表
      fetchFileList();
      
      alert("Files uploaded successfully!");
      
      // 重置状态
      setSelectedFiles([]);
      setCompanyName("");
      setDocumentType("");
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const cancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setCompanyName("");
    setDocumentType("");
    setErrorMessage("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Google Drive Documents
        </h2>
        <div className="flex gap-2">
          {!driveAuthorized && (
            <Button
              text="Check Authorization"
              icon={isCheckingAuth ? <FaSpinner className="animate-spin" /> : null}
              onClick={checkDriveAuthorization}
              disabled={isCheckingAuth}
            />
          )}
          <Button
            text="Upload Files"
            icon={<FaUpload />}
            onClick={openFileSelector}
            disabled={!driveAuthorized || isUploading}
          />
          <input
            id="file-input"
            type="file"
            multiple
            hidden
            onChange={handleFileSelect}
            disabled={!driveAuthorized || isUploading}
          />
        </div>
      </div>

      {!driveAuthorized && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
            <p className="text-yellow-700">{errorMessage || "Google Drive authorization required. Please connect your account in settings."}</p>
          </div>
        </div>
      )}

      {errorMessage && driveAuthorized && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div>
          <div className="flex items-center">
            <FaSpinner className="animate-spin mr-2 text-blue-500" />
            <span>Uploading... {uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Upload Configuration</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="">Select document type</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Files ({selectedFiles.length})
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center py-1">
                    <FaFile className="text-gray-400 mr-2" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={cancelUpload}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={[
            { 
              key: "file_name", 
              label: "File Name", 
              width: "30%",
              render: (file) => (
                <div className="flex items-center">
                  <FaFile className="mr-2 text-gray-400" />
                  <span className="truncate">{file.file_name}</span>
                </div>
              )
            },
            { 
              key: "file_size", 
              label: "Size", 
              width: "15%" 
            },
            { 
              key: "location", 
              label: "Location", 
              width: "25%",
              render: (file) => (
                <div className="flex items-center">
                  <FaFolderOpen className="mr-2 text-gray-400" />
                  <span className="truncate">{`${file.company_name}/${file.document_type}`}</span>
                </div>
              ) 
            },
            { 
              key: "upload_time", 
              label: "Upload Time", 
              width: "20%",
              render: (file) => formatDateTime(file.upload_time)
            }
          ]}
          data={uploadedFiles}
          className={isLoading ? "opacity-50" : ""}
        />
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center">
            <FaSpinner className="animate-spin text-blue-500 text-xl" />
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default DocumentTab;
