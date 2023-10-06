import type { AuthStateUserObject } from "react-auth-kit/dist/types";

type Setor = {
  id: number;
  nome: string;
  soma_entrada: number;
  soma_saida: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  nivel: "Super-Admin" | "Admin" | "User";
  setor_id: number;
  cpf: string;
  setor: Setor;
} & AuthStateUserObject;

type CustomAuthState = {
  user: User;
};

declare module "react-auth-kit" {
  function useAuthUser(): () => CustomAuthState | null;
}
