import { useSignOut, useIsAuthenticated, useAuthUser } from "react-auth-kit";
import { NavLink } from "react-router-dom";
import {
  BuildingIcon,
  KeyRoundIcon,
  HomeIcon,
  PalmtreeIcon,
  FileDownIcon,
  UsersIcon,
} from "lucide-react";

export default function Navbar() {
  const signOut = useSignOut();
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="flex items-center gap-8 border-b border-white/20 px-4 shadow shadow-black/20 md:px-8 md:py-4">
      <NavLink
        to={auth()?.user.setor.nome === "TERMINAL" ? "/terminal" : "/"}
        className={({ isActive }) =>
          `${
            isActive ? "text-white" : "text-white/60 hover:text-white/80"
          } text-center text-xl`
        }
      >
        Ponto Eletrônico
      </NavLink>
      {isAuthenticated() ? (
        <>
          <NavLink
            to="/"
            title="Página Inicial"
            className={({ isActive }) =>
              `${
                isActive ? "text-white" : "text-white/60 hover:text-white/80"
              } text-center`
            }
          >
            <HomeIcon className="h-6 w-6" />
          </NavLink>
          <div className="ml-auto flex flex-col-reverse items-end gap-4 py-4 md:flex-row md:items-center md:gap-16 md:py-0">
            <div className="ml-auto flex flex-col items-center gap-8 md:flex-row">
              {["Super-Admin", "Admin"].includes(auth()?.user.nivel || "") && (
                <>
                  <NavLink
                    to="/exports"
                    title="Exportações em PDF."
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white/80"
                      }`
                    }
                  >
                    <FileDownIcon className="h-6 w-6" />
                  </NavLink>
                  <NavLink
                    to="/users"
                    title="Usuários."
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white/80"
                      }`
                    }
                  >
                    <UsersIcon className="h-6 w-6" />
                  </NavLink>
                </>
              )}
              {auth()?.user.nivel === "Super-Admin" && (
                <>
                  <NavLink
                    to="/setores"
                    title="Setores."
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white/80"
                      }`
                    }
                  >
                    <BuildingIcon className="h-6 w-6" />
                  </NavLink>
                  <NavLink
                    to="/feriados"
                    title="Feriados e pontos facultativos."
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white/80"
                      }`
                    }
                  >
                    <PalmtreeIcon className="h-6 w-6" />
                  </NavLink>
                </>
              )}
              <NavLink
                to="/changepassword"
                title="Alterar senha."
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white/80"
                  }`
                }
              >
                <KeyRoundIcon className="h-6 w-6" />
              </NavLink>
            </div>
            <button
              className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white"
              onClick={handleSignOut}
            >
              Sair
            </button>
          </div>
        </>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `${isActive ? "text-white" : "text-white/50"} ml-auto`
          }
        >
          Login
        </NavLink>
      )}
    </header>
  );
}
