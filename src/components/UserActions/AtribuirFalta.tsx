import * as React from "react";
import ReactDOM from "react-dom";
import type { UserWithSetor } from "@/types/interfaces";

import errorFromApi from "@/utils/errorFromAPI";
import { ptBR } from "date-fns/locale";

import { notificationAtom } from "@/store";
import { useAtom } from "jotai";

import { Calendar } from "@/components/ui/calendar";
import { useAuthHeader } from "react-auth-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AtribuirFaltaProps = {
  user: UserWithSetor;
  closePopup: () => void;
};
type Resultado = "existente";

const API_URL = import.meta.env.VITE_API_URL;

export default function AtribuirFalta({
  closePopup,
  user,
}: AtribuirFaltaProps) {
  const authHeader = useAuthHeader();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [img, setImg] = React.useState<File | undefined | null>(undefined);

  const handleChangeFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setImg(evt.target.files?.item(0));
  };

  const setNotification = useAtom(notificationAtom)[1];
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (date) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("cpf", user.cpf);
        formData.append("tipo", "falta");
        formData.append("date", date.toDateString());
        if (img) {
          formData.append("img", img);
        }

        const res = await fetch(`${API_URL}/api/registro`, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            Authorization: authHeader(),
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        setLoading(false);
        setNotification({
          message: "Registro de falta criado com sucesso.",
          type: "success",
        });
        closePopup();
      } catch (error) {
        console.log(error);

        if (error instanceof Error) {
          setNotification({
            message: "Ocorreu um erro.",
            type: "error",
          });
        } else if (errorFromApi<{ resultado: Resultado }>(error, "resultado")) {
          const resultado = error.resultado as Resultado;
          if (resultado === "existente") {
            setNotification({
              message: "Registro existente na data selecionada.",
              type: "error",
            });
          }
        }

        setLoading(false);
      }
    }
  };

  const names = user.name.split(" ");
  const briefUserName = `${names[0]} ${
    names[1].length > 3 ? names[1] : `${names[1]} ${names[2]}`
  }`;

  return ReactDOM.createPortal(
    <>
      <div className="fixed left-1/2 top-1/2 z-30 flex max-h-[90vh] w-[28rem] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 overflow-auto rounded bg-slate-700 bg-gradient-to-br from-indigo-500/40 to-rose-500/40 p-4 md:w-[40rem] lg:w-[40rem]">
        <div className="my-4 flex h-full flex-1 flex-col gap-4 font-mono">
          <h2 className="text-center text-slate-200/90">
            Atribuir falta para {briefUserName}
          </h2>
          <form
            className="flex-2 flex flex-col items-center justify-center gap-2"
            onSubmit={handleSubmit}
          >
            <span className="text-white">Selecione a data.</span>
            <Calendar
              className="dark w-auto rounded bg-slate-800 bg-gradient-to-br from-indigo-700/30 to-rose-500/30 p-3 text-white shadow shadow-black/30"
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              initialFocus
            />
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="img" className="text-center text-base text-white">
                Imagem/Documento (opcional).
              </Label>
              <Input id="img" type="file" onChange={handleChangeFile} />
            </div>
            <div className="flex items-center gap-4">
              <button
                disabled={loading}
                className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:bg-slate-500/10"
              >
                {loading ? "Carregando..." : "Atribuir"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div
        className="fixed z-20 h-screen w-screen bg-black/30 backdrop-blur-sm"
        onClick={closePopup}
      />
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
