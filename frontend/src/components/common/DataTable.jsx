// components/common/DataTable.jsx
import React, { useState, useMemo } from "react";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";

const DataTable = ({ columns, data, onRowClick, className = "" }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null // 'asc' or 'desc'
  });

  // 处理表头点击
  const handleSort = (key, sortable = true) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      // 第三次点击取消排序
      key = null;
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;
    
    return [...data].sort((a, b) => {
      const keyParts = sortConfig.key.split('.');
      
      // 处理嵌套属性
      let aValue = a;
      let bValue = b;
      
      for (const key of keyParts) {
        aValue = aValue?.[key];
        bValue = bValue?.[key];
      }
      
      // 处理空值
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // 处理数字
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortConfig.direction === 'asc'
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }
      
      // 处理日期
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return sortConfig.direction === 'asc'
          ? aDate - bDate
          : bDate - aDate;
      }
      
      // 处理字符串
      return sortConfig.direction === 'asc'
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
  }, [data, sortConfig]);

  // 获取排序图标
  const getSortIcon = (columnKey, sortable = true) => {
    if (!sortable) return null;
    
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-gray-300 ml-1" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-blue-500 ml-1" /> 
      : <FaSortDown className="text-blue-500 ml-1" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis ${col.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ maxWidth: col.width || 'auto', minWidth: col.minWidth || '100px' }}
                  title={col.label}
                  onClick={() => handleSort(col.key, col.sortable !== false)}
                >
                  <div className="flex items-center">
                    <span className="truncate">{col.label}</span>
                    {getSortIcon(col.key, col.sortable !== false)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={row.id || row.user_id || row.client_id || row.contract_id || index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td 
                      key={`${index}-${col.key}`} 
                      className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ maxWidth: col.width || 'auto', minWidth: col.minWidth || '100px' }}
                      title={typeof col.render === "function" ? "" : (col.key.includes(".") ? 
                        col.key.split(".").reduce((acc, part) => acc?.[part], row) : 
                        row[col.key])}
                    >
                      {typeof col.render === "function" ? (
                        col.render(row)
                      ) : col.key === "status" ? (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            row[col.key] === "active" || row[col.key] === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {row[col.key] === "active" || row[col.key] === "Active" ? "Active" : "Inactive"}
                        </span>
                      ) : col.key.includes(".") ? (
                        col.key
                          .split(".")
                          .reduce((acc, part) => acc?.[part], row) || "-"
                      ) : (
                        row[col.key] || "-"
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
