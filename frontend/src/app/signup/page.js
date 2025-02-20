"use client";

import React, { useState } from "react";
import Button from "../../components/Button"; // Adjust the path based on your project structure
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";

function SignUpPage() {
  
  // State for form inputs
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior

    if (!validateForm()) {
      return;
    }

    // Check if terms and conditions are accepted
    if (!termsAccepted) {
      alert("You must accept the Terms and Conditions to proceed.");
      return;
    }

    // Call the backend API to create a new user account
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify JSON payload
        },
        body: JSON.stringify({
          username: username, // Username entered by the user
          email: email, // Email entered by the user
          password: password, // Password entered by the user
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Signup successful, redirect to login or dashboard
        alert("Sign up successful! Please log in.");
        console.log("User created:", data);
      } else {
        // Handle signup failure (e.g., username already exists)
        alert(`Sign up failed: ${data.message}`);
      }
    } catch (error) {
      // Handle errors from the API call
      console.error("Error during sign up:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // 用戶名驗證
    if (username.length < 3) {
      newErrors.username = '用戶名至少需要3個字符';
      isValid = false;
    }

    // 電子郵件驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
      isValid = false;
    }

    // 密碼驗證
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = '密碼至少8位，必須包含字母和數字';
      isValid = false;
    }

    // 確認密碼驗證
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '兩次輸入的密碼不一致';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
            className={`border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}

          <label htmlFor="email" className="text-gray-700 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}

          <label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Create a password"
            className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

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
            className={`border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirmPassword state
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}

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
