import React from "react";

const ServiceCard = ({ 
  service, 
  name, 
  icon, 
  isAuthorized = false, 
  isActive = false, 
  isAuthInProgress = false,
  details = null,
  onAuthorize,
  onRevoke
}) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {icon}
          <span className="ml-3 text-lg font-medium">{name}</span>
        </div>
        {!isAuthorized ? (
          <button
            onClick={() => onAuthorize(service)}
            disabled={isAuthInProgress}
            className={`px-4 py-2 rounded ${
              isAuthInProgress 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isAuthInProgress ? "Authorizing..." : "Authorize"}
          </button>
        ) : (
          <button
            onClick={() => onRevoke(service)}
            className="px-3 py-1 rounded bg-red-500 text-white"
          >
            Revoke Access
          </button>
        )}
      </div>
      
      {isAuthorized && (
        <div className="mt-3 text-sm text-gray-600">
          <div className="flex items-center mt-2">
            <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
            <span>Status: {isActive ? "Active" : "Inactive"}</span>
          </div>
          {details}
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
