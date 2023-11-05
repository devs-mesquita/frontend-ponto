import { useAuthHeader, useAuthUser } from "react-auth-kit";
import * as React from "react";
import {
  CalendarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TimerIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { Navigate } from "react-router-dom";

import { useAtom } from "jotai";
import { notificationAtom } from "@/store";

import errorFromApi from "@/utils/errorFromAPI";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
};
type Resultado = "existente";

type CreateRegistroResultado = "ok" | "existente";
type CreateRegistroTipo = "feriado" | "facultativo";
type CreateRegistroAPIResponse = {
  resultado: CreateRegistroResultado;
  tipo: CreateRegistroTipo;
};
const results = {
  ok: {
    message: "Registro criado com sucesso.",
    type: "success",
  },
  existente: {
    message: "Registro existente na data selecionada.",
    type: "error",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
} as const;
const messages = {
  feriado: "Registro de feriado criado com sucesso.",
  facultativo: "Registro de ponto facultativo criado com sucesso.",
} as const;

const API_URL = import.meta.env.VITE_API_URL;

export default function Feriados() {
  document.title = "Feriados";
  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const setNotification = useAtom(notificationAtom)[1];

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [loading, setLoading] = React.useState<boolean>(false);

  const [registros, setRegistros] = React.useState<
    Record<string, FilteredRegistro> | undefined
  >(undefined);

  const fetchConsulta = async () => {
    if (date?.from && date.to) {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/registro?` +
            new URLSearchParams({
              from: date.from.toDateString(),
              to: date.to.toDateString(),
              cpf: "sistema",
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

        const registros = data.registros;

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
        setRegistros(registrosTable);
      } catch (error) {
        console.error(error);
        setNotification({
          message: "Ocorreu um erro.",
          type: "error",
        });
        setLoading(false);
      }
    }
  };

  const handleSubmitConsulta = async (
    evt: React.FormEvent<HTMLFormElement>,
  ) => {
    evt.preventDefault();
    //setNotification(notificationInitialState);
    await fetchConsulta();
  };

  const [dateNew, setDateNew] = React.useState<Date>();
  const [tipoNew, setTipoNew] = React.useState<string>("");
  const [img, setImg] = React.useState<File | undefined | null>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChangeFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setImg(evt.target.files?.item(0));
  };

  const handleSubmitNovo = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (dateNew && tipoNew) {
      setLoading(true);
      //setNotification(notificationInitialState);

      try {
        const formData = new FormData();
        formData.append("cpf", "sistema");
        formData.append("tipo", tipoNew);
        formData.append("date", dateNew.toDateString());
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

        const data: CreateRegistroAPIResponse = await res.json();

        setNotification({
          ...results[data.resultado],
          message: messages[data.tipo],
        });
        setLoading(false);
        setDateNew(undefined);
        setTipoNew("");
        setImg(null);
        if (inputRef?.current) {
          inputRef.current.value = "";
        }

        await fetchConsulta();
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setNotification(results["error"]);
        } else if (errorFromApi<{ resultado: Resultado }>(error, "resultado")) {
          setNotification(results[error.resultado]);
        }

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
      //setNotification(notificationInitialState);

      const res = await fetch(`${API_URL}/api/registro/delete`, {
        method: "POST",
        body: JSON.stringify({
          date: dateKey,
          cpf: "sistema",
        }),
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

      setLoading(false);
      setDialog(dialogInitialState);
      setNotification({
        message: "Registro removido com sucesso.",
        type: "success",
      });
      await fetchConsulta();
    } catch (error) {
      console.error(error);
      setLoading(false);
      setNotification({
        message: "Ocorreu um erro.",
        type: "error",
      });
    }
  };

  return auth()?.user.nivel === "Super-Admin" ? (
    <>
      <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
        <h2 className="text-center text-slate-200/90">
          Registrar novo feriado/ponto facultativo.
        </h2>
        <div className="flex flex-col items-center justify-around gap-8 md:flex-row md:items-start md:gap-4">
          <form
            className="flex-2 flex flex-col items-center gap-4 md:flex-row md:items-end"
            onSubmit={handleSubmitNovo}
          >
            <div className="flex flex-col items-center gap-2">
              <Label className="text-center text-base text-white">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[250px] justify-start text-left font-normal",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateNew ? (
                      format(dateNew, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="dark w-auto bg-slate-800 bg-gradient-to-br from-indigo-700/30 to-rose-500/30 p-0 shadow shadow-black/30">
                  <Calendar
                    className="dark"
                    mode="single"
                    selected={dateNew}
                    onSelect={setDateNew}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="img" className="text-center text-base text-white">
                Imagem/Documento (opcional)
              </Label>
              <Input
                id="img"
                type="file"
                className="bg-slate-100"
                onChange={handleChangeFile}
                ref={inputRef}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label
                htmlFor="tipo"
                className="text-center text-base text-white"
              >
                Tipo
              </Label>
              <select
                id="tipo"
                className="rounded border-2 bg-slate-100 px-2 py-2 text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                required
                value={tipoNew}
                onChange={(evt) => setTipoNew(evt.target.value)}
              >
                <option value="">Selecione o tipo</option>
                <option value="feriado">Feriado</option>
                <option value="facultativo">Ponto Facultativo</option>
              </select>
            </div>
            <button
              title="Criar novo feriado/ponto facultativo."
              className="rounded bg-green-600 p-1 px-4 text-green-100 shadow shadow-black/20 hover:bg-green-500"
            >
              {loading ? "Carregando..." : "Criar"}
            </button>
          </form>
        </div>
        <form
          className="flex-2 ml-4 mt-8 flex flex-col items-center justify-center gap-2 md:mr-auto"
          onSubmit={handleSubmitConsulta}
        >
          <h2 className="text-center text-slate-200/90">Consultar</h2>
          <div className="flex items-center gap-2">
            <div className={cn("dark grid gap-2")}>
              <Popover>
                <PopoverTrigger asChild className="dark">
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "dark w-[250px] justify-start text-left font-normal text-slate-100",
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
              className="rounded bg-slate-500/40 bg-gradient-to-r p-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:bg-slate-500/10"
            >
              {loading ? (
                <TimerIcon className="h-5 w-5 text-white/50" />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
        <div className="mx-4 flex-1 overflow-auto rounded border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20">
          <Table className="flex-1 shadow shadow-black/20">
            <TableHeader className="sticky top-0 bg-slate-700 bg-gradient-to-r from-indigo-700/50 to-rose-700/30">
              <TableRow>
                <TableHead className="text-center text-white">
                  Comprovante
                </TableHead>
                <TableHead className="text-center text-white">Data</TableHead>
                <TableHead className="text-center text-white">Tipo</TableHead>
                <TableHead className="text-center text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-slate-200/80">
              {registros &&
                Object.keys(registros).map((dateKey) => (
                  <TableRow className="text-center" key={crypto.randomUUID()}>
                    <>
                      {registros[dateKey]?.feriado ? (
                        <>
                          <TableCell>
                            {registros[dateKey]?.feriado?.img ? (
                              <>
                                {[
                                  "jpeg",
                                  "jpg",
                                  "png",
                                  "jfif",
                                  "webp",
                                  "tiff",
                                ].includes(
                                  registros[dateKey]?.feriado?.img.split(
                                    ".",
                                  )[1] || "",
                                ) ? (
                                  <img
                                    className="mx-auto w-[64px]"
                                    src={`${API_URL}/${
                                      registros[dateKey]?.feriado?.img || ""
                                    }`}
                                  />
                                ) : (
                                  <a
                                    target="_blank"
                                    href={`${API_URL}/${
                                      registros[dateKey]?.feriado?.img || ""
                                    }`}
                                    download
                                    className=" text-white"
                                  >
                                    <DownloadIcon className="mx-auto h-4 w-4" />
                                  </a>
                                )}
                              </>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(`${dateKey} 12:00:00`),
                              "dd/MM - EEEEEE",
                              {
                                locale: ptBR,
                              },
                            )}
                          </TableCell>
                          <TableCell>FERIADO</TableCell>
                          <TableCell>
                            <form
                              onSubmit={(evt) => {
                                evt.preventDefault();
                                handleConfirmation(
                                  () => handleDelete(dateKey),
                                  "Deseja confirmar a remoção do feriado?",
                                );
                              }}
                            >
                              <button
                                title="Remover feriado."
                                className="rounded bg-red-500/80 p-2 shadow shadow-black/20 hover:bg-red-600/80"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </form>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          {registros[dateKey]?.facultativo ? (
                            <>
                              <TableCell>
                                {registros[dateKey]?.facultativo?.img ? (
                                  <>
                                    {[
                                      "jpeg",
                                      "jpg",
                                      "png",
                                      "jfif",
                                      "webp",
                                      "tiff",
                                    ].includes(
                                      registros[
                                        dateKey
                                      ]?.facultativo?.img.split(".")[1] || "",
                                    ) ? (
                                      <img
                                        className="mx-auto w-[64px]"
                                        src={`${API_URL}/${
                                          registros[dateKey]?.facultativo
                                            ?.img || ""
                                        }`}
                                      />
                                    ) : (
                                      <a
                                        target="_blank"
                                        href={`${API_URL}/${
                                          registros[dateKey]?.facultativo
                                            ?.img || ""
                                        }`}
                                        download
                                        className=" text-white"
                                      >
                                        <DownloadIcon className="mx-auto h-4 w-4" />
                                      </a>
                                    )}
                                  </>
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(`${dateKey} 12:00:00`),
                                  "dd/MM - EEEEEE",
                                  {
                                    locale: ptBR,
                                  },
                                )}
                              </TableCell>
                              <TableCell>FACULTATIVO</TableCell>
                              <TableCell>
                                <form
                                  onSubmit={(evt) => {
                                    evt.preventDefault();
                                    handleConfirmation(
                                      () => handleDelete(dateKey),
                                      "Deseja confirmar a remoção do ponto facultativo?",
                                    );
                                  }}
                                >
                                  <button
                                    title="Remover ponto facultativo."
                                    className="rounded bg-red-500/80 p-2 shadow shadow-black/20 hover:bg-red-600/80"
                                  >
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
  ) : (
    <Navigate to="/" />
  );
}
