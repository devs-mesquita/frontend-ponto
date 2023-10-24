import { useState } from "react";
import { useAuthHeader, useSignOut } from "react-auth-kit";
import errorFromApi from "@/utils/errorFromAPI";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";

type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};
type ChangePasswordResultado =
  | "ok"
  | "wrong-current-password"
  | "wrong-confirm-password"
  | "not-found"
  | "not-user";
type RegisterAPIResponse = {
  resultado: ChangePasswordResultado;
  user: {
    name: string;
    cpf: string;
    email: string;
  };
};
const results = {
  ok: {
    message: "Senha alterada com sucesso.",
    type: "success",
  },
  "wrong-current-password": {
    message: "Senha atual incorreta.",
    type: "error",
  },
  "wrong-confirm-password": {
    message: "Confirme a senha corretamente.",
    type: "error",
  },
  "not-found": {
    message: "Usuário não encontrado.",
    type: "error",
  },
  "not-user": {
    message: "Permissão negada.",
    type: "error",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
} as const;

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  document.title = "Registrar Usuário";

  const authHeader = useAuthHeader();
  const signOut = useSignOut();

  const setNotification = useAtom(notificationAtom)[1];
  const [loading, setLoading] = useState<boolean>(false);

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const formInit = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const [form, setForm] = useState(formInit);

  const handleChange = (
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((st) => ({
      ...st,
      [evt.target.name]: evt.target.value,
    }));
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (form.confirmPassword !== form.newPassword) {
      setMessage(results["wrong-confirm-password"]);
      return;
    }

    if (!form.confirmPassword || !form.currentPassword || !form.newPassword) {
      return;
    }

    setMessage(messageInit);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/changepassword`, {
        method: "POST",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw err;
      }

      const data: RegisterAPIResponse = await res.json();
      setMessage(results[data.resultado]);
      setForm(formInit);
      setLoading(false);
      signOut();
      setNotification({
        message: "Senha alterada com sucesso.",
        type: "success",
      });
    } catch (error) {
      if (error instanceof Error) {
        setMessage(results["error"]);
      } else if (
        errorFromApi<{ resultado: ChangePasswordResultado }>(error, "resultado")
      ) {
        const resultado = error.resultado as ChangePasswordResultado;
        setMessage(results[resultado]);
      }
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="m-auto my-4 flex flex-col items-center rounded-lg bg-white/5 shadow-md shadow-black/20"
    >
      <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
        Alterar Senha
      </h1>
      <div className="flex flex-col items-center">
        <img src="/logo192.png" className="w-[130px] py-4" />
        {message.message.length > 0 && (
          <h2
            className={`my-2 max-w-[275px] rounded px-2 py-1 text-center ${
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
        <div className="flex min-w-[22rem] flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-4 px-4">
            <div className="flex w-full flex-col gap-1">
              <label className="text-slate-300" htmlFor="currentPassword">
                Senha Atual:
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                required
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <label className="text-slate-300" htmlFor="newPassword">
                Nova Senha:
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                required
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <label className="text-slate-300" htmlFor="confirmPassword">
                Confirmar Nova Senha:
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                required
              />
            </div>
          </div>
          <div className="w-full border-b border-white/20 shadow shadow-black/20"></div>
          <div className="w-full px-4 pb-4">
            <button
              type="submit"
              className=" w-full rounded-lg bg-indigo-500/60 py-2 font-bold text-slate-300 shadow shadow-black/20 hover:bg-indigo-500/75 disabled:bg-indigo-400/30 hover:disabled:bg-indigo-400/40"
              disabled={loading}
            >
              {loading ? "CARREGANDO..." : "REGISTRAR"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
