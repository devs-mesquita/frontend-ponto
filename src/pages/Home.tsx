import { useAuthHeader, useAuthUser } from "react-auth-kit";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { addHours } from "date-fns";
import InputMask from "react-input-mask";

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
import exportPDF from "@/utils/exportPDF";
import { UserWithSetor } from "@/types/interfaces";

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
};

type FilteredRegistro = {
  entrada?: string;
  "fim-intervalo"?: string;
  "inicio-intervalo"?: string;
  saida?: string;
  falta?: string;
  abono?: string;
  ferias?: string;
  feriado?: string;
  facultativo?: string;
};

type RegistroAPIResponse = {
  registros: Registro[];
  user: UserWithSetor;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  document.title = "Ponto Eletrônico";
  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [lastDate, setLastDate] = React.useState<{
    from: Date;
    to: Date;
  } | null>(null);
  const [cpf, setCPF] = React.useState<string>("");

  const handleChangeCPF = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    setCPF(evt.target.value);
  };

  const [loading, setLoading] = React.useState<boolean>(false);

  const [registros, setRegistros] = React.useState<
    Record<string, FilteredRegistro> | undefined
  >(undefined);

  const [user, setUser] = React.useState<UserWithSetor | undefined>(undefined);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (
      date?.from &&
      date.to &&
      ((["Super-Admin"].includes(auth()?.user.nivel || "") &&
        cpf.length === 14) ||
        (!["Super-Admin"].includes(auth()?.user.nivel || "") &&
          auth()?.user.cpf))
    ) {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/registro?` +
            new URLSearchParams({
              from: date.from.toDateString(),
              to: date.to.toDateString(),
              cpf:
                auth()?.user.nivel === "Super-Admin"
                  ? cpf.replace("-", "").replace(".", "").replace(".", "")
                  : auth()?.user.cpf || "",
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
                [registro.tipo]: registro.data_hora,
              },
            };
          },
          {} as Record<string, FilteredRegistro>,
        );
        setLastDate({ from: date.from, to: date.to });
        setRegistros(registrosTable);
        setUser(user);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    if (
      registros &&
      lastDate !== null &&
      auth()?.user.nivel !== "Super-Admin"
    ) {
      exportPDF(registros, auth()?.user as UserWithSetor, lastDate);
      return;
    }

    if (
      registros &&
      lastDate !== null &&
      user &&
      auth()?.user.nivel === "Super-Admin"
    ) {
      exportPDF(registros, user, lastDate);
    }
  };

  return (
    <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
      <h1 className="text-center text-slate-200/90">Consultar Pontos</h1>
      <form
        className="flex flex-col items-center justify-center gap-4 md:flex-row"
        onSubmit={handleSubmit}
      >
        {["Super-Admin"].includes(auth()?.user.nivel || "") && (
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
        )}
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
      {registros && lastDate && Object.keys(registros).length > 0 && (
        <button
          onClick={handleExport}
          disabled={
            !(registros && lastDate && Object.keys(registros).length > 0)
          }
          className="mx-auto rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:cursor-not-allowed disabled:bg-slate-500/10 disabled:from-indigo-500/10 disabled:to-rose-500/10 hover:disabled:text-white/80"
        >
          Exportar PDF
        </button>
      )}
      <div className="mx-4 flex-1 rounded border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20">
        <Table className="flex-1 shadow shadow-black/20">
          <TableHeader className="sticky top-0 bg-slate-700 bg-gradient-to-r from-indigo-700/50 to-rose-700/30">
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
                              {registros[dateKey]?.abono ? (
                                <>
                                  <TableCell>ABONO</TableCell>
                                  <TableCell>ABONO</TableCell>
                                  <TableCell>ABONO</TableCell>
                                  <TableCell>ABONO</TableCell>
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
                                                registros[dateKey]?.entrada ||
                                                  "",
                                              ),
                                              auth()?.user.setor.soma_entrada ||
                                                0,
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
                                        {registros[dateKey]?.["fim-intervalo"]
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
                                                registros[dateKey]?.saida || "",
                                              ),
                                              new Date(
                                                registros[dateKey]?.saida || "",
                                              ).getDay() === 5
                                                ? 0
                                                : auth()?.user.setor
                                                    .soma_saida || 0,
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
  );
}
