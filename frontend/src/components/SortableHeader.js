import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * 可排序的表头组件
 * @param {string} label - 表头标签文本
 * @param {string} field - 排序字段名称
 * @param {string} currentSortField - 当前排序的字段
 * @param {string} sortDirection - 当前排序方向 ('asc' 或 'desc')
 * @param {function} onSort - 排序处理函数
 * @param {string} className - 额外的CSS类名
 */
const SortableHeader = ({ 
  label, 
  field, 
  currentSortField, 
  sortDirection, 
  onSort,
  className = "" 
}) => {
  // 获取排序图标
  const getSortIcon = () => {
    if (currentSortField !== field) {
      return <FaSort className="ml-1" />;
    }
    return sortDirection === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  return (
    <div 
      className={`flex items-center cursor-pointer ${className}`}
      onClick={() => onSort(field)}
    >
      {label}
      {getSortIcon()}
    </div>
  );
};

export default SortableHeader; 