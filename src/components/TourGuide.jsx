import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslation } from "react-i18next";

const TourGuide = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const tourCompleted = localStorage.getItem("tutorialCompleted");

    if (!tourCompleted) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        doneBtnText: t("common.done") || "Concluído",
        nextBtnText: t("common.next") || "Próximo",
        prevBtnText: t("common.previous") || "Anterior",
        steps: [
          {
            element: "#dashboard-title",
            popover: {
              title: t("tour.welcomeTitle") || "Bem-vindo ao FinanceDash!",
              description:
                t("tour.welcomeDesc") ||
                "Este é o seu novo painel financeiro. Vamos fazer um tour rápido?",
            },
          },
          {
            element: "#summary-cards",
            popover: {
              title: t("tour.summaryTitle") || "Resumo Financeiro",
              description:
                t("tour.summaryDesc") ||
                "Aqui você vê seu saldo total, receitas e despesas do mês num piscar de olhos.",
            },
          },
          {
            element: "#nav-transactions",
            popover: {
              title: t("tour.addTransactionTitle") || "Adicionar Transação",
              description:
                t("tour.addTransactionDesc") ||
                "Clique aqui para registrar suas receitas e despesas rapidamente.",
            },
          },
          {
            element: "#sidebar-nav",
            popover: {
              title: t("tour.navTitle") || "Navegação",
              description:
                t("tour.navDesc") ||
                "Use este menu para acessar suas Transações, Metas, Contas e Relatórios.",
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem("tutorialCompleted", "true");
        },
      });

      // Small delay to ensure elements are rendered
      setTimeout(() => {
        driverObj.drive();
      }, 1000);
    }
  }, [t]);

  return null;
};

export default TourGuide;
