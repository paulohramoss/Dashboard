import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#1e40af",
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
    color: "#ffffff",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 16,
    textAlign: "right",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 10,
    textAlign: "right",
    color: "#ffffff",
    opacity: 0.85,
    marginTop: 2,
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
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  filterBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8,
    color: "#1d4ed8",
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
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  cardIncome: { borderLeftWidth: 4, borderLeftColor: "#22c55e" },
  cardExpense: { borderLeftWidth: 4, borderLeftColor: "#ef4444" },
  cardBalance: { borderLeftWidth: 4, borderLeftColor: "#3b82f6" },
  villainContainer: {
    backgroundColor: "#fff1f2",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecdd3",
    marginBottom: 20,
  },
  villainText: {
    fontSize: 12,
    color: "#be123c",
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
  tableColDate: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
  },
  tableColDesc: {
    width: "35%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
  },
  tableColCat: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: "#e5e7eb",
  },
  tableColAmt: {
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

const formatDate = (dateVal) => {
  if (typeof dateVal === "string" && dateVal.includes("-")) {
    return dateVal.split("-").reverse().join("/");
  }
  try {
    return new Date(dateVal).toLocaleDateString("pt-BR");
  } catch {
    return String(dateVal);
  }
};

const MonthlyReportPDF = ({
  periodStart,
  periodEnd,
  filterType,
  filterCategory,
  filterAccount,
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
    }).format(val ?? 0);

  const savingsRate =
    income > 0 ? ((balance / income) * 100).toFixed(1) : "0.0";
  const villainPercentage =
    expense > 0 ? ((villainAmount / expense) * 100).toFixed(1) : "0.0";

  // Build active filters list for display in PDF
  const activeFilters = [];
  if (periodStart && periodEnd) {
    activeFilters.push(
      `Período: ${formatDate(periodStart)} – ${formatDate(periodEnd)}`
    );
  }
  if (filterType && filterType !== "all") {
    activeFilters.push(
      `Tipo: ${filterType === "income" ? "Receitas" : "Despesas"}`
    );
  }
  if (filterCategory && filterCategory !== "all") {
    activeFilters.push(`Categoria: ${filterCategory}`);
  }
  if (filterAccount && filterAccount !== "all") {
    activeFilters.push("Conta: filtrada");
  }

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.logoText}>FinanceDash</Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Relatório Financeiro</Text>
            {periodStart && periodEnd && (
              <Text style={styles.headerSubtitle}>
                {formatDate(periodStart)} – {formatDate(periodEnd)}
              </Text>
            )}
          </View>
        </View>

        {/* Applied Filters badges */}
        {activeFilters.length > 0 && (
          <View style={styles.filtersRow}>
            {activeFilters.map((f, i) => (
              <Text key={i} style={styles.filterBadge}>
                {f}
              </Text>
            ))}
          </View>
        )}

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
              A categoria de maior gasto foi {villainCategory}, representando{" "}
              {villainPercentage}% das despesas totais (
              {formatCurrency(villainAmount)}).
            </Text>
          </View>
        )}

        {/* Transactions Table — all rows, no limit */}
        <Text style={styles.sectionTitle}>
          Transações ({transactions.length} no total)
        </Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]} fixed>
            <View style={styles.tableColDate}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Data
              </Text>
            </View>
            <View style={styles.tableColDesc}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Descrição
              </Text>
            </View>
            <View style={styles.tableColCat}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Categoria
              </Text>
            </View>
            <View style={styles.tableColAmt}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Valor
              </Text>
            </View>
          </View>

          {/* Data rows */}
          {transactions.map((tx, i) => (
            <View
              key={i}
              style={[
                styles.tableRow,
                i % 2 === 1 ? { backgroundColor: "#f9fafb" } : {},
              ]}
              wrap={false}
            >
              <View style={styles.tableColDate}>
                <Text style={styles.tableCell}>{formatDate(tx.date)}</Text>
              </View>
              <View style={styles.tableColDesc}>
                <Text style={styles.tableCell}>{tx.description}</Text>
              </View>
              <View style={styles.tableColCat}>
                <Text style={styles.tableCell}>{tx.category}</Text>
              </View>
              <View style={styles.tableColAmt}>
                <Text
                  style={[
                    styles.tableCell,
                    { color: tx.type === "expense" ? "#ef4444" : "#22c55e" },
                  ]}
                >
                  {tx.type === "expense" ? "-" : "+"}{" "}
                  {formatCurrency(tx.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Gerado automaticamente por FinanceDash — Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default MonthlyReportPDF;
