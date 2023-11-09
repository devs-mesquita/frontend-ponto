import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addHours, addDays, differenceInDays } from "date-fns";
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

type FRegistro = string;
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

  const startDate = date.from;
  const endDate = date.to;
  const daysQuantity = differenceInDays(endDate, startDate) + 1;
  const dates = Array.from({ length: daysQuantity }, (_value, index) => {
    return format(addDays(startDate, index), "yyyy-MM-dd", {
      locale: ptBR,
    });
  });

  const doc = new jsPDF();
  let i = 0;
  const repousoArr = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
  for (const user of usersWithRegistros) {
    const cpfWithSymbols = `${user.cpf.slice(0, 3)}.${user.cpf.slice(
      3,
      6,
    )}.${user.cpf.slice(6, 9)}-${user.cpf.slice(9)}`;

    if (i > 0) {
      doc.addPage("a4", "p");
    }

    doc.setFont("Helvetica", "normal", "bold");
    doc.setFontSize(12);
    doc.text(
      `PLANILHA DE HORÁRIOS POR TRABALHADOR DE ${fromDate} A ${toDate}`,
      doc.internal.pageSize.width / 2,
      5,
      {
        align: "center",
      },
    );
    doc.setFontSize(10);
    doc.text(`NOME: ${user.name.toUpperCase()}`.slice(0, 55), 15, 12, {});
    doc.text(`SETOR: ${user.setor.nome}`.slice(0, 55), 15, 18);
    doc.text(`CARGO: ${user.cargo}`.slice(0, 55), 15, 24);
    doc.text(`LOTAÇÃO: ${user.lotacao}`.slice(0, 55), 15, 30);
    doc.text(`EMPRESA: ${user.setor.empresa}`.slice(0, 55), 15, 36);

    doc.text(`CPF: ${cpfWithSymbols}`, doc.internal.pageSize.width * 0.73, 12);
    doc.text(
      `PISPASEP: ${user.pispasep}`,
      doc.internal.pageSize.width * 0.73,
      18,
    );
    doc.text(`CTPS: ${user.ctps}`, doc.internal.pageSize.width * 0.73, 24);
    doc.text(
      `ADMISSÃO: ${
        user.data_admissao
          ? format(new Date(user.data_admissao), "dd/MM/yyyy")
          : ""
      }`,
      doc.internal.pageSize.width * 0.73,
      30,
    );

    const userRepousoArr: boolean[] | null = JSON.parse(user.repouso);

    let repousoStr = "";
    if (userRepousoArr) {
      repousoStr = `${userRepousoArr
        .map((v, i) => {
          if (v) {
            return repousoArr[i];
          }
        })
        .filter((v) => v)
        .join(", ")}.`;
    }
    doc.text(`REPOUSO: ${repousoStr}`, doc.internal.pageSize.width * 0.73, 36);

    autoTable(doc, {
      startY: 40,
      columnStyles: { 0: { halign: "left" } },
      headStyles: {
        fillColor: [30, 30, 30],
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
      head: [
        ["DATA", "ENTRADA", "INÍCIO DE INTERVALO", "FIM DE INTERVALO", "SAÍDA"],
      ],
      body: dates.map((dateKey) => {
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
                new Date(user.registrosTable[dateKey]?.entrada || ""),
                user.setor.soma_entrada || 0,
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---",
          user.registrosTable[dateKey]?.["inicio-intervalo"]
            ? new Date(
                user.registrosTable[dateKey]?.["inicio-intervalo"] || "",
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---",
          user.registrosTable[dateKey]?.["fim-intervalo"]
            ? new Date(
                user.registrosTable[dateKey]?.["fim-intervalo"] || "",
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---",
          user.registrosTable[dateKey]?.saida
            ? addHours(
                new Date(user.registrosTable[dateKey]?.saida || ""),
                new Date(user.registrosTable[dateKey]?.saida || "").getDay() ===
                  5
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
