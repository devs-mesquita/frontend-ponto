/*
Tabela de Usuários:
  - Paginação;
  - Filtros;
  - Ordenação;
*/
import errorFromApi from "@/utils/errorFromAPI";
import { useAuthHeader, useAuthUser } from "react-auth-kit";
import * as React from "react";
import { useAtom } from "jotai";
import { notificationAtom /* notificationInitialState */ } from "@/store";
import { Link, Navigate } from "react-router-dom";

import type { UserWithSetor, Setor, AppDialog } from "@/types/interfaces";
import ConfirmationDialog from "@/components/ConfirmationDialog";

import ConsultarPontos from "@/components/UserActions/ConsultarPontos";
import AtribuirFalta from "@/components/UserActions/AtribuirFalta";
import AtribuirFerias from "@/components/UserActions/AtribuirFerias";
import AlterarNivel from "@/components/UserActions/AlterarNivel";
import AlterarSetor from "@/components/UserActions/AlterarSetor";

import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  StarFilledIcon,
  SymbolIcon,
  AvatarIcon,
  IdCardIcon,
} from "@radix-ui/react-icons";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { UserDataTable } from "@/components/DataTables/UserDataTable";

import TopNotification from "@/components/TopNotification";
import { PlusIcon } from "lucide-react";

type UserAPIResponse = {
  users: UserWithSetor[];
};

type AtribuirFeriasPopup = {
  close: () => void;
} & (
  | { isOpen: true; user: UserWithSetor }
  | { isOpen: false; user: undefined }
);
type ConsultaPontosPopup = {
  close: () => void;
} & (
  | { isOpen: true; user: UserWithSetor }
  | { isOpen: false; user: undefined }
);
type AtribuirFaltaPopup = {
  close: () => void;
} & (
  | { isOpen: true; user: UserWithSetor }
  | { isOpen: false; user: undefined }
);
type AlterarNivelPopup = {
  close: () => Promise<void>;
} & (
  | { isOpen: true; user: UserWithSetor }
  | { isOpen: false; user: undefined }
);
type AlterarSetorPopup = {
  close: () => Promise<void>;
} & (
  | { isOpen: true; user: UserWithSetor }
  | { isOpen: false; user: undefined }
);
type ResetPasswordResultado = "ok" | "unauthorized" | "not-found";
type Message = {
  type: "" | "success" | "error" | "warning";
  message: string;
};
const results = {
  ok: {
    message: "Senha alterada com sucesso.",
    type: "success",
  },
  unauthorized: {
    message: "Permissão negada.",
    type: "error",
  },
  "not-found": {
    message: "Usuário não encontrado.",
    type: "error",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
} as const;

const API_URL = import.meta.env.VITE_API_URL;

export default function Configs() {
  document.title = "Usuários";
  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [notification, setNotification] = useAtom(notificationAtom);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [setores, setSetores] = React.useState<Setor[]>([]);
  const [setorID, setSetorID] = React.useState<string>("");
  const [users, setUsers] = React.useState<UserWithSetor[]>([]);

  const messageInit: Message = {
    message: "",
    type: "",
  };
  const [message, setMessage] = React.useState<Message>(messageInit);

  const fetchUsersBySetor = async (setor = setorID) => {
    if (setor) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/${setor}`, {
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

        const data: UserAPIResponse = await res.json();
        setLoading(false);

        const users = data.users;
        setUsers(users);
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

  const handleConsulta = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (setorID) {
      //setNotification(notificationInitialState);
      await fetchUsersBySetor();
    }
  };

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
        await fetchUsersBySetor(`${auth()?.user.setor.id}`);
      }
    };

    getSetores();
  }, []);

  const consultaPontosInitialState: ConsultaPontosPopup = {
    isOpen: false,
    close: () => {
      setConsultaPontos((st) => ({ ...st, user: undefined, isOpen: false }));
    },
    user: undefined,
  };
  const [consultarPontos, setConsultaPontos] =
    React.useState<ConsultaPontosPopup>(consultaPontosInitialState);
  const handlePopupConsultarPontos = (user: UserWithSetor) => {
    setConsultaPontos((st) => ({ ...st, user, isOpen: true }));
  };

  const atribuirFeriasInitialState: AtribuirFeriasPopup = {
    isOpen: false,
    close: () => {
      setAtribuirFerias((st) => ({ ...st, user: undefined, isOpen: false }));
    },
    user: undefined,
  };
  const [atribuirFerias, setAtribuirFerias] =
    React.useState<AtribuirFeriasPopup>(atribuirFeriasInitialState);
  const handlePopupAtribuirFerias = (user: UserWithSetor) => {
    setAtribuirFerias((st) => ({ ...st, user, isOpen: true }));
  };

  const atribuirFaltaInitialState: AtribuirFaltaPopup = {
    isOpen: false,
    close: () => {
      setAtribuirFalta((st) => ({ ...st, user: undefined, isOpen: false }));
    },
    user: undefined,
  };
  const [atribuirFalta, setAtribuirFalta] = React.useState<AtribuirFaltaPopup>(
    atribuirFaltaInitialState,
  );
  const handlePopupAtribuirFalta = (user: UserWithSetor) => {
    setAtribuirFalta((st) => ({ ...st, user, isOpen: true }));
  };

  const alterarNivelInitialState: AlterarNivelPopup = {
    isOpen: false,
    close: async () => {
      setAlterarNivel((st) => ({ ...st, user: undefined, isOpen: false }));
    },
    user: undefined,
  };
  const [alterarNivel, setAlterarNivel] = React.useState<AlterarNivelPopup>(
    alterarNivelInitialState,
  );
  const handlePopupAlterarNivel = (user: UserWithSetor) => {
    setAlterarNivel((st) => ({ ...st, user, isOpen: true }));
  };

  const alterarSetorInitialState: AlterarSetorPopup = {
    isOpen: false,
    close: async () => {
      setAlterarSetor((st) => ({ ...st, user: undefined, isOpen: false }));
    },
    user: undefined,
  };
  const [alterarSetor, setAlterarSetor] = React.useState<AlterarSetorPopup>(
    alterarSetorInitialState,
  );
  const handlePopupAlterarSetor = (user: UserWithSetor) => {
    setAlterarSetor((st) => ({ ...st, user, isOpen: true }));
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

  const handleDelete = async (user_id: number) => {
    try {
      setLoading(true);
      //setNotification(notificationInitialState);

      const res = await fetch(`${API_URL}/api/resetpassword`, {
        method: "POST",
        body: JSON.stringify({
          user_id,
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
        message: "Senha restaurada com sucesso.",
        type: "success",
      });
      await fetchUsersBySetor();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(results["error"]);
      } else if (
        errorFromApi<{ resultado: ResetPasswordResultado }>(error, "resultado")
      ) {
        const resultado = error.resultado as ResetPasswordResultado;
        setMessage(results[resultado]);
      }
      setLoading(false);
    }
  };

  const columns: ColumnDef<UserWithSetor>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "cpf",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            CPF
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("cpf")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("email")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-center gap-4">
            <button
              title="Consultar pontos."
              className="rounded bg-cyan-500/80 p-2 text-blue-50 shadow shadow-black/20 hover:bg-cyan-600/80"
              onClick={() => handlePopupConsultarPontos(user)}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button
              title="Atribuir falta."
              className="rounded bg-red-500/80 p-2 text-red-50 shadow shadow-black/20 hover:bg-red-600/80"
              onClick={() => handlePopupAtribuirFalta(user)}
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
            </button>
            <button
              title="Atribuir férias."
              className="rounded bg-green-500/80 p-2 text-green-50 shadow shadow-black/20 hover:bg-green-600/80"
              onClick={() => handlePopupAtribuirFerias(user)}
            >
              <StarFilledIcon className="h-5 w-5" />
            </button>
            <form
              onSubmit={(evt) => {
                evt.preventDefault();
                handleConfirmation(
                  () => handleDelete(user.id),
                  `Deseja confirmar a restauração da senha de ${`${
                    user.name.split(" ")[0]
                  } ${
                    user.name.split(" ")[1].length > 3
                      ? user.name.split(" ")[1]
                      : `${user.name.split(" ")[1]} ${user.name.split(" ")[2]}`
                  }`}?`,
                );
              }}
            >
              <button
                title="Restaurar senha."
                className="rounded bg-blue-500/80 p-2 text-blue-50 shadow shadow-black/20 hover:bg-blue-600/80"
              >
                <SymbolIcon className="h-5 w-5" />
              </button>
            </form>
            {auth()?.user.nivel === "Super-Admin" && (
              <>
                <button
                  title="Alterar setor."
                  className="rounded bg-yellow-500/80 p-2 text-yellow-50 shadow shadow-black/20 hover:bg-yellow-600/80"
                  onClick={() => handlePopupAlterarSetor(user)}
                >
                  <IdCardIcon className="h-5 w-5" />
                </button>
                <button
                  title="Alterar nível."
                  className="rounded bg-purple-500/80 p-2 text-purple-50 shadow shadow-black/20 hover:bg-purple-600/80"
                  onClick={() => handlePopupAlterarNivel(user)}
                >
                  <AvatarIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return ["Admin", "Super-Admin"].includes(auth()?.user.nivel || "") ? (
    <>
      <div className="my-4 flex flex-1 flex-col gap-4 font-mono">
        <h1 className="text-center text-slate-200/90">Lista de Usuários</h1>
        <div className="flex flex-col items-center justify-around gap-8 md:flex-row md:gap-4">
          <form
            className="flex flex-1 flex-col items-center justify-center gap-2"
            onSubmit={handleConsulta}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-center text-slate-200/90">Setor:</h2>
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
                {loading ? "Carregando..." : "Consultar"}
              </button>
            </div>
          </form>
          <div className="flex flex-1 justify-end gap-4 px-8">
            <Link
              to="/register"
              title="Registrar novo usuário."
              className="flex items-center gap-2 rounded bg-green-500/80 px-2 py-1 text-base text-green-50 shadow shadow-black/20 hover:bg-green-600/80"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Usuário
            </Link>
            {auth()?.user.nivel === "Super-Admin" && (
              <Link
                to="/setores/create"
                title="Criar novo setor."
                className="flex items-center gap-2 rounded bg-blue-500/80 px-2 py-1 text-base text-blue-50 shadow shadow-black/20 hover:bg-blue-600/80"
              >
                <PlusIcon className="h-5 w-5" />
                Novo Setor
              </Link>
            )}
          </div>
        </div>
        {message.message.length > 0 && (
          <h2
            className={`mx-auto my-2 max-w-[275px] rounded px-2 py-1 text-center ${
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
        <div className="mx-4 flex-1">
          <UserDataTable
            className="border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20 shadow shadow-black/20"
            columns={columns}
            data={users}
          />
        </div>
      </div>
      {dialog.isOpen && (
        <ConfirmationDialog
          accept={dialog.accept}
          reject={dialog.reject}
          message={dialog.message}
        />
      )}
      {notification.message && <TopNotification />}
      {consultarPontos.isOpen && (
        <ConsultarPontos
          user={consultarPontos.user}
          closePopup={consultarPontos.close}
        />
      )}
      {atribuirFerias.isOpen && (
        <AtribuirFerias
          user={atribuirFerias.user}
          closePopup={atribuirFerias.close}
        />
      )}
      {atribuirFalta.isOpen && (
        <AtribuirFalta
          user={atribuirFalta.user}
          closePopup={atribuirFalta.close}
        />
      )}
      {alterarNivel.isOpen && (
        <AlterarNivel
          user={alterarNivel.user}
          closePopup={alterarNivel.close}
          refetch={fetchUsersBySetor}
        />
      )}
      {alterarSetor.isOpen && (
        <AlterarSetor
          user={alterarSetor.user}
          closePopup={alterarSetor.close}
          refetch={fetchUsersBySetor}
        />
      )}
    </>
  ) : (
    <Navigate to="/" />
  );
}
