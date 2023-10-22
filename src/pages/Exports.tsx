/*
Exportar PDFs:
  - Pontos por Usuário;
  - Pontos por Setor;
*/
import { useAuthUser, useAuthHeader } from "react-auth-kit";
import * as React from "react";
import { useAtom } from "jotai";
import { notificationAtom, notificationInitialState } from "@/store";
import { Navigate } from "react-router-dom";

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

export default function Exports() {
  document.title = "Exportações";
  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [notification, setNotification] = useAtom(notificationAtom);
  const [loading, setLoading] = React.useState<boolean>(false);

  return ["Admin", "Super-Admin"].includes(auth()?.user.nivel || "") ? (
    <>
      <div className="my-4 flex flex-1 flex-col gap-4 font-mono ">
        <h1 className="text-center text-slate-200/90">Exportar Pontos</h1>
        <h2 className="text-center text-white my-auto">Work in progress...</h2>
      </div>
      {notification.message && <TopNotification />}
    </>
  ) : (
    <Navigate to="/" />
  );
}
