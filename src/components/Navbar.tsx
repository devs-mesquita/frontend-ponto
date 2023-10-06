import { useSignOut, useIsAuthenticated, useAuthUser } from "react-auth-kit";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const signOut = useSignOut();
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="flex items-center gap-8 border-b border-white/20 px-4 py-2 shadow shadow-black/20 md:px-8 md:py-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${
            isActive ? "text-white" : "text-white/60 hover:text-white/80"
          } text-xl`
        }
      >
        Ponto Eletrônico
      </NavLink>
      {isAuthenticated() ? (
        <div className="ml-auto flex items-center gap-8">
          {["Super-Admin", "Admin"].includes(auth()?.user.nivel) && (
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `${
                  isActive ? "text-white" : "text-white/60 hover:text-white/80"
                }`
              }
            >
              Registrar
            </NavLink>
          )}
          <button
            className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white"
            onClick={handleSignOut}
          >
            Sair
          </button>
        </div>
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
