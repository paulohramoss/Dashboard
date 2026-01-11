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

const JoinPage = () => {
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
        window.location.pathname + window.location.search
      );
      navigate("/login");
      return;
    }

    if (!inviteCode) {
      setError("Código de convite inválido.");
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
          setError("Este convite não existe ou expirou.");
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar convite.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [user, authLoading, inviteCode, navigate]);

  const handleAccept = async () => {
    if (!user || !inviteData) return;
    setProcessing(true);

    try {
      const batch = writeBatch(db);
      const ownerId = inviteData.createdBy;

      // 1. Fetch Key Collections of the Owner
      // Note: We are limiting to prevent massive reads, but assuming reasonable usage.
      // Ideally, specific "shared" config docs would be better, but we are patching "self-join".

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
          where("userId", "==", ownerId)
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
        toast.success("Sucesso! Finanças unidas.");
      } else {
        // Even if no docs, we delete invite
        await deleteDoc(doc(db, "invites", inviteCode));
        toast.success(
          "Convite aceite, mas não havia dados para partilhar ainda."
        );
      }

      navigate("/");
    } catch (err) {
      console.error("Error accepting invite:", err);
      toast.error("Erro ao aceitar convite. Tente novamente.");
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
          <CardTitle className="text-2xl">Convite de Finanças</CardTitle>
          <CardDescription>
            Junte-se para gerir o orçamento em equipa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center text-destructive">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={() => navigate("/")} variant="outline">
                Ir para Dashboard
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-primary/10 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-primary">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <p className="text-lg">
                  <strong>{inviteData?.ownerName}</strong> convidou você para
                  colaborar.
                </p>
                <p className="text-muted-foreground text-sm">
                  Ao aceitar, você poderá ver e adicionar transações, categorias
                  e objetivos em conjunto.
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />A unir
                      finanças...
                    </>
                  ) : (
                    "Aceitar e Unir Finanças"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  disabled={processing}
                >
                  Cancelar
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
