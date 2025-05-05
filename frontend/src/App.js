import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import axios from "axios";
import UserDashboard from "./pages/dashboard/User";
import PrivateRoute from "./components/PrivateRoute";


const isLoggedIn = sessionStorage.getItem("username") !== null;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
        path="/user"
        element={
        <PrivateRoute>
          <UserDashboard />
        </PrivateRoute>
  }
/>

      </Routes>
    </Router>
  );
}
export default App;
