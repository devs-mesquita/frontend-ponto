import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "react-auth-kit";

import Layout from "./components/Layout";
import Terminal from "./pages/Terminal";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Feriados from "./pages/Feriados";
import Configs from "./pages/Configs";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import Exports from "./pages/Exports";
import SetorCreate from "./pages/SetorCreate";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-600/20">
      <Routes>
        <Route
          path="terminal"
          element={
            <RequireAuth loginPath="/login">
              <Terminal />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <RequireAuth loginPath="/login">
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="configs"
            element={
              <RequireAuth loginPath="/login">
                <Configs />
              </RequireAuth>
            }
          />
          <Route
            path="feriados"
            element={
              <RequireAuth loginPath="/login">
                <Feriados />
              </RequireAuth>
            }
          />
          <Route
            path="exports"
            element={
              <RequireAuth loginPath="/login">
                <Exports />
              </RequireAuth>
            }
          />
          <Route
            path="users"
            element={
              <RequireAuth loginPath="/login">
                <Users />
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
          <Route
            path="setores/create"
            element={
              <RequireAuth loginPath="/login">
                <SetorCreate />
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
