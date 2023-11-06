import { useState, useEffect } from "react";
import { useAuthUser, useAuthHeader } from "react-auth-kit";
import InputMask from "react-input-mask";
import { notificationAtom } from "@/store";
import { useAtom } from "jotai";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import errorFromApi from "@/utils/errorFromAPI";
import { UserWithSetor } from "@/types/interfaces";

type Repouso = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};
type ViewUserAPIResponse = {
  user: UserWithSetor;
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
    message: "Usuário modificado com sucesso.",
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

export default function UserEdit() {
  document.title = "Modificar Usuário";

  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [loading, setLoading] = useState<boolean>(false);
  const setNotification = useAtom(notificationAtom)[1];
  const navigate = useNavigate();
  const { userId } = useParams();

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const formInit = {
    user_id: 0,
    email: "",
    cpf: "",
    name: "",
    setor_nome: "",
    nivel_nome: "",
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

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/update`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          cpf: form.cpf.replace("-", "").replace(".", "").replace(".", ""),
          matricula: form.matricula.replace(".", ""),
          pispasep: form.pispasep
            .replace("-", "")
            .replace(".", "")
            .replace(".", ""),
          ctps: form.ctps.replace("/", ""),
          repouso,
          user_id: form.user_id,
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
      setNotification(results[data.resultado]);
      navigate("/users");
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

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/user/${userId}`, {
          headers: {
            Authorization: authHeader(),
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        const { user }: ViewUserAPIResponse = await res.json();

        setForm({
          user_id: user.id || 0,
          name: user.name || "",
          cpf: user.cpf || "",
          email: user.email || "",
          cargo: user.cargo || "",
          ctps: user.ctps || "",
          lotacao: user.lotacao || "",
          matricula: user.matricula || "",
          pispasep: user.pispasep || "",
          nivel_nome: user.nivel || "",
          setor_nome: user.setor.nome || "",
          data_admissao: user.data_admissao?.split(" ")[0] || "",
        });
        setRepouso(JSON.parse(user.repouso));

        setLoading(false);
      } catch (error) {
        setMessage({
          message: "Ocorreu um erro, atualize a página para tentar novamente.",
          type: "error",
        });
        console.error(error);
      }
    };

    getUser();
  }, []);

  return ["Super-Admin", "Admin"].includes(auth()?.user.nivel || "") ? (
    <form
      onSubmit={handleSubmit}
      className="m-4 flex flex-col gap-2 rounded-lg bg-white/5 shadow-md shadow-black/20"
    >
      <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
        Modificar Usuário
      </h1>
      <span className="text-center text-sm text-red-400">
        * Campos marcados com asterisco são obrigatórios.
      </span>
      <div className="flex flex-col">
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
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled
                >
                  <option>{form.setor_nome}</option>
                </select>
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="nivel">
                  Nível: *
                </label>
                <select
                  id="nivel"
                  name="nivel"
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled
                  value={form.nivel_nome}
                >
                  <option value=""></option>
                  <option value="User">Usuário</option>
                  <option value="Admin">Administrador</option>
                  <option value="Super-Admin">Super Administrador</option>
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
                <label className="text-slate-300" htmlFor="cargo">
                  Cargo:
                </label>
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  value={form.cargo}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Cargo"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="lotacao">
                  Lotação:
                </label>
                <input
                  id="lotacao"
                  name="lotacao"
                  type="text"
                  value={form.lotacao}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Lotação"
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
                    checked={repouso[0]}
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
                    checked={repouso[1]}
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
                    checked={repouso[2]}
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
                    checked={repouso[3]}
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
                    checked={repouso[4]}
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
                    checked={repouso[5]}
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
                    checked={repouso[6]}
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
              {loading ? "CARREGANDO..." : "SALVAR"}
            </button>
          </div>
        </div>
      </div>
    </form>
  ) : (
    <Navigate to="/" />
  );
}
