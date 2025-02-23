import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">{/* 您的路由内容 */}</div>
      </div>
    </Router>
  );
}

export default App;
