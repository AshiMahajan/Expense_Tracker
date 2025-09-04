import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tesseract from "tesseract.js";
import { v4 as uuidv4 } from 'uuid';

function UserDashboard() {
  const [username, setUsername] = useState("");
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ tag: "", description: "", amount: "", date: "", expense_id: "" });
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("amount");
  const [filterTag, setFilterTag] = useState("");

  const navigate = useNavigate();
  const API_ENDPOINT = "https://8w7s679qsi.execute-api.us-east-1.amazonaws.com/userexpense";

  const handleVisualizeClick = () => {
    navigate("/user/visualize");
  };

  const sortEntries = (entries) => {
    return [...entries].sort((a, b) => {
      if (sortBy === "amount") {
        const amountA = parseFloat(a.amount);
        const amountB = parseFloat(b.amount);
        return sortOrder === "asc" ? amountA - amountB : amountB - amountA;
      } else if (sortBy === "date") {
        const parseDateString = (dateStr) => {
          const parts = dateStr.split(',')[1].trim().split('/');
          return new Date(parts[2], parts[1] - 1, parts[0]);
        };
        const dateA = parseDateString(a.date);
        const dateB = parseDateString(b.date);
        return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
  };

  const filterEntries = (entries) => {
    if (!filterTag) return entries;
    return entries.filter(entry => entry.tag.toLowerCase().includes(filterTag.toLowerCase()));
  };

  const displayedEntries = sortEntries(filterEntries(entries));

  useEffect(() => {
    const sessionUsername = sessionStorage.getItem("username");
    const sessionEmail = sessionStorage.getItem("email");

    if (!sessionUsername || !sessionEmail) {
      navigate("/login");
    } else {
      setUsername(sessionUsername);
      fetchEntries(sessionEmail);
    }
  }, []);

  const fetchEntries = async (email) => {
    try {
      const response = await axios.get(`${API_ENDPOINT}?email=${email}`);
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
      alert("Failed to fetch your expense data.");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleClearFilters = () => {
    setSortOrder("asc");
    setFilterTag("");
    setSortBy("amount");
  };

  const handleAdd = () => {
    const currentDate = new Date().toLocaleDateString("en-GB", {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    });
    setFormData({ tag: "", description: "", amount: "", date: currentDate, expense_id: uuidv4() });
    setEditExpenseId(null);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "date") {
      const selectedDate = new Date(value);
      const formattedDate = selectedDate.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      setFormData((prev) => ({ ...prev, [name]: formattedDate }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    const email = sessionStorage.getItem("email");
    const entryToSave = {
      ...formData,
      date: formData.date,
      email,
      timestamp: formData.timestamp || Date.now(),
    };

    try {
      if (editExpenseId !== null) {
        await axios.put(API_ENDPOINT, entryToSave);
        setEntries((prev) =>
          prev.map((entry) =>
            entry.expense_id === entryToSave.expense_id ? entryToSave : entry
          )
        );
      } else {
        await axios.post(API_ENDPOINT, entryToSave);
        fetchEntries(email);
      }

      setFormData({ tag: "", description: "", amount: "", date: "", expense_id: "" });
      setEditExpenseId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to save or update data:", error);
      alert("Failed to save/update expense. Kindly reload the page!");
    }
  };

  const handleEdit = (expenseId) => {
    const selected = entries.find(entry => entry.expense_id === expenseId);
    if (!selected) {
        console.error("Entry not found for editing:", expenseId);
        return;
    }

    const dateFormatted = formatInputDate(selected.date);
    setFormData({ ...selected, date: dateFormatted });
    setEditExpenseId(expenseId);
    setShowForm(true);
};

  const formatInputDate = (dateString) => {
    if (!dateString) return ''; // Return empty string if dateString is undefined
    const parts = dateString.split(',')[1]?.trim().split('/');
    if (!parts || parts.length < 3) return ''; // Return empty string if parts are not valid
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to YYYY-MM-DD
};

  const formatDisplayDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB", {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const handleCancel = () => {
    setFormData({ tag: "", description: "", amount: "", date: "", expense_id: "" });
    setEditExpenseId(null);
    setShowForm(false);
  };

  const handleDelete = async (expenseId) => {
    try {
      await axios.delete(`${API_ENDPOINT}?email=${sessionStorage.getItem("email")}&expense_id=${expenseId}`);
      const updatedEntries = entries.filter((entry) => entry.expense_id !== expenseId);
      setEntries(updatedEntries);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete expense. Kindly reload the page!");
    }
  };

  const handleUploadClick = () => {
    setShowUploadPopup(true);
  };

  const extractAmount = (text) => {
    const amountMatch = text.match(/(?:Total|Amount|Rs\.?|INR|₹)?\s*[\₹]?\s?(\d+[.,]?\d{0,2})/i);
    return amountMatch ? amountMatch[1] : "0";
  };

  const extractTag = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("food") || lowerText.includes("restaurant") || lowerText.includes("meal")) {
      return "Food";
    }
    if (
      lowerText.includes("transport") ||
      lowerText.includes("uber") ||
      lowerText.includes("ola") ||
      lowerText.includes("taxi") ||
      lowerText.includes("metro") ||
      lowerText.includes("bus") ||
      lowerText.includes("train")
    ) {
      return "Transport";
    }
    if (lowerText.includes("grocery") || lowerText.includes("supermarket")) {
      return "Grocery";
    }
    if (lowerText.includes("medicine") || lowerText.includes("pharmacy")) {
      return "Health";
    }

    return "Other";
  };

  const extractDescription = (text) => {
    const keywords = ["metro", "restaurant", "uber", "grocery", "medicine", "pharmacy", "train", "bus"];
    const lowerText = text.toLowerCase();

    const found = keywords.find(word => lowerText.includes(word));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : "Parsed from receipt";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const imageData = reader.result;

        const result = await Tesseract.recognize(
          imageData,
          'eng',
          { logger: m => console.log(m) }
        );

        const text = result.data.text;
        console.log("Extracted Text:", text);

        const extractedData = {
          tag: extractTag(text),
          description: extractDescription(text),
          amount: extractAmount(text),
          date: formatDisplayDate(new Date()),
          email: sessionStorage.getItem("email"),
          timestamp: Date.now(),
          expense_id: uuidv4(),
        };

        await axios.post(API_ENDPOINT, extractedData);
        fetchEntries(sessionStorage.getItem("email"));
        setShowUploadPopup(false);
      } catch (err) {
        console.error("Tesseract Error:", err);
        alert("Failed to extract text. Try a clearer image.");
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/5 bg-blue-200 p-6 flex flex-col justify-between">
        <div className="self-center mt-5 p-2">
          <button
            onClick={handleUploadClick}
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

      <div className="w-4/5 bg-blue-50 relative p-6">
        <div className="flex justify-end items-center mb-6">
          <span className="text-gray-700 font-medium mr-4">Hi, {username}</span>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Dashboard</h1>
          <button
            onClick={handleVisualizeClick}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Visualize
          </button>
          <button
            onClick={handleAdd}
            className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 self-start"
          >
            Add
          </button>
          <div className="flex justify-end w-full mb-4">
            <input
              type="text"
              placeholder="Filter by Tag"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded ml-2"
            >
              Clear Filters
            </button>
          </div>
          <div className="overflow-x-auto w-full px-6">
            <table className="table-auto w-full border border-black text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2">Tag</th>
                  <th className="border px-4 py-2">Description</th>
                  <th
                    className="border px-4 py-2 cursor-pointer"
                    onClick={() => {
                      setSortBy("amount");
                      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                    }}
                  >
                    Amount {sortBy === "amount" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th
                    className="border px-4 py-2 cursor-pointer"
                    onClick={() => {
                      setSortBy("date");
                      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                    }}
                  >
                    Date {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="border px-4 py-2">Edit</th>
                  <th className="border px-4 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {displayedEntries.map((entry) => (
                  editExpenseId === entry.expense_id ? (
                    <tr key={entry.expense_id} className="bg-yellow-100">
                      <td className="border px-2 py-1">
                        <input name="tag" value={formData.tag} onChange={handleChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input name="description" value={formData.description} onChange={handleChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input name="amount" value={formData.amount} onChange={handleChange} className="w-full p-1 border rounded" />
                      </td>
                      <td className="border px-2 py-1">
                        <input
                          name="date"
                          type="date"
                          value={formatInputDate(formData.date)} // Ensure the date is in YYYY-MM-DD format
                          onChange={handleChange}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <button onClick={handleSave} className="text-green-600 font-semibold">Save</button>
                      </td>
                      <td className="border px-2 py-1">
                        <button onClick={handleCancel} className="text-red-600 font-semibold">❌</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={entry.expense_id}>
                      <td className="border px-4 py-2">{entry.tag}</td>
                      <td className="border px-4 py-2">{entry.description}</td>
                      <td className="border px-4 py-2">{entry.amount}</td>
                      <td className="border px-4 py-2">{entry.date}</td>
                      <td className="border px-4 py-2">
                        <button className="text-blue-500 underline" onClick={() => handleEdit(entry.expense_id)}>Edit</button>
                      </td>
                      <td className="border px-4 py-2">
                        <button className="text-red-500 underline" onClick={() => handleDelete(entry.expense_id)}>Delete</button>
                      </td>
                    </tr>
                  )
                ))}
                {showForm && editExpenseId === null && (
                  <tr className="bg-green-100">
                    <td className="border px-2 py-1">
                      <input name="tag" value={formData.tag} onChange={handleChange} className="w-full p-1 border rounded" />
                    </td>
                    <td className="border px-2 py-1">
                      <input name="description" value={formData.description} onChange={handleChange} className="w-full p-1 border rounded" />
                    </td>
                    <td className="border px-2 py-1">
                      <input name="amount" value={formData.amount} onChange={handleChange} className="w-full p-1 border rounded" />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        name="date"
                        type="date"
                        value={formatInputDate(formData.date)} // Ensure the date is in YYYY-MM-DD format
                        onChange={handleChange}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <button onClick={handleSave} className="text-green-600 font-semibold">Save</button>
                    </td>
                    <td className="border px-2 py-1">
                      <button onClick={handleCancel} className="text-red-600 font-semibold">❌</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showUploadPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded shadow-xl">
            <h2 className="text-xl mb-4">Upload Receipt</h2>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            <button onClick={() => setShowUploadPopup(false)} className="mt-4 bg-red-500 text-white py-2 px-6 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
