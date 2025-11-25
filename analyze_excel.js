import * as XLSX from "xlsx";
import { readFileSync } from "fs";

try {
  const path = "c:\\Users\\Flexpro\\Desktop\\Dashboard\\Orçamento Simples.xlsx";
  console.log("Reading file from:", path);
  const file = readFileSync(path);
  const workbook = XLSX.read(file, { type: "buffer" });
  console.log("Sheet Names:", workbook.SheetNames);

  workbook.SheetNames.forEach((name) => {
    if (name === "Resumo da Exportação") return;

    console.log(`\n--- Inspecting Sheet: ${name} ---`);
    const ws = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    console.log("First 10 rows (raw):");
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
  });
} catch (error) {
  console.error("Error:", error.message);
}
