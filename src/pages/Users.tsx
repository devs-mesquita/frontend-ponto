/*
Tabela de Usuários:
  — Features:
    - Paginação;
    - Filtros;
    - Ordenação;

    DONE - Consulta da tabela por Setor;
      - Super: Qualquer setor;
      - Admin: Próprio setor.

  — Ações:
    > Admin:
      > Popups:
        - onClick Action > Set the popup.isOpen to true, Set the user to the corresponding user.
        - Atribuição de falta (popup, single date);
        - Atribuição de férias (popup, date range).
        - Consultar Pontos (popup, date range);
        TBD - Atribuição de atestado (popup date range, comprovante atestado?);

        - Resetar Senha (confirmDialog).
*/

// Configurações/Administração:
// - Criação de feriado/ponto facultativo (cpf = "sistema");
// - Lista de Feriados/Pontos Facultativos criados.

import { useAuthUser } from "react-auth-kit";
import * as React from "react";
import { useAtom } from "jotai";
import { notificationAtom, notificationInitialState } from "@/store";
import { Link, Navigate } from "react-router-dom";

import type { UserWithSetor, Setor } from "@/types/interfaces";

import ConsultarPontos from "@/components/UserActions/ConsultarPontos";
import AtribuirFalta from "@/components/UserActions/AtribuirFalta";
import AtribuirFerias from "@/components/UserActions/AtribuirFerias";

import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const API_URL = import.meta.env.VITE_API_URL;

export default function Configs() {
  document.title = "Usuários";
  const auth = useAuthUser();

  const [notification, setNotification] = useAtom(notificationAtom);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [setores, setSetores] = React.useState<Setor[]>([]);
  const [setorID, setSetorID] = React.useState<string>("");
  const [users, setUsers] = React.useState<UserWithSetor[]>([]);

  const fetchUsersBySetor = async () => {
    if (setorID) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/${setorID}`);

        if (!res.ok) {
          const err = await res.json();
          console.log(err);
          throw err;
        }

        const data: UserAPIResponse = await res.json();
        setLoading(false);

        const users = data.users;
        setUsers(users);
      } catch (error) {
        console.log(error);
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
      setNotification(notificationInitialState);
      await fetchUsersBySetor();
    }
  };

  React.useEffect(() => {
    const getSetores = async () => {
      if (auth()?.user.nivel === "Super-Admin") {
        try {
          const res = await fetch(`${API_URL}/api/setores`);

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

  return ["Admin", "Super-Admin"].includes(auth()?.user.nivel || "") ? (
    <>
      <div className="my-4 flex flex-1 flex-col gap-4 font-mono">
        <h1 className="text-center text-slate-200/90">Lista de Usuários</h1>
        <div className="flex flex-col items-center justify-around gap-8 md:flex-row md:gap-4">
          <form
            className="flex-2 flex flex-col items-center justify-center gap-2"
            onSubmit={handleConsulta}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-center text-slate-200/90">Setor:</h2>
              <select
                className="rounded border-2 bg-slate-200 px-2 py-1 text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
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
          <Link
            to="/register"
            title="Registrar novo usuário."
            className="flex items-center gap-2 rounded bg-green-500/80 px-2 py-1 text-base text-green-50 shadow shadow-black/20 hover:bg-green-600/80"
          >
            <PlusIcon className="h-5 w-5" />
            Novo Usuário
          </Link>
        </div>
        <div className="mx-4 flex-1 rounded border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20">
          <Table className="flex-1 shadow shadow-black/20">
            <TableHeader className="sticky top-0 bg-slate-700 bg-gradient-to-r from-indigo-700/50 to-rose-700/30">
              <TableRow>
                <TableHead className="text-center text-white">Nome</TableHead>
                <TableHead className="text-center text-white">CPF</TableHead>
                <TableHead className="text-center text-white">Email</TableHead>
                <TableHead className="text-center text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-slate-200/80">
              {users.map((user) => (
                <TableRow className="text-center" key={crypto.randomUUID()}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.cpf}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
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
    </>
  ) : (
    <Navigate to="/" />
  );
}
