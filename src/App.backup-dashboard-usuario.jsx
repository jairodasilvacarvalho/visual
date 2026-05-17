import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardUsuario from "./pages/DashboardUsuario";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard-usuario" element={<DashboardUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}
