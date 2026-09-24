import { useOnlineUsers } from "@/lib/presence";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function initialsFromEmail(email: string) {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

function colorFromEmail(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export default function OnlineUsers() {
  const { user } = useAuth();
  const onlineUsers = useOnlineUsers(user?.email ?? null, user?.id ?? null);

  if (!user) return null;

  const visible = onlineUsers.slice(0, 3);
  const extra = Math.max(0, onlineUsers.length - visible.length);

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 hover:opacity-80 transition"
            aria-label={`${onlineUsers.length} משתמשים מחוברים`}
          >
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {visible.map((u) => (
                <Tooltip key={u.userId}>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white border-2 border-primary ring-1 ring-white"
                      style={{ backgroundColor: colorFromEmail(u.email) }}
                    >
                      {initialsFromEmail(u.email)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{u.email}</TooltipContent>
                </Tooltip>
              ))}
              {extra > 0 && (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/20 text-xs font-bold border-2 border-primary">
                  +{extra}
                </span>
              )}
            </div>
            <span className="ms-1 hidden sm:inline-flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {onlineUsers.length}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64" dir="rtl">
          <div className="space-y-2">
            <div className="text-sm font-bold border-b pb-2">
              מחוברים כעת ({onlineUsers.length})
            </div>
            <ul className="space-y-1.5 max-h-64 overflow-y-auto">
              {onlineUsers.map((u) => (
                <li key={u.userId} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: colorFromEmail(u.email) }}
                  >
                    {initialsFromEmail(u.email)}
                  </span>
                  <span className="truncate" dir="ltr">{u.email}</span>
                  {u.userId === user.id && (
                    <span className="text-[10px] text-muted-foreground">(אתה)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
