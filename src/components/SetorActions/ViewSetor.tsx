import ReactDOM from "react-dom";
import type { Setor } from "@/types/interfaces";

type ViewSetorProps = {
  setor: Setor;
  closePopup: () => void;
};

export default function ViewSetor({ closePopup, setor }: ViewSetorProps) {
  return ReactDOM.createPortal(
    <>
      <div className="fixed left-1/2 top-1/2 z-30 flex w-[28rem] translate-x-[-50%] translate-y-[-50%] flex-col gap-3 rounded bg-slate-700 bg-gradient-to-br from-indigo-500/40 to-rose-500/40 p-3 md:w-[45rem] lg:w-[60rem]">
        <h2 className="mx-auto rounded bg-slate-800/80 px-4 py-1 text-center text-slate-200/90">
          {setor.nome}
        </h2>
        <div className="flex flex-col gap-2 rounded bg-slate-800/80 p-3 text-slate-200/90">
          <div className="flex flex-col gap-2 md:flex-row md:gap-0">
            <p className="flex-1">Empresa: {setor.empresa}</p>
            <p className="flex-1">CNPJ: {setor.cnpj}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-0">
            <p className="flex-1">CNAE: {setor.cnae}</p>
            <p className="flex-1">Visto Fiscal: {setor.visto_fiscal}</p>
          </div>
          <div className="border-b border-white" />
          <div className="flex flex-col gap-2 md:flex-row md:gap-0">
            <p className="flex-1">CEP: {setor.cep}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-0">
            <p className="flex-1">Logradouro: {setor.logradouro}</p>
            <p className="flex-1">Número: {setor.numero_logradouro}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-0">
            <p className="flex-1">Complemento: {setor.complemento}</p>
            <p className="flex-1">Bairro: {setor.bairro}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-0">
            <p className="flex-1">Cidade: {setor.cidade}</p>
            <p className="flex-1">UF: {setor.uf}</p>
          </div>
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
