import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Expense Tracker</h1>
      <button
        onClick={handleLoginClick}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Login / Register
      </button>
    </div>
  );
}

export default HomePage;
