import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 text-slate-100/80">
      <h1 className="pb-4 text-center tracking-widest">
        404 - A página não foi encontrada.
      </h1>
      <Link
        to="/"
        className="rounded bg-slate-500/40 bg-gradient-to-r px-4 py-1 text-white/80 shadow shadow-black/20 hover:bg-slate-500/20"
      >
        Página Inicial
      </Link>
    </div>
  );
}
