import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read translation files
const ptPath = path.join(__dirname, "src", "locales", "pt.json");
const enPath = path.join(__dirname, "src", "locales", "en.json");

const ptData = JSON.parse(fs.readFileSync(ptPath, "utf8"));
const enData = JSON.parse(fs.readFileSync(enPath, "utf8"));

// Flatten nested objects to dot notation
function flattenObject(obj, prefix = "") {
  const flattened = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  return flattened;
}

const ptFlat = flattenObject(ptData);
const enFlat = flattenObject(enData);

const ptKeys = new Set(Object.keys(ptFlat));
const enKeys = new Set(Object.keys(enFlat));

// Find keys only in PT
const onlyInPt = [...ptKeys].filter((k) => !enKeys.has(k));

// Find keys only in EN
const onlyInEn = [...enKeys].filter((k) => !ptKeys.has(k));

console.log("=== ANÁLISE DE TRADUÇÕES ===\n");
console.log(`Total de chaves em PT: ${ptKeys.size}`);
console.log(`Total de chaves em EN: ${enKeys.size}\n`);

if (onlyInPt.length > 0) {
  console.log("❌ CHAVES APENAS EM PT (faltam em EN):");
  onlyInPt.forEach((key) => {
    console.log(`  - ${key}: "${ptFlat[key]}"`);
  });
  console.log("");
} else {
  console.log("✅ Todas as chaves de PT existem em EN\n");
}

if (onlyInEn.length > 0) {
  console.log("❌ CHAVES APENAS EM EN (faltam em PT):");
  onlyInEn.forEach((key) => {
    console.log(`  - ${key}: "${enFlat[key]}"`);
  });
  console.log("");
} else {
  console.log("✅ Todas as chaves de EN existem em PT\n");
}

if (onlyInPt.length === 0 && onlyInEn.length === 0) {
  console.log("🎉 Todos os arquivos de tradução estão sincronizados!\n");
}

// Display summary
console.log("=== RESUMO ===");
console.log(`Chaves apenas em PT: ${onlyInPt.length}`);
console.log(`Chaves apenas em EN: ${onlyInEn.length}`);
console.log(
  `Chaves em comum: ${[...ptKeys].filter((k) => enKeys.has(k)).length}`,
);
