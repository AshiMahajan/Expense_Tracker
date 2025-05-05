import React, { useEffect, useState } from "react";

function UserDashboard() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const sessionUsername = sessionStorage.getItem("username");
    setUsername(sessionUsername || "User");
  }, []);

  return (
    <div className="min-h-screen text-center flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Hi {username}</h1>
    </div>
  );
}

export default UserDashboard;