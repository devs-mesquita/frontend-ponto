import * as React from "react";
import ReactDOM from "react-dom";
import type { UserWithSetor } from "@/types/interfaces";

import errorFromApi from "@/utils/errorFromAPI";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { notificationAtom, notificationInitialState } from "@/store";
import { useAtom } from "jotai";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { differenceInDays, addDays } from "date-fns";

type AtribuirFeriasProps = {
  user: UserWithSetor;
  closePopup: () => void;
};
type Resultado = "existente";

const API_URL = import.meta.env.VITE_API_URL;

export default function AtribuirFerias({
  closePopup,
  user,
}: AtribuirFeriasProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const setNotification = useAtom(notificationAtom)[1];
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (date?.from && date.to) {
      setLoading(true);
      setNotification(notificationInitialState);

      const startDate = date.from;
      const endDate = date.to;
      const daysQuantity = differenceInDays(endDate, startDate) + 1;
      const dates = Array.from({ length: daysQuantity }, (_value, index) => {
        return addDays(startDate, index).toDateString();
      });

      try {
        const res = await fetch(`${API_URL}/api/ferias`, {
          method: "POST",
          body: JSON.stringify({
            dates,
            cpf: user.cpf,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        const data = await res.json();
        console.log(data);

        setLoading(false);
        setNotification({
          message: "Registros criados com sucesso.",
          type: "success",
        });
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
              message: "Um registro já existe em alguma data selecionada.",
              type: "error",
            });
          }
        }

        setLoading(false);
      }
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed left-1/2 top-1/2 z-40 flex w-[28rem] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 rounded bg-slate-700 bg-gradient-to-br from-indigo-500/40 to-rose-500/40 p-4 md:w-[40rem] lg:w-[40rem]">
        <div className="my-4 flex h-full flex-1 flex-col gap-4 font-mono">
          <h2 className="text-center text-slate-200/90">
            Atribuir férias para{" "}
            {`${user.name.split(" ")[0]} ${
              user.name.split(" ").slice(-1) || ""
            }`}
          </h2>
          <form
            className="flex flex-col items-center justify-center gap-4"
            onSubmit={handleSubmit}
          >
            <div
              className={cn(
                "dark grid gap-2 rounded bg-slate-900 bg-gradient-to-br from-indigo-700/60 to-rose-500/60",
              )}
            >
              <Calendar
                className="dark rounded shadow shadow-black/30"
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                max={31}
                locale={ptBR}
              />
            </div>
            <span className="text-white">
              Selecione o período (máximo: 31 dias).
            </span>
            <button
              disabled={loading}
              className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:bg-slate-500/10"
            >
              {loading ? "Carregando..." : "Atribuir"}
            </button>
          </form>
        </div>
      </div>
      <div
        className="fixed z-30 h-screen w-screen bg-black/30 backdrop-blur-sm"
        onClick={closePopup}
      />
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
