import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const CookiePolicyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/login">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{t("cookies.policy")}</h1>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>{t("legal.lastUpdated")}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("cookies.policyContent.whatTitle")}
            </h2>
            <p>{t("cookies.policyContent.whatText")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("cookies.policyContent.howTitle")}
            </h2>
            <p>{t("cookies.policyContent.howText")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("cookies.policyContent.typesTitle")}
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>{t("cookies.essentialTitle")}:</strong>{" "}
                {t("cookies.essentialDesc")}
              </li>
              <li>
                <strong>{t("cookies.analyticsTitle")}:</strong>{" "}
                {t("cookies.analyticsDesc")}
              </li>
              <li>
                <strong>{t("cookies.marketingTitle")}:</strong>{" "}
                {t("cookies.marketingDesc")}
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("cookies.policyContent.managingTitle")}
            </h2>
            <p>{t("cookies.policyContent.managingText")}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
