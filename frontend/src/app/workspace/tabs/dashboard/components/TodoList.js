"use client";

import React from "react";
import { FaStar, FaRegStar, FaTimes } from "react-icons/fa";

const TodoList = ({ todos, toggleStar, deleteTodo }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Tasks</h3>
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <span className="flex-grow">{todo.text}</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleStar(todo.id)}
                className={`${
                  todo.starred ? "text-yellow-400" : "text-gray-400"
                } hover:text-yellow-500`}
              >
                {todo.starred ? <FaStar /> : <FaRegStar />}
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
