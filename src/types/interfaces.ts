export interface AppDialog {
  isOpen: boolean;
  message: string;
  accept: () => void;
  reject: () => void;
}

export type AppNotification = {
  message: string;
  type: "error" | "success" | "warning" | "";
};

export type Setor = {
  id: number;
  nome: string;
  cnpj: string;
  cnae: string;
  empresa: string;
  visto_fiscal: string;
  logradouro: string;
  numero_logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  soma_entrada: number;
  soma_saida: number;
};

export type UserWithSetor = {
  id: number;
  name: string;
  email: string;
  nivel: "Super-Admin" | "Admin" | "User";
  cpf: string;
  cargo: string;
  ctps: string;
  lotacao: string;
  matricula: string;
  pispasep: string;
  data_admissao: string;
  repouso: string;
  setor_id: number;
  setor: Setor;
};
