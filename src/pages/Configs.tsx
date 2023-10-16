// Configurações/Administração:
// - Criação de feriado/ponto facultativo (cpf = "sistema");
// - Lista de Feriados/Pontos Facultativos criados.

//import { useAuthUser } from "react-auth-kit";
import * as React from "react";
import { CalendarIcon, TrashIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";

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

import type { AppDialog } from "@/types/interfaces";
import ConfirmationDialog from "@/components/ConfirmationDialog";

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

export default function Configs() {
  document.title = "Configurações";
  //const auth = useAuthUser();

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
          `${API_URL}/api/configs?` +
            new URLSearchParams({
              from: date.from.toDateString(),
              to: date.to.toDateString(),
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

  const dialogInitialState: AppDialog = {
    isOpen: false,
    message: "",
    accept: () => {},
    reject: () => {},
  };

  const [dialog, setDialog] = React.useState<AppDialog>(dialogInitialState);

  const handleConfirmation = (
    accept: () => void,
    message: string = "Deseja confimar a operação?",
    reject = () => {
      setDialog(() => dialogInitialState);
    },
  ) => {
    setDialog({
      isOpen: true,
      accept,
      reject,
      message,
    });
  };

  const handleDelete = async (dateKey: string) => {
    try {
      setLoading(true);
      console.log(dateKey);

      /* const res = await fetch(`${API_URL}/api/configs/delete`, {
        method: "POST",
        body: JSON.stringify({ date: dateKey }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw err;
      }

      const data = await res.json();
      console.log(data); */

      setLoading(false);
      setDialog(dialogInitialState);
      
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
        <h1 className="text-center text-slate-200/90">
          Feriados e Pontos Facultativos
        </h1>
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
                  numberOfMonths={2}
                  max={62}
                  locale={ptBR}
                  // disabled={{ after: new Date() }}
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
                <TableHead className="text-center text-white">Tipo</TableHead>
                <TableHead className="text-center text-white">Ações</TableHead>
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
                    <>
                      {registros[dateKey]?.feriado ? (
                        <>
                          <TableCell>FERIADO</TableCell>
                          <TableCell>
                            <form
                              onSubmit={() =>
                                handleConfirmation(
                                  () => handleDelete(dateKey),
                                  "Deseja confirmar a remoção do feriado?",
                                )
                              }
                            >
                              <button>
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </form>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          {registros[dateKey]?.facultativo ? (
                            <>
                              <TableCell>FACULTATIVO</TableCell>
                              <TableCell>
                                <form
                                  onSubmit={() =>
                                    handleConfirmation(
                                      () => handleDelete(dateKey),
                                      "Deseja confirmar a remoção do ponto facultativo?",
                                    )
                                  }
                                >
                                  <button>
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </form>
                              </TableCell>
                            </>
                          ) : (
                            ""
                          )}
                        </>
                      )}
                    </>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {dialog.isOpen && (
        <ConfirmationDialog
          accept={dialog.accept}
          reject={dialog.reject}
          message={dialog.message}
        />
      )}
    </>
  );
}
