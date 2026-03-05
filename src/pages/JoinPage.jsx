import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  deleteDoc,
  writeBatch,
  collection,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const JoinPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("code");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Save current URL to redirect back after login
      sessionStorage.setItem(
        "redirectAfterLogin",
        window.location.pathname + window.location.search,
      );
      navigate("/login");
      return;
    }

    if (!inviteCode) {
      setError(t("join.invalidCode"));
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const docRef = doc(db, "invites", inviteCode);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setInviteData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setError(t("join.notFound"));
        }
      } catch (err) {
        console.error(err);
        setError(t("join.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [user, authLoading, inviteCode, navigate, t]);

  const handleAccept = async () => {
    if (!user || !inviteData) return;
    setProcessing(true);

    try {
      const batch = writeBatch(db);
      const ownerId = inviteData.createdBy;

      const collectionsToUpdate = [
        "categories",
        "accounts",
        "goals",
        "userRules",
      ];
      let operationCount = 0;

      for (const colName of collectionsToUpdate) {
        const q = query(
          collection(db, colName),
          where("userId", "==", ownerId),
        );
        const snapshot = await getDocs(q);

        snapshot.docs.forEach((d) => {
          batch.update(d.ref, {
            allowedUsers: arrayUnion(user.id),
          });
          operationCount++;
        });
      }

      // 2. Delete the Invite (One-time use)
      batch.delete(doc(db, "invites", inviteCode));

      if (operationCount > 0) {
        await batch.commit();
        toast.success(t("join.success"));
      } else {
        // Even if no docs, we delete invite
        await deleteDoc(doc(db, "invites", inviteCode));
        toast.success(t("join.noDataYet"));
      }

      navigate("/");
    } catch (err) {
      console.error("Error accepting invite:", err);
      toast.error(t("join.acceptError"));
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("join.title")}</CardTitle>
          <CardDescription>{t("join.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center text-destructive">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={() => navigate("/")} variant="outline">
                {t("join.goToDashboard")}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-primary/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-primary">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <p className="text-lg">
                  <strong>{inviteData?.ownerName}</strong> {t("join.invited")}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("join.description")}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={handleAccept}
                  disabled={processing}
                  className="w-full font-bold text-md shadow-md hover:shadow-lg transition-all"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("join.joining")}
                    </>
                  ) : (
                    t("join.accept")
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  disabled={processing}
                >
                  {t("join.cancel")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinPage;
