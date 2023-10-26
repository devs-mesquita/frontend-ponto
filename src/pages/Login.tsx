import { useState } from "react";
import { useSignIn, useIsAuthenticated } from "react-auth-kit";
import { useNavigate, Navigate } from "react-router-dom";
import errorFromApi from "@/utils/errorFromAPI";

type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};

type Resultado = "unauthorized";
const messages = {
  unauthorized: {
    message: "Credenciais inválidas.",
    type: "error",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
} as const;

type LoginAPIResponse = {
  authorization: {
    token: string;
    type: string;
    expires_in: number;
  };
  user: {
    name: string;
    cpf: string;
    email: string;
  };
};

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  document.title = "Login";

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
    if (!form.email && !form.password) {
      return;
    }

    setMessage(messageInit);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw err;
      }

      const data: LoginAPIResponse = await res.json();

      signIn({
        token: data.authorization.token,
        refreshToken: data.authorization.token,
        tokenType: data.authorization.type,
        expiresIn: data.authorization.expires_in,
        refreshTokenExpireIn: data.authorization.expires_in,
        authState: { user: data.user },
      });

      navigate("/");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setMessage(messages["error"]);
      } else if (errorFromApi<{ resultado: Resultado }>(error, "resultado")) {
        const resultado = error.resultado as Resultado;
        setMessage(messages[resultado]);
      }
      setLoading(false);
    }
  };

  return isAuthenticated() ? (
    <Navigate to="/" />
  ) : (
    <form
      onSubmit={handleSubmit}
      className="m-auto flex flex-col items-center rounded-lg bg-white/5 shadow-md shadow-black/20"
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
