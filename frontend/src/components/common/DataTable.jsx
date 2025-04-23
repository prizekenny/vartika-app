// components/common/DataTable.jsx

const DataTable = ({ columns, data, onRowClick, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ maxWidth: col.width || 'auto', minWidth: col.minWidth || '100px' }}
                  title={col.label}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
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
