import { useAuthUser } from "react-auth-kit";

export default function Home() {
  document.title = "Ponto Eletrônico";

  const auth = useAuthUser();

  return (
    <div className="my-4 flex flex-1 flex-col p-4 font-mono text-slate-100/80">
      <h1 className="m-auto pb-4 text-center tracking-widest">
        Olá, {auth()?.user.name.split(" ")[0]}.
      </h1>
    </div>
  );
}
