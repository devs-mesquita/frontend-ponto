import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";

import Layout from "./components/Layout";
import PontoEletronico from "./components/PontoEletronico";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import NotFound from "./components/NotFound";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-600/20">
      <Routes>
        <Route path="/ponto" element={<PontoEletronico />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <RequireAuth loginPath="/login">
                <Home />
              </RequireAuth>
            }
          />
          <Route path="login" element={<Login />} />
          <Route
            path="register"
            element={
              <RequireAuth loginPath="/login">
                <Register />
              </RequireAuth>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Route>
      </Routes>
    </div>
  );
}
