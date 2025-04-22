import React from "react";
import ReactPaginate from "react-paginate";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (data) => {
    onPageChange(data.selected + 1); // react-paginate passes the page index starting from 0
  };

  return (
    <div className="flex justify-between items-center mt-4">
      {/* Page Info */}
      <div className="text-sm text-gray-500 mr-4">
        Page {currentPage} of {totalPages || 1}
      </div>

      {/* Pagination Buttons */}
      <div className="flex space-x-2">
        <ReactPaginate
          previousLabel={<span className="text-sm">Previous</span>}
          nextLabel={<span className="text-sm">Next</span>}
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={2}
          onPageChange={handlePageChange}
          forcePage={currentPage - 1}
          containerClassName="flex space-x-2"
          pageClassName="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          activeClassName="bg-blue-400 text-white" // Change background color to blue and text color to white when active
          previousClassName="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          nextClassName="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          disabledClassName="bg-gray-300 text-gray-800 cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default Pagination;
