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
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    paddingBottom: 60,
  },

  // ── rel-header ──────────────────────────────────────────────────
  relHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tagline: {
    fontSize: 8,
    color: "#9ca3af",
    letterSpacing: 0.3,
  },
  logo: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0d9488",
  },

  // ── period-banner ───────────────────────────────────────────────
  periodBanner: {
    backgroundColor: "#134e4a",
    paddingHorizontal: 32,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodBannerLabel: {
    fontSize: 11,
    color: "#ccfbf1",
  },
  periodBannerDate: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  // ── content wrapper ─────────────────────────────────────────────
  content: {
    paddingHorizontal: 32,
    paddingTop: 22,
  },

  // ── section-title ───────────────────────────────────────────────
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 12,
    marginTop: 4,
  },

  // ── cards-grid ──────────────────────────────────────────────────
  cardsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 26,
  },
  card: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHighlight: {
    backgroundColor: "#f0fdf9",
    borderColor: "#99f6e4",
  },
  cardLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 3,
  },
  cardValueIncome: { color: "#15803d" },
  cardValueExpense: { color: "#dc2626" },
  cardSub: {
    fontSize: 7,
    color: "#9ca3af",
  },
  economyPill: {
    marginTop: 7,
    backgroundColor: "#ccfbf1",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  economyPillText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#0f766e",
  },

  // ── table-wrap ──────────────────────────────────────────────────
  tableWrap: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 28,
  },
  tableWrapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableWrapTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 7,
    color: "#374151",
  },

  // ── table ───────────────────────────────────────────────────────
  tableRowHead: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRowAlt: { backgroundColor: "#fafafa" },
  colDate: { width: "15%", paddingHorizontal: 10, paddingVertical: 7 },
  colDesc: { width: "38%", paddingHorizontal: 10, paddingVertical: 7 },
  colCat:  { width: "27%", paddingHorizontal: 10, paddingVertical: 7 },
  colAmt:  { width: "20%", paddingHorizontal: 10, paddingVertical: 7, alignItems: "flex-end" },
  thCell: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#6b7280" },
  tdCell: { fontSize: 8, color: "#374151" },
  tdCatPill: {
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  tdCatPillText: { fontSize: 7, color: "#4b5563" },
  valPos: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#16a34a" },
  valNeg: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#dc2626" },

  // ── empty state ─────────────────────────────────────────────────
  emptyState: {
    paddingVertical: 22,
    alignItems: "center",
  },
  emptyStrong: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 3,
  },
  emptyNote: {
    fontSize: 8,
    color: "#9ca3af",
  },

  // ── rel-footer ──────────────────────────────────────────────────
  relFooter: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 8,
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 2,
  },
  footerNote: {
    fontSize: 7,
    color: "#9ca3af",
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
  filterType: _filterType,
  filterCategory: _filterCategory,
  filterAccount: _filterAccount,
  income,
  expense,
  balance,
  villainCategory: _villainCategory,
  villainAmount: _villainAmount,
  transactions,
}) => {
  const formatCurrency = (val) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val ?? 0);

  const savingsRate =
    income > 0 ? ((balance / income) * 100).toFixed(1) : "0,0";

  const today = new Date().toLocaleDateString("pt-BR");

  const periodLabel =
    periodStart && periodEnd
      ? `${formatDate(periodStart)} – ${formatDate(periodEnd)}`
      : "—";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>

        {/* ── rel-header ── */}
        <View style={styles.relHeader} fixed>
          <Text style={styles.tagline}>Tranquilidade Financeira. Assim Fácil.</Text>
          <Text style={styles.logo}>eazy</Text>
        </View>

        {/* ── period-banner ── */}
        <View style={styles.periodBanner}>
          <Text style={styles.periodBannerLabel}>Relatório Financeiro</Text>
          <Text style={styles.periodBannerDate}>{periodLabel}</Text>
        </View>

        <View style={styles.content}>

          {/* ── Resumo Executivo ── */}
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>

          <View style={styles.cardsGrid}>
            {/* Receitas */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Receitas</Text>
              <Text style={[styles.cardValue, styles.cardValueIncome]}>
                {formatCurrency(income)}
              </Text>
              <Text style={styles.cardSub}>no período</Text>
            </View>

            {/* Despesas */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Despesas</Text>
              <Text style={[styles.cardValue, styles.cardValueExpense]}>
                {formatCurrency(expense)}
              </Text>
              <Text style={styles.cardSub}>no período</Text>
            </View>

            {/* Saldo (highlight) */}
            <View style={[styles.card, styles.cardHighlight]}>
              <Text style={styles.cardLabel}>Saldo</Text>
              <Text
                style={[
                  styles.cardValue,
                  { color: balance >= 0 ? "#0f766e" : "#dc2626" },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
              <View style={styles.economyPill}>
                <Text style={styles.economyPillText}>
                  {savingsRate}% economizado
                </Text>
              </View>
            </View>
          </View>

          {/* ── Transações ── */}
          <Text style={styles.sectionTitle}>Transações</Text>

          <View style={styles.tableWrap}>
            {/* table header bar */}
            <View style={styles.tableWrapHeader}>
              <Text style={styles.tableWrapTitle}>Extrato do mês</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {transactions.length}{" "}
                  {transactions.length === 1 ? "transação" : "transações"}
                </Text>
              </View>
            </View>

            {/* thead */}
            <View style={styles.tableRowHead} fixed>
              <View style={styles.colDate}>
                <Text style={styles.thCell}>Data</Text>
              </View>
              <View style={styles.colDesc}>
                <Text style={styles.thCell}>Descrição</Text>
              </View>
              <View style={styles.colCat}>
                <Text style={styles.thCell}>Categoria</Text>
              </View>
              <View style={styles.colAmt}>
                <Text style={styles.thCell}>Valor</Text>
              </View>
            </View>

            {/* tbody */}
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStrong}>Nenhuma transação</Text>
                <Text style={styles.emptyNote}>
                  Nenhum lançamento encontrado neste período.
                </Text>
              </View>
            ) : (
              transactions.map((tx, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                  wrap={false}
                >
                  <View style={styles.colDate}>
                    <Text style={styles.tdCell}>{formatDate(tx.date)}</Text>
                  </View>
                  <View style={styles.colDesc}>
                    <Text style={styles.tdCell}>{tx.description}</Text>
                  </View>
                  <View style={styles.colCat}>
                    <View style={styles.tdCatPill}>
                      <Text style={styles.tdCatPillText}>{tx.category}</Text>
                    </View>
                  </View>
                  <View style={styles.colAmt}>
                    <Text
                      style={
                        tx.type === "expense" ? styles.valNeg : styles.valPos
                      }
                    >
                      {tx.type === "expense" ? "- " : "+ "}
                      {formatCurrency(tx.amount)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

        </View>

        {/* ── rel-footer ── */}
        <View style={styles.relFooter} fixed>
          <View style={styles.footerDivider} />
          <Text style={styles.footerBrand}>
            Eazy Tranquilidade Financeira para Jovens
          </Text>
          <Text style={styles.footerNote}>
            Gerado automaticamente pela Eazy · {today}
          </Text>
        </View>

      </Page>
    </Document>
  );
};

export default MonthlyReportPDF;
