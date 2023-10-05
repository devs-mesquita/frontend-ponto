import { useState } from "react";
import { useAuthUser } from "react-auth-kit";
import InputMask from "react-input-mask";

type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};
type RegisterResultado = "created";
type RegisterAPIResponse = {
  resultado: RegisterResultado;
  user: {
    name: string;
    cpf: string;
    email: string;
  };
};
const results = {
  created: {
    message: "Usuário registrado com sucesso.",
    type: "success",
  },
} as const;

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  document.title = "Registrar Usuário";

  const auth = useAuthUser();
  
  const [loading, setLoading] = useState<boolean>(false);

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const formInit = { email: "", cpf: "", name: "" };
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
    if (form.cpf.length !== 14) return;
    const cleanCPF = form.cpf
      .replace("-", "")
      .replace(".", "")
      .replace(".", "");

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          cpf: cleanCPF,
        }),
        headers: {
          "Content-Type": "application/json",
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
    } catch (error: any) {
      setMessage({
        message: "Ocorreu um erro.",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="m-auto flex flex-col items-center rounded-lg bg-white/5 shadow-md shadow-black/20"
    >
      <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
        Registro
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
              <label className="text-slate-300" htmlFor="name">
                Nome:
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                placeholder="Arthur de Oliveira"
                required
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <label className="text-slate-300" htmlFor="cpf">
                CPF:
              </label>
              <InputMask
                id="cpf"
                autoComplete="off"
                name="cpf"
                type="text"
                value={form.cpf}
                onChange={handleChange}
                mask="999.999.999-99"
                maskChar={null}
                alwaysShowMask={false}
                className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                placeholder="000.000.000-00"
                required
              />
            </div>
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
            {/* <div className="flex w-full flex-col gap-1">
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
            </div> */}
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
