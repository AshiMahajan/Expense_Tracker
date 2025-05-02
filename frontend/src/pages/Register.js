// import React, { useState } from "react";

// function Register() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle form submission here
//     console.log("Form Data:", formData);
//     // You can add validation or API call here
//   };

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-gray-100">
  //     <form
  //       onSubmit={handleSubmit}
  //       className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
  //     >
  //       <h2 className="text-2xl font-bold text-center text-cyan-600 mb-6">
  //         Register
  //       </h2>

        // <div className="mb-4">
        //   <label className="block text-sm font-medium text-gray-700">Name</label>
        //   <input
        //     type="text"
        //     name="name"
        //     value={formData.name}
        //     onChange={handleChange}
        //     className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
        //     required
        //   />
        // </div>

        // <div className="mb-4">
        //   <label className="block text-sm font-medium text-gray-700">Email</label>
        //   <input
        //     type="email"
        //     name="email"
        //     value={formData.email}
        //     onChange={handleChange}
        //     className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
        //     required
        //   />
        // </div>

        // <div className="mb-4">
        //   <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        //   <input
        //     type="tel"
        //     name="phone"
        //     value={formData.phone}
        //     onChange={handleChange}
        //     className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
        //     required
        //   />
        // </div>

        // <div className="mb-6">
        //   <label className="block text-sm font-medium text-gray-700">Password</label>
        //   <input
        //     type="password"
        //     name="password"
        //     value={formData.password}
        //     onChange={handleChange}
        //     className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
        //     required
        //   />
        // </div>

  //       <button
  //         type="submit"
  //         className="w-full bg-cyan-600 text-white py-2 rounded-md hover:bg-cyan-700 transition"
  //       >
  //         Register
  //       </button>
  //     </form>
  //   </div>
  // );
// }

// export default Register;


import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/registerUserFunction`,
        formData
      );
      console.log("User registered:", response.data);
      alert("Registration successful!");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2"
        />
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
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;