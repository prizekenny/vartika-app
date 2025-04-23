"use client";

import React, { useState } from "react";
import Button from "../../components/common/Button";
import { FaGoogle, FaFacebook, FaMicrosoft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import api from "@/lib/axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, user } = useUser(); // 从 UserContext 获取 setUser and user
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  console.log("useUser output:", { setUser });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!email || !password) {
        alert("Please fill in both email and password.");
        return;
      }
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      setUser(user);

      router.push("/workspace");
    } catch (error) {
      alert("An error occurred during login. Please try again.");
    }
  };

  // Add a function to autofill the email and password fields
  const autofillCredentials = (role) => {
    if (role === "admin") {
      setEmail("test@test.com");
      setPassword("123456");
    } else if (role === "client") {
      setEmail("client@test.com");
      setPassword("123456");
    }
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
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="text-gray-600">
                Remember Me
              </label>
            </div>
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Forgot Password?
            </a>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 transition w-full"
            >
              Sign In
            </button>

            {/* Admin and Client autofill buttons */}
            <div className="flex space-x-4 pl-4">
              <button
                type="button"
                onClick={() => autofillCredentials("admin")}
                className="bg-gray-200 text-gray-700 py-2 px-2 rounded-md hover:bg-gray-300 transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofillCredentials("client")}
                className="bg-gray-200 text-gray-700 py-2 px-2 rounded-md hover:bg-gray-300 transition"
              >
                Client
              </button>
            </div>
          </div>
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
