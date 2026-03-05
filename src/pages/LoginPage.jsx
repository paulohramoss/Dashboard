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

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
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

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch {
      setError(t("auth.invalidCredentials"));
    } finally {
      setGoogleLoading(false);
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
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword", "Ocultar senha")
                        : t("auth.showPassword", "Mostrar senha")
                    }
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

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("auth.orDivider")}
                </span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-base gap-3"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              <GoogleIcon />
              {googleLoading ? "..." : t("auth.continueWithGoogle")}
            </Button>

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
