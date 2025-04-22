// components/common/DataTable.jsx

const DataTable = ({ columns, data, onRowClick }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr
              key={row.user_id || row.id || row.DocNumber || index}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-500">
                  {typeof col.render === "function" ? (
                    col.render(row)
                  ) : col.key === "status" ? (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        row[col.key] === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {row[col.key] === "active" ? "Active" : "Inactive"}
                    </span>
                  ) : col.key.includes(".") ? (
                    col.key
                      .split(".")
                      .reduce((acc, part) => acc?.[part], row) || "-"
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
