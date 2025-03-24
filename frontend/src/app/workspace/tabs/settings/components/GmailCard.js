import React from "react";
import { FaGoogle, FaTrash, FaPlus } from "react-icons/fa";

const GmailCard = ({ 
  accounts = [], 
  isAuthInProgress = false, 
  onAuthorize, 
  onRevoke 
}) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FaGoogle className="text-2xl text-red-500" />
          <span className="ml-3 text-lg font-medium">Gmail</span>
        </div>
        <button
          onClick={() => onAuthorize("gmail")}
          disabled={isAuthInProgress}
          className={`px-4 py-2 rounded ${
            isAuthInProgress 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          } text-white flex items-center`}
        >
          {isAuthInProgress ? "Authorizing..." : (
            <>
              <FaPlus className="mr-2" /> Add Account
            </>
          )}
        </button>
      </div>

      {accounts.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Connected Accounts</h4>
          <ul className="space-y-2">
            {accounts.map((account, index) => (
              <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full ${account.active ? 'bg-green-500' : 'bg-gray-400'} mr-3`}></span>
                  <span>{account.email}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {account.active ? "(Active)" : "(Inactive)"}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => onRevoke("gmail", account.email)}
                    className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                  >
                    <FaTrash className="inline mr-1" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 italic">No Gmail accounts connected</p>
      )}
    </div>
  );
};

export default GmailCard;
