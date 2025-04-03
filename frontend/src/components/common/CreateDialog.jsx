// components/common/CreateDialog.jsx

import Modal from "./Modal";
import React, { useState, useEffect } from "react";

const CreateDialog = ({
  isOpen,
  onClose,
  title = "Create Item",
  fields = [], // [{ name: "title", label: "Title", type: "text" }]
  onSubmit,
}) => {
  const initialFormState = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) setForm(initialFormState);
  }, [isOpen]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm text-gray-600 mb-1">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              value={form[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Create
        </button>
      </div>
    </Modal>
  );
};

export default CreateDialog;
