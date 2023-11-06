import { useAuthHeader, useAuthUser } from "react-auth-kit";
import * as React from "react";
import { useAtom } from "jotai";
import { notificationAtom } from "@/store";
import { Link, Navigate } from "react-router-dom";

import type { Setor } from "@/types/interfaces";
import ViewSetor from "@/components/SetorActions/ViewSetor";

type ViewSetorPopup = {
  close: () => void;
} & ({ isOpen: true; setor: Setor } | { isOpen: false; setor: undefined });

import {
  MagnifyingGlassIcon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SetorDataTable } from "@/components/DataTables/SetorDataTable";

const API_URL = import.meta.env.VITE_API_URL;

export default function Setores() {
  document.title = "Setores";
  const auth = useAuthUser();
  const authHeader = useAuthHeader();

  const [loading, setLoading] = React.useState<boolean>(false);
  const setNotification = useAtom(notificationAtom)[1];
  const [setores, setSetores] = React.useState<Setor[]>([]);

  const viewSetorInitialState: ViewSetorPopup = {
    isOpen: false,
    close: () => {
      setViewSetor((st) => ({ ...st, setor: undefined, isOpen: false }));
    },
    setor: undefined,
  };
  const [consultarPontos, setViewSetor] = React.useState<ViewSetorPopup>(
    viewSetorInitialState,
  );
  const handlePopupConsultarPontos = (setor: Setor) => {
    setViewSetor((st) => ({ ...st, setor, isOpen: true }));
  };

  React.useEffect(() => {
    const getSetores = async () => {
      try {
        setLoading(true);
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
        setSetores(data.setores.filter((setor) => setor.nome !== "TERMINAL"));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setNotification({
          message: "Ocorreu um erro.",
          type: "error",
        });
        setLoading(false);
      }
    };

    getSetores();
  }, []);

  const columns: ColumnDef<Setor>[] = [
    {
      accessorKey: "nome",
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
      id: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const setor = row.original;
        return (
          <div className="flex justify-center gap-4">
            <button
              disabled={loading}
              title="Visualizar setor."
              className="rounded bg-cyan-500/80 p-2 text-blue-50 shadow shadow-black/20 hover:bg-cyan-600/80"
              onClick={() => handlePopupConsultarPontos(setor)}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <Link
              to={`/setores/${setor.id}/edit`}
              title="Modificar setor."
              className="rounded bg-yellow-500/80 p-2 text-blue-50 shadow shadow-black/20 hover:bg-yellow-600/80"
            >
              <Pencil2Icon className="h-5 w-5" />
            </Link>
          </div>
        );
      },
    },
  ];

  return ["Super-Admin"].includes(auth()?.user.nivel || "") ? (
    <>
      <div className="my-4 flex flex-1 flex-col gap-4 font-mono">
        <h1 className="text-center text-slate-200/90">Lista de Setores</h1>
        <div className="flex flex-col items-center justify-around gap-8 md:flex-row md:gap-4">
          <div className="flex flex-1 justify-end gap-4 px-8">
            <Link
              to="/setores/create"
              title="Criar novo setor."
              className="flex items-center gap-2 rounded bg-blue-500/80 px-2 py-1 text-base text-blue-50 shadow shadow-black/20 hover:bg-blue-600/80"
            >
              <PlusIcon className="h-5 w-5" />
              Novo Setor
            </Link>
          </div>
        </div>
        <div className="mx-4 flex-1">
          <SetorDataTable
            className="border border-white/20 bg-slate-800 bg-gradient-to-br from-indigo-700/20 to-rose-500/20 shadow shadow-black/20"
            columns={columns}
            data={setores}
          />
        </div>
      </div>
      {consultarPontos.isOpen && (
        <ViewSetor
          setor={consultarPontos.setor}
          closePopup={consultarPontos.close}
        />
      )}
    </>
  ) : (
    <Navigate to="/" />
  );
}
