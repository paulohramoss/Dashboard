import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { KeyRound, ArrowLeft, Mail } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(t("auth.resetError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <CookieConsent />

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />

      <div className="flex-1 flex items-center justify-center w-full max-w-md">
        <Card className="w-full shadow-2xl border-t-4 border-t-primary">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-4 ring-background shadow-lg">
                <KeyRound className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {t("auth.resetPassword")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.resetSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  <Mail className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">{t("auth.checkEmail")}</p>
                  <p className="text-sm opacity-90 mt-1">
                    {t("auth.resetSentTo", { email })}
                  </p>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("auth.backToLogin")}
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md font-medium">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? t("common.loading") : t("auth.sendLink")}
                </Button>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    {t("auth.backToLogin")}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="w-full py-6 mt-8 text-center space-y-4">
        <p className="text-xs text-muted-foreground/60">
          {t("legal.copyright")}
        </p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
