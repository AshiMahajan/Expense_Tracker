import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLoginClick = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen text-center flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Expense Tracker</h1>
      <div>
        <button
          onClick={() => handleNavigation("/login")}
          className="px-6 py-3 mb-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
        onClick={() => handleNavigation("/register")}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
          Register
        </button>
      </div>
      <button
        onClick={handleLoginClick}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Wanna Know about us first?
      </button>
    </div>
  );
}

export default HomePage;
