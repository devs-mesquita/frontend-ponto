import { useState, useRef } from "react";
import { useAuthUser, useAuthHeader } from "react-auth-kit";
import { Navigate } from "react-router-dom";
import InputMask from "react-input-mask";
import dataURLtoBlob from "../utils/dataURLtoBlob";
import errorFromApi from "../utils/errorFromAPI";
import ConfirmarRegistro from "../components/TerminalActions/ConfirmarRegistro";
import { UserWithSetor } from "@/types/interfaces";

import { useAtom } from "jotai";
import { notificationAtom, notificationInitialState } from "@/store";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const IMAGE_SIZE = +import.meta.env.VITE_IMAGE_SIZE;

type Ponto = "entrada" | "inicio-intervalo" | "fim-intervalo" | "saida";

type ConfirmarRegistroPopup = {
  close: () => void;
} & (
  | {
      isOpen: true;
      cpf: string;
      tipo: Ponto;
      img: File;
      user: UserWithSetor;
    }
  | {
      isOpen: false;
      cpf: undefined;
      tipo: undefined;
      img: undefined;
      user: undefined;
    }
);

type ConfirmarRegistroResultado =
  | "ok"
  | "timeout"
  | "complete"
  | "invalid-cpf"
  | "ferias"
  | "falta"
  | "atestado"
  | "unauthorized"

type ConfirmarRegistroAPIResponse =
  | {
      tipo: undefined;
      user: undefined;
      resultado: Omit<ConfirmarRegistroResultado, "ok">;
    }
  | { resultado: "ok"; tipo: Ponto; user: UserWithSetor };

const results = {
  ok: {
    type: "success",
    message: "Ponto registrado com sucesso.",
  },
  timeout: {
    type: "warning",
    message: "Um ponto já foi registrado nos últimos 30 minutos.",
  },
  "invalid-cpf": {
    type: "error",
    message: "CPF inválido.",
  },
  complete: {
    type: "warning",
    message: "Todos os pontos do dia já foram marcados.",
  },
  error: {
    type: "error",
    message: "Ocorreu um erro.",
  },
  ferias: {
    type: "warning",
    message: "Registro de férias existente nesta data.",
  },
  feriado: {
    type: "warning",
    message: "Registro de feriado existente nesta data.",
  },
  falta: {
    type: "warning",
    message: "Registro de falta existente nesta data.",
  },
  atestado: {
    type: "warning",
    message: "Registro de atestado existente nesta data.",
  },
  unauthorized: {
    type: "warning",
    message: "Permissão negada.",
  },
} as const;

export default function Terminal() {
  document.title = "Ponto Eletrônico";

  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [cpf, setCPF] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [notification, setNotification] = useAtom(notificationAtom);

  //const camera = document.querySelector<HTMLVideoElement>("#camera")!;
  const camera = useRef<HTMLVideoElement>(null);
  const assignCamera = (m: MediaProvider | null) => {
    if (camera.current) {
      camera.current.srcObject = m;
      camera.current.play();
    }
  };

  const handleCPFChange = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setCPF(evt.target.value);

    if (evt.target.value.length > 0 && cpf.length === 0) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      assignCamera(stream);
    } else if (evt.target.value.length === 0) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      stream.getTracks()[0].stop();
      assignCamera(null);
    }
  };

  const confirmarRegistroInitialState: ConfirmarRegistroPopup = {
    close: () => {
      setCPF("");
      assignCamera(null);
      setLoading(false);
      setConfirmarRegistro((st) => ({
        ...st,
        tipo: undefined,
        cpf: undefined,
        img: undefined,
        isOpen: false,
        user: undefined,
      }));
    },
    isOpen: false,
    cpf: undefined,
    img: undefined,
    user: undefined,
    tipo: undefined,
  };
  const [confirmarRegistro, setConfirmarRegistro] =
    useState<ConfirmarRegistroPopup>(confirmarRegistroInitialState);

  const handlePopupConfirmarRegistro = (
    cpf: string,
    img: File,
    tipo: Ponto,
    user: UserWithSetor,
  ) => {
    setConfirmarRegistro((st) => ({
      ...st,
      cpf,
      img,
      tipo,
      user,
      isOpen: true,
    }));
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (cpf.length !== 14) return;

    setLoading(true);
    setNotification(notificationInitialState);

    try {
      const cleanCPF = cpf.replace("-", "").replace(".", "").replace(".", "");

      if (!camera.current) {
        setNotification({
          message: "A câmera não foi encontrada.",
          type: "error",
        });
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.height = IMAGE_SIZE;
      canvas.width = IMAGE_SIZE;
      const context = canvas.getContext("2d");
      context?.drawImage(camera.current, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

      // Make File image
      const imageURL = canvas.toDataURL("image/jpeg", 1);
      const blob = dataURLtoBlob(imageURL);
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      const result = await fetch(`${API_URL}/api/registro/confirm`, {
        method: "POST",
        body: JSON.stringify({
          cpf: cleanCPF,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader(),
          "X-API-KEY": API_KEY,
        },
      });

      if (!result.ok) {
        const err = await result.json();
        throw err;
      }

      const res: ConfirmarRegistroAPIResponse = await result.json();

      if (res.resultado === "ok" && res.tipo) {
        handlePopupConfirmarRegistro(cleanCPF, file, res.tipo, res.user);
      }
    } catch (error) {
      console.log(error);

      if (error instanceof Error) {
        setNotification(results["error"]);
      } else if (
        errorFromApi<{ resultado: ConfirmarRegistroResultado }>(
          error,
          "resultado",
        )
      ) {
        const resultado = error.resultado as ConfirmarRegistroResultado;
        setNotification(results[resultado]);
      }

      setTimeout(() => {
        setNotification(notificationInitialState);
      }, 5000);
      setLoading(false);
    }
  };

  return auth()?.user.setor.nome === "TERMINAL" ? (
    <>
      <div id="notifications" />
      <div id="modal" />
      <div className="m-auto my-4 flex flex-1 flex-col justify-center gap-6">
        <div className="rounded-lg bg-white/5 p-2 shadow-md shadow-black/20">
          <div className="h-[300px] w-[300px] overflow-hidden">
            <video
              ref={camera}
              id="camera"
              src=""
              className="h-full w-full rounded-lg bg-white/20 object-cover object-center"
              muted
            />
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center rounded-lg bg-white/5 shadow-md shadow-black/20"
        >
          <h1 className="w-full cursor-default border-b border-white/20 p-3 text-center text-2xl text-slate-300 shadow shadow-black/20">
            Ponto Eletrônico
          </h1>
          <div className="flex flex-col items-center p-4">
            {notification.message.length > 0 && (
              <h2
                className={`max-w-[275px] rounded px-2 py-1 text-center ${
                  notification.type === "success"
                    ? "bg-green-400 text-green-900"
                    : notification.type === "error"
                    ? "bg-red-400 text-red-900"
                    : notification.type === "warning"
                    ? "bg-yellow-300 text-yellow-900"
                    : ""
                }`}
              >
                {notification.message}
              </h2>
            )}
            <img src="/logo192.png" className="w-[130px] py-4" />
            <div className="flex flex-col items-center gap-4">
              <label className="text-xl text-slate-300">Digite o seu CPF</label>
              <InputMask
                autoComplete="off"
                name="cpf"
                type="text"
                value={cpf}
                onChange={handleCPFChange}
                mask="999.999.999-99"
                maskChar={null}
                alwaysShowMask={false}
                className="rounded border-2 bg-slate-200 p-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                placeholder="000.000.000-00"
                required
              />
              <button
                className="w-full rounded-lg bg-indigo-500/60 py-2 font-bold text-slate-300 shadow shadow-black/20 hover:bg-indigo-500/75 disabled:bg-indigo-400/30 hover:disabled:bg-indigo-400/40"
                disabled={loading}
              >
                {loading ? "ENVIANDO..." : "ENVIAR"}
              </button>
            </div>
          </div>
        </form>
      </div>
      {confirmarRegistro.isOpen && (
        <ConfirmarRegistro
          cpf={confirmarRegistro.cpf}
          img={confirmarRegistro.img}
          tipo={confirmarRegistro.tipo}
          closePopup={confirmarRegistro.close}
          user={confirmarRegistro.user}
        />
      )}
    </>
  ) : (
    <Navigate to="/" />
  );
}
