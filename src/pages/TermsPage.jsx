import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const TermsPage = () => {
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
          <h1 className="text-3xl font-bold">{t("legal.terms")}</h1>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>{t("legal.lastUpdated")}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("legal.termsContent.introTitle")}
            </h2>
            <p>{t("legal.termsContent.introText")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("legal.termsContent.licenseTitle")}
            </h2>
            <p>{t("legal.termsContent.licenseText")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("legal.termsContent.disclaimerTitle")}
            </h2>
            <p>{t("legal.termsContent.disclaimerText")}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {t("legal.termsContent.limitationsTitle")}
            </h2>
            <p>{t("legal.termsContent.limitationsText")}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
