import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import User from "./app/workspace/tabs/user";
import { UserProvider } from "@/context/UserContext";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 bg-gray-50 min-h-screen">
            <Routes>
              <Route path="/users" element={<User />} />
              {/* Add other routes as needed */}
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
