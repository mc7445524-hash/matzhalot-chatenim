import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatPanel } from "@/contexts/ChatPanelContext";
import ChatModule from "@/components/ChatModule";

const PANEL_WIDTH = 400; // px on desktop

export default function ChatPanel() {
  const { open, setOpen } = useChatPanel();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <>
      {/* Mobile backdrop only */}
      <div
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={() => setOpen(false)}
      />
      <aside
        dir="rtl"
        className="fixed top-0 right-0 z-50 h-screen w-full md:w-[380px] lg:w-[420px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        style={{ maxWidth: "100vw" }}
      >
        <div className="flex items-center justify-between px-3 h-12 border-b shrink-0">
          <h2 className="font-semibold">צ'אט</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="סגור">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatModule />
        </div>
      </aside>
    </>
  );
}

export { PANEL_WIDTH };
