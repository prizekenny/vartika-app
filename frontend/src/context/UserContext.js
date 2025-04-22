"use client"; // 确保这是一个客户端组件

import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user"); // 仅在客户端访问 localStorage
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // 设置用户信息
    }
  }, []); // 空依赖数组，确保只在组件挂载时运行一次

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user)); // 保存用户信息到 localStorage
    } else {
      localStorage.removeItem("user"); // 移除用户信息
    }
  }, [user]); // 每次用户信息变化时，更新 localStorage

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 方便使用
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    console.error("useUser must be used within a UserProvider");
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
