import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  Users,
  Link as LinkIcon,
  Copy,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const InvitePartner = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  // In a real app, this list would come from fetching "users" collection where "sharedWith" == me
  // For now, we just show the current user.
  const [accessList] = useState([
    {
      uid: user?.id,
      name: user?.name,
      email: user?.email,
      photoURL: user?.photoURL,
      role: "Owner",
    },
  ]);

  const handleGenerateInvite = async () => {
    if (!user?.id) return;

    setInviting(true);
    try {
      // Create Invite Document
      const docRef = await addDoc(collection(db, "invites"), {
        createdBy: user.id,
        ownerName: user.name || "Alguém",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Generate Link
      const link = `${window.location.origin}/join?code=${docRef.id}`;
      setInviteLink(link);
      toast.success(t("settings.inviteGenerated", "Link de convite gerado!"));
    } catch (error) {
      console.error("Error creating invite:", error);
      toast.error(t("common.error", "Erro ao gerar convite."));
    } finally {
      setInviting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success(t("common.copied", "Copiado!"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("settings.sharedFinance", "Finanças Compartilhadas")}
        </CardTitle>
        <CardDescription>
          {t(
            "settings.sharedFinanceDesc",
            "Convide parceiros para gerir as finanças juntos."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!inviteLink ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {t(
                "settings.inviteIntro",
                "Gere um link para convidar alguém para aceder às suas finanças."
              )}
            </p>
            <Button
              onClick={handleGenerateInvite}
              disabled={inviting}
              className="w-full sm:w-auto"
            >
              {inviting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {inviting
                ? t("common.generating", "A gerar...")
                : t("settings.generateInvite", "Gerar Link de Convite")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <Label>{t("settings.shareLink", "Partilhe este link")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={inviteLink} readOnly className="pl-9 pr-4" />
              </div>
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                "settings.linkWarning",
                "Qualquer pessoa com este link poderá solicitar acesso."
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInviteLink("")}
              className="text-xs"
            >
              {t("settings.generateNew", "Gerar novo")}
            </Button>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("settings.usersWithAccess", "Utilizadores com acesso")}
          </h4>
          <div className="space-y-2">
            {accessList.map((u, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.photoURL} />
                    <AvatarFallback>
                      {u.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitePartner;
