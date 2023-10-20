export interface AppDialog {
  isOpen: boolean;
  message: string;
  accept: () => void;
  reject: () => void;
}

export type AppNotification = {
  message: string;
  type: "error" | "success" | "";
};

export type Setor = {
  id: number;
  nome: string;
  soma_entrada: number;
  soma_saida: number;
};

export type UserWithSetor = {
  id: number;
  name: string;
  email: string;
  nivel: "Super-Admin" | "Admin" | "User";
  cpf: string;
  setor_id: number;
  setor: Setor;
};