
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DadoRelatorio {
  ano: number;
  mes: number;
  consumoLitros: number;
  consumoM3: number;
  valorAgua: number;
  valorEsgoto: number;
  valorEstimado: number;
}

interface GerarPDFProps {
  dados: DadoRelatorio[];
  titulo?: string;
}

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function moeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function numero(valor: number, casas = 3) {
  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  });
}

export default function GerarPDF({
  dados,
  titulo = "Relatório de consumo de água",
}: GerarPDFProps) {
  async function gerarPDF() {
    if (dados.length === 0) return;

    const pdf = new jsPDF();
    const dataGeracao = new Date().toLocaleDateString("pt-BR");

    const dadosOrdenados = [...dados].sort(
      (a, b) => a.ano - b.ano || a.mes - b.mes
    );

    const consumoTotal = dados.reduce(
      (total, item) => total + Number(item.consumoLitros || 0),
      0
    );

    const consumoM3Total = dados.reduce(
      (total, item) => total + Number(item.consumoM3 || 0),
      0
    );

    const valorAguaTotal = dados.reduce(
      (total, item) => total + Number(item.valorAgua || 0),
      0
    );

    const valorEsgotoTotal = dados.reduce(
      (total, item) => total + Number(item.valorEsgoto || 0),
      0
    );

    const valorTotal = dados.reduce(
      (total, item) => total + Number(item.valorEstimado || 0),
      0
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(titulo, 14, 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${dataGeracao}`, 14, 27);

    const primeiro = dadosOrdenados[0];
    const ultimo = dadosOrdenados[dadosOrdenados.length - 1];

    const periodoTexto =
      primeiro.ano === ultimo.ano && primeiro.mes === ultimo.mes
        ? `Período: ${nomesMeses[primeiro.mes - 1]} de ${primeiro.ano}`
        : `Período: ${nomesMeses[primeiro.mes - 1]} de ${primeiro.ano} a ${
            nomesMeses[ultimo.mes - 1]
          } de ${ultimo.ano}`;

    const linhasPeriodo = pdf.splitTextToSize(periodoTexto, 180);

    pdf.setFontSize(11);
    pdf.text(linhasPeriodo, 14, 36);

    let y = 36 + linhasPeriodo.length * 6 + 8;

    pdf.setFontSize(12);

    pdf.text(`Consumo total: ${numero(consumoTotal)} L`, 14, y);
    y += 8;

    pdf.text(
      `Consumo total: ${numero(consumoM3Total, 6)} m³`,
      14,
      y
    );
    y += 8;

    pdf.text(`Água: ${moeda(valorAguaTotal)}`, 14, y);
    y += 8;

    pdf.text(`Esgoto: ${moeda(valorEsgotoTotal)}`, 14, y);
    y += 8;

    pdf.text(`Valor estimado total: ${moeda(valorTotal)}`, 14, y);
    y += 10;

    autoTable(pdf, {
      startY: y,
      head: [
        [
          "Mês",
          "Consumo (L)",
          "Consumo (m³)",
          "Água",
          "Esgoto",
          "Total",
        ],
      ],
      body: dadosOrdenados.map((item) => [
        `${nomesMeses[item.mes - 1]} de ${item.ano}`,
        numero(item.consumoLitros),
        numero(item.consumoM3, 6),
        moeda(item.valorAgua),
        moeda(item.valorEsgoto),
        moeda(item.valorEstimado),
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
        minCellHeight: 9,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [37, 99, 235],
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 29 },
        2: { cellWidth: 29 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
      theme: "grid",
      margin: {
        left: 14,
        right: 14,
      },
      showHead: "everyPage",
    });

    // Captura do gráfico em uma página separada
    const elementoGrafico = document.getElementById("grafico-consumo");

    if (elementoGrafico) {
      try {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        const { default: html2canvas } = await import("html2canvas-pro");

        const imagem = await html2canvas(elementoGrafico, {
          scale: 2,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
        });

        console.log("Dimensões da imagem:", imagem.width, imagem.height);

        if (imagem.width > 0 && imagem.height > 0) {
          const imagemBase64 = imagem.toDataURL("image/png");

          console.log("Tamanho da imagem:", imagemBase64.length);

          if (imagemBase64.length > 1000) {
            pdf.addPage();

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.text("Gráfico de consumo mensal", 14, 22);

            const larguraPagina = pdf.internal.pageSize.getWidth();
            const alturaPagina = pdf.internal.pageSize.getHeight();

            const margem = 14;
            const larguraMaxima = larguraPagina - margem * 2;
            const alturaMaxima = alturaPagina - 45;

            const proporcao = imagem.width / imagem.height;

            let largura = larguraMaxima;
            let altura = largura / proporcao;

            if (altura > alturaMaxima) {
              altura = alturaMaxima;
              largura = altura * proporcao;
            }

            const x = (larguraPagina - largura) / 2;

            pdf.addImage(
              imagemBase64,
              "PNG",
              x,
              35,
              largura,
              altura,
              undefined,
              "FAST"
            );
          } else {
            console.error("A imagem capturada parece estar vazia.");
          }
        } else {
          console.error("O gráfico não possui dimensões válidas.");
        }
      } catch (erro) {
        console.error("Erro ao capturar o gráfico para o PDF:", erro);
      }
    } else {
      console.error('Elemento com id="grafico-consumo" não encontrado.');
    }

    const anosArquivo = [
      ...new Set(dadosOrdenados.map((item) => item.ano)),
    ];

    const nomePeriodo =
      anosArquivo.length === 1
        ? String(anosArquivo[0])
        : `${anosArquivo[0]}-${anosArquivo[anosArquivo.length - 1]}`;

    pdf.save(`relatorio-consumo-${nomePeriodo}.pdf`);
  }

  return (
    <button
      type="button"
      onClick={gerarPDF}
      disabled={dados.length === 0}
      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Baixar relatório em PDF
    </button>
  );
}
