import { useState } from "react";
import { useAuthUser, useAuthHeader } from "react-auth-kit";
import { Navigate } from "react-router-dom";
import errorFromApi from "@/utils/errorFromAPI";

type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};
type Resultado = "ok" | "existent" | "unauthorized";
type CreateSetorAPIResponse = {
  resultado: Resultado;
  user: {
    name: string;
    cpf: string;
    email: string;
  };
};
const results = {
  ok: {
    message: "Setor criado com sucesso.",
    type: "success",
  },
  existent: {
    message: "O setor já existe.",
    type: "error",
  },
  unauthorized: {
    message: "Permissão negada.",
    type: "error",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
} as const;

const API_URL = import.meta.env.VITE_API_URL;

export default function SetorCreate() {
  document.title = "Novo Setor";

  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [loading, setLoading] = useState<boolean>(false);

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const formInit = { nome: "", soma_entrada: 0, soma_saida: 0 };
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
    setMessage(messageInit);
    setLoading(true);
    if (!form.nome) return;

    try {
      const res = await fetch(`${API_URL}/api/setores`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
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

      const data: CreateSetorAPIResponse = await res.json();
      setMessage(results[data.resultado]);
      setForm(formInit);
      setLoading(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(results["error"]);
      } else if (errorFromApi<{ resultado: Resultado }>(error, "resultado")) {
        const resultado = error.resultado as Resultado;
        setMessage(results[resultado]);
      }
      setLoading(false);
    }
  };

  return auth()?.user.nivel === "Super-Admin" ? (
    <form
      onSubmit={handleSubmit}
      className="m-auto my-4 flex flex-col items-center rounded-lg bg-white/5 shadow-md shadow-black/20"
    >
      <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
        Novo Setor
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
              <label className="text-slate-300" htmlFor="nome">
                Nome:
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={form.nome}
                onChange={handleChange}
                className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                placeholder="Tecnologia"
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
              {loading ? "CARREGANDO..." : "CRIAR"}
            </button>
          </div>
        </div>
      </div>
    </form>
  ) : (
    <Navigate to="/" />
  );
}
