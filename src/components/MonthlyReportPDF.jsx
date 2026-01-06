import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register a standard font (optional, using built-in Helvetica usually works fine)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#1e40af", // blue-800
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#ffffff",
    borderRadius: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 16,
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 10,
    textAlign: "right",
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 15,
    color: "#333333",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 5,
  },
  summaryCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 4,
    backgroundColor: "#f3f4f6", // gray-100
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 10,
    color: "#6b7280", // gray-500
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827", // gray-900
  },
  cardIncome: { borderLeftWidth: 4, borderLeftColor: "#22c55e" }, // green
  cardExpense: { borderLeftWidth: 4, borderLeftColor: "#ef4444" }, // red
  cardBalance: { borderLeftWidth: 4, borderLeftColor: "#3b82f6" }, // blue

  villainContainer: {
    backgroundColor: "#fff1f2", // red-50
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecdd3", // red-200
    marginBottom: 20,
  },
  villainText: {
    fontSize: 12,
    color: "#be123c", // rose-700
    textAlign: "center",
  },

  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  tableCell: {
    margin: 5,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});

const MonthlyReportPDF = ({
  monthName,
  year,
  income,
  expense,
  balance,
  villainCategory,
  villainAmount,
  transactions,
}) => {
  const formatCurrency = (val) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
  const villainPercentage =
    expense > 0 ? ((villainAmount / expense) * 100).toFixed(1) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>FinanceDash</Text>
          <View>
            <Text style={styles.headerTitle}>Relatório Mensal</Text>
            <Text style={styles.headerSubtitle}>
              {monthName} {year}
            </Text>
          </View>
        </View>

        {/* Executive Summary */}
        <Text style={styles.sectionTitle}>Resumo Executivo</Text>
        <View style={styles.summaryCardsContainer}>
          <View style={[styles.card, styles.cardIncome]}>
            <Text style={styles.cardTitle}>RECEITAS</Text>
            <Text style={[styles.cardValue, { color: "#15803d" }]}>
              {formatCurrency(income)}
            </Text>
          </View>
          <View style={[styles.card, styles.cardExpense]}>
            <Text style={styles.cardTitle}>DESPESAS</Text>
            <Text style={[styles.cardValue, { color: "#b91c1c" }]}>
              {formatCurrency(expense)}
            </Text>
          </View>
          <View style={[styles.card, styles.cardBalance]}>
            <Text style={styles.cardTitle}>SALDO</Text>
            <Text
              style={[
                styles.cardValue,
                { color: balance >= 0 ? "#1d4ed8" : "#b91c1c" },
              ]}
            >
              {formatCurrency(balance)}
            </Text>
            <Text style={[styles.cardTitle, { marginTop: 4, fontSize: 8 }]}>
              {savingsRate}% Economizado
            </Text>
          </View>
        </View>

        {/* Villain Analysis */}
        {villainAmount > 0 && (
          <View style={styles.villainContainer}>
            <Text style={styles.villainText}>
              A sua categoria de maior gasto este mês foi {villainCategory},
              representando {villainPercentage}% das despesas totais (
              {formatCurrency(villainAmount)}).
            </Text>
          </View>
        )}

        {/* Transactions Table */}
        <Text style={styles.sectionTitle}>Últimas Transações (Top 20)</Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Data</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Descrição</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Categoria</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Valor</Text>
            </View>
          </View>

          {/* Rows */}
          {transactions.slice(0, 20).map((t, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {typeof t.date === "string"
                    ? t.date.split("-").reverse().join("/")
                    : new Date(t.date).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{t.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{t.category}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text
                  style={[
                    styles.tableCell,
                    { color: t.type === "expense" ? "#ef4444" : "#22c55e" },
                  ]}
                >
                  {t.type === "expense" ? "-" : "+"} {formatCurrency(t.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Gerado automaticamente por FinanceDash - Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default MonthlyReportPDF;
