import { useAuthUser, useAuthHeader } from "react-auth-kit";
import * as React from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";

import { CalendarIcon } from "@radix-ui/react-icons";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import exportPDF from "@/utils/exportPDF";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import InputMask from "react-input-mask";
import { UserWithSetor } from "@/types/interfaces";
import exportSetorPDF from "@/utils/exportSetorPDF";

type Setor = {
  id: number;
  nome: string;
  soma_entrada: number;
  soma_saida: number;
};

type Registro = {
  id: number;
  cpf: string;
  tipo:
    | "entrada"
    | "inicio-intervalo"
    | "fim-intervalo"
    | "saida"
    | "ferias"
    | "feriado"
    | "facultativo"
    | "abono"
    | "falta";
  data_hora: string;
  img: string;
};

type FRegistro = { data_hora: string; img: string };
type FilteredRegistro = {
  entrada?: FRegistro;
  "fim-intervalo"?: FRegistro;
  "inicio-intervalo"?: FRegistro;
  saida?: FRegistro;
  falta?: FRegistro;
  abono?: FRegistro;
  ferias?: FRegistro;
  feriado?: FRegistro;
  facultativo?: FRegistro;
};

type RegistroAPIResponse = {
  registros: Registro[];
  user: UserWithSetor;
};

type SetorRegistrosAPIResponse = {
  users: UserWithSetor[];
  feriados: Registro[];
  setorRegistros: Registro[];
};

const API_URL = import.meta.env.VITE_API_URL;

export default function Exports() {
  document.title = "Exportações";
  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [loading, setLoading] = React.useState<boolean>(false);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [cpf, setCPF] = React.useState<string>("");
  const handleChangeCPF = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setCPF(evt.target.value);
  };

  const [setores, setSetores] = React.useState<Setor[]>([]);
  const [setorID, setSetorID] = React.useState<string>("");

  React.useEffect(() => {
    const getSetores = async () => {
      if (auth()?.user.nivel === "Super-Admin") {
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
      } else {
        setSetores([auth()?.user.setor as Setor]);
      }
    };

    getSetores();
  }, []);

  const handleSubmitExportUserPontos = async (
    evt: React.FormEvent<HTMLFormElement>,
  ) => {
    evt.preventDefault();
    if (date?.from && date?.to && cpf) {
      setLoading(true);
      const cleanCPF = cpf.replace("-", "").replace(".", "").replace(".", "");
      try {
        const res = await fetch(
          `${API_URL}/api/registro?` +
            new URLSearchParams({
              from: date.from.toDateString(),
              to: date.to.toDateString(),
              cpf: cleanCPF,
            }),
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(),
            },
          },
        );

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        const data: RegistroAPIResponse = await res.json();
        setLoading(false);

        const { registros, user } = data;

        const registrosTable = registros.reduce(
          (lista, registro) => {
            const dateKey = registro.data_hora.split(" ")[0].trim();

            return {
              ...lista,
              [dateKey]: {
                ...lista[dateKey],
                [registro.tipo]: {
                  img: registro.img,
                  data_hora: registro.data_hora,
                },
              },
            };
          },
          {} as Record<string, FilteredRegistro>,
        );

        if (date.to && date.from) {
          exportPDF(registrosTable, user, { from: date.from, to: date.to });
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  const handleSubmitExportSetorPontos = async (
    evt: React.FormEvent<HTMLFormElement>,
  ) => {
    evt.preventDefault();
    if (date?.from && date?.to && setorID) {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/registro/setor?` +
            new URLSearchParams({
              from: date.from.toDateString(),
              to: date.to.toDateString(),
              setor_id: setorID,
            }),
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: authHeader(),
            },
          },
        );

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        const data: SetorRegistrosAPIResponse = await res.json();
        setLoading(false);

        const { users, feriados, setorRegistros } = data;
        console.log(users, feriados, setorRegistros);

        exportSetorPDF(users, feriados, setorRegistros, {
          from: date.from,
          to: date.to,
        });
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  return ["Admin", "Super-Admin"].includes(auth()?.user.nivel || "") ? (
    <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
      <h1 className="text-center text-slate-200/90">Exportar Pontos</h1>
      <div className={cn("dark mx-auto grid gap-2")}>
        <Popover>
          <PopoverTrigger asChild className="dark">
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "dark w-[280px] justify-start text-left font-normal text-slate-100",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yy", { locale: ptBR })} ~{" "}
                    {format(date.to, "dd/MM/yy", { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "dd/MM/yy", { locale: ptBR })
                )
              ) : (
                <span>Selecione o período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="dark w-auto bg-slate-800 bg-gradient-to-br from-indigo-700/30 to-rose-500/30 p-0 shadow shadow-black/30"
            align="start"
          >
            <Calendar
              className="dark"
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              max={31}
              locale={ptBR}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="m-4 mt-8 flex flex-col items-center justify-around rounded p-8 md:flex-row md:items-start">
        <form
          className="flex flex-col items-center justify-center gap-4"
          onSubmit={handleSubmitExportUserPontos}
        >
          <h1 className="text-center text-slate-200/90">
            Pontos por Usuário (CPF)
          </h1>
          <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
            <InputMask
              autoComplete="off"
              name="cpf"
              type="text"
              value={cpf}
              onChange={handleChangeCPF}
              mask="999.999.999-99"
              maskChar={null}
              alwaysShowMask={false}
              className="rounded border-2 bg-slate-200 p-1 text-center text-lg text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
              disabled={loading}
              placeholder="000.000.000-00"
              required
            />
            <button
              disabled={loading}
              className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:bg-slate-500/10"
            >
              {loading ? "Carregando..." : "Exportar"}
            </button>
          </div>
        </form>
        <form
          className="flex flex-col items-center justify-center gap-4"
          onSubmit={handleSubmitExportSetorPontos}
        >
          <h1 className="text-center text-slate-200/90">Pontos por Setor</h1>
          <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
            <select
              className="rounded border-2 bg-white px-2 py-1 text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
              disabled={loading}
              required
              value={setorID}
              onChange={(evt) => setSetorID(evt.target.value)}
            >
              <option value="">Selecione o setor</option>
              {setores.map((setor) => (
                <option value={setor.id} key={crypto.randomUUID()}>
                  {setor.nome}
                </option>
              ))}
            </select>
            <button
              disabled={loading}
              className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:bg-slate-500/10"
            >
              {loading ? "Carregando..." : "Exportar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <Navigate to="/" />
  );
}
