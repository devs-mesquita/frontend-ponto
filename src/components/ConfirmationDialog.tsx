import ReactDOM from "react-dom";

interface ConfirmationDialogProps {
  message: string;
  accept: () => any;
  reject: () => any;
}

export default function ConfirmationDialog({
  message,
  accept,
  reject,
}: ConfirmationDialogProps) {
  return ReactDOM.createPortal(
    <>
      <div
        className="fixed z-30 h-screen w-screen bg-black/30 backdrop-blur-sm"
        onClick={reject}
      ></div>
      <div className="bg-light-500 dark:bg-dark-500 fixed left-1/2 top-1/2 z-40 flex w-72 max-w-full translate-x-[-50%] translate-y-[-50%] flex-col gap-3 rounded p-4 sm:w-[30rem] md:w-[36rem] lg:w-[42rem]">
        <h2 className="text-light-50 dark:text-dark-50 text-center">
          {message}
        </h2>
        <div className="flex w-full gap-4">
          <button
            onClick={accept}
            className="bg-roxo flex-1 rounded px-4 py-1 text-white hover:bg-indigo-500"
          >
            Confirmar
          </button>
          <button
            onClick={reject}
            className="flex-1 rounded bg-zinc-400 px-4 py-1 text-white hover:bg-zinc-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>,
    document.querySelector<HTMLDivElement>("#modal")!,
  );
}
