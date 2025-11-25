import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
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
// Removed unused Select imports
import { Bell, Shield, User, Save, Tag, Trash2, Plus } from "lucide-react";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { categories, addCategory, deleteCategory } = useCategories();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense",
    color: "#000000",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ name });
      // In a real app, show success toast
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile.");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) return;

    await addCategory(newCategory);
    setNewCategory({ name: "", type: "expense", color: "#000000" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("settings.title")}
        </h2>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("settings.profile")}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {t("settings.categories")}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            {t("settings.notifications")}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t("settings.security")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profile")}</CardTitle>
              <CardDescription>{t("settings.profileDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.name")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {t("settings.save")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.categories")}</CardTitle>
              <CardDescription>{t("settings.categoriesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleAddCategory}
                className="flex gap-4 items-end"
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
                <div className="space-y-2 w-32">
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
                <div className="space-y-2 w-20">
                  <Label>{t("settings.categoryColor")}</Label>
                  <Input
                    type="color"
                    className="h-10 p-1 cursor-pointer"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                  />
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("settings.addCategory")}
                </Button>
              </form>

              <div className="space-y-2">
                {categories.map((category) => (
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
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>
                {t("settings.notificationsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="email-notifs"
                  className="flex flex-col space-y-1"
                >
                  <span>{t("settings.emailNotifs")}</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    {t("settings.emailNotifsDesc")}
                  </span>
                </Label>
                <Switch
                  id="email-notifs"
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, email: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="push-notifs"
                  className="flex flex-col space-y-1"
                >
                  <span>{t("settings.pushNotifs")}</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    {t("settings.pushNotifsDesc")}
                  </span>
                </Label>
                <Switch
                  id="push-notifs"
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, push: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.security")}</CardTitle>
              <CardDescription>{t("settings.securityDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">
                  {t("settings.currentPassword")}
                </Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">
                  {t("settings.newPassword")}
                </Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  {t("settings.confirmPassword")}
                </Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>{t("settings.updatePassword")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
