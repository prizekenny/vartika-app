"use client";

import React, { useState } from "react";
import Button from "../../components/Button";
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { useRouter } from "next/navigation";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!email || !password) {
        alert("Please fill in both email and password.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push("/workspace");
      } else {
        alert(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      alert("An error occurred during login. Please try again.");
    }
  };

  const handleOAuthLogin = (provider) => {
    const URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
    const authWindow = window.open(URL, "_blank", "width=500,height=600");

    console.log("Auth URL:", URL);

    const checkAuth = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkAuth);
        console.log("🔍 OAuth window closed, checking authentication...");

        // 读取 localStorage 中的 token
        const token = localStorage.getItem("token");
        if (token) {
          console.log("✅ Authenticated! Redirecting...");
          window.location.href = "/dashboard"; // 进入主页
        } else {
          console.log("❌ Authentication failed or canceled.");
        }
      }
    }, 500);
  };

  return (
    <main className="bg-white min-h-screen flex flex-col justify-center items-center text-black">
      <header className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-black text-2xl font-bold">Welcome Back!</h1>
        <p className="text-gray-600">Please login to your account</p>
      </header>
      <div className="w-full max-w-md">
        <form
          className="flex flex-col space-y-4 p-4 border border-gray-200 rounded-lg shadow-sm"
          onSubmit={handleSubmit}
        >
          <label htmlFor="email" className="text-gray-700 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            required
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
            Sign In
          </button>
        </form>

        <div className="flex flex-col items-center justify-center mt-6 space-y-4">
          <p className="text-gray-500">Or continue with</p>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              aria-label="Login with Google"
            >
              <FaGoogle className="text-xl text-red-500" />
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin("microsoft")}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              aria-label="Login with Microsoft"
            >
              <FaMicrosoft className="text-xl text-blue-500" />
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin("facebook")}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              aria-label="Login with Facebook"
            >
              <FaFacebook className="text-xl text-blue-600" />
            </button>
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
