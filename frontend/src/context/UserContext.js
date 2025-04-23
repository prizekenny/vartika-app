"use client"; // 确保这是一个客户端组件

import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUserLocal = localStorage.getItem("user");
    const savedUserSession = sessionStorage.getItem("user");
    
    if (savedUserLocal) {
      setUser(JSON.parse(savedUserLocal));
    } else if (savedUserSession) {
      setUser(JSON.parse(savedUserSession));
    }
  }, []);

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
