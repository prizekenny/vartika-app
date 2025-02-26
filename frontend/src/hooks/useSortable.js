import { useState } from 'react';

/**
 * 排序钩子函数
 * @param {string} defaultSortField - 默认排序字段
 * @param {string} defaultDirection - 默认排序方向 ('asc' 或 'desc')
 * @returns {object} 包含排序状态和处理函数的对象
 */
const useSortable = (defaultSortField = 'id', defaultDirection = 'asc') => {
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultDirection);

  // 处理排序
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 排序数据
  const sortData = (data, customSortFn) => {
    return [...data].sort((a, b) => {
      // 如果提供了自定义排序函数，则使用它
      if (customSortFn) {
        return customSortFn(a, b, sortField, sortDirection);
      }

      const direction = sortDirection === 'asc' ? 1 : -1;
      
      // 处理日期字段
      if (a[sortField] instanceof Date || (typeof a[sortField] === 'string' && !isNaN(new Date(a[sortField])))) {
        return direction * (new Date(a[sortField]) - new Date(b[sortField]));
      }
      
      // 处理数字字段
      if (typeof a[sortField] === 'number') {
        return direction * (a[sortField] - b[sortField]);
      }
      
      // 处理字符串字段
      if (typeof a[sortField] === 'string') {
        return direction * a[sortField].localeCompare(b[sortField]);
      }
      
      // 默认比较
      return direction * (a[sortField] < b[sortField] ? -1 : 1);
    });
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    sortData
  };
};

export default useSortable; 