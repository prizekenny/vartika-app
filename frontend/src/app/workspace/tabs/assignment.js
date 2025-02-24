import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Button from "../../../components/Button";

// Helper function for date formatting
const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
};

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    socket.on("assignment:updated", (data) => {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === data.id
            ? { ...assignment, status: data.status }
            : assignment
        )
      );
    });

    socket.on("assignment:created", (data) => {
      setAssignments((prev) => [...prev, data]);
    });

    return () => socket.disconnect();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/assignments`
      );
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((assignment) => {
    if (statusFilter !== "all" && assignment.status !== statusFilter) {
      return false;
    }

    const dueDate = new Date(assignment.dueDate);
    const now = new Date();

    if (dateFilter === "today") {
      return dueDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      return dueDate >= weekStart && dueDate <= weekEnd;
    }
    return true;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Assignments</h1>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{assignment.title}</h3>
                  <p className="text-sm text-gray-500">
                    {assignment.assignedTo.name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      assignment.status === "planned"
                        ? "bg-blue-100 text-blue-600"
                        : assignment.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {assignment.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Due {formatDate(assignment.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignment;
