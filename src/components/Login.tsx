import { useState } from "react";
import { asyncPause } from "../utils/asyncPause";
import { useSignIn, useIsAuthenticated } from "react-auth-kit";
import { useNavigate, Navigate } from "react-router-dom";

type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};

type LoginAPIResponse = {
  authorization: {
    token: string;
    type: string;
    expiresIn?: number;
  };
  user: {
    name: string;
    cpf: string;
    email: string;
  };
};

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const signIn = useSignIn();

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const formInit = { email: "", password: "" };
  const [form, setForm] = useState(formInit);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setForm((st) => ({
      ...st,
      [evt.target.name]: evt.target.value,
    }));
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setMessage(messageInit);
    setLoading(true);

    try {
      await asyncPause(3000);

      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw err;
      }

      const data: LoginAPIResponse = await res.json();

      signIn({
        token: data.authorization.token,
        tokenType: "Bearer",
        expiresIn: 3600,
        authState: { user: data.user },
      });

      navigate("/home");
    } catch (error: any) {
      console.log(error.message);

      if (error.message === "Unauthorized") {
        setMessage({
          message: "Credenciais inválidas.",
          type: "error",
        });
      } else {
        setMessage({
          message: "Ocorreu um erro.",
          type: "error",
        });
      }
      setLoading(false);
    }
  };

  return isAuthenticated() ? (
    <Navigate to="/home" />
  ) : (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center rounded-lg bg-white/5 shadow-md shadow-black/20"
    >
      <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
        Login
      </h1>
      <div className="flex flex-col items-center p-4">
        <img src="/logo192.png" className="w-[130px] py-4" />
        {message.message.length > 0 && (
          <h2
            className={`max-w-[275px] rounded px-2 py-1 text-center ${
              message.type === "success"
                ? "bg-green-400 text-green-900"
                : message.type === "error"
                ? "bg-red-400 text-red-900"
                : message.type === "warning"
                ? "bg-yellow-300 text-yellow-900"
                : ""
            }`}
          >
            {message.message}
          </h2>
        )}
        <div className="flex min-w-[20rem] flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-1">
            <label className="text-slate-300" htmlFor="email">
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
              disabled={loading}
              placeholder="arthur.oliveira@mesquita.rj.gov.br"
              required
            />
          </div>
          <div className="flex w-full flex-col gap-1">
            <label className="text-slate-300" htmlFor="password">
              Senha:
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
              disabled={loading}
              placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
              required
            />
          </div>
          <button
            className="w-full rounded-lg bg-indigo-500/60 py-2 font-bold text-slate-300 shadow shadow-black/20 hover:bg-indigo-500/75 disabled:bg-indigo-400/30 hover:disabled:bg-indigo-400/40"
            disabled={loading}
          >
            {loading ? "CARREGANDO..." : "ENTRAR"}
          </button>
        </div>
      </div>
    </form>
  );
}
