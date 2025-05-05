import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [username, setUsername] = useState("");
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ tag: "", field: "", name: "", amount: "" });
  const [editIndex, setEditIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const sessionUsername = sessionStorage.getItem("username");
    setUsername(sessionUsername || "User");
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleAdd = () => {
    if (!showForm) {
      setFormData({ tag: "", field: "", name: "", amount: "" });
      setEditIndex(null);
      setShowForm(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const updatedEntries = [...entries];
      updatedEntries[editIndex] = formData;
      setEntries(updatedEntries);
    } else {
      setEntries((prev) => [...prev, formData]);
    }
    setFormData({ tag: "", field: "", name: "", amount: "" });
    setEditIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index) => {
    setFormData(entries[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({ tag: "", field: "", name: "", amount: "" });
    setEditIndex(null);
    setShowForm(false);
  };

  const handleDelete = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-1/5 bg-blue-200 p-6 flex flex-col justify-between">
        <div className="self-center mt-5 p-2">
          <button
            onClick={() => {}}
            className="font-semibold mb-4 border bg-white rounded-md border-black px-4 py-2 text-base tracking-widest"
          >
            Upload Receipt
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Right Content */}
      <div className="w-4/5 bg-blue-50 relative p-6">
        <div className="flex justify-end items-center mb-6">
          <span className="text-gray-700 font-medium mr-4">Hi, {username}</span>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>

          <button
            onClick={handleAdd}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 self-start"
          >
            Add
          </button>

          {/* Table */}
          <div className="overflow-x-auto w-full px-6">
            <table className="table-auto w-full border border-black text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-black px-4 py-2">Tag</th>
                  <th className="border border-black px-4 py-2">Field</th>
                  <th className="border border-black px-4 py-2">Name</th>
                  <th className="border border-black px-4 py-2">Amount</th>
                  <th className="border border-black px-4 py-2">Edit</th>
                  <th className="border border-black px-4 py-2">Delete</th>
                </tr>
              </thead>

              <tbody>
              {entries.length > 0 ? (
                entries.map((entry, index) => (
                  editIndex === index ? (
                    // Show inline form for editing
                    <tr key={index} className="bg-yellow-100">
                      <td className="border border-black px-2 py-1">
                        <input
                          type="text"
                          name="tag"
                          value={formData.tag}
                          onChange={handleChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-black px-2 py-1">
                        <input
                          type="text"
                          name="field"
                          value={formData.field}
                          onChange={handleChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-black px-2 py-1">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-black px-2 py-1">
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border border-black px-2 py-1">
                        <button className="text-green-600 font-semibold" onClick={handleSave}>
                          Save
                        </button>
                      </td>
                      <td className="border border-black px-2 py-1">
                        <button className="text-red-600 font-semibold" onClick={handleCancel}>
                          ❌
                        </button>
                      </td>
                    </tr>
                  ) : (
                    // Regular row display
                    <tr key={index}>
                      <td className="border border-black px-4 py-2">{entry.tag}</td>
                      <td className="border border-black px-4 py-2">{entry.field}</td>
                      <td className="border border-black px-4 py-2">{entry.name}</td>
                      <td className="border border-black px-4 py-2">{entry.amount}</td>
                      <td className="border border-black px-4 py-2">
                        <button className="text-blue-500 underline" onClick={() => handleEdit(index)}>
                          Edit
                        </button>
                      </td>
                      <td className="border border-black px-4 py-2">
                        <button className="text-red-500 underline" onClick={() => handleDelete(index)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="border border-black px-4 py-2 text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            
              {/* Show form at bottom only for 'Add' mode */}
              {showForm && editIndex === null && (
                <tr className="bg-yellow-100">
                  <td className="border border-black px-2 py-1">
                    <input
                      type="text"
                      name="tag"
                      value={formData.tag}
                      onChange={handleChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border border-black px-2 py-1">
                    <input
                      type="text"
                      name="field"
                      value={formData.field}
                      onChange={handleChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border border-black px-2 py-1">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border border-black px-2 py-1">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border border-black px-2 py-1">
                    <button className="text-green-600 font-semibold" onClick={handleSave}>
                      Save
                    </button>
                  </td>
                  <td className="border border-black px-2 py-1">
                    <button className="text-red-600 font-semibold" onClick={handleCancel}>
                      ❌
                    </button>
                  </td>
                </tr>
                )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;