import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import { cn } from "@/lib/utils";

const FileUploader = ({ onUpload }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, uploading, success, error
  const [message, setMessage] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setStatus("uploading");
    setMessage(t("transactions.import.processing"));

    try {
      const extension = file.name.split(".").pop().toLowerCase();

      if (extension === "csv") {
        parseCSV(file);
      } else if (["xlsx", "xls"].includes(extension)) {
        parseExcel(file);
      } else if (extension === "ofx") {
        parseOFX(file);
      } else {
        throw new Error(t("transactions.import.unsupportedFormat"));
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setStatus("error");
          setMessage(t("transactions.import.csvError"));
          return;
        }

        const isSicoob = results.data.slice(0, 5).some((row) => {
          const cell = Array.isArray(row) ? row[0] : row;
          return (
            typeof cell === "string" &&
            (cell.includes("SICOOB") || cell.includes("SISBR"))
          );
        });

        if (isSicoob) {
          const txs = parseSicoobCSV(results.data);
          if (!txs || txs.length === 0) {
            setStatus("error");
            setMessage(t("transactions.import.noTransactions"));
            return;
          }
          onUpload(txs);
          setStatus("success");
          setMessage(
            t("transactions.import.success", { count: txs.length })
          );
          setTimeout(() => {
            setStatus("idle");
            setMessage("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }, 3000);
        } else {
          // Re-parse with headers for standard CSV format
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results2) => {
              normalizeData(results2.data);
            },
            error: (error) => {
              setStatus("error");
              setMessage(error.message);
            },
          });
        }
      },
      error: (error) => {
        setStatus("error");
        setMessage(error.message);
      },
    });
  };

  const parseSicoobCSV = (rawRows) => {
    const today = new Date().toISOString().split("T")[0];

    const lines = rawRows
      .map((row) => (Array.isArray(row) ? row[0] : row) || "")
      .map((l) => (typeof l === "string" ? l.trim() : String(l).trim()))
      .filter((l) => l.length > 0);

    // Extract statement year from header line (e.g. "27/03/2026  EXTRATO...")
    let statementYear = new Date().getFullYear();
    for (const line of lines.slice(0, 15)) {
      const yearMatch = line.match(/\d{2}\/\d{2}\/(\d{4})/);
      if (yearMatch) {
        statementYear = parseInt(yearMatch[1]);
        break;
      }
    }

    const transactions = [];
    let inSection = false;
    let pendingDate = null;
    let pendingDesc = null;

    // Amount at end: optional sign, digits/dots (thousands sep), comma, 2 decimals
    const amountAtEnd = /(-?[\d.]+,\d{2})\s*$/;
    // Date at start: DD/MM followed by at least one space
    const dateAtStart = /^(\d{2})\/(\d{2})\s+/;
    // Just a bare date: "04/03"
    const justDateOnly = /^(\d{2})\/(\d{2})\s*$/;
    // Exchange rate line: "R$ X,XX U$ Y,YY V.DOL Z.ZZZZ    BRL_AMOUNT"
    const exchangeLine =
      /^R\$\s+[\d.,]+\s+U\$\s+[\d.,]+\s+V\.DOL\s+[\d.,]+\s+([\d.,]+,\d{2})\s*$/;

    const parseAmt = (amtStr) =>
      parseFloat(amtStr.replace(/\./g, "").replace(",", "."));

    const formatDate = (day, month) =>
      `${statementYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    // Short lines with no asterisk and no embedded date are likely city names
    const isCityOrJunk = (line) =>
      !line.includes("*") && !/\d{2}\/\d{2}/.test(line) && line.length < 20;

    const pushTx = (date, description, amtStr) => {
      const amount = parseAmt(amtStr);
      if (isNaN(amount) || amount === 0) return;
      const desc = (description || "").trim();
      if (desc.toUpperCase().includes("SALDO ANTERIOR")) return;

      transactions.push({
        description: desc || t("transactions.import.defaultDescription"),
        amount: Math.abs(amount),
        type: amount < 0 ? "income" : "expense",
        category: "General",
        date: date || today,
      });
      pendingDate = null;
      pendingDesc = null;
    };

    for (const line of lines) {
      // Detect start of transaction sections
      if (line === "MOVIMENTOS" || /^GASTOS DE /i.test(line)) {
        inSection = true;
        pendingDate = null;
        pendingDesc = null;
        continue;
      }
      // Detect end of transaction sections
      if (
        /^TOTAL\s/.test(line) ||
        line.startsWith("DEMONSTRATIVO") ||
        line.startsWith("LIMITES") ||
        line === "RESUMO" ||
        line.startsWith("PERFIL")
      ) {
        inSection = false;
        continue;
      }

      if (!inSection) continue;

      // Skip lines using "-" as empty date placeholder (e.g. SALDO ANTERIOR)
      if (line.startsWith("-")) continue;

      const amountMatch = line.match(amountAtEnd);
      const dateMatch = line.match(dateAtStart);
      const justDate = line.match(justDateOnly);
      const exchangeMatch = line.match(exchangeLine);

      if (exchangeMatch) {
        // "R$ 110,00 U$ 21,30 V.DOL 5,1635    110,00"
        pushTx(pendingDate || today, pendingDesc, exchangeMatch[1]);
      } else if (justDate) {
        // Bare date only: "04/03" — save for next line
        const [, day, month] = justDate;
        pendingDate = formatDate(day, month);
      } else if (amountMatch && dateMatch) {
        // Line has both date and amount: "DD/MM  DESCRIPTION  AMOUNT"
        const [, day, month] = line.match(/^(\d{2})\/(\d{2})/);
        const date = formatDate(day, month);
        const descStart = dateMatch[0].length;
        const descEnd = line.lastIndexOf(amountMatch[1]);
        let desc = line.slice(descStart, descEnd).trim();
        // Multi-line case: amount line has no inline description
        if (!desc) desc = pendingDesc;
        pushTx(date, desc, amountMatch[1]);
      } else if (dateMatch && !amountMatch) {
        // Date at start but no amount: "24/02  CLAUDE.AI SUBSCRIPTI SAN FRANCISCO"
        const [, day, month] = line.match(/^(\d{2})\/(\d{2})/);
        pendingDate = formatDate(day, month);
        const desc = line.slice(dateMatch[0].length).trim();
        if (desc) pendingDesc = desc;
      } else if (!dateMatch && !amountMatch && !exchangeMatch) {
        // Text-only line — merchant name or city
        if (!isCityOrJunk(line)) {
          // Looks like a merchant name; append in case it's split across lines
          pendingDesc = pendingDesc ? pendingDesc + " " + line : line;
        }
        // Short city names (CAJAMAR, TIJUCAS, PAULO…) are silently ignored
      }
    }

    return transactions;
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Check for specific "Orçamento Simples" structure (Apple Numbers export)
        if (
          workbook.SheetNames.includes("Orçamento - Rendimentos") ||
          workbook.SheetNames.includes("Orçamento - Despesas")
        ) {
          parseNumbersExport(workbook);
        } else {
          // Default behavior: parse first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          normalizeData(jsonData);
        }
      } catch {
        setStatus("error");
        setMessage(t("transactions.import.excelError"));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseNumbersExport = (workbook) => {
    let transactions = [];
    const today = new Date().toISOString().split("T")[0];

    // Parse Income
    if (workbook.SheetNames.includes("Orçamento - Rendimentos")) {
      const ws = workbook.Sheets["Orçamento - Rendimentos"];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      data.forEach((row) => {
        // Skip header and totals
        if (
          !row[0] ||
          row[0] === "Dinheiro Entrando" ||
          row[0].toString().toLowerCase().includes("totais")
        )
          return;

        const amount = parseFloat(row[1]);
        if (!isNaN(amount)) {
          transactions.push({
            description: row[0],
            amount: Math.abs(amount),
            type: "income",
            category: "Salary", // Default for income in this template
            date: today,
          });
        }
      });
    }

    // Parse Expenses
    if (workbook.SheetNames.includes("Orçamento - Despesas")) {
      const ws = workbook.Sheets["Orçamento - Despesas"];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      data.forEach((row) => {
        // Skip header and totals
        if (
          !row[0] ||
          row[0] === "Dinheiro Saindo" ||
          row[0].toString().toLowerCase().includes("totais")
        )
          return;

        const amount = parseFloat(row[1]);
        if (!isNaN(amount)) {
          transactions.push({
            description: row[0],
            amount: Math.abs(amount),
            type: "expense",
            category: "General", // Default category
            date: today,
          });
        }
      });
    }

    if (transactions.length === 0) {
      setStatus("error");
      setMessage(t("transactions.import.numbersError"));
      return;
    }

    onUpload(transactions);
    setStatus("success");
    setMessage(
      t("transactions.import.success", { count: transactions.length })
    );

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 3000);
  };

  const parseOFX = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;

        // Simple Regex-based parser to avoid external library dependencies issues in browser
        const transactions = [];

        // Find all STMTTRN blocks
        const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
        let match;

        while ((match = trnRegex.exec(text)) !== null) {
          const trnBlock = match[1];

          // Helper to extract value by tag
          const getValue = (tag) => {
            const tagRegex = new RegExp(`<${tag}>([^<]+)`, "i");
            const tagMatch = trnBlock.match(tagRegex);
            return tagMatch ? tagMatch[1].trim() : null;
          };

          // Also handle closed tags style <TAG>VALUE</TAG>
          const getValueClosed = (tag) => {
            const tagRegex = new RegExp(`<${tag}>([^<]+)</${tag}>`, "i");
            const tagMatch = trnBlock.match(tagRegex);
            return tagMatch ? tagMatch[1].trim() : null;
          };

          const amountStr = getValue("TRNAMT") || getValueClosed("TRNAMT");
          const dateStr = getValue("DTPOSTED") || getValueClosed("DTPOSTED");
          const distinct = getValue("MEMO") || getValueClosed("MEMO");
          const name = getValue("NAME") || getValueClosed("NAME");

          if (amountStr && dateStr) {
            const amount = parseFloat(amountStr.replace(",", ".")); // Ensure handle comma if present, usually OFX uses dot

            // Format date YYYYMMDD... -> YYYY-MM-DD
            const cleanDateStr = dateStr.substring(0, 8);
            const date = `${cleanDateStr.substring(
              0,
              4
            )}-${cleanDateStr.substring(4, 6)}-${cleanDateStr.substring(6, 8)}`;

            transactions.push({
              description: distinct || name || "OFX Transaction",
              amount: Math.abs(amount),
              type: amount < 0 ? "expense" : "income",
              category: "General",
              date: date,
            });
          }
        }

        if (transactions.length === 0) {
          // Fallback check if it's because of encoding or other issues?
          // Sometimes tags are different, but STMTTRN is standard.
          throw new Error(t("transactions.import.ofxNoTransactions"));
        }

        onUpload(transactions);
        setStatus("success");
        setMessage(
          t("transactions.import.success", { count: transactions.length })
        );

        setTimeout(() => {
          setStatus("idle");
          setMessage("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }, 3000);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage(t("transactions.import.ofxError"));
      }
    };

    // Try reading as ISO-8859-1 (Latin-1) which is common for Brazilian Banks OFX
    reader.readAsText(file, "ISO-8859-1");
  };

  const normalizeData = (data) => {
    // Attempt to map common column names to our schema
    // Schema: description, amount, type, category, date

    const normalized = data
      .map((row) => {
        // Case insensitive key search
        const getKey = (key) =>
          Object.keys(row).find((k) => k.toLowerCase().includes(key));

        const description =
          row[getKey("desc")] ||
          row[getKey("name")] ||
          t("transactions.import.defaultDescription");
        const amount = parseFloat(
          row[getKey("amount")] ||
            row[getKey("value")] ||
            row[getKey("price")] ||
            0
        );
        const dateRaw = row[getKey("date")] || row[getKey("time")];

        // Simple type inference if not present
        let type = "expense";
        if (row[getKey("type")]) {
          type = row[getKey("type")].toLowerCase();
        } else if (amount > 0) {
          // Sometimes positive is income, negative is expense.
          // But here we assume absolute amount and explicit type, or default to expense.
          // Let's assume if amount is negative it's expense, positive income?
          // Or just default to expense.
          // Let's look for 'income' or 'credit' keywords in other fields?
          // For now, default to expense.
        }

        // Format date
        let date = new Date().toISOString().split("T")[0];
        if (dateRaw) {
          try {
            // Handle Excel serial dates if needed, but sheet_to_json usually handles it if cell type is date
            // If string, try to parse
            const parsedDate = new Date(dateRaw);
            if (!isNaN(parsedDate)) {
              date = parsedDate.toISOString().split("T")[0];
            }
          } catch {
            // Ignore invalid dates, keep default
          }
        }

        return {
          description,
          amount: Math.abs(amount), // Store as positive
          type: amount < 0 ? "expense" : type, // If negative amount in file, treat as expense
          category: row[getKey("cat")] || "General",
          date,
        };
      })
      .filter((t) => t.amount > 0);

    if (normalized.length === 0) {
      setStatus("error");
      setMessage(t("transactions.import.noTransactions"));
      return;
    }

    onUpload(normalized);
    setStatus("success");
    setMessage(t("transactions.import.success", { count: normalized.length }));

    // Reset after 3 seconds
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 3000);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            status === "success" && "border-green-500 bg-green-50/10",
            status === "error" && "border-destructive bg-destructive/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx,.xls,.ofx"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-2">
            {status === "idle" && (
              <>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Upload className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{t("transactions.dragDrop")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("transactions.supports")}
                </p>
              </>
            )}

            {status === "uploading" && (
              <>
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2" />
                <p className="font-medium">
                  {t("transactions.import.processing")}
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="font-medium text-green-600">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <p className="font-medium text-red-600">{message}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
