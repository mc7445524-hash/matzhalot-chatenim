import { createFileRoute } from "@tanstack/react-router";
import { useRef, useEffect, useState } from "react";
import AppHeader, { type TabId } from "@/components/AppHeader";
import { NavigationProvider, useNavigation } from "@/contexts/NavigationContext";
import Dashboard from "@/components/Dashboard";
import BachurimModule from "@/components/BachurimModule";
import AskanimModule from "@/components/AskanimModule";
import IncomesModule from "@/components/IncomesModule";
import ExpensesModule from "@/components/ExpensesModule";
import DebtsModule from "@/components/DebtsModule";
import BasketCostModule from "@/components/BasketCostModule";
import SearchModule from "@/components/SearchModule";
import ReportsModule from "@/components/ReportsModule";
import TabPlaceholder from "@/components/TabPlaceholder";
import AuthScreen from "@/components/AuthScreen";
import UsersAdminModule from "@/components/UsersAdminModule";
import { useAuth } from "@/contexts/AuthContext";
import { ChatPanelProvider } from "@/contexts/ChatPanelContext";
import ChatPanel from "@/components/ChatPanel";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapStorage } from "@/lib/storageSync";
import { startRealtimeSync } from "@/lib/realtimeSync";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "קול מצהלות חתנים – מערכת ניהול עמותה" },
      { name: "description", content: "מערכת ניהול לעמותת קול מצהלות חתנים – ניהול בחורים, הכנסות, הוצאות ודוחות" },
    ],
  }),
});

const tabTitles: Record<TabId, string> = {
  dashboard: "ראשי",
  bachurim: "בחורים",
  askanim: "פרויקט עסקנים",
  income: "הכנסות",
  expenses: "הוצאות",
  debts: "חובות",
  "basket-cost": "עלות הסל",
  search: "חיפוש",
  reports: "דוחות",
  users: "משתמשים",
};

function Index() {
  const { session, loading: authLoading, profileStatus, isAdmin, registering } = useAuth();

  useEffect(() => {
    if (!authLoading && session && profileStatus !== "unknown" && profileStatus !== "approved" && !isAdmin) {
      try {
        sessionStorage.setItem(
          "forced_signout_reason",
          profileStatus === "rejected"
            ? "הגישה שלך לאתר בוטלה על ידי המנהל."
            : "הגישה שלך הושעתה ומחכה לאישור המנהל."
        );
      } catch { /* noop */ }
      supabase.auth.signOut().then(() => window.location.reload());
    }
  }, [authLoading, session, profileStatus, isAdmin]);

  if (authLoading || registering) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  // Session exists — but until profile loads / is approved, NEVER render the app.
  // Always show AuthScreen with a clear pending-approval message instead of a spinner.
  if (profileStatus !== "approved" && !isAdmin) {
    return <AuthScreen />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  return (
    <ChatPanelProvider>
      <NavigationProvider>
        <AuthenticatedAppInner />
        <ChatPanel />
      </NavigationProvider>
    </ChatPanelProvider>
  );
}

function AuthenticatedAppInner() {
  const { activeTab, setActiveTab } = useNavigation();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    bootstrapStorage()
      .then(() => {
        startRealtimeSync();
        setReady(true);
      })
      .catch((err) => {
        console.error("Bootstrap failed", err);
        setError(err?.message || "שגיאה בטעינת נתונים");
        setReady(true);
      });
  }, []);

  function handleOpenSettings() {
    settingsBtnRef.current?.click();
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">טוען נתונים מהענן...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {error && (
        <div className="bg-destructive/10 text-destructive text-center text-sm py-2">
          {error}
        </div>
      )}
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} settingsBtnRef={settingsBtnRef} />
      <main className="mx-auto max-w-7xl">
        {activeTab === "dashboard" ? (
          <Dashboard />
        ) : activeTab === "bachurim" ? (
          <BachurimModule />
        ) : activeTab === "askanim" ? (
          <AskanimModule />
        ) : activeTab === "income" ? (
          <IncomesModule />
        ) : activeTab === "expenses" ? (
          <ExpensesModule />
        ) : activeTab === "debts" ? (
          <DebtsModule />
        ) : activeTab === "basket-cost" ? (
          <BasketCostModule onOpenSettings={handleOpenSettings} />
        ) : activeTab === "search" ? (
          <SearchModule />
        ) : activeTab === "reports" ? (
          <ReportsModule />
        ) : activeTab === "users" ? (
          <UsersAdminModule />
        ) : (
          <TabPlaceholder title={tabTitles[activeTab]} />
        )}
      </main>
    </div>
  );
}
