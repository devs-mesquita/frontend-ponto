import { Routes, Route } from "react-router-dom";
import PontoEletronico from "./components/PontoEletronico";
import Login from "./components/Login";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-600/20">
      <Routes>
        <Route path="/" element={<PontoEletronico />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}
