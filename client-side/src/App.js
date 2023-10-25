import Dashboard from "./Components/Dashboard";
import Login from "./Components/Login";
import Register from "./Components/Register";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./Routes/PrivateRoute";
import Profile from "./Components/Profile";
import Notification from "./Components/Notification";
import Messages from "./Components/Messages";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/messages" element={<Messages />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
