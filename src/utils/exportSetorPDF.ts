import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addHours } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { UserWithSetor } from "@/types/interfaces";

type Registro = {
  id: number;
  cpf: string;
  tipo:
    | "entrada"
    | "inicio-intervalo"
    | "fim-intervalo"
    | "saida"
    | "ferias"
    | "feriado"
    | "facultativo"
    | "abono"
    | "falta";
  data_hora: string;
};

type FRegistro = { data_hora: string; img: string };
type FilteredRegistro = {
  entrada?: FRegistro;
  "fim-intervalo"?: FRegistro;
  "inicio-intervalo"?: FRegistro;
  saida?: FRegistro;
  falta?: FRegistro;
  abono?: FRegistro;
  ferias?: FRegistro;
  feriado?: FRegistro;
  facultativo?: FRegistro;
};

type UserWithRegistros = UserWithSetor & {
  registrosTable: Record<string, FilteredRegistro>;
};

const parseRegistrosToTable = (registros: Registro[]) => {
  const registrosTable = registros.reduce(
    (lista, registro) => {
      const dateKey = registro.data_hora.split(" ")[0].trim();

      return {
        ...lista,
        [dateKey]: {
          ...lista[dateKey],
          [registro.tipo]: registro.data_hora,
        },
      };
    },
    {} as Record<string, FilteredRegistro>,
  );

  return registrosTable;
};

export default function (
  users: UserWithSetor[],
  feriados: Registro[],
  setorRegistros: Registro[],
  date: { from: Date; to: Date },
) {
  const doc = new jsPDF();
  const fromDate = format(date.from, "dd/MM/yyyy");
  const toDate = format(date.to, "dd/MM/yyyy");

  const usersWithRegistros: UserWithRegistros[] = users.map((user) => {
    const userRegistros = setorRegistros.filter(
      (registro) => registro.cpf === user.cpf,
    );

    const userWithRegistros = {
      ...user,
      registrosTable: parseRegistrosToTable(userRegistros),
    };

    return userWithRegistros as UserWithRegistros;
  });

  const feriadosTable = parseRegistrosToTable(feriados);

  let i = 0;
  for (const user of usersWithRegistros) {
    const cpfWithSymbols = `${user.cpf.slice(0, 3)}.${user.cpf.slice(
      3,
      6,
    )}.${user.cpf.slice(6, 9)}-${user.cpf.slice(9)}`;

    if (i > 0) {
      doc.addPage("a4", "p");
    }

    doc.setFontSize(12);
    doc.text(
      `PLANILHA DE HORÁRIOS POR TRABALHADOR DE ${fromDate} A ${toDate}`,
      doc.internal.pageSize.width / 2,
      10,
      {
        align: "center",
      },
    );
    doc.setFontSize(10);
    doc.text(`NOME: ${user.name.toUpperCase()}`, 15, 18, {});
    doc.text(`SETOR: ${user.setor.nome}`, 15, 24);
    doc.text(`CPF: ${cpfWithSymbols}`, 15, 30);
    // doc.text(`LINHA 4: TESTE DE ESPAÇO`, 15, 36);

    autoTable(doc, {
      startY: 46,
      headStyles: {
        fillColor: [30, 30, 30],
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
      head: [["DATA", "ENTRADA", "INI. INTERV.", "FIM. INTERV", "SAÍDA"]],
      body: Object.keys(user.registrosTable).map((dateKey) => {
        const pontoDate = format(
          new Date(`${dateKey} 12:00:00`),
          "dd/MM - EEEEEE",
          {
            locale: ptBR,
          },
        );

        if (user.registrosTable[dateKey]?.ferias) {
          return [pontoDate, "FÉRIAS", "FÉRIAS", "FÉRIAS", "FÉRIAS"];
        }
        if (feriadosTable[dateKey]?.feriado) {
          return [pontoDate, "FERIADO", "FERIADO", "FERIADO", "FERIADO"];
        }
        if (feriadosTable[dateKey]?.facultativo) {
          return [
            pontoDate,
            "FACULTATIVO",
            "FACULTATIVO",
            "FACULTATIVO",
            "FACULTATIVO",
          ];
        }
        if (user.registrosTable[dateKey]?.abono) {
          return [pontoDate, "ABONO", "ABONO", "ABONO", "ABONO"];
        }
        if (user.registrosTable[dateKey]?.falta) {
          return [pontoDate, "FALTA", "FALTA", "FALTA", "FALTA"];
        }
        return [
          pontoDate,
          user.registrosTable[dateKey]?.entrada
            ? addHours(
                new Date(
                  user.registrosTable[dateKey]?.entrada?.data_hora || "",
                ),
                user.setor.soma_entrada || 0,
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---",
          user.registrosTable[dateKey]?.["inicio-intervalo"]
            ? new Date(
                user.registrosTable[dateKey]?.["inicio-intervalo"]?.data_hora ||
                  "",
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---",
          user.registrosTable[dateKey]?.["fim-intervalo"]
            ? new Date(
                user.registrosTable[dateKey]?.["fim-intervalo"]?.data_hora ||
                  "",
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---",
          user.registrosTable[dateKey]?.saida
            ? addHours(
                new Date(user.registrosTable[dateKey]?.saida?.data_hora || ""),
                new Date(
                  user.registrosTable[dateKey]?.saida?.data_hora || "",
                ).getDay() === 5
                  ? 0
                  : user.setor.soma_saida || 0,
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---",
        ];
      }),
    });
    i++;
  }
  doc.save(
    `${users[0].setor.nome}_${format(date.from, "yyyy-MM-dd", {
      locale: ptBR,
    })}_${format(date.to, "yyyy-MM-dd", {
      locale: ptBR,
    })}.pdf`,
  );
}
