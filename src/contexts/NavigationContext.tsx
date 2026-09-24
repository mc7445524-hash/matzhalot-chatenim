import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { TabId } from "@/components/AppHeader";

interface Focus {
  module: TabId;
  id: string;
  /** request that the target module open the edit dialog for this id */
  edit?: boolean;
}

interface NavigationContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  focus: Focus | null;
  navigateTo: (module: TabId, id?: string, opts?: { edit?: boolean }) => void;
  /** returns the current focus if it targets `module`, then clears it */
  consumeFocus: (module: TabId) => Focus | null;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation(): NavigationContextType {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [focus, setFocus] = useState<Focus | null>(null);

  const navigateTo = useCallback((module: TabId, id?: string, opts?: { edit?: boolean }) => {
    setActiveTab(module);
    if (id) setFocus({ module, id, edit: opts?.edit });
    else setFocus(null);
  }, []);

  const consumeFocus = useCallback((module: TabId) => {
    if (focus && focus.module === module) {
      const f = focus;
      // defer clearing so the consumer's effect can react first
      setTimeout(() => setFocus((cur) => (cur === f ? null : cur)), 0);
      return f;
    }
    return null;
  }, [focus]);

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, focus, navigateTo, consumeFocus }}>
      {children}
    </NavigationContext.Provider>
  );
}