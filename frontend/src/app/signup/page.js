"use client";

import React, { useState } from "react";
import Button from "../../components/Button";
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { useRouter } from "next/navigation";

function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log("Starting signup process...");
      
      // Validate input fields
      if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all required fields.");
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
      }

      // Check if terms and conditions are accepted
      if (!termsAccepted) {
        alert("You must accept the Terms and Conditions to proceed.");
        return;
      }

      console.log("Using API URL:", process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      console.log("Response received:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        alert("Sign up successful! Please log in.");
        router.push("/login");
      } else {
        alert(`Sign up failed: ${data.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Detailed error:", error);
      alert("An error occurred during sign up. Please try again later.");
    }
  };

  return (
    <main className="bg-white min-h-screen flex flex-col justify-center items-center">
      <header className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-gray-600">Sign up to get started</p>
      </header>
      <div className="w-full max-w-md">
        <form
          className="flex flex-col space-y-4 p-4 border border-gray-200 rounded-lg shadow-sm"
          onSubmit={handleSubmit} // Call handleSubmit on form submission
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
            onChange={(e) => setUsername(e.target.value)} // Update username state
          />

          <label htmlFor="email" className="text-gray-700 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />

          <label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Create a password"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
          />

          <label
            htmlFor="confirm-password"
            className="text-gray-700 font-medium"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Confirm your password"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirmPassword state
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)} // Update termsAccepted state
              />
              <label htmlFor="terms" className="text-gray-600">
                I agree to the Terms and Conditions
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </form>

        <div className="flex flex-col items-center justify-center mt-6 space-y-4">
          <p className="text-gray-500">Or sign up with</p>
          <div className="flex space-x-4">
            <Button icon={<FaGoogle size={20} />} text="Google" />
            <Button icon={<FaMicrosoft size={20} />} text="Microsoft" />
            <Button icon={<FaFacebook size={20} />} text="Facebook" />
          </div>
        </div>

        <footer className="flex items-center justify-center mt-6">
          <p className="text-gray-600 mr-2">Already have an account?</p>
          <a href="/login" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </footer>
      </div>
    </main>
  );
}

export default SignUpPage;
