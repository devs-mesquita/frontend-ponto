import * as React from "react";
import ReactDOM from "react-dom";

import errorFromApi from "@/utils/errorFromAPI";

import { notificationAtom, notificationInitialState } from "@/store";
import { useAtom } from "jotai";

import { useAuthHeader } from "react-auth-kit";
import { AppNotification, UserWithSetor } from "@/types/interfaces";

type Ponto = "entrada" | "inicio-intervalo" | "fim-intervalo" | "saida";
type CreateRegistroResultado =
  | "ok"
  | "timeout"
  | "complete"
  | "invalid-cpf"
  | "unauthorized"
  | "not-found";

type CreateRegistroAPIResponse = {
  resultado: CreateRegistroResultado;
  tipo: Ponto;
};

type ConfirmarRegistroProps = {
  cpf: string;
  img: File;
  tipo: Ponto;
  user: UserWithSetor;
  closePopup: () => void;
};

const notifications = {
  unauthorized: {
    message: "Permissão negada.",
    type: "error",
  },
  "invalid-cpf": {
    message: "CPF inválido.",
    type: "error",
  },
  "not-found": {
    message: "O usuário não foi encontrado.",
    type: "error",
  },
  timeout: {
    message: "Um ponto já foi registrado nos últimos 30 minutos.",
    type: "error",
  },
  complete: {
    message: "Todos os pontos já foram marcados.",
    type: "success",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
  ok: {
    message: "Nível atribuído com sucesso.",
    type: "success",
  },
} as const;

const messages = {
  entrada: "Ponto de entrada registrado com sucesso.",
  "inicio-intervalo": "Início de intervalo registrado com sucesso.",
  "fim-intervalo": "Fim de intervalo registrado com sucesso.",
  saida: "Ponto de saída registrado com sucesso.",
} as const;

const API_URL = import.meta.env.VITE_API_URL;

export default function ConfirmarRegistro({
  closePopup,
  cpf,
  img,
  tipo,
  user,
}: ConfirmarRegistroProps) {
  const authHeader = useAuthHeader();
  const setNotification = useAtom(notificationAtom)[1];
  const [loading, setLoading] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<AppNotification>();

  const handleCancel = async (
    evt: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
  ) => {
    evt.preventDefault();
    if (!loading) {
      closePopup();
    }
  };

  const handleSubmit = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setLoading(true);

    try {
      // Make FormData
      const formData = new FormData();
      const cleanCPF = cpf.replace("-", "").replace(".", "").replace(".", "");
      formData.append("cpf", cleanCPF);
      formData.append("img", img);

      // Send to API.
      const result = await fetch(`${API_URL}/api/registro`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          Authorization: authHeader(),
        },
      });

      if (!result.ok) {
        const err = await result.json();
        throw err;
      }

      const res: CreateRegistroAPIResponse = await result.json();

      setLoading(false);
      setNotification({
        type: "success",
        message: messages[res.tipo],
      });
      setTimeout(() => {
        setNotification(notificationInitialState);
      }, 5000);
      closePopup();
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        setMessage(notifications["error"]);
      } else if (
        errorFromApi<{ resultado: CreateRegistroResultado }>(error, "resultado")
      ) {
        const resultado = error.resultado as CreateRegistroResultado;
        setMessage(notifications[resultado]);
      }

      setLoading(false);
    }
  };

  const names = user.name.split(" ");
  const briefUserName = `${names[0]} ${
    names[1].length > 3 ? names[1] : `${names[1]} ${names[2]}`
  }`;

  const ponto = {
    entrada: "ponto de entrada",
    "inicio-intervalo": "início de intervalo",
    "fim-intervalo": "fim de intervalo",
    saida: "ponto de saída",
  } as const;

  return ReactDOM.createPortal(
    <>
      <div className="fixed left-1/2 top-1/2 z-30 flex w-[28rem] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 rounded bg-slate-700 bg-gradient-to-br from-indigo-500/40 to-rose-500/40 p-4 md:w-[40rem] lg:w-[40rem]">
        <div className="my-4 flex h-full flex-1 flex-col gap-4 font-mono">
          <h2 className="text-center text-slate-200/90">
            Registrar {ponto[tipo]} para {briefUserName}.
          </h2>
          {message?.message !== undefined && (
            <h2
              className={`mx-auto max-w-[275px] rounded px-2 py-1 text-center ${
                message?.type === "success"
                  ? "bg-green-400 text-green-900"
                  : message?.type === "error"
                  ? "bg-red-400 text-red-900"
                  : ""
              }`}
            >
              {message?.message}
            </h2>
          )}
          <form className="flex-2 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-8">
              <button
                onClick={handleSubmit}
                type="submit"
                disabled={loading}
                className="rounded bg-green-500 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-green-400 hover:text-white disabled:bg-green-400/70"
              >
                {loading ? "Carregando..." : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="rounded bg-slate-500 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-400 hover:text-white disabled:bg-slate-400/70"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        className="fixed z-20 h-screen w-screen bg-black/30 backdrop-blur-sm"
        onClick={handleCancel}
      />
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
