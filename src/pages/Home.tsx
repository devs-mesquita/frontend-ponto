import { useAuthUser } from "react-auth-kit";

export default function Home() {
  document.title = "Ponto Eletrônico";

  const auth = useAuthUser();

  return (
    <div className="font-mono text-slate-100/80 p-4">
      <h1 className="text-center tracking-widest pb-4">Página Autenticada</h1>
      <pre className="rounded-lg bg-slate-700/75 p-4 shadow shadow-black/20">
        {JSON.stringify(auth(), null, 2)}
      </pre>
    </div>
  );
}
