import { useEffect, useState } from "react";
import { useAuthUser, useAuthHeader } from "react-auth-kit";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import errorFromApi from "@/utils/errorFromAPI";
import InputMask from "react-input-mask";
import { Setor } from "@/types/interfaces";
import { notificationAtom } from "@/store";
import { useAtom } from "jotai";

type ViewSetorAPIResponse = {
  setor: Setor;
};
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
    message: "Setor modificado com sucesso.",
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

export default function SetorEdit() {
  document.title = "Modificar Setor";

  const auth = useAuthUser();
  const authHeader = useAuthHeader();
  const { setorId } = useParams();

  const navigate = useNavigate();
  const setNotification = useAtom(notificationAtom)[1];
  const [loading, setLoading] = useState<boolean>(false);

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const formInit = {
    setor_id: 0,
    nome: "",
    empresa: "",
    cnpj: "",
    cnae: "",
    visto_fiscal: "",
    cep: "",
    logradouro: "",
    numero_logradouro: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    soma_entrada: 0,
    soma_saida: 0,
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

  useEffect(() => {
    const getSetor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/setores/${setorId}`, {
          headers: {
            Authorization: authHeader(),
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        const { setor }: ViewSetorAPIResponse = await res.json();

        setForm({
          setor_id: setor.id,
          nome: setor.nome,
          empresa: setor.empresa,
          cnpj: setor.cnpj,
          cnae: setor.cnae,
          visto_fiscal: setor.visto_fiscal,
          cep: setor.cep,
          logradouro: setor.logradouro,
          numero_logradouro: setor.numero_logradouro,
          complemento: setor.complemento,
          bairro: setor.bairro,
          cidade: setor.cidade,
          uf: setor.uf,
          soma_entrada: setor.soma_entrada,
          soma_saida: setor.soma_saida,
        });

        setLoading(false);
      } catch (error) {
        setMessage({
          message: "Ocorreu um erro, atualize a página para tentar novamente.",
          type: "error",
        });
        //setLoading(false);
        console.error(error);
      }
    };

    getSetor();
  }, []);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setMessage(messageInit);
    setLoading(true);
    if (!form.nome) return;

    try {
      const res = await fetch(`${API_URL}/api/setores/update`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          cnpj: form.cnpj
            .replace("-", "")
            .replace(".", "")
            .replace(".", "")
            .replace("/", ""),
          cep: form.cep.replace("-", ""),
          cnae: form.cnae.replace("/", "").replace("-", ""),
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
      setNotification(results[data.resultado]);
      navigate("/setores");
      // setLoading(false);
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
      className="m-4 flex flex-col gap-2 rounded-lg bg-white/5 shadow-md shadow-black/20"
    >
      <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
        Novo Setor
      </h1>
      <span className="text-center text-sm text-red-400">
        * Campos marcados com asterisco são obrigatórios.
      </span>
      <div className="flex flex-col">
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-4 px-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-slate-300" htmlFor="nome">
                  Nome do Setor: *
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Arthur de Oliveira"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="empresa">
                  Empresa:
                </label>
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  value={form.empresa}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Razão Social"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="cnpj">
                  CNPJ:
                </label>
                <InputMask
                  id="cnpj"
                  autoComplete="off"
                  name="cnpj"
                  type="text"
                  value={form.cnpj}
                  onChange={handleChange}
                  mask="99.999.999/9999-99"
                  maskChar={null}
                  alwaysShowMask={false}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="cnae">
                  CNAE:
                </label>
                <InputMask
                  id="cnae"
                  autoComplete="off"
                  name="cnae"
                  type="text"
                  value={form.cnae}
                  onChange={handleChange}
                  mask="9999-9/99"
                  maskChar={null}
                  alwaysShowMask={false}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="0000-0/00"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="visto_fiscal">
                  Visto Fiscal:
                </label>
                <input
                  id="visto_fiscal"
                  autoComplete="off"
                  name="visto_fiscal"
                  type="text"
                  value={form.visto_fiscal}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Visto Fiscal"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-1 flex-col gap-1">
                <label className="text-slate-300" htmlFor="cep">
                  CEP:
                </label>
                <InputMask
                  id="cep"
                  autoComplete="off"
                  name="cep"
                  type="text"
                  value={form.cep}
                  onChange={handleChange}
                  mask="99999-999"
                  maskChar={null}
                  alwaysShowMask={false}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="00000-000"
                />
              </div>
              <div className="md:flex-1"></div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="logradouro">
                  Logradouro:
                </label>
                <input
                  id="logradouro"
                  autoComplete="off"
                  name="logradouro"
                  type="text"
                  value={form.logradouro}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Rua Arthur de Oliveira Vechi"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="numero_logradouro">
                  Número:
                </label>
                <input
                  id="numero_logradouro"
                  autoComplete="off"
                  name="numero_logradouro"
                  type="text"
                  value={form.numero_logradouro}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="120"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="complemento">
                  Complemento:
                </label>
                <input
                  id="complemento"
                  autoComplete="off"
                  name="complemento"
                  type="text"
                  value={form.complemento}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="(Opcional)"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="bairro">
                  Bairro:
                </label>
                <input
                  id="bairro"
                  autoComplete="off"
                  name="bairro"
                  type="text"
                  value={form.bairro}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Centro"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="cidade">
                  Cidade:
                </label>
                <input
                  id="cidade"
                  autoComplete="off"
                  name="cidade"
                  type="text"
                  value={form.cidade}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="Mesquita"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <label className="text-slate-300" htmlFor="uf">
                  UF:
                </label>
                <input
                  maxLength={2}
                  id="uf"
                  autoComplete="off"
                  name="uf"
                  type="text"
                  value={form.uf}
                  onChange={handleChange}
                  className="w-full rounded border-2 bg-slate-200 py-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                  disabled={loading}
                  placeholder="RJ"
                />
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
