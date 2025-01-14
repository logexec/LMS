"use client";
import React, { Suspense, useState } from "react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { usePagination } from "@table-library/react-table-library/pagination";
import { useSort } from "@table-library/react-table-library/sort";

import Input from "./Input";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";
import "./table.component.css";
import Loader from "../Loader";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { GrDocumentCsv, GrDocumentPdf } from "react-icons/gr";

interface Node {
  id: string;
  fechaGasto: Date;
  tipo: string;
  facturaVale: string;
  cuenta: string;
  valor: number;
  proyecto: string;
  responsable: string;
  transporte: string;
  placa: string;
  adjunto: string;
  observacion: string;
  estado: string;
  acciones?: React.ReactNode;
}

interface TableData {
  nodes: Node[];
  type: string;
}

type ColumnType = {
  accessor: (item: Node) => string | number | Date | null | React.ReactNode;
  name: string;
};

const PaginationButtons: React.FC<{
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  handlePage: (index: number) => void;
}> = ({ currentPage, totalPages, onPreviousPage, onNextPage, handlePage }) => (
  <div className="flex justify-center items-center">
    <span className="flex gap-3 items-center">
      <button
        aria-label="Página anterior"
        className={
          currentPage === 0
            ? "cursor-not-allowed text-slate-400"
            : "text-red-600"
        }
        onClick={onPreviousPage}
        disabled={currentPage === 0}
      >
        <BiLeftArrow />
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          type="button"
          className={`hover:underline underline-offset-4 ${
            currentPage === index
              ? "underline font-semibold underline-offset-4 text-red-700"
              : "font-light text-secondary "
          }`}
          onClick={() => handlePage(index)}
        >
          {index + 1}
        </button>
      ))}
      <button
        aria-label="Página siguiente"
        className={
          currentPage === totalPages - 1
            ? "cursor-not-allowed text-slate-400"
            : "text-red-600"
        }
        onClick={onNextPage}
        disabled={currentPage === totalPages - 1}
      >
        <BiRightArrow />
      </button>
    </span>
  </div>
);

const removeAccents = (text: string) => {
  return text
    .normalize("NFD") // Descompone caracteres acentuados en dos partes (caracter base + acento)
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los caracteres de acento
};

const Component: React.FC<TableData> = ({ nodes, type }) => {
  const [search, setSearch] = useState("");

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  auto auto auto auto auto auto auto auto auto auto minmax(150px, 1fr) auto auto;
      `,
    },
  ]);

  const lowerSearch = removeAccents(search.toLowerCase());
  const filteredData = nodes.filter((item) => {
    return (
      removeAccents(item.id.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.tipo.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.cuenta.toLowerCase()).includes(lowerSearch) ||
      item.valor.toString().includes(search) ||
      removeAccents(item.proyecto.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.responsable.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.placa.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.transporte.toLowerCase()).includes(lowerSearch) ||
      removeAccents(item.observacion.toLowerCase()).includes(lowerSearch)
    );
  });

  const sortedData = filteredData.sort((a, b) => {
    return b.fechaGasto.getTime() - a.fechaGasto.getTime();
  });

  const pagination = usePagination(
    { nodes: sortedData },
    {
      state: { page: 0, size: 15 },
    }
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handlePage = (index: number) => {
    if (pagination.state.page !== index) {
      pagination.fns.onSetPage(index);
    }
  };

  const handleNextPage = () => {
    if (
      pagination.state.page <
      pagination.state.getTotalPages(filteredData) - 1
    ) {
      pagination.fns.onSetPage(pagination.state.page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.state.page > 0) {
      pagination.fns.onSetPage(pagination.state.page - 1);
    }
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const sort = useSort(
    { nodes: filteredData },
    { onChange: (action, state) => console.log(action, state) },
    {
      sortFns: {
        FECHA_GASTO: (array) =>
          array.sort((a, b) => a.fechaGasto.getTime() - b.fechaGasto.getTime()),
        TIPO: (array) => array.sort((a, b) => a.tipo.localeCompare(b.tipo)),
        FACTURA_VALE: (array) =>
          array.sort((a, b) => a.facturaVale.localeCompare(b.facturaVale)),
        VALOR: (array) => array.sort((a, b) => a.valor - b.valor),
        CUENTA: (array) =>
          array.sort((a, b) => a.cuenta.localeCompare(b.cuenta)),
        PROYECTO: (array) =>
          array.sort((a, b) => a.proyecto.localeCompare(b.proyecto)),
        RESPONSABLE: (array) =>
          array.sort((a, b) => a.responsable.localeCompare(b.responsable)),
        TRANSPORTE: (array) =>
          array.sort((a, b) => a.transporte.localeCompare(b.transporte)),
        PLACA: (array) => array.sort((a, b) => a.placa.localeCompare(b.placa)),
      },
    }
  );

  const COLUMNS = [
    {
      label: "Fecha Gasto",
      renderCell: (item: Node) =>
        item.fechaGasto.toLocaleDateString("es-ES", dateOptions),
      sort: { sortKey: "FECHA_GASTO" },
    },
    {
      label: "Tipo",
      renderCell: (item: Node) => item.tipo,
      sort: { sortKey: "TIPO" },
    },
    {
      label: "Factura/Vale",
      renderCell: (item: Node) => item.facturaVale,
      sort: { sortKey: "FACTURA_VALE" },
    },
    {
      label: "Valor",
      renderCell: (item: Node) => `$${item.valor}`,
      sort: { sortKey: "VALOR" },
    },
    {
      label: "Cuenta",
      renderCell: (item: Node) => item.cuenta,
      sort: { sortKey: "CUENTA" },
    },
    {
      label: "Proyecto",
      renderCell: (item: Node) => item.proyecto,
      sort: { sortKey: "PROYECTO" },
    },
    {
      label: "Responsable",
      renderCell: (item: Node) => item.responsable,
      sort: { sortKey: "RESPONSABLE" },
    },
    {
      label: "Transporte",
      renderCell: (item: Node) => item.transporte,
      sort: { sortKey: "TRANSPORTE" },
    },
    {
      label: "Placa",
      renderCell: (item: Node) => item.placa,
      sort: { sortKey: "PLACA" },
    },
    {
      label: "Adjunto",
      renderCell: (item: Node) => item.adjunto,
    },
    {
      label: "Observación",
      renderCell: (item: Node) => item.observacion,
    },
    {
      label: "Estado",
      renderCell: (item: Node) => item.estado,
    },
    {
      label: "Acciones",
      renderCell: () => (
        <div className="flex flex-row gap-3">
          <button className="text-indigo-500 hover:underline hover:text-indigo-700">
            <span>Editar</span>
          </button>
          <button className="text-red-500 hover:underline hover:text-red-700">
            <span>Eliminar</span>
          </button>
        </div>
      ),
    },
  ];

  //   Descargar CSV
  const escapeCsvCell = (
    cell: string | number | Date | null | React.ReactNode
  ): string => {
    if (cell == null) {
      return "";
    }

    if (cell instanceof Date) {
      return cell.toLocaleDateString();
    }

    if (React.isValidElement(cell)) {
      const children = cell.props;
      // const children = cell.props.children;

      return String(children);
    }

    const sc = String(cell).trim();

    if (sc === "" || sc === '""') {
      return sc;
    }

    if (
      sc.includes('"') ||
      sc.includes(",") ||
      sc.includes("\n") ||
      sc.includes("\r")
    ) {
      return '"' + sc.replace(/"/g, '""') + '"';
    }

    return sc;
  };

  const makeCsvData = (
    columns: {
      accessor: (item: Node) => string | number | Date | null | React.ReactNode;
      name: string;
    }[],
    data: Node[]
  ): string => {
    return data.reduce((csvString, rowItem) => {
      return (
        csvString +
        columns
          .map(({ accessor }) => escapeCsvCell(accessor(rowItem)))
          .join(",") +
        "\r\n"
      );
    }, columns.map(({ name }) => escapeCsvCell(name)).join(",") + "\r\n");
  };

  const downloadAsCsv = (
    columns: ColumnType[],
    data: Node[],
    filename: string
  ): void => {
    const csvData = makeCsvData(columns, data);
    const csvFile = new Blob([csvData], { type: "text/csv" });
    const downloadLink = document.createElement("a");

    downloadLink.style.display = "none";
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleDownloadCsv = () => {
    const columns: ColumnType[] = [
      { accessor: (item: Node) => item.fechaGasto, name: "Fecha Gasto" },
      { accessor: (item: Node) => item.tipo, name: "Tipo" },
      {
        accessor: (item: Node) => item.facturaVale,
        name: "No. Factura o Vale",
      },
      { accessor: (item: Node) => item.cuenta, name: "Cuenta" },
      { accessor: (item: Node) => item.valor, name: "Valor" },
      { accessor: (item: Node) => item.proyecto, name: "Proyecto" },
      { accessor: (item: Node) => item.responsable, name: "Responsable" },
      { accessor: (item: Node) => item.transporte, name: "Transporte" },
      { accessor: (item: Node) => item.placa, name: "Placa" },
      { accessor: (item: Node) => item.adjunto, name: "Adjunto" },
      { accessor: (item: Node) => item.observacion, name: "Observación" },
      { accessor: (item: Node) => item.estado, name: "Estado" },
    ];

    downloadAsCsv(
      columns,
      filteredData,
      `Registro de ${type}__${new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      ).toLocaleDateString()}`
    );
  };

  // Descargar PDF (Horizontal)
  const handleDownloadPdf = async () => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([842, 595]); // A4 tamaño horizontal: 842 x 595

    const { height, width } = page.getSize();

    const margin = 50; // Margen para mover todo más hacia la derecha
    const fontSize = 10;
    const lineHeight = fontSize + 5; // Separación entre las líneas de texto

    // Cargar una fuente estándar
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Función para dividir el texto largo en múltiples líneas
    const splitTextIntoLines = (text: string, maxWidth: number) => {
      const words = text.split(" ");
      const lines = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine ? currentLine + " " + word : word;
        const widthOfTestLine = font.widthOfTextAtSize(testLine, fontSize);

        if (widthOfTestLine < maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word; // Nueva línea con la palabra larga
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    // Cargar el logo
    const logoUrl = "/images/logex_logo.png";
    const logoImageBytes = await fetch(logoUrl).then((res) =>
      res.arrayBuffer()
    );
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.5);
    page.drawImage(logoImage, {
      x: margin,
      y: height - logoDims.height - 50,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Título centrado
    const title =
      type === "gastos" ? "Reporte de Gastos" : "Reporte de Descuentos";
    page.drawText(title, {
      x: (width - font.widthOfTextAtSize(title, 18)) / 2, // Centrado horizontalmente
      y: height - logoDims.height - 20,
      size: 18,
      font: font,
      color: rgb(0.04, 0.04, 0.04),
    });

    // Fecha
    const date = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    page.drawText(date, {
      x: width - 130,
      y: height - 50,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Encabezado de la tabla
    const columns = [
      "Fecha Gasto",
      "Tipo",
      "Factura/Vale",
      "Valor",
      "Cuenta",
      "Proyecto",
      "Responsable",
      "Transporte",
      "Placa",
      "Observación",
      "Estado",
    ];

    let yPosition = height - logoDims.height - 80;
    columns.forEach((column, index) => {
      page.drawText(column, {
        x: margin + index * 70, // Ajuste horizontal con margen izquierdo
        y: yPosition,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    });

    yPosition -= lineHeight; // Espacio después del encabezado

    // Imprimir filas con un fondo gris claro para filas pares
    const rows = filteredData.map((item) => [
      item.fechaGasto.toLocaleDateString("es-ES", dateOptions),
      item.tipo,
      item.facturaVale,
      `$${item.valor}`,
      item.cuenta,
      item.proyecto,
      item.responsable,
      item.transporte,
      item.placa,
      item.observacion,
      item.estado,
    ]);

    rows.forEach((row, rowIndex) => {
      // Calcular la altura máxima de la fila
      const rowHeight =
        Math.max(...row.map((cell) => splitTextIntoLines(cell, 70).length)) *
        lineHeight; // Altura dinámica de la fila

      if (rowIndex % 2 === 1) {
        // Fondo gris claro para filas PARES
        page.drawRectangle({
          x: margin - 5,
          y: yPosition - rowHeight, // Ajuste la posición Y para alinear el fondo con la fila
          width: width - margin * 2 + 10, // Ancho total (con más espacio a la derecha)
          height: rowHeight + 5, // Añadir un pequeño ajuste para que cubra toda la fila
          color: rgb(0.94, 0.94, 0.94),
        });
      }

      // Dibujar el texto
      row.forEach((cell, index) => {
        const lines = splitTextIntoLines(cell.toString(), 70); // Ajusta el ancho para cada celda
        const totalLines = lines.length;
        const cellHeight = totalLines * lineHeight;

        lines.forEach((line, lineIndex) => {
          // Calcular la posición vertical para centrar el texto
          const verticalOffset =
            (rowHeight - cellHeight) / 2 + lineIndex * lineHeight;

          page.drawText(line, {
            x: margin + index * 70,
            y: yPosition - verticalOffset, // Ajuste vertical
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        });
      });

      yPosition -= rowHeight; // Ajusta la posición después de cada fila

      // Si la fila no cabe, agregamos una nueva página
      if (yPosition < 50) {
        page = pdfDoc.addPage([842, 595]); // Crear nueva página en orientación horizontal
        yPosition = height - 50;
      }
    });

    // Generar y descargar el PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Registro de ${type}_${new Date().toLocaleDateString()}.pdf`;
    a.click();
  };

  return (
    <Suspense fallback={<Loader fullScreen={false} />}>
      <div className="flex items-center justify-between">
        <Input
          label="Buscar"
          placeholder="Filtrar datos..."
          name="search"
          id="search"
          required
          type="search"
          value={search}
          onChange={handleSearch}
        />
        <div className="flex flex-row gap-2 justify-center items-center">
          <button
            type="button"
            className="btn !bg-emerald-600 hover:!bg-emerald-700 !px-3 !py-1 !text-base !font-normal !transition-all duration-300 flex flex-row items-center gap-2"
            onClick={handleDownloadCsv}
          >
            <GrDocumentCsv />
            Descargar CSV
          </button>
          <button
            type="button"
            className="btn !bg-red-600 hover:!bg-red-700 !px-3 !py-1 !text-base !font-normal !transition-all duration-300 flex flex-row items-center gap-2"
            onClick={handleDownloadPdf}
          >
            <GrDocumentPdf />
            Descargar PDF
          </button>
          <span>
            Mostrando página {pagination.state.page + 1} de{" "}
            {pagination.state.getTotalPages(filteredData)}
          </span>
        </div>
      </div>
      <br />
      <CompactTable
        columns={COLUMNS}
        data={{ nodes: filteredData }}
        theme={theme}
        layout={{ custom: true, horizontalScroll: true }}
        pagination={pagination}
        sort={sort}
      />
      <br />
      <PaginationButtons
        currentPage={pagination.state.page}
        totalPages={pagination.state.getTotalPages(filteredData)}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        handlePage={handlePage}
      />

      <button className="text-primary hover:text-red-700 hover:underline transition-all duration-300">
        Enviar Solicitud
      </button>
    </Suspense>
  );
};

export default Component;
