"use client";

import React, { useState, useEffect } from "react";
import { FaUpload, FaSpinner, FaFile } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import { formatDateTime } from "@/lib/format";

const DocumentTab = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsData, setDocumentsData] = useState({
    documents: [],
    pagination: { itemsPerPage: 10, totalItems: 0 },
  });

  useEffect(() => {
    const loadDocumentData = async () => {
      try {
        const response = await import("../../../../dummy_data/document.json");
        setDocumentsData(response);
        setUploadedFiles(response.documents);
      } catch (error) {
        console.error("Error loading document data:", error);
      }
    };
    loadDocumentData();
  }, []);

  const getFileType = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
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

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const successfulUploads = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("username", "testuser");
        formData.append("fileType", getFileType(files[i].name));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/drive/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) throw new Error(await response.text());

        successfulUploads.push({
          name: files[i].name,
          size: `${(files[i].size / 1024).toFixed(2)} KB`,
          type: getFileType(files[i].name),
          uploadTime: new Date().toISOString(),
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setUploadedFiles((prev) => [...successfulUploads, ...prev]);
      alert("Files uploaded successfully!");
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const { itemsPerPage } = documentsData.pagination;
  const totalPages = Math.ceil(uploadedFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = uploadedFiles.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Google Drive Documents
        </h2>
        <div>
          <Button
            text="Upload Files"
            icon={<FaUpload />}
            onClick={() => document.getElementById("file-input").click()}
          />
          <input
            id="file-input"
            type="file"
            multiple
            hidden
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </div>
      </div>

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

      <div className="bg-white rounded-lg shadow">
        {/* ✅ 表头 */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-medium">
          <div className="col-span-4">File Name</div>
          <div className="col-span-3">Size</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-2">Upload Time</div>
        </div>

        {/* ✅ 列表 */}
        <div className="divide-y divide-gray-200">
          {currentFiles.length === 0 ? (
            <EmptyState message="No files uploaded yet." />
          ) : (
            currentFiles.map((file, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50"
              >
                <div className="col-span-4 flex items-center">
                  <FaFile className="mr-2 text-gray-400" />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="col-span-3">{file.size}</div>
                <div className="col-span-3">{file.type}</div>
                <div className="col-span-2">
                  {formatDateTime(file.uploadTime)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default DocumentTab;
