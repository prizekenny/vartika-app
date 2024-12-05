"use client";

import React, { useState } from "react";
import Button from "../../components/Button"; // Adjust the path based on your project structure
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";

import { useRouter } from "next/navigation";

function LoginPage() {
  // State for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior

    // Validate input fields
    if (!username || !password) {
      alert("Please fill in both username and password.");
      return;
    }

    // Call the backend API to verify login credentials
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify JSON payload
        },
        body: JSON.stringify({
          username: username, // Username from input
          password: password, // Password from input
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, redirect to dashboard or handle success
        alert("Login successful!");
        console.log("User data:", data);
      } else {
        // Handle login failure
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      // Handle errors from the API call
      console.error("Error during login:", error);
      alert("An error occurred. Please try again later.");
    }

    // If login successful, redirect the user to workspace page, now it's just to test.
    router.push("/workspace");
  };

  return (
    <main className="bg-white min-h-screen flex flex-col justify-center items-center text-black">
      <header className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-black text-2xl font-bold">
          Welcome to the login page
        </h1>
        <p className="text-gray-600">Please login to continue</p>
      </header>
      <div className="w-full max-w-md">
        <form
          className="flex flex-col space-y-4 p-4 border border-gray-200 rounded-lg shadow-sm"
          onSubmit={handleSubmit}
        >
          <label htmlFor="username" className="text-gray-700 font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-gray-600">
                Remember Me
              </label>
            </div>
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition"
          >
            Login (Use Case 1)
          </button>
        </form>

        <div className="flex flex-col items-center justify-center mt-6 space-y-4">
          <p className="text-gray-500">Or log in with</p>
          <div className="flex space-x-4">
            <Button icon={<FaGoogle size={20} />} text="Google" />
            <Button icon={<FaMicrosoft size={20} />} text="Microsoft" />
            <Button icon={<FaFacebook size={20} />} text="Facebook" />
          </div>
        </div>

        <footer className="flex items-center justify-center mt-6">
          <p className="text-gray-600 mr-2">No account yet?</p>
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </footer>
      </div>
    </main>
  );
}

export default LoginPage;
