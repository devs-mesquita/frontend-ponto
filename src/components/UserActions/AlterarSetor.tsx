import * as React from "react";
import ReactDOM from "react-dom";
import type { UserWithSetor, Setor } from "@/types/interfaces";

import errorFromApi from "@/utils/errorFromAPI";

import { notificationAtom } from "@/store";
import { useAtom } from "jotai";

import { useAuthHeader } from "react-auth-kit";

type AtribuirFaltaProps = {
  user: UserWithSetor;
  closePopup: () => void;
  refetch: () => Promise<void>;
};
type Resultado = "unauthorized" | "not-found" | "ok";
const notifications = {
  unauthorized: {
    message: "Permissão negada.",
    type: "error",
  },
  "not-found": {
    message: "O usuário não foi encontrado.",
    type: "error",
  },
  error: {
    message: "Ocorreu um erro.",
    type: "error",
  },
  ok: {
    message: "Setor atribuído com sucesso.",
    type: "success",
  },
} as const;

const API_URL = import.meta.env.VITE_API_URL;

export default function AlterarSetor({
  closePopup,
  user,
  refetch,
}: AtribuirFaltaProps) {
  const authHeader = useAuthHeader();
  const [setorID, setSetorID] = React.useState<number>(user.setor_id);

  const setNotification = useAtom(notificationAtom)[1];
  const [loading, setLoading] = React.useState<boolean>(false);

  const [setores, setSetores] = React.useState<Setor[]>([]);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (setorID) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/user/setor`, {
          method: "POST",
          body: JSON.stringify({
            setor_id: setorID,
            user_id: user.id,
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

        const data: { resultado: Resultado } = await res.json();

        setLoading(false);
        setNotification(notifications[data.resultado]);
        closePopup();
        await refetch();
      } catch (error) {
        console.log(error);

        if (error instanceof Error) {
          setNotification({
            message: "Ocorreu um erro.",
            type: "error",
          });
        }

        if (error instanceof Error) {
          setNotification(notifications["error"]);
        } else if (errorFromApi<{ resultado: Resultado }>(error, "resultado")) {
          const resultado = error.resultado as Resultado;
          setNotification(notifications[resultado]);
        }

        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    const getSetores = async () => {
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
    };

    getSetores();
  }, []);

  const names = user.name.split(" ");
  const briefUserName = `${names[0]} ${
    names[1].length > 3 ? names[1] : `${names[1]} ${names[2]}`
  }`;

  return ReactDOM.createPortal(
    <>
      <div className="fixed left-1/2 top-1/2 z-30 flex max-h-[90vh] w-[28rem] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 overflow-auto rounded bg-slate-700 bg-gradient-to-br from-indigo-500/40 to-rose-500/40 p-4 md:w-[40rem] lg:w-[40rem]">
        <div className="my-4 flex h-full flex-1 flex-col gap-4 font-mono">
          <h2 className="text-center text-slate-200/90">
            Alterar nível de {briefUserName}
          </h2>
          {setores.length > 0 ? (
            <form
              className="flex-2 flex flex-col items-center justify-center gap-2"
              onSubmit={handleSubmit}
            >
              <select
                className="rounded border-2 bg-white px-2 py-1 text-slate-800 shadow shadow-black/20 outline-0 focus:border-indigo-600/70 disabled:bg-slate-200/40"
                disabled={loading}
                required
                name="setor_id"
                value={setorID}
                onChange={(evt) => setSetorID(+evt.target.value)}
              >
                {setores.map((setor) => (
                  <option key={crypto.randomUUID()} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-4">
                <button
                  disabled={loading}
                  className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20 hover:text-white disabled:bg-slate-500/10"
                >
                  {loading ? "Carregando..." : "Atribuir"}
                </button>
              </div>
            </form>
          ) : (
            <span className="text-center text-white">
              Carregando setores...
            </span>
          )}
        </div>
      </div>
      <div
        className="fixed z-20 h-screen w-screen bg-black/30 backdrop-blur-sm"
        onClick={closePopup}
      />
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
