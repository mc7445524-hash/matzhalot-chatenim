import { useState, type RefObject } from "react";
import ringsIcon from "@/assets/rings-icon.png";
import GlobalSettings from "@/components/GlobalSettings";
import OnlineUsers from "@/components/OnlineUsers";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, KeyRound, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserProfileDialog from "@/components/UserProfileDialog";
import { useChatPanel } from "@/contexts/ChatPanelContext";

const tabs = [
  { id: "dashboard", label: "ראשי" },
  { id: "bachurim", label: "בחורים" },
  { id: "askanim", label: "פרויקט עסקנים" },
  { id: "income", label: "הכנסות" },
  { id: "expenses", label: "הוצאות" },
  { id: "debts", label: "חובות" },
  { id: "basket-cost", label: "עלות הסל" },
  { id: "search", label: "חיפוש" },
  { id: "reports", label: "דוחות" },
  { id: "users", label: "משתמשים" },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface AppHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  settingsBtnRef?: RefObject<HTMLButtonElement | null>;
}


export default function AppHeader({ activeTab, onTabChange, settingsBtnRef }: AppHeaderProps) {
  const { signOut, user, isAdmin, displayName } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const { toggle: toggleChat, unread } = useChatPanel();
  const visibleTabs = tabs.filter((t) => t.id !== "users" || isAdmin);
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GlobalSettings triggerRef={settingsBtnRef} onNavigateToTab={(tab) => onTabChange(tab as TabId)} />
            <OnlineUsers />
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="relative text-primary-foreground hover:bg-primary-foreground/10 gap-1"
                title="צ'אט"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden md:inline text-xs">צ'אט</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] leading-none min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Button>
            )}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/10 gap-1"
                    title={`מחובר: ${user.email}`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden md:inline text-xs max-w-[140px] truncate">
                      {displayName || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[220px]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-sm font-medium">{displayName || "משתמש"}</div>
                    <div className="text-xs text-muted-foreground truncate" dir="ltr">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                    <UserIcon className="w-4 h-4 ms-2" />
                    עריכת שם
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                    <KeyRound className="w-4 h-4 ms-2" />
                    שינוי סיסמה
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 ms-2" />
                    יציאה
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
          </div>
          <div className="flex items-center gap-3">
            <img src={ringsIcon} alt="טבעות נישואין" width={36} height={36} className="drop-shadow" />
            <h1 className="text-xl font-bold tracking-wide">קול מצהלות חתנים</h1>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1 overflow-x-auto pb-1 -mb-px scrollbar-hide">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                ${
                  activeTab === tab.id
                    ? "bg-background text-foreground"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export { tabs };
