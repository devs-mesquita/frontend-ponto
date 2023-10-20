import * as React from "react";
import ReactDOM from "react-dom";
import type { UserWithSetor } from "@/types/interfaces";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { addHours } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    | "atestado"
    | "falta";
  data_hora: string;
};

type FilteredRegistro = {
  entrada?: string;
  "fim-intervalo"?: string;
  "inicio-intervalo"?: string;
  saida?: string;
  falta?: string;
  atestado?: string;
  ferias?: string;
  feriado?: string;
  facultativo?: string;
};

type RegistroAPIResponse = {
  registros: Registro[];
};

type ConsultarPontosProps = {
  user: UserWithSetor;
  closePopup: () => void;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function ConsultarPontos({
  closePopup,
  user,
}: ConsultarPontosProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined, //new Date(),
    to: undefined, //addDays(new Date(), 30),
  });

  const [loading, setLoading] = React.useState<boolean>(false);

  const [registros, setRegistros] = React.useState<
    Record<string, FilteredRegistro> | undefined
  >(undefined);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (date?.from && date.to) {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/registro?` +
            new URLSearchParams({
              from: date.from.toDateString(),
              to: date.to.toDateString(),
              cpf: user.cpf,
            }),
        );

        if (!res.ok) {
          const err = await res.json();
          throw err;
        }

        const data: RegistroAPIResponse = await res.json();
        setLoading(false);

        const registros = data.registros;

        const registrosTable = registros.reduce(
          (lista, registro) => {
            const dateKey = registro.data_hora.split(" ")[0].trim();

            return {
              ...lista,
              [dateKey]: {
                ...lista[dateKey],
                [registro.tipo]: registro.data_hora,
              },
            };
          },
          {} as Record<string, any>,
        );
        setRegistros(registrosTable);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed left-1/2 top-1/2 z-40 flex w-[28rem] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 rounded bg-slate-700 bg-gradient-to-br from-indigo-500/40 to-rose-500/40 p-4 md:w-[45rem] lg:w-[60rem]">
        <div className="my-4 flex h-full flex-1 flex-col gap-4 font-mono">
          <h2 className="text-center text-slate-200/90">
            Consultar Pontos de{" "}
            {`${user.name.split(" ")[0]} ${
              user.name.split(" ").slice(-1) || ""
            }`}
          </h2>
          <form
            className="flex flex-col items-center justify-center gap-4 md:flex-row"
            onSubmit={handleSubmit}
          >
            <div className={cn("dark grid gap-2")}>
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
            <button
              disabled={loading}
              className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:bg-slate-500/10"
            >
              {loading ? "Carregando..." : "Consultar"}
            </button>
          </form>
          <div className="mx-4 max-h-[72vh] overflow-auto rounded border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20">
            <Table className="relative flex-1 shadow shadow-black/20">
              <TableHeader className="sticky top-0 bg-slate-700 bg-gradient-to-r from-indigo-700/50 to-rose-700/30">
                <TableRow>
                  <TableHead className="text-center text-white">Data</TableHead>
                  <TableHead className="text-center text-white">
                    Entrada
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Ini. Interv.
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Fim Interv.
                  </TableHead>
                  <TableHead className="text-center text-white">
                    Saída
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-slate-200/80">
                {registros &&
                  Object.keys(registros).map((dateKey) => (
                    <TableRow className="text-center" key={crypto.randomUUID()}>
                      <TableCell>
                        {format(
                          new Date(`${dateKey} 12:00:00`),
                          "dd/MM - EEEEEE",
                          {
                            locale: ptBR,
                          },
                        )}
                      </TableCell>
                      {registros[dateKey]?.ferias ? (
                        <>
                          <TableCell>FÉRIAS</TableCell>
                          <TableCell>FÉRIAS</TableCell>
                          <TableCell>FÉRIAS</TableCell>
                          <TableCell>FÉRIAS</TableCell>
                        </>
                      ) : (
                        <>
                          {registros[dateKey]?.feriado ? (
                            <>
                              <TableCell>FERIADO</TableCell>
                              <TableCell>FERIADO</TableCell>
                              <TableCell>FERIADO</TableCell>
                              <TableCell>FERIADO</TableCell>
                            </>
                          ) : (
                            <>
                              {registros[dateKey]?.facultativo ? (
                                <>
                                  <TableCell>FACULTATIVO</TableCell>
                                  <TableCell>FACULTATIVO</TableCell>
                                  <TableCell>FACULTATIVO</TableCell>
                                  <TableCell>FACULTATIVO</TableCell>
                                </>
                              ) : (
                                <>
                                  {registros[dateKey]?.atestado ? (
                                    <>
                                      <TableCell>ATESTADO</TableCell>
                                      <TableCell>ATESTADO</TableCell>
                                      <TableCell>ATESTADO</TableCell>
                                      <TableCell>ATESTADO</TableCell>
                                    </>
                                  ) : (
                                    <>
                                      {registros[dateKey]?.falta ? (
                                        <>
                                          <TableCell>FALTA</TableCell>
                                          <TableCell>FALTA</TableCell>
                                          <TableCell>FALTA</TableCell>
                                          <TableCell>FALTA</TableCell>
                                        </>
                                      ) : (
                                        <>
                                          <TableCell>
                                            {registros[dateKey]?.entrada
                                              ? addHours(
                                                  new Date(
                                                    registros[dateKey]
                                                      ?.entrada || "",
                                                  ),
                                                  user.setor.soma_entrada || 0,
                                                ).toLocaleTimeString("pt-BR", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })
                                              : "---"}
                                          </TableCell>
                                          <TableCell>
                                            {registros[dateKey]?.[
                                              "inicio-intervalo"
                                            ]
                                              ? new Date(
                                                  registros[dateKey]?.[
                                                    "inicio-intervalo"
                                                  ] || "",
                                                ).toLocaleTimeString("pt-BR", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })
                                              : "---"}
                                          </TableCell>
                                          <TableCell>
                                            {registros[dateKey]?.[
                                              "fim-intervalo"
                                            ]
                                              ? new Date(
                                                  registros[dateKey]?.[
                                                    "fim-intervalo"
                                                  ] || "",
                                                ).toLocaleTimeString("pt-BR", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })
                                              : "---"}
                                          </TableCell>
                                          <TableCell>
                                            {registros[dateKey]?.saida
                                              ? addHours(
                                                  new Date(
                                                    registros[dateKey]?.saida ||
                                                      "",
                                                  ),
                                                  new Date(
                                                    registros[dateKey]?.saida ||
                                                      "",
                                                  ).getDay() === 5
                                                    ? 0
                                                    : user.setor.soma_saida ||
                                                        0,
                                                ).toLocaleTimeString("pt-BR", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })
                                              : "---"}
                                          </TableCell>
                                        </>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
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
