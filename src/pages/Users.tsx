/*
Tabela de Usuários:
  — Features:
    - Consulta da tabela por Setor;
      - Super: Qualquer setor;
      - Admin: Próprio setor.

  — Ações:
    - Atribuição de atestado (popup date range, comprovante atestado?);
    - Atribuição de falta (popup, single date);
    - Atribuição de férias (popup, date range, comprovante férias?).
    - Exportar Pontos PDF (popup, date range, comprovante férias?).
*/

// Configurações/Administração:
// - Criação de feriado/ponto facultativo (cpf = "sistema");
// - Lista de Feriados/Pontos Facultativos criados.

import { useAuthUser } from "react-auth-kit";
import * as React from "react";

import { useAtom } from "jotai";
import { notificationAtom, notificationInitialState } from "@/store";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TopNotification from "@/components/TopNotification";

type Setor = {
  id: number;
  nome: string;
  soma_entrada: number;
  soma_saida: number;
};

type UserWithSetor = {
  id: number;
  name: string;
  email: string;
  nivel: "Super-Admin" | "Admin" | "User";
  cpf: string;
  setor_id: number;
  setor: Setor;
};

type UserAPIResponse = {
  users: UserWithSetor[];
};

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

  return (
    <>
      <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
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
        </div>
        <div className="mx-4 flex-1 rounded border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20">
          <Table className="flex-1 shadow shadow-black/20">
            <TableHeader>
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
                  <TableCell>ACTIONS</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {notification.message && <TopNotification />}
    </>
  );
}
