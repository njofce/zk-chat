import "./App.scss";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import RegisterOrRecover from "./components/RegisterOrRecover";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="App ">
        <div className="w-100 vh-100 container-fluid">
          {" "}
          <Routes>
            <Route path="/r-procedure" element={<RegisterOrRecover />} />
            <Route path="/" element={<Navigate replace to="/r-procedure" />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>{" "}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
