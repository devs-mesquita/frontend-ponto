import { useState } from "react";
import InputMask from "react-input-mask";
import dataURLtoBlob from "../utils/dataURLtoBlob";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const IMAGE_SIZE = +import.meta.env.VITE_IMAGE_SIZE;

type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};

type Ponto = "entrada" | "inicio-intervalo" | "fim-intervalo" | "saida";
type APIResponse = {
  resultado: "ok" | "timeout" | "complete";
  tipo: Ponto;
};
const results = {
  ok: {
    type: "success",
    message: "Ponto registrado com sucesso.",
  },
  timeout: {
    type: "warning",
    message: "Um ponto já foi registrado nos últimos 30 minutos.",
  },
  complete: {
    type: "warning",
    message: "Todos os pontos do dia já foram marcados.",
  },
  error: {
    type: "error",
    message: "Ocorreu um erro.",
  },
} as const;

const messages = {
  entrada: "Horário de entrada registrado com sucesso.",
  "inicio-intervalo": "Início de intervalo registrado com sucesso.",
  "fim-intervalo": "Fim de intervalo registrado com sucesso.",
  saida: "Horário de saída registrado com sucesso.",
} as const;

export default function PontoEletronico() {
  const [cpf, setCPF] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const messageInit: Message = {
    type: "",
    message: "",
  };
  const [message, setMessage] = useState<Message>(messageInit);

  const camera = document.querySelector<HTMLVideoElement>("#camera")!;

  const handleCPFChange = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setCPF(evt.target.value);

    if (
      (evt.target.value.length > 0 && cpf.length === 0) ||
      !camera.srcObject
    ) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      camera.srcObject = stream;
      camera.play();
    } else if (evt.target.value.length === 0) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      stream.getTracks()[0].stop();
      camera.srcObject = null;
    }
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (cpf.length !== 14) return;

    setLoading(true);
    setMessage(messageInit);

    try {
      // Make image
      const canvas = document.createElement("canvas");
      canvas.height = IMAGE_SIZE;
      canvas.width = IMAGE_SIZE;
      const context = canvas.getContext("2d");
      context?.drawImage(camera, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

      // Make File image
      const imageURL = canvas.toDataURL("image/jpeg", 1);
      const blob = dataURLtoBlob(imageURL);
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      // Download for Testing Purposes
      // const anchor = document.createElement("a");
      // anchor.href = imageURL;
      // anchor.download = "ponto-eletronico.png";
      // anchor.click();

      // Make FormData
      const formData = new FormData();
      formData.append("cpf", cpf);
      formData.append("img", file);

      // Send to API.
      const cpfClean = cpf.replace("-", "").replace(".", "").replace(".", "");
      const result = await fetch(`${API_URL}/api/registro/${cpfClean}`, {
        method: "POST",
        body: formData,
        headers: {
          "X-API-KEY": API_KEY,
        },
      });

      if (!result.ok) {
        const err = await result.json();
        throw new Error(err);
      }

      const res: APIResponse = await result.json();

      setCPF("");
      camera.srcObject = null;
      setLoading(false);

      if (res.resultado === "ok") {
        setMessage({
          ...results[res.resultado],
          message: messages[res.tipo],
        });
      } else {
        setMessage(results[res.resultado]);
      }
    } catch (error) {
      setLoading(false);
      setMessage(results["error"]);
      console.error(error);
    }

    setTimeout(() => {
      setMessage(messageInit);
    }, 6000);
  };

  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="rounded-lg bg-white/5 p-2 shadow-md shadow-black/20">
        <div className="h-[300px] w-[300px] overflow-hidden">
          <video
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
          {message.message.length > 0 && (
            <h2
              className={`animate-disappear max-w-[275px] rounded px-2 py-1 text-center ${
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
  );
}
