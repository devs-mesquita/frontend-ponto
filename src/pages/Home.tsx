import { useAuthUser } from "react-auth-kit";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { /* addDays, */ format } from "date-fns";
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

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  document.title = "Ponto Eletrônico";
  const auth = useAuthUser();

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
    if (date?.from && date.to && auth()?.user.cpf) {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/registro?` +
            new URLSearchParams({
              from: date.from.toDateString(),
              to: date.to.toDateString(),
              cpf: auth()?.user.cpf || "",
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

  return (
    <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
      <h1 className="text-center text-slate-200/90">Consultar Pontos</h1>
      <form
        className="flex items-center justify-center gap-4"
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
      <div className="mx-4 flex-1 rounded border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20">
        <Table className="flex-1 shadow shadow-black/20">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-white">Data</TableHead>
              <TableHead className="text-center text-white">Entrada</TableHead>
              <TableHead className="text-center text-white">
                Ini. Interv.
              </TableHead>
              <TableHead className="text-center text-white">
                Fim Interv.
              </TableHead>
              <TableHead className="text-center text-white">Saída</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-slate-200/80">
            {registros &&
              Object.keys(registros).map((dateKey) => (
                <TableRow className="text-center" key={crypto.randomUUID()}>
                  <TableCell>
                    {format(new Date(`${dateKey} 12:00:00`), "dd/MM - EEEEEE", {
                      locale: ptBR,
                    })}
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
                                        {addHours(
                                          new Date(
                                            registros[dateKey]?.entrada || "",
                                          ),
                                          auth()?.user.setor.soma_entrada || 0,
                                        ).toLocaleTimeString("pt-BR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          registros[dateKey]?.[
                                            "inicio-intervalo"
                                          ] || "",
                                        ).toLocaleTimeString("pt-BR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          registros[dateKey]?.[
                                            "fim-intervalo"
                                          ] || "",
                                        ).toLocaleTimeString("pt-BR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </TableCell>
                                      <TableCell>
                                        {addHours(
                                          new Date(
                                            registros[dateKey]?.saida || "",
                                          ),
                                          auth()?.user.setor.soma_saida || 0,
                                        ).toLocaleTimeString("pt-BR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
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
  );
}
