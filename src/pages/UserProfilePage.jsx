import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Loader2,
  User,
  Lock,
  Mail,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const UserProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser, uploadProfilePicture, removeProfilePicture } =
    useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.imageSizeError", "A imagem deve ter no máximo 5MB"));
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
  }, [t]);

  const handleImageUpload = async () => {
    if (!pendingFile) return;
    setUploadingImage(true);
    try {
      await uploadProfilePicture(pendingFile);
      toast.success(t("profile.photoUpdated", "Foto de perfil atualizada!"));
      setPreviewUrl(null);
      setPendingFile(null);
    } catch {
      toast.error(t("profile.photoUpdateError", "Erro ao atualizar foto"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    setRemovingImage(true);
    try {
      await removeProfilePicture();
      toast.success(t("profile.photoRemoved", "Foto de perfil removida"));
      setPreviewUrl(null);
      setPendingFile(null);
    } catch {
      toast.error(t("common.error", "Ocorreu um erro"));
    } finally {
      setRemovingImage(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("profile.nameRequired", "O nome não pode estar vazio"));
      return;
    }
    setSavingProfile(true);
    try {
      await updateUser({ name: name.trim() });
      toast.success(t("settings.profileUpdated"));
    } catch {
      toast.error(t("settings.profileUpdateError"));
    } finally {
      setSavingProfile(false);
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

  const displayedAvatar = previewUrl || user?.photoURL;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("profile.backToDashboard", "Voltar ao painel")}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("profile.title", "Meu Perfil")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("profile.subtitle", "Gerencie suas informações pessoais e segurança da conta")}
        </p>
      </div>

      {/* Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4" />
            {t("profile.photoSection", "Foto de Perfil")}
          </CardTitle>
          <CardDescription>
            {t("profile.photoDesc", "Adicione uma foto para personalizar sua conta")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar preview */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={displayedAvatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {previewUrl && (
                <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  {t("profile.preview", "prévia")}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />

              {/* Actions */}
              {pendingFile ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    size="sm"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {t("profile.savePhoto", "Salvar foto")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelPreview}
                    disabled={uploadingImage}
                  >
                    {t("settings.cancel", "Cancelar")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t("profile.choosePhoto", "Escolher foto")}
                  </Button>
                  {(user?.photoURL) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleRemovePhoto}
                      disabled={removingImage}
                    >
                      {removingImage ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      {t("profile.removePhoto", "Remover foto")}
                    </Button>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {t(
                  "settings.photoRequirements",
                  "JPG, PNG ou GIF. Máximo 5MB."
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            {t("profile.personalInfo", "Informações Pessoais")}
          </CardTitle>
          <CardDescription>
            {t("settings.profileDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t("settings.name")}</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("auth.namePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                {t("settings.email")}
              </Label>
              <Input
                id="profile-email"
                value={user?.email || ""}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                {t("profile.emailReadOnly", "O e-mail não pode ser alterado por aqui.")}
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t("settings.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            {t("profile.changePassword", "Alterar Senha")}
          </CardTitle>
          <CardDescription>
            {t("settings.securityDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("settings.confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  updatingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {updatingPassword ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {t("settings.updatePassword")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
