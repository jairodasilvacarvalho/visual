import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomeInstitucional from "./pages/HomeInstitucional";
import DashboardUsuario from "./pages/DashboardUsuario";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeInstitucional />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard-usuario" element={<DashboardUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}
