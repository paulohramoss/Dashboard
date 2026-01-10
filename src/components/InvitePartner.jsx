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
import { UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const InvitePartner = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // Mock list of users with access. In a real full implementation, this would fetch from a subcollection or array in Firestore.
  // For now, we show the current user and simulate a partner if one was "added".
  const [accessList] = useState([
    {
      uid: user?.id,
      name: user?.name,
      email: user?.email,
      photoURL: user?.photoURL,
      role: "Owner",
    },
  ]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setInviting(true);

    // Simulation of invite process
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(t("settings.inviteSent", "Convite enviado com sucesso!"));
      setEmail("");
      // Simulate adding to list for visual feedback
      /* 
            setAccessList(prev => [...prev, {
                uid: "temp-partner",
                name: "Parceiro (Pendente)",
                email: email,
                role: "Convidado"
            }]);
            */
    } catch {
      toast.error(t("common.error"));
    } finally {
      setInviting(false);
    }
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
        <form onSubmit={handleInvite} className="flex gap-4 items-end">
          <div className="space-y-2 flex-1">
            <Label>{t("settings.partnerEmail", "Email do Parceiro")}</Label>
            <Input
              type="email"
              placeholder="parceiro@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={inviting}>
            <UserPlus className="mr-2 h-4 w-4" />
            {inviting
              ? t("common.sending", "Enviando...")
              : t("settings.invite", "Convidar")}
          </Button>
        </form>

        <div className="space-y-4">
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
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitePartner;
