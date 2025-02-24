import React, { useState, useEffect } from 'react';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://your-websocket-url');

    socket.onmessage = (event) => {
      const newActivity = JSON.parse(event.data);
      setActivities((prevActivities) => [newActivity, ...prevActivities]);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="activity-log-container p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Activity Log</h1>
      <div className="tabs mb-6 flex space-x-4">
        <button className="tab active px-4 py-2 bg-blue-500 text-white rounded">All Activities</button>
        <button className="tab px-4 py-2 bg-gray-200 rounded">Client Activities</button>
        <button className="tab px-4 py-2 bg-gray-200 rounded">File Operations</button>
        <button className="tab px-4 py-2 bg-gray-200 rounded">System Sync</button>
        <button className="tab px-4 py-2 bg-gray-200 rounded">System Alerts</button>
      </div>
      <div className="search-filter mb-6 flex space-x-4">
        <input
          type="text"
          className="search-input flex-1 p-2 border border-gray-300 rounded"
          placeholder="Search client name or activity..."
        />
        <input type="date" className="date-input p-2 border border-gray-300 rounded" />
        <span className="date-separator p-2">→</span>
        <input type="date" className="date-input p-2 border border-gray-300 rounded" />
      </div>
      <table className="activity-table w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-3 border-b">Activity Name and Description</th>
            <th className="text-left p-3 border-b">Type</th>
            <th className="text-left p-3 border-b">Date</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-3 border-b">{activity.name}</td>
              <td className="p-3 border-b">{activity.type}</td>
              <td className="p-3 border-b">{activity.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination mt-6 flex justify-center space-x-2">
        <button className="page-btn px-3 py-1 bg-gray-200 rounded">Previous</button>
        <button className="page-btn px-3 py-1 bg-gray-200 rounded">1</button>
        <button className="page-btn active px-3 py-1 bg-blue-500 text-white rounded">2</button>
        <button className="page-btn px-3 py-1 bg-gray-200 rounded">3</button>
        <span className="px-3 py-1">...</span>
        <button className="page-btn px-3 py-1 bg-gray-200 rounded">11</button>
        <button className="page-btn px-3 py-1 bg-gray-200 rounded">Next</button>
      </div>
    </div>
  );
};

export default ActivityLog;
