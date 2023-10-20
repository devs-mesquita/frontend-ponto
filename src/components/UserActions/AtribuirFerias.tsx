import ReactDOM from "react-dom";
import type { UserWithSetor } from "@/types/interfaces";

type AtribuirFeriasProps = {
  user: UserWithSetor;
  closePopup: () => void;
};

export default function AtribuirFerias({
  closePopup,
  user,
}: AtribuirFeriasProps) {
  return ReactDOM.createPortal(
    <>
      <div className="fixed left-1/2 top-1/2 z-40 flex w-72 max-w-full translate-x-[-50%] translate-y-[-50%] flex-col gap-3 rounded bg-slate-700 p-4 sm:w-[30rem] md:w-[36rem] lg:w-[42rem]">
        {/* <h2 className="text-center text-white/90">{message}</h2>
        <div className="flex w-full gap-4">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white text-white/80 shadow shadow-black/20 hover:bg-slate-500/75 hover:text-white disabled:bg-slate-500/10"
          >
          {isLoading ? "Carregando..." : "Confirmar"}
          </button>
          <button
            onClick={reject}
            disabled={isLoading}
            className="flex-1 rounded bg-zinc-500 px-4 py-1 text-white hover:bg-zinc-400 disabled:bg-zinc-400/25"
          >
            Cancelar
          </button>
        </div> */}
      </div>
      <div
        className="fixed z-30 h-screen w-screen bg-black/30 backdrop-blur-sm"
        onClick={closePopup}
      />
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
