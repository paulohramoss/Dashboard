import React, { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Tesseract from "tesseract.js";
import { useTranslation } from "react-i18next";

const MagicScan = ({ onScanComplete, className }) => {
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
        logger: (m) => console.log(m), // Optional: log progress
      });

      const text = result.data.text;
      console.log("OCR Result:", text);

      // --- Extraction Logic ---

      // 1. Extract Date (DD/MM/YYYY)
      // Matches 12/05/2023 or 12-05-2023
      const dateRegex = /(\d{2})[/.-](\d{2})[/.-](\d{4})/;
      const dateMatch = text.match(dateRegex);
      let extractedDate = null;

      if (dateMatch) {
        // Convert to YYYY-MM-DD for HTML input
        const [_, day, month, year] = dateMatch;
        extractedDate = `${year}-${month}-${day}`;
      }

      // 2. Extract Amount
      // Look for patterns like R$ 20,00 or 20,00
      // We look for "Total" lines mostly, but generic search helps too
      // Regex matches: 1.234,56 or 1234,56
      const amountRegex = /(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/gi;
      const amountMatches = text.match(amountRegex);
      let extractedAmount = null;

      if (amountMatches) {
        // Simple heuristic: The largest value found on the receipt is usually the total
        // Or the last value found. Let's try to map them to numbers and find the max.
        const values = amountMatches.map((str) => {
          // clean string: remove R$, remove dots, replace comma with dot
          const cleanStr = str
            .replace(/[R$\s]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");
          return parseFloat(cleanStr);
        });

        const maxVal = Math.max(...values);
        if (!isNaN(maxVal)) {
          extractedAmount = maxVal;
        }
      }

      if (extractedDate || extractedAmount) {
        onScanComplete({
          date: extractedDate,
          amount: extractedAmount,
          rawText: text, // Optional: useful for debugging or description
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
      // Reset input so same file can be selected again if needed
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
        capture="environment" // Opens camera on mobile
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
        {/* Shimmer effect for "Magic" feel */}
        {!isScanning && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </Button>
    </div>
  );
};

export default MagicScan;
