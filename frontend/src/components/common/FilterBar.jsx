// components/common/FilterBar.jsx

import SearchInput from "./SearchInput";

const FilterBar = ({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  dateValue,
  onDateChange,
  statusOptions = [],
}) => {
  return (
    <div className="flex flex-wrap space-x-2 space-y-2 mb-4 items-center">
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search..."
      />

      <select
        value={statusValue}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Status</option>
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={dateValue}
        onChange={(e) => onDateChange(e.target.value)}
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default FilterBar;
