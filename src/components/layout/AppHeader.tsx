import { Moon, Sun, Languages, LogIn, LogOut, Settings, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { META } from "@/data";
import { useNavigate } from "react-router-dom";
import { QrScannerButton } from "@/components/QrScannerButton";
import { OnlineStatus } from "@/components/OnlineStatus";
import sonatrachLogo from "@/assets/sonatrach-logo.png";
import type { User } from "@supabase/supabase-js";

// ─── Deterministic avatar colour from email ───────────────────────────────────
const AVATAR_COLORS = [
  "bg-blue-600",   "bg-violet-600", "bg-emerald-600",
  "bg-orange-500", "bg-pink-600",   "bg-teal-600",
];

function emailColor(email: string): string {
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ─── Avatar circle ────────────────────────────────────────────────────────────
function Avatar({ user }: { user: User }) {
  // Google OAuth populates avatar_url / picture in user_metadata
  const pic: string | undefined =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture   as string | undefined);

  const displayName: string =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name      as string | undefined) ||
    user.email || "?";

  const initials = displayName.trim().charAt(0).toUpperCase();
  const color    = emailColor(user.email ?? displayName);

  if (pic) {
    return (
      <img
        src={pic}
        alt={displayName}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover rounded-full"
        onError={(e) => {
          // If image fails (permissions, CORS) fall back to initials
          (e.currentTarget as HTMLImageElement).style.display = "none";
          (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("hidden");
        }}
      />
    );
  }

  return (
    <span
      className={`flex h-full w-full items-center justify-center rounded-full ${color} text-white text-sm font-bold leading-none select-none`}
    >
      {initials}
    </span>
  );
}

// ─── User menu (avatar button + dropdown) ─────────────────────────────────────
function UserMenu({ user }: { user: User }) {
  const { signOut } = useAuth();
  const navigate    = useNavigate();

  const displayName: string =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name      as string | undefined) ||
    user.email?.split("@")[0] || "User";

  const isGoogle =
    (user.app_metadata?.provider as string | undefined) === "google" ||
    !!(user.user_metadata?.avatar_url || user.user_metadata?.picture);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User menu"
          className={[
            "relative h-8 w-8 rounded-full overflow-hidden",
            "ring-2 ring-accent/40 hover:ring-accent",
            "focus:outline-none focus-visible:ring-accent",
            "transition-all duration-150 cursor-pointer",
          ].join(" ")}
        >
          <Avatar user={user} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">

        {/* User info header */}
        <DropdownMenuLabel className="font-normal pb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-border shrink-0">
              <Avatar user={user} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate font-display">{displayName}</p>
              <p className="text-[11px] text-muted-foreground font-mono truncate">{user.email}</p>
              {isGoogle && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 mt-0.5">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google account
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm"
          onClick={() => navigate("/author")}
        >
          <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm"
          onClick={() => navigate("/download")}
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          Downloads
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm text-destructive focus:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── AppHeader ────────────────────────────────────────────────────────────────
export function AppHeader() {
  const { theme, toggle }    = useTheme();
  const { lang, toggle: toggleLang } = useI18n();
  const { user }             = useAuth();
  const navigate             = useNavigate();

  return (
    <header className="h-14 border-b-2 border-accent/30 bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-3 md:px-5 gap-3">
      <SidebarTrigger className="text-foreground hover:text-accent" />

      <img src={sonatrachLogo} alt="Sonatrach" className="h-8 w-auto md:hidden" />

      <div className="hidden md:flex items-center gap-3 min-w-0">
        <img src={sonatrachLogo} alt="Sonatrach" className="h-9 w-auto" />
        <div className="h-6 w-px bg-border" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{META.project}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-xs text-muted-foreground truncate">{META.location}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <OnlineStatus />
        <Badge variant="outline" className="hidden sm:inline-flex border-accent/40 text-accent bg-accent/10 font-mono text-[10px]">
          {META.process}
        </Badge>
        <QrScannerButton onScan={(id) => navigate(`/equipment/${id}`)} />
        <Button variant="ghost" size="sm" onClick={toggleLang} className="font-mono text-xs gap-1.5">
          <Languages className="h-4 w-4" />
          {lang.toUpperCase()}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {user ? (
          <UserMenu user={user} />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="gap-1.5 font-mono text-xs"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        )}
      </div>
    </header>
  );
}
