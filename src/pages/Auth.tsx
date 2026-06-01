// src/pages/Auth.tsx
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { LogIn, ArrowLeft, Loader2, Mail, KeyRound, User } from "lucide-react";
import sonatrachLogo from "@/assets/sonatrach-logo.png";
import newsHero from "@/assets/news-hero.jpg";

export default function Auth() {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSignIn = async () => {
    if (!email || !password) return;
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome back" });
    navigate("/");
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    setBusy(true);
    const { error } = await signUp(email, password, fullName);
    setBusy(false);
    if (error) {
      toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Check your email to confirm your account." });
  };

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tab === "signin") void handleSignIn();
    else void handleSignUp();
  };

  const onKey = (e: KeyboardEvent, fn: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-10 overflow-hidden">
      <img
        src={newsHero}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

      <div className="relative w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent mb-3 font-mono uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <div className="border border-border rounded-xl bg-card/95 backdrop-blur p-6 shadow-industrial">
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

          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <form onSubmit={onSubmit}>
              <TabsContent value="signin" className="space-y-3 pt-4">
                <Field icon={Mail} label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
                <Field icon={KeyRound} label="Password" value={password} onChange={setPassword} type="password" autoComplete="current-password" onKey={(e) => onKey(e, handleSignIn)} />
                <Button type="submit" disabled={busy || !email || !password} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3 pt-4">
                <Field icon={User} label="Full name" value={fullName} onChange={setFullName} autoComplete="name" />
                <Field icon={Mail} label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
                <Field icon={KeyRound} label="Password" value={password} onChange={setPassword} type="password" autoComplete="new-password" onKey={(e) => onKey(e, handleSignUp)} />
                <Button type="submit" disabled={busy || !email || !password} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </TabsContent>
            </form>
          </Tabs>

          <div className="my-5 flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button variant="outline" onClick={handleGoogle} disabled={busy} className="w-full gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.48l2.63-2.54C16.86 3.4 14.66 2.4 12 2.4 6.93 2.4 2.8 6.5 2.8 12s4.13 9.6 9.2 9.6c5.31 0 8.83-3.74 8.83-9 0-.6-.07-1.06-.16-1.4H12z" />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-5 text-[11px] text-muted-foreground text-center leading-relaxed">
            Browsing equipment is public. Sign in only to log tests or upload photos.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  onKey,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onKey?: (e: KeyboardEvent) => void;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          type={type}
          autoComplete={autoComplete}
          className={Icon ? "pl-9" : undefined}
        />
      </div>
    </div>
  );
}
