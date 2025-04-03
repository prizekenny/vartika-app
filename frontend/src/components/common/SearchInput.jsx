// components/common/SearchInput.jsx

import { FaSearch } from "react-icons/fa";

const SearchInput = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <FaSearch className="absolute left-3 top-3 text-gray-400" />
    </div>
  );
};

export default SearchInput;
