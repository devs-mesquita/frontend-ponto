import { useEffect, useState } from "react";
import { useAuthUser, useAuthHeader } from "react-auth-kit";
import InputMask from "react-input-mask";
import { Navigate } from "react-router-dom";
import errorFromApi from "@/utils/errorFromAPI";

type Repouso = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
type Setor = {
  id: number;
  nome: string;
  soma_entrada: number;
  soma_saida: number;
};
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
  "cpf-existente": {
    message: "O CPF informado já está cadastrado.",
    type: "error",
  },
  "email-existente": {
    message: "O E-mail informado já está cadastrado.",
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

  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [loading, setLoading] = useState<boolean>(false);

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const formInit = {
    email: "",
    cpf: "",
    name: "",
    setor_id: "",
    nivel: "",
    matricula: "",
    pispasep: "",
    ctps: "",
    cargo: "",
    lotacao: "",
    data_admissao: "",
  };
  const [form, setForm] = useState(formInit);

  const repousoInit: Repouso = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];
  const [repouso, setRepouso] = useState<Repouso>(repousoInit);

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
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setMessage(results["error"]);
      } else if (
        errorFromApi<{ resultado: RegisterResultado }>(error, "resultado")
      ) {
        const resultado = error.resultado as RegisterResultado;
        setMessage(results[resultado]);
      }
      setLoading(false);
    }
  };

  const [setores, setSetores] = useState<Setor[]>([]);

  useEffect(() => {
    const getSetores = async () => {
      try {
        const res = await fetch(`${API_URL}/api/setores`, {
          method: "GET",
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

        const data: { setores: Setor[] } = await res.json();
        setSetores(data.setores);
      } catch (error) {
        console.error(error);
      }
    };

    getSetores();
  }, []);

  return ["Super-Admin", "Admin"].includes(auth()?.user.nivel || "") ? (
    <form
      onSubmit={handleSubmit}
      className="m-4 flex flex-col gap-2 rounded-lg bg-white/5 shadow-md shadow-black/20"
    >
      <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
        Registrar Usuário
      </h1>
      <span className="text-center text-sm text-red-400">
        * Campos marcados com asterisco são obrigatórios.
      </span>
      <div className="flex flex-col">
        {/* <img src="/logo192.png" className="mx-auto w-[130px] py-4" /> */}
        {/* TODO INPUTS: Separate each pair within a div "flex flex-col gap-0 md:gap-4 md:flex-row" */}
        {/* Inputs: matricula, pispasep, ctps, cargo, lotacao, data_admissao, repouso checkboxes */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-4 px-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="name">
                  Nome: *
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
                <label className="text-slate-300" htmlFor="email">
                  Email: *
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
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="setor">
                  Setor: *
                </label>
                <select
                  id="setor"
                  name="setor_id"
                  value={form.setor_id}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  required
                >
                  {auth()?.user.nivel === "Super-Admin" ? (
                    <>
                      <option value="">Selecione um setor</option>
                      {setores.map((setor) => (
                        <option key={crypto.randomUUID()} value={setor.id}>
                          {setor.nome}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value={auth()?.user.setor.id}>
                      {auth()?.user.setor.nome}
                    </option>
                  )}
                </select>
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="nivel">
                  Nível: *
                </label>
                <select
                  id="nivel"
                  name="nivel"
                  value={form.nivel}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  required
                >
                  <option value="">Selecione um nível</option>
                  {auth()?.user.nivel === "Super-Admin" && (
                    <option value="Super-Admin">Super Administrador</option>
                  )}
                  <option value="Admin">Administrador</option>
                  <option value="User">Usuário</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="cpf">
                  CPF: *
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
                <label className="text-slate-300" htmlFor="matricula">
                  Matrícula:
                </label>
                <InputMask
                  id="matricula"
                  autoComplete="off"
                  name="matricula"
                  type="text"
                  value={form.matricula}
                  onChange={handleChange}
                  mask="999.999"
                  maskChar={null}
                  alwaysShowMask={false}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="000.000"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="pispasep">
                  PIS/PASEP:
                </label>
                <InputMask
                  id="pispasep"
                  autoComplete="off"
                  name="pispasep"
                  type="text"
                  value={form.pispasep}
                  onChange={handleChange}
                  mask="999.99999.99-9"
                  maskChar={null}
                  alwaysShowMask={false}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="000.00000.00-0"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="ctps">
                  CTPS:
                </label>
                <InputMask
                  id="ctps"
                  autoComplete="off"
                  name="ctps"
                  type="text"
                  value={form.ctps}
                  onChange={handleChange}
                  mask="9999999/9999"
                  maskChar={null}
                  alwaysShowMask={false}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="0000000/0000"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="data_admissao">
                  Data de Admissão:
                </label>
                <input
                  id="data_admissao"
                  autoComplete="off"
                  name="data_admissao"
                  type="date"
                  value={form.data_admissao}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-center text-slate-300">Repouso:</label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:justify-items-start lg:grid-cols-7">
                <div className="flex gap-2">
                  <input
                    id="domingo"
                    name="domingo"
                    type="checkbox"
                    defaultChecked={repouso[0]}
                    onChange={() => {
                      setRepouso((st) => {
                        return st.map((v, i) => {
                          return i === 0 ? !v : v;
                        }) as Repouso;
                      });
                    }}
                    disabled={loading}
                  />
                  <label className="text-slate-300" htmlFor="domingo">
                    Domingo
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    id="segunda_feira"
                    name="segunda_feira"
                    type="checkbox"
                    defaultChecked={repouso[1]}
                    onChange={() => {
                      setRepouso((st) => {
                        return st.map((v, i) => {
                          return i === 1 ? !v : v;
                        }) as Repouso;
                      });
                    }}
                    disabled={loading}
                  />
                  <label className="text-slate-300" htmlFor="segunda_feira">
                    Segunda-Feira
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    id="terca_feira"
                    name="terca_feira"
                    type="checkbox"
                    defaultChecked={repouso[2]}
                    onChange={() => {
                      setRepouso((st) => {
                        return st.map((v, i) => {
                          return i === 2 ? !v : v;
                        }) as Repouso;
                      });
                    }}
                    disabled={loading}
                  />
                  <label className="text-slate-300" htmlFor="terca_feira">
                    Terça-Feira
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    id="quarta_feira"
                    name="quarta_feira"
                    type="checkbox"
                    defaultChecked={repouso[3]}
                    onChange={() => {
                      setRepouso((st) => {
                        return st.map((v, i) => {
                          return i === 3 ? !v : v;
                        }) as Repouso;
                      });
                    }}
                    disabled={loading}
                  />
                  <label className="text-slate-300" htmlFor="quarta_feira">
                    Quarta-Feira
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    id="quinta_feira"
                    name="quinta_feira"
                    type="checkbox"
                    defaultChecked={repouso[4]}
                    onChange={() => {
                      setRepouso((st) => {
                        return st.map((v, i) => {
                          return i === 4 ? !v : v;
                        }) as Repouso;
                      });
                    }}
                    disabled={loading}
                  />
                  <label className="text-slate-300" htmlFor="quinta_feira">
                    Quinta-Feira
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    id="sexta_feira"
                    name="sexta_feira"
                    type="checkbox"
                    defaultChecked={repouso[5]}
                    onChange={() => {
                      setRepouso((st) => {
                        return st.map((v, i) => {
                          return i === 5 ? !v : v;
                        }) as Repouso;
                      });
                    }}
                    disabled={loading}
                  />
                  <label className="text-slate-300" htmlFor="sexta_feira">
                    Sexta-Feira
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    id="sabado"
                    name="sabado"
                    type="checkbox"
                    defaultChecked={repouso[6]}
                    onChange={() => {
                      setRepouso((st) => {
                        return st.map((v, i) => {
                          return i === 6 ? !v : v;
                        }) as Repouso;
                      });
                    }}
                    disabled={loading}
                  />
                  <label className="text-slate-300" htmlFor="sabado">
                    Sábado
                  </label>
                </div>
              </div>
            </div>
            {message.message.length > 0 && (
              <h2
                className={`mx-auto w-[275px] rounded px-2 py-1 text-center ${
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
          </div>
          <div className="w-full border-b border-white/20 shadow shadow-black/20"></div>
          <div className="flex px-4 pb-4">
            <button
              type="submit"
              className="rounded-lg bg-indigo-500/60 px-8 py-2 font-bold text-slate-300 shadow shadow-black/20 hover:bg-indigo-500/75 disabled:bg-indigo-400/30 hover:disabled:bg-indigo-400/40"
              disabled={loading}
            >
              {loading ? "CARREGANDO..." : "REGISTRAR"}
            </button>
          </div>
        </div>
      </div>
    </form>
  ) : (
    <Navigate to="/" />
  );
}
