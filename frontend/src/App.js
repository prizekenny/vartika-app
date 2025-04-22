import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import User from "./app/workspace/tabs/user";

function App() {
  console.log("Rendering App");
  return (
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
  );
}

export default App;
