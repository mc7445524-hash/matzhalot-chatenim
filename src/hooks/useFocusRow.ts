import { useEffect, useRef, useState } from "react";
import type { TabId } from "@/components/AppHeader";
import { useNavigation } from "@/contexts/NavigationContext";

/**
 * Returns { highlightedId, registerRow } for a module.
 * When the navigation focus targets `module`, the matching row is
 * scrolled into view and highlighted briefly. Optionally invokes
 * `onEdit(id)` when the focus requested edit mode.
 */
export function useFocusRow(module: TabId, onEdit?: (id: string) => void) {
  const { consumeFocus } = useNavigation();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const rowRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    const f = consumeFocus(module);
    if (!f) return;
    const tryFocus = (attempt = 0) => {
      const el = rowRefs.current.get(f.id);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        setHighlightedId(f.id);
        setTimeout(() => setHighlightedId((cur) => (cur === f.id ? null : cur)), 2500);
        if (f.edit && onEdit) onEdit(f.id);
      } else if (attempt < 10) {
        setTimeout(() => tryFocus(attempt + 1), 80);
      }
    };
    tryFocus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consumeFocus, module]);

  const registerRow = (id: string) => (el: HTMLElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };

  return { highlightedId, registerRow };
}