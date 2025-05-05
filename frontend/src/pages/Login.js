import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /*    Back Button function
  const back = () => {
    navigate("/register"); // redirect to login page
  };
  */
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_LOGIN_URL}/loginUserFunction`,
        formData
      );
      console.log("User Logged in:", response.data);
      navigate("/user");
      sessionStorage.setItem("username", response.data.name);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white py-2 rounded">
          Login
        </button>

        {/* Back button */}
        {/* <button
        onClick={back} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Back
        </button> */}
      
      </form>
    </div>
  );
}

export default Login;