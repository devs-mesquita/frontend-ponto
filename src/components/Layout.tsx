import Navbar from "./Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { notificationAtom, usingDefaultPasswordAtom } from "@/store";
import { useAtom } from "jotai";
import TopNotification from "@/components/TopNotification";
import { useEffect } from "react";
import { useAuthHeader, useSignOut, useIsAuthenticated } from "react-auth-kit";

const API_URL = import.meta.env.VITE_API_URL;

type CheckPasswordAPIResponse = {
  resultado: "not-found" | "default-password" | "ok";
};

export default function Layout() {
  const [notification, setNotification] = useAtom(notificationAtom);
  const [usingDefaultPassword, setUsingDefaultPassword] = useAtom(
    usingDefaultPasswordAtom,
  );

  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();
  const authHeader = useAuthHeader();
  const signOut = useSignOut();

  useEffect(() => {
    const checkPassword = async () => {
      if (!isAuthenticated()) return;

      if (usingDefaultPassword === false) return; // false = Checked and authorized.

      if (usingDefaultPassword === true) {
        // true = Checkend and unauthorized (using default).
        setNotification({
          message: "Altere sua senha para obter acesso ao sistema.",
          type: "warning",
        });
        navigate("/configs");
      }

      if (usingDefaultPassword === null) {
        // null = Not Checked
        try {
          const res = await fetch(`${API_URL}/api/checkpassword`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: authHeader(),
            },
          });

          if (!res.ok) {
            const err = await res.json();
            throw err;
          }

          const data: CheckPasswordAPIResponse = await res.json();

          if (data.resultado === "default-password") {
            setNotification({
              message: "Altere sua senha para obter acesso ao sistema.",
              type: "warning",
            });
            setUsingDefaultPassword(true);
            navigate("/configs");
          } else if (data.resultado === "not-found") {
            setNotification({
              type: "error",
              message: "O usuário não foi encontrado.",
            });
            setUsingDefaultPassword(null);
            signOut();
          } else {
            setUsingDefaultPassword(false);
          }
        } catch (error) {
          console.error(error);
          setNotification({
            message: "Ocorreu um erro.",
            type: "error",
          });
        }
      }
    };

    checkPassword();
  }, [location.pathname]);

  return (
    <>
      <div id="notifications" />
      <div id="modal" />
      {!usingDefaultPassword && <Navbar />}
      <Outlet />
      {notification.message && <TopNotification />}
    </>
  );
}
