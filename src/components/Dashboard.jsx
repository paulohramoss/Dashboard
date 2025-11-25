import React from "react";
import { useTransactions } from "@/hooks/useTransactions";
import SummaryCards from "@/components/SummaryCards";
import OverviewChart from "@/components/Charts/OverviewChart";
import CategoryChart from "@/components/Charts/CategoryChart";
import TransactionHistory from "@/components/TransactionHistory";
import TransactionForm from "@/components/TransactionForm";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";

const Dashboard = () => {
  const {
    transactions,
    addTransaction,
    addTransactions,
    deleteTransaction,
    clearTransactions,
    stats,
  } = useTransactions();

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "financial-dashboard-export.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Financial Dashboard Report", 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
    const tableRows = [];

    transactions.forEach((transaction) => {
      const transactionData = [
        new Date(transaction.date).toLocaleDateString(),
        transaction.description,
        transaction.category,
        transaction.type,
        `$${parseFloat(transaction.amount).toFixed(2)}`,
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }, // Primary blue color
    });

    doc.save("financial-dashboard-report.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your financial status and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={clearTransactions}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Data
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <SummaryCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OverviewChart transactions={transactions} />
        <CategoryChart transactions={transactions} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4 space-y-4">
          <TransactionHistory
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </div>
        <div className="col-span-4 lg:col-span-3 space-y-4">
          <TransactionForm onAddTransaction={addTransaction} />
          <FileUploader onUpload={addTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
