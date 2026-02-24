import React, { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Tesseract from "tesseract.js";
import { useTranslation } from "react-i18next";
import { suggestCategory } from "@/lib/gemini";

/**
 * Extrai o nome do estabelecimento do texto OCR.
 * Busca a primeira linha legível que não seja data, valor ou código fiscal.
 */
function extractMerchantName(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const meaningful = lines.filter((l) => {
    const noSpaces = l.replace(/\s/g, "");
    if (/^[\d.,/:R$%*=\-+]+$/.test(noSpaces)) return false;
    if (/^\d{2}[/.\-]\d{2}[/.\-]\d{4}/.test(l)) return false;
    if (/cnpj|cpf|total|subtotal|troco|cobrado|pgto|dinheiro|via\s/i.test(l))
      return false;
    return true;
  });

  return (meaningful[0] || "")
    .replace(/[^\w\sÀ-ú]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 60);
}

const MagicScan = ({
  onScanComplete,
  className,
  categories = [],
  language = "pt",
}) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processImage = async (file) => {
    setIsScanning(true);
    const toastId = toast.loading(t("magicScan.processing", "Lendo recibo..."));

    try {
      const result = await Tesseract.recognize(file, "por", {
        logger: () => {},
      });

      const text = result.data.text;

      // 1. Extrair data (DD/MM/YYYY)
      const dateRegex = /(\d{2})[/.-](\d{2})[/.-](\d{4})/;
      const dateMatch = text.match(dateRegex);
      let extractedDate = null;
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        extractedDate = `${year}-${month}-${day}`;
      }

      // 2. Extrair valor (maior valor = total do recibo)
      const amountRegex = /(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/gi;
      const amountMatches = text.match(amountRegex);
      let extractedAmount = null;
      if (amountMatches) {
        const values = amountMatches.map((str) =>
          parseFloat(
            str.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".")
          )
        );
        const maxVal = Math.max(...values);
        if (!isNaN(maxVal)) extractedAmount = maxVal;
      }

      // 3. Extrair nome do estabelecimento
      const description = extractMerchantName(text);

      // 4. Categorizar com IA baseado no texto do recibo
      let category = null;
      const textSample = text.substring(0, 600);
      if (textSample.trim()) {
        toast.loading(
          t("magicScan.categorizing", "Categorizando com IA..."),
          { id: toastId }
        );
        try {
          const aiResult = await suggestCategory(
            textSample,
            categories,
            language
          );
          category = aiResult.category || null;
        } catch {
          // falha silenciosa — não bloqueia o fluxo principal
        }
      }

      if (extractedDate || extractedAmount) {
        onScanComplete({
          date: extractedDate,
          amount: extractedAmount,
          description,
          category,
          rawText: text,
        });
        toast.success(t("magicScan.success", "Dados extraídos com sucesso!"), {
          id: toastId,
        });
      } else {
        toast.warning(
          t("magicScan.noData", "Não foi possível identificar data ou valor."),
          { id: toastId }
        );
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error(t("magicScan.error", "Erro ao processar imagem."), {
        id: toastId,
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleButtonClick}
        disabled={isScanning}
        className="relative overflow-hidden"
        aria-label={t("magicScan.buttonLabel", "Escanear Recibo")}
      >
        {isScanning ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Camera className="h-4 w-4 text-primary" />
        )}
        {!isScanning && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </Button>
    </div>
  );
};

export default MagicScan;
