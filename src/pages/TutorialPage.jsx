import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  LayoutDashboard,
  Wallet,
  Target,
  PieChart,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TutorialPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sections = [
    {
      id: "intro",
      icon: BookOpen,
      title: t("tutorialPage.sections.intro.title"),
      content: t("tutorialPage.sections.intro.content"),
    },
    {
      id: "dashboard",
      icon: LayoutDashboard,
      title: t("tutorialPage.sections.dashboard.title"),
      description: t("tutorialPage.sections.dashboard.description"),
      points: [
        t("tutorialPage.sections.dashboard.points.1"),
        t("tutorialPage.sections.dashboard.points.2"),
        t("tutorialPage.sections.dashboard.points.3"),
      ],
      action: { label: t("nav.dashboard"), path: "/" },
    },
    {
      id: "transactions",
      icon: Wallet,
      title: t("tutorialPage.sections.transactions.title"),
      description: t("tutorialPage.sections.transactions.description"),
      points: [
        t("tutorialPage.sections.transactions.points.1"),
        t("tutorialPage.sections.transactions.points.2"),
        t("tutorialPage.sections.transactions.points.3"),
      ],
      action: { label: t("nav.transactions"), path: "/transactions" },
    },
    {
      id: "planning",
      icon: Target,
      title: t("tutorialPage.sections.planning.title"),
      description: t("tutorialPage.sections.planning.description"),
      points: [
        t("tutorialPage.sections.planning.budgets"),
        t("tutorialPage.sections.planning.goals"),
        t("tutorialPage.sections.planning.debt"),
      ],
      action: { label: t("nav.budgets"), path: "/budgets" },
    },
    {
      id: "reports",
      icon: PieChart,
      title: t("tutorialPage.sections.reports.title"),
      description: t("tutorialPage.sections.reports.description"),
      content: t("tutorialPage.sections.reports.content"),
      action: { label: t("nav.reports"), path: "/reports" },
    },
    {
      id: "accounts",
      icon: CreditCard,
      title: t("tutorialPage.sections.accounts.title"),
      description: t("tutorialPage.sections.accounts.description"),
      content: t("tutorialPage.sections.accounts.content"),
      action: { label: t("accounts.title"), path: "/accounts" },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("tutorialPage.title")}
        </h2>
        <p className="text-muted-foreground">{t("tutorialPage.subtitle")}</p>
      </div>

      <Tabs defaultValue="intro" className="w-full">
        <TabsList className="w-full h-auto flex-wrap justify-start p-2 gap-2 bg-muted/50">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex items-center gap-2 px-4 py-2"
            >
              <section.icon className="h-4 w-4" />
              <span className="hidden md:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-6">
            <Card className="border-none shadow-md bg-card/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <section.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.content && (
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {section.content}
                  </p>
                )}

                {section.points && (
                  <ul className="grid gap-4 md:grid-cols-2">
                    {section.points.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border"
                      >
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span className="text-base">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.action && (
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={() => navigate(section.action.path)}
                      className="gap-2"
                    >
                      {section.action.label} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TutorialPage;
