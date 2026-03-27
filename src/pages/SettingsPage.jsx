import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useBackup } from "@/hooks/useBackup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  Tag,
  Trash2,
  Plus,
  Pencil,
  X,
  MessageSquare,
  RefreshCw,
  Loader2,
  Upload,
  Download,
  HardDriveDownload,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

import emailjs from "@emailjs/browser";
import { useRules } from "@/hooks/useRules";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { categories, addCategory, deleteCategory, updateCategory } =
    useCategories();
  const { rules, addRule, deleteRule } = useRules();

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense",
    color: "#000000",
  });
  const [editingId, setEditingId] = useState(null);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) return;

    if (editingId) {
      await updateCategory(editingId, newCategory);
      setEditingId(null);
    } else {
      await addCategory(newCategory);
    }
    setNewCategory({ name: "", type: "expense", color: "#000000" });
  };

  const handleEdit = (category) => {
    setNewCategory({
      name: category.name,
      type: category.type,
      color: category.color,
    });
    setEditingId(category.id);
  };

  const [newRule, setNewRule] = useState({
    keyword: "",
    type: "expense", // default
    category: "",
  });

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRule.keyword || !newRule.category) return;
    await addRule(newRule);
    setNewRule({ keyword: "", type: "expense", category: "" });
  };

  const [feedback, setFeedback] = useState({
    type: "suggestion",
    message: "",
  });
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const { exportData, importData } = useBackup();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.message.trim()) return;

    setSendingFeedback(true);
    try {
      // Send to Firestore
      const firestorePromise = addDoc(collection(db, "suggestions"), {
        userId: user?.id,
        userEmail: user?.email,
        userName: user?.name,
        type: feedback.type,
        message: feedback.message,
        createdAt: new Date().toISOString(),
      });

      // Send to Email via EmailJS
      // Keys updated from user screenshots
      const YOUR_SERVICE_ID = "service_8vcx7bq";
      const YOUR_TEMPLATE_ID = "template_qamjc3i";
      const YOUR_PUBLIC_KEY = "lMkgyQ1ZogoJ0ZqwC";

      // Only attempt to send email if keys are configured
      let emailPromise = Promise.resolve();
      if (YOUR_SERVICE_ID && YOUR_TEMPLATE_ID && YOUR_PUBLIC_KEY) {
        const templateParams = {
          // Custom params
          user_name: user?.name || "Anonymous",
          user_email: user?.email || "No Email",
          feedback_type: feedback.type,
          message: feedback.message,
          to_email: "pramosphdr548@gmail.com",

          // Standard default params (just in case)
          from_name: user?.name || "Anonymous",
          from_email: user?.email || "No Email",
          reply_to: user?.email || "No Email",
        };

        emailPromise = emailjs.send(
          YOUR_SERVICE_ID,
          YOUR_TEMPLATE_ID,
          templateParams,
          YOUR_PUBLIC_KEY,
        );
      } else {
        console.warn(
          "EmailJS keys are missing. Feedback will only be saved to Firestore.",
        );
      }

      await Promise.all([firestorePromise, emailPromise]);

      toast.success(t("settings.feedbackSent"));
      setFeedback({ type: "suggestion", message: "" });
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error(t("settings.feedbackError"));
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportData();
      toast.success(t("backup.exportSuccess", "Dados exportados com sucesso!"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected if needed
    e.target.value = "";
    setImporting(true);
    try {
      const result = await importData(file);
      if (result.success) {
        toast.success(
          t(
            "backup.importSuccess",
            "Dados importados! Recarregue a página para ver todas as alterações.",
          ),
        );
      } else if (result.error === "invalid_format") {
        toast.error(
          t(
            "backup.importInvalidFormat",
            "Formato inválido. O arquivo pode estar corrompido.",
          ),
        );
      } else {
        toast.error(
          t(
            "backup.importError",
            "Falha ao importar. Verifique se o arquivo é um backup válido.",
          ),
        );
      }
    } catch {
      toast.error(
        t(
          "backup.importError",
          "Falha ao importar. Verifique se o arquivo é um backup válido.",
        ),
      );
    } finally {
      setImporting(false);
    }
  };

  const handleCancelEdit = () => {
    setNewCategory({ name: "", type: "expense", color: "#000000" });
    setEditingId(null);
  };

  const uniqueCategories = useMemo(() => {
    return categories.filter(
      (cat, index, self) =>
        index === self.findIndex((c) => c.name === cat.name),
    );
  }, [categories]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("settings.title")}
        </h2>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.categories")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.smartRules")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{t("settings.feedback")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <HardDriveDownload className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("backup.tab", "Backup")}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.categories")}</CardTitle>
              <CardDescription>{t("settings.categoriesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleSaveCategory}
                className="flex flex-col md:flex-row gap-4 md:items-end"
              >
                <div className="space-y-2 flex-1">
                  <Label>{t("settings.categoryName")}</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="e.g. Gaming"
                  />
                </div>
                <div className="space-y-2 w-full md:w-32">
                  <Label>{t("settings.categoryType")}</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newCategory.type}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, type: e.target.value })
                    }
                  >
                    <option value="expense">{t("settings.expense")}</option>
                    <option value="income">{t("settings.income")}</option>
                  </select>
                </div>
                <div className="space-y-2 w-full md:w-20">
                  <Label>{t("settings.categoryColor")}</Label>
                  <Input
                    type="color"
                    className="h-10 p-1 cursor-pointer w-full"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1 md:flex-none"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t("settings.cancel")}
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 md:flex-none">
                    {editingId ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t("settings.updateCategory")}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("settings.addCategory")}
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="space-y-2">
                {uniqueCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">
                        {category.isDefault
                          ? t(`categories.${category.name.toLowerCase()}`)
                          : category.name}
                      </span>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full capitalize">
                        {category.type === "income"
                          ? t("settings.income")
                          : t("settings.expense")}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </TabsContent>


        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.rulesTitle")}</CardTitle>
              <CardDescription>{t("settings.rulesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleAddRule}
                className="flex flex-col md:flex-row gap-4 md:items-end"
              >
                <div className="space-y-2 flex-1">
                  <Label>{t("settings.keyword")}</Label>
                  <Input
                    value={newRule.keyword}
                    onChange={(e) =>
                      setNewRule({ ...newRule, keyword: e.target.value })
                    }
                    placeholder={t("settings.keywordPlaceholder")}
                  />
                </div>
                <div className="space-y-2 w-full md:w-32">
                  <Label>{t("settings.categoryType")}</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newRule.type}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        type: e.target.value,
                        category: "",
                      })
                    }
                  >
                    <option value="expense">{t("settings.expense")}</option>
                    <option value="income">{t("settings.income")}</option>
                  </select>
                </div>
                <div className="space-y-2 w-full md:w-48">
                  <Label>{t("settings.category")}</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newRule.category}
                    onChange={(e) =>
                      setNewRule({ ...newRule, category: e.target.value })
                    }
                  >
                    <option value="">{t("settings.selectCategory")}</option>
                    {categories
                      .filter((c) => c.type === newRule.type)
                      .filter(
                        // Deduplicate logic similar to other dropdowns
                        (cat, index, self) =>
                          index === self.findIndex((c) => c.name === cat.name),
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.isDefault
                            ? t(`categories.${cat.name.toLowerCase()}`)
                            : cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("settings.addRule")}
                </Button>
              </form>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-12 gap-4 p-2 text-sm font-medium text-muted-foreground border-b">
                  <div className="col-span-5">{t("settings.keyword")}</div>
                  <div className="col-span-4">{t("settings.category")}</div>
                  <div className="col-span-2">{t("settings.categoryType")}</div>
                  <div className="col-span-1"></div>
                </div>
                {rules.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {t("settings.noRules")}
                  </div>
                )}
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="grid grid-cols-12 gap-4 p-3 border rounded-lg bg-card items-center text-sm"
                  >
                    <div className="col-span-5 font-medium">{rule.keyword}</div>
                    <div className="col-span-4">
                      {/* Try to translate if it matches a default category, else show raw name */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t(
                          `categories.${rule.category.toLowerCase()}`,
                          rule.category,
                        )}
                      </span>
                    </div>
                    <div className="col-span-2 capitalize text-muted-foreground">
                      {rule.type === "income"
                        ? t("settings.income")
                        : t("settings.expense")}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.feedback")}</CardTitle>
              <CardDescription>{t("settings.feedbackDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("settings.feedbackType")}</Label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={feedback.type}
                    onChange={(e) =>
                      setFeedback({ ...feedback, type: e.target.value })
                    }
                  >
                    <option value="suggestion">
                      {t("settings.suggestion")}
                    </option>
                    <option value="bug">{t("settings.bug")}</option>
                    <option value="compliment">
                      {t("settings.compliment")}
                    </option>
                    <option value="other">{t("settings.other")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.message")}</Label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t("settings.messagePlaceholder")}
                    value={feedback.message}
                    onChange={(e) =>
                      setFeedback({ ...feedback, message: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="submit" disabled={sendingFeedback}>
                    {sendingFeedback ? (
                      t("common.loading")
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t("settings.sendFeedback")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>{t("backup.title", "Backup de Dados")}</CardTitle>
              <CardDescription>
                {t(
                  "backup.description",
                  "Exporte todos os seus dados ou restaure a partir de um arquivo de backup.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">
                    {t("backup.exportTitle", "Exportar Dados")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "backup.exportDesc",
                    "Baixe um backup completo em JSON com todas as suas transações, categorias, contas, objetivos e regras.",
                  )}
                </p>
                <Button onClick={handleExport} disabled={exporting}>
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      {t("backup.exportButton", "Exportar JSON")}
                    </>
                  )}
                </Button>
              </div>

              {/* Import */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">
                    {t("backup.importTitle", "Importar Dados")}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "backup.importDesc",
                    "Restaure dados de um backup exportado anteriormente. Documentos com o mesmo ID serão sobrescritos.",
                  )}
                </p>
                <Button
                  variant="outline"
                  disabled={importing}
                  className="relative"
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("backup.importing", "Importando...")}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {t(
                        "backup.importButton",
                        "Selecionar Arquivo de Backup",
                      )}
                    </>
                  )}
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleImport}
                    disabled={importing}
                  />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default SettingsPage;
