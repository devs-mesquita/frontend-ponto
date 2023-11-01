import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, addHours } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { UserWithSetor } from "@/types/interfaces";

type FilteredRegistro = {
  entrada?: string;
  "fim-intervalo"?: string;
  "inicio-intervalo"?: string;
  saida?: string;
  falta?: string;
  abono?: string;
  ferias?: string;
  feriado?: string;
  facultativo?: string;
};

export default function (
  registrosTable: Record<string, FilteredRegistro>,
  user: UserWithSetor,
  date: { from: Date; to: Date },
) {
  const doc = new jsPDF();
  const fromDate = format(date.from, "dd/MM/yyyy");
  const toDate = format(date.to, "dd/MM/yyyy");

  const cpfWithSymbols = `${user.cpf.slice(0, 3)}.${user.cpf.slice(
    3,
    6,
  )}.${user.cpf.slice(6, 9)}-${user.cpf.slice(9)}`;

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
    startY: 40,
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
    body: Object.keys(registrosTable).map((dateKey) => {
      const pontoDate = format(
        new Date(`${dateKey} 12:00:00`),
        "dd/MM - EEEEEE",
        {
          locale: ptBR,
        },
      );

      if (registrosTable[dateKey]?.ferias) {
        return [pontoDate, "FÉRIAS", "FÉRIAS", "FÉRIAS", "FÉRIAS"];
      }
      if (registrosTable[dateKey]?.feriado) {
        return [pontoDate, "FERIADO", "FERIADO", "FERIADO", "FERIADO"];
      }
      if (registrosTable[dateKey]?.facultativo) {
        return [
          pontoDate,
          "FACULTATIVO",
          "FACULTATIVO",
          "FACULTATIVO",
          "FACULTATIVO",
        ];
      }
      if (registrosTable[dateKey]?.abono) {
        return [pontoDate, "ABONO", "ABONO", "ABONO", "ABONO"];
      }
      if (registrosTable[dateKey]?.falta) {
        return [pontoDate, "FALTA", "FALTA", "FALTA", "FALTA"];
      }
      return [
        pontoDate,
        registrosTable[dateKey]?.entrada
          ? addHours(
              new Date(registrosTable[dateKey]?.entrada || ""),
              user.setor.soma_entrada || 0,
            ).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "---",
        registrosTable[dateKey]?.["inicio-intervalo"]
          ? new Date(
              registrosTable[dateKey]?.["inicio-intervalo"] || "",
            ).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "---",
        registrosTable[dateKey]?.["fim-intervalo"]
          ? new Date(
              registrosTable[dateKey]?.["fim-intervalo"] || "",
            ).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "---",
        registrosTable[dateKey]?.saida
          ? addHours(
              new Date(registrosTable[dateKey]?.saida || ""),
              new Date(registrosTable[dateKey]?.saida || "").getDay() === 5
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

  doc.save(
    `${format(new Date(), "yyyy-MM-dd", {
      locale: ptBR,
    })}_${user.cpf}.pdf`,
  );
}
