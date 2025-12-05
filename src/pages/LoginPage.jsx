import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError(t("auth.invalidCredentials"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <CookieConsent />

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />

      <div className="flex-1 flex items-center justify-center w-full max-w-md">
        <Card className="w-full shadow-2xl border-t-4 border-t-primary">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-4 ring-background shadow-lg">
                <Lock className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {t("auth.welcome")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.loginSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline transition-colors"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base">
                {t("auth.signIn")}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                {t("auth.noAccount")}{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  {t("auth.signUp")}
                </Link>
              </p>
            </div>
          </CardContent>
          <div className="px-6 pb-6 pt-2">
            <div className="bg-muted/30 rounded-lg p-4 text-center space-y-3 border border-border/50">
              <div className="flex justify-center">
                <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">
                  {t("auth.privacyNotice")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("auth.noAccess")}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2 border-t border-border/50 mt-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-xs font-medium text-green-600 dark:text-green-500">
                  {t("auth.lgpd")}{" "}
                  <a
                    href="https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-700 transition-colors"
                  >
                    LGPD
                  </a>
                  .
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Professional Footer */}
      <footer className="w-full py-6 mt-8 text-center space-y-4 animate-in fade-in duration-700 delay-300">
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-primary transition-colors">
            {t("legal.terms")}
          </Link>
          <span className="text-border">|</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">
            {t("legal.privacy")}
          </Link>
          <span className="text-border">|</span>
          <Link
            to="/cookie-policy"
            className="hover:text-primary transition-colors"
          >
            {t("cookies.policy")}
          </Link>
        </div>
        <p className="text-xs text-muted-foreground/60">
          {t("legal.copyright")}
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
