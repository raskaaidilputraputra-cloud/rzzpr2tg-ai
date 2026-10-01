import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { initialsFromName } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  KeyRound,
  LogOut,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  X,
} from "lucide-react";

export interface SidebarConversation {
  id: string;
  title: string;
}

interface ChatSidebarProps {
  conversations: SidebarConversation[];
  activeId: string | null;
  search: string;
  isOpen: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onCheckApiKey: () => void;
  onClose: () => void;
}

const OWNER_WHATSAPP_URL = "https://wa.me/62881022762735";

export function ChatSidebar({
  conversations,
  activeId,
  search,
  isOpen,
  onSearchChange,
  onSelect,
  onDelete,
  onNewChat,
  onOpenSettings,
  onCheckApiKey,
  onClose,
}: ChatSidebarProps) {
  const { user, isGuest, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const query = search.trim().toLowerCase();
  const visible = query
    ? conversations.filter((chat) => chat.title.toLowerCase().includes(query))
    : conversations;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          data-ocid="chat.sidebar_backdrop"
          aria-label="Tutup menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        data-ocid="chat.sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link
            to="/"
            data-ocid="chat.sidebar_logo_link"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-skybrand-600 text-primary-foreground">
              <Brain className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              RzzPr2tg Ai
            </span>
          </Link>
          <button
            type="button"
            data-ocid="chat.close_sidebar_button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="rounded-lg p-2 text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <button
            type="button"
            data-ocid="chat.new_chat_button"
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-skybrand-600 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-subtle transition-smooth hover:bg-skybrand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New Chat</span>
          </button>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="text"
              data-ocid="chat.search_input"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search conversations..."
              aria-label="Cari percakapan"
              className="w-full rounded-xl border border-input bg-muted py-2 pl-9 pr-4 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div
          data-ocid="chat.conversation_list"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-2"
        >
          {visible.length === 0 ? (
            <div
              data-ocid="chat.conversation_empty_state"
              className="p-4 text-center text-xs text-muted-foreground"
            >
              {conversations.length === 0
                ? "Belum ada percakapan"
                : "Tidak ada hasil"}
            </div>
          ) : (
            visible.map((chat, index) => {
              const isActive = chat.id === activeId;
              return (
                <div
                  key={chat.id}
                  data-ocid={`chat.conversation_item.${index + 1}`}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-smooth",
                    isActive
                      ? "bg-skybrand-100 font-semibold text-skybrand-700 dark:bg-skybrand-950/60 dark:text-skybrand-300"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(chat.id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-none"
                  >
                    <MessageSquare
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button
                    type="button"
                    data-ocid={`chat.delete_button.${index + 1}`}
                    onClick={() => onDelete(chat.id)}
                    aria-label={`Hapus percakapan ${chat.title}`}
                    className="p-1 text-muted-foreground opacity-0 transition-smooth hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            data-ocid="chat.check_api_key_button"
            onClick={onCheckApiKey}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            <span>Cek API Key</span>
          </button>
          <a
            href={OWNER_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            data-ocid="chat.contact_owner_link"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Hubungi Owner</span>
          </a>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-skybrand-500 text-sm font-bold text-primary-foreground">
              {initialsFromName(user.displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground">
                {user.displayName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {isGuest ? "Guest Mode" : (user.email ?? "Pengguna")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-ocid="chat.settings_button"
              onClick={onOpenSettings}
              title="Pengaturan"
              aria-label="Buka pengaturan"
              className="rounded-lg p-2 text-muted-foreground transition-smooth hover:text-skybrand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              data-ocid="chat.theme_toggle"
              onClick={toggleTheme}
              title={isDark ? "Mode terang" : "Mode gelap"}
              aria-label={
                isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
              }
              className="rounded-lg p-2 text-muted-foreground transition-smooth hover:text-skybrand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-warning" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              data-ocid="chat.logout_button"
              onClick={logout}
              title="Keluar"
              aria-label="Keluar"
              className="rounded-lg p-2 text-muted-foreground transition-smooth hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
