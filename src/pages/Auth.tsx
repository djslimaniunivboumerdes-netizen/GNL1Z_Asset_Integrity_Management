// src/pages/Auth.tsx
import { useState, type FormEvent } from "react";
import type { KeyboardEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LogIn, ArrowLeft, ArrowRight, Loader2, Mail, KeyRound, User, Eye, EyeOff,
} from "lucide-react";
import sonatrachLogo from "@/assets/sonatrach-logo.png";
import newsHero from "@/assets/news-hero.jpg";

// ─── Password strength ──────────────────────────────────────────────────────

function getStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)              s++;
  if (pw.length >= 12)             s++;
  if (/[A-Z]/.test(pw))           s++;
  if (/[0-9]/.test(pw))           s++;
  if (/[^A-Za-z0-9]/.test(pw))   s++;
  return s; // 0–5
}
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
const STRENGTH_COLOR = [
  "", "bg-destructive", "bg-warning", "bg-warning", "bg-success", "bg-success",
];

function PasswordStrength({ password }: { password: string }) {
  const score = getStrength(password);
  if (!password) return null;
  return (
    <div className="space-y-1 mt-1.5" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? STRENGTH_COLOR[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono text-muted-foreground">{STRENGTH_LABEL[score]}</p>
    </div>
  );
}

// ─── Reusable Field ─────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", icon: Icon,
  onKey, autoComplete, error, hint, id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onKey?: (e: KeyboardEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  error?: string;
  hint?: string;
  id?: string;
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} className="text-xs">{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          type={inputType}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={[
            Icon ? "pl-9" : "",
            isPassword ? "pr-9" : "",
            error ? "border-destructive focus-visible:ring-destructive" : "",
          ].join(" ")}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-err`} className="text-[10px] text-destructive font-mono" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// ─── Full Google logo (4-colour) ────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ─── Shared page shell ──────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-10 overflow-hidden">
      <img
        src={newsHero}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      <div className="relative w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent mb-3 font-mono uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        {children}
      </div>
    </div>
  );
}

// ─── Validation helpers ─────────────────────────────────────────────────────

const validateEmail    = (v: string) =>
  !v ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email" : "";
const validatePassword = (v: string) =>
  !v ? "Password is required" : v.length < 8 ? "Minimum 8 characters" : "";
const validateConfirm  = (pw: string, c: string) =>
  !c ? "Please confirm your password" : pw !== c ? "Passwords do not match" : "";

// ─── Main component ─────────────────────────────────────────────────────────

export default function Auth() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // view: "auth" | "forgot"
  const [mode, setMode]             = useState<"auth" | "forgot">("auth");
  const [tab, setTab]               = useState<"signin" | "signup">("signin");

  // form fields
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [fullName, setFullName]     = useState("");

  // inline field errors
  const [emailErr, setEmailErr]       = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [confirmErr, setConfirmErr]   = useState("");

  const [busy, setBusy]             = useState(false);
  const [resetSent, setResetSent]   = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  // ── Tab switch: clear passwords + errors ──
  const switchTab = (v: string) => {
    if (busy) return;
    setTab(v as "signin" | "signup");
    setPassword(""); setConfirmPw(""); setFullName("");
    setEmailErr(""); setPasswordErr(""); setConfirmErr("");
  };

  // ── Sign in ──
  const handleSignIn = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailErr(eErr); setPasswordErr(pErr);
    if (eErr || pErr) return;

    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      const msg = error.message?.toLowerCase().includes("invalid")
        ? "Incorrect email or password."
        : error.message;
      toast({ title: "Sign-in failed", description: msg, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back" });
    navigate("/");
  };

  // ── Sign up ──
  const handleSignUp = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirm(password, confirmPw);
    setEmailErr(eErr); setPasswordErr(pErr); setConfirmErr(cErr);
    if (eErr || pErr || cErr) return;

    setBusy(true);
    const { error } = await signUp(email, password, fullName);
    setBusy(false);
    if (error) {
      toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Account created!", description: "Check your email to confirm your account." });
  };

  // ── Google ──
  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle();
    setBusy(false);
    if (error) {
      const msg = error.message?.toLowerCase().includes("provider")
        ? "Google sign-in is not enabled for this project yet."
        : error.message;
      toast({ title: "Google sign-in failed", description: msg, variant: "destructive" });
    }
  };

  // ── Forgot password ──
  const handleForgotPassword = async () => {
    const eErr = validateEmail(email);
    setEmailErr(eErr);
    if (eErr) return;

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth`,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
      return;
    }
    setResetSent(true);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tab === "signin") void handleSignIn();
    else void handleSignUp();
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement>, fn: () => void) => {
    if (e.key === "Enter") { e.preventDefault(); fn(); }
  };

  // ════════════════════════════════════════════════════════════
  // FORGOT PASSWORD VIEW
  // ════════════════════════════════════════════════════════════
  if (mode === "forgot") {
    return (
      <PageShell>
        <div className="border border-border rounded-xl bg-card/95 backdrop-blur p-6 shadow-industrial">
          <div className="flex flex-col items-center text-center mb-5">
            <img src={sonatrachLogo} alt="Sonatrach" className="h-10 w-auto mb-3 opacity-90" />
            <h1 className="text-xl font-display font-bold">Reset Password</h1>
            <p className="text-xs text-muted-foreground mt-1">
              We'll send a reset link to your email
            </p>
          </div>

          {resetSent ? (
            <div className="text-center space-y-3 py-2">
              {/* success envelope icon via CSS — no external dependency */}
              <div className="mx-auto w-12 h-12 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-medium font-display">Check your inbox</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A reset link was sent to{" "}
                <span className="font-mono text-foreground">{email}</span>.
                It may take a minute to arrive.
              </p>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => { setMode("auth"); setResetSent(false); }}
              >
                ← Back to sign in
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); void handleForgotPassword(); }}
              className="space-y-4"
            >
              <Field
                id="forgot-email"
                icon={Mail}
                label="Email address"
                value={email}
                onChange={(v) => { setEmail(v); setEmailErr(""); }}
                type="email"
                autoComplete="email"
                error={emailErr}
                onKey={(e) => onEnter(e, handleForgotPassword)}
              />
              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {busy
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><ArrowRight className="h-4 w-4 mr-1.5" />Send reset link</>
                }
              </Button>
              <button
                type="button"
                onClick={() => { setMode("auth"); setEmailErr(""); }}
                className="w-full text-xs text-muted-foreground hover:text-accent transition-colors text-center"
              >
                ← Back to sign in
              </button>
            </form>
          )}
        </div>
      </PageShell>
    );
  }

  // ════════════════════════════════════════════════════════════
  // MAIN AUTH VIEW
  // ════════════════════════════════════════════════════════════
  return (
    <PageShell>
      <div className="border border-border rounded-xl bg-card/95 backdrop-blur p-6 shadow-industrial">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <img src={sonatrachLogo} alt="Sonatrach" className="h-10 w-auto mb-3 opacity-90" />
          <div className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-accent" />
            <h1 className="text-xl font-display font-bold">GNL1Z Access</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in to log tests or upload photos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={switchTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin" disabled={busy}>Sign in</TabsTrigger>
            <TabsTrigger value="signup" disabled={busy}>Sign up</TabsTrigger>
          </TabsList>

          <form onSubmit={onSubmit} noValidate>

            {/* ── SIGN IN ── */}
            <TabsContent value="signin" className="space-y-3 pt-4">
              <Field
                id="signin-email"
                icon={Mail}
                label="Email"
                value={email}
                onChange={(v) => { setEmail(v); setEmailErr(""); }}
                type="email"
                autoComplete="email"
                error={emailErr}
              />
              <Field
                id="signin-password"
                icon={KeyRound}
                label="Password"
                value={password}
                onChange={(v) => { setPassword(v); setPasswordErr(""); }}
                type="password"
                autoComplete="current-password"
                error={passwordErr}
                onKey={(e) => onEnter(e, handleSignIn)}
              />

              {/* Forgot password link */}
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setEmailErr(""); setPasswordErr(""); }}
                  className="text-[11px] text-muted-foreground hover:text-accent transition-colors font-mono"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </TabsContent>

            {/* ── SIGN UP ── */}
            <TabsContent value="signup" className="space-y-3 pt-4">
              <Field
                id="signup-name"
                icon={User}
                label="Full name"
                value={fullName}
                onChange={setFullName}
                autoComplete="name"
                hint="Optional"
              />
              <Field
                id="signup-email"
                icon={Mail}
                label="Email"
                value={email}
                onChange={(v) => { setEmail(v); setEmailErr(""); }}
                type="email"
                autoComplete="email"
                error={emailErr}
              />

              {/* Password + strength meter */}
              <div>
                <Field
                  id="signup-password"
                  icon={KeyRound}
                  label="Password"
                  value={password}
                  onChange={(v) => { setPassword(v); setPasswordErr(""); }}
                  type="password"
                  autoComplete="new-password"
                  error={passwordErr}
                  hint={!passwordErr ? "Minimum 8 characters" : undefined}
                />
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <Field
                id="signup-confirm"
                icon={KeyRound}
                label="Confirm password"
                value={confirmPw}
                onChange={(v) => { setConfirmPw(v); setConfirmErr(""); }}
                type="password"
                autoComplete="new-password"
                error={confirmErr}
                onKey={(e) => onEnter(e, handleSignUp)}
              />

              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </TabsContent>

          </form>
        </Tabs>

        {/* Divider */}
        <div className="my-5 flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google */}
        <Button
          variant="outline"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full gap-2"
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <p className="mt-5 text-[11px] text-muted-foreground text-center leading-relaxed">
          Browsing equipment is public. Sign in only to log tests or upload photos.
        </p>
      </div>
    </PageShell>
  );
      }
