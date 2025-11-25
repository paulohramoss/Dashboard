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
import { parse } from "ofx-js";
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
    setMessage(t("common.loading"));

    try {
      const extension = file.name.split(".").pop().toLowerCase();

      if (extension === "csv") {
        parseCSV(file);
      } else if (["xlsx", "xls"].includes(extension)) {
        parseExcel(file);
      } else if (extension === "ofx") {
        parseOFX(file);
      } else {
        throw new Error(
          "Unsupported file format. Please use .csv, .xlsx, .xls, or .ofx"
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setStatus("error");
          setMessage("Error parsing CSV file");
          return;
        }
        normalizeData(results.data);
      },
      error: (error) => {
        setStatus("error");
        setMessage(error.message);
      },
    });
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
        setMessage("Error parsing Excel file");
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
      setMessage("No valid transactions found in Numbers export");
      return;
    }

    onUpload(transactions);
    setStatus("success");
    setMessage(`Successfully imported ${transactions.length} transactions`);

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 3000);
  };

  const parseOFX = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const data = await parse(text);

        // Navigate through OFX structure to find transactions
        // Structure varies but usually: OFX -> BANKMSGSRSV1 -> STMTTRNRS -> STMTRS -> BANKTRANLIST -> STMTTRN
        const bankMsgs = data.OFX.BANKMSGSRSV1 || data.OFX.CREDITCARDMSGSRSV1;
        const stmtTrnRs = bankMsgs.STMTTRNRS || bankMsgs.CCSTMTTRNRS;
        const stmtRs = stmtTrnRs.STMTRS || stmtTrnRs.CCSTMTRS;
        const bankTranList = stmtRs.BANKTRANLIST;
        const stmtTrn = bankTranList.STMTTRN;

        // Ensure array
        const transactionsList = Array.isArray(stmtTrn) ? stmtTrn : [stmtTrn];

        const transactions = transactionsList.map((trn) => {
          const amount = parseFloat(trn.TRNAMT);
          const dateStr = trn.DTPOSTED.substring(0, 8); // YYYYMMDD
          const date = `${dateStr.substring(0, 4)}-${dateStr.substring(
            4,
            6
          )}-${dateStr.substring(6, 8)}`;

          return {
            description: trn.MEMO || trn.NAME || "OFX Transaction",
            amount: Math.abs(amount),
            type: amount < 0 ? "expense" : "income",
            category: "General",
            date: date,
          };
        });

        if (transactions.length === 0) {
          throw new Error("No transactions found in OFX file");
        }

        onUpload(transactions);
        setStatus("success");
        setMessage(
          `Successfully imported ${transactions.length} transactions from OFX`
        );

        setTimeout(() => {
          setStatus("idle");
          setMessage("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }, 3000);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("Error parsing OFX file. Ensure it is a valid bank export.");
      }
    };
    reader.readAsText(file);
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
          row[getKey("desc")] || row[getKey("name")] || "Imported Transaction";
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
      setMessage("No valid transactions found");
      return;
    }

    onUpload(normalized);
    setStatus("success");
    setMessage(`Successfully imported ${normalized.length} transactions`);

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
                <p className="font-medium">Processing...</p>
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
