import React, { useState, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Shield,
  User,
  Save,
  Tag,
  Trash2,
  Plus,
  Pencil,
  X,
  MessageSquare,
  Mail,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, writeBatch } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import ConfirmDialog from "@/components/ui/confirm-dialog";

import { useNotifications } from "@/hooks/useNotifications";
import emailjs from "@emailjs/browser";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { categories, addCategory, deleteCategory, updateCategory } =
    useCategories();
  const { enabled: notificationsEnabled, toggleNotifications } =
    useNotifications();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState({
    email: true,
  });

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense",
    color: "#000000",
  });
  const [editingId, setEditingId] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ name });
      toast.success(t("settings.profileUpdated"));
    } catch {
      toast.error(t("settings.profileUpdateError"));
    }
  };

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

  const [feedback, setFeedback] = useState({
    type: "suggestion",
    message: "",
  });
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [recalculateDialogOpen, setRecalculateDialogOpen] = useState(false);

  const handleRecalculateRollovers = async () => {
    try {
      setRecalculating(true);
      const batch = writeBatch(db);
      categories.forEach((cat) => {
        if (cat.rollover) {
          const ref = doc(db, "categories", cat.id);
          batch.update(ref, {
            lastRolloverCheck: null,
            accumulatedRollover: 0,
          });
        }
      });
      await batch.commit();
      toast.success(t("settings.recalculateSuccess"));
    } catch (error) {
      console.error("Error recalculating rollovers:", error);
      toast.error(t("common.error"));
    } finally {
      setRecalculating(false);
      setRecalculateDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser(auth.currentUser);
      toast.success(t("settings.accountDeleted"));
      // AuthContext will handle the redirect to login
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error(t("settings.deleteAccountError"));
      } else {
        toast.error(t("common.error"));
      }
    }
  };

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
      // TODO: Replace these placeholders with your actual EmailJS keys
      const YOUR_SERVICE_ID = "service_8vcx7bq";
      const YOUR_TEMPLATE_ID = "template_rhmsjbl";
      const YOUR_PUBLIC_KEY = "lMkgyQ1ZogoJ0ZqwC";

      // Only attempt to send email if keys are configured (basic check)
      let emailPromise = Promise.resolve();
      if (
        YOUR_SERVICE_ID !== "service_8vcx7bq" &&
        YOUR_TEMPLATE_ID !== "template_rhmsjbl" &&
        YOUR_PUBLIC_KEY !== "lMkgyQ1ZogoJ0ZqwC"
      ) {
        const templateParams = {
          user_name: user?.name || "Anonymous",
          user_email: user?.email || "No Email",
          feedback_type: feedback.type,
          message: feedback.message,
          to_email: "pramosphdr548@gmail.com",
        };

        emailPromise = emailjs.send(
          YOUR_SERVICE_ID,
          YOUR_TEMPLATE_ID,
          templateParams,
          YOUR_PUBLIC_KEY
        );
      } else {
        console.warn(
          "EmailJS keys are missing. Feedback will only be saved to Firestore."
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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("auth.passwordLength"));
      return;
    }

    setUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success(t("settings.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error(t("auth.invalidCredentials"));
      } else {
        toast.error(t("settings.passwordUpdateError"));
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setNewCategory({ name: "", type: "expense", color: "#000000" });
    setEditingId(null);
  };

  const uniqueCategories = useMemo(() => {
    return categories.filter(
      (cat, index, self) => index === self.findIndex((c) => c.name === cat.name)
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
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t("settings.feedback")}
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
                onSubmit={handleSaveCategory}
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
                <div className="flex gap-2">
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t("settings.cancel")}
                    </Button>
                  )}
                  <Button type="submit">
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("settings.recalculateRollover")}</CardTitle>
              <CardDescription>
                {t("settings.recalculateRolloverDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setRecalculateDialogOpen(true)}
                disabled={recalculating}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    recalculating ? "animate-spin" : ""
                  }`}
                />
                {recalculating
                  ? t("settings.recalculating")
                  : t("settings.recalculateRollover")}
              </Button>
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
                  checked={notificationsEnabled}
                  onCheckedChange={toggleNotifications}
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
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">
                    {t("settings.currentPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    {t("settings.newPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    {t("settings.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" disabled={updatingPassword}>
                  {updatingPassword
                    ? t("common.loading")
                    : t("settings.updatePassword")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">
                {t("settings.dangerZone")}
              </CardTitle>
              <CardDescription>
                {t("settings.deleteAccountDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("settings.deleteAccountButton")}
              </Button>
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
      </Tabs>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title={t("settings.deleteAccountConfirmTitle")}
        description={t("settings.deleteAccountConfirmDesc")}
        confirmText={t("settings.deleteAccountButton")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={recalculateDialogOpen}
        onClose={() => setRecalculateDialogOpen(false)}
        onConfirm={handleRecalculateRollovers}
        title={t("settings.recalculateRollover")}
        description={t("settings.recalculateConfirm")}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
};

export default SettingsPage;
