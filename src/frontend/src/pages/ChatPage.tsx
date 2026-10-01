import { ApiKeyCheckDialog } from "@/components/chat/ApiKeyCheckDialog";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { GuestBanner } from "@/components/chat/GuestBanner";
import { MessageList } from "@/components/chat/MessageList";
import { SettingsModal } from "@/components/chat/SettingsModal";
import { useAuth } from "@/context/AuthContext";
import { type ChatMessageView, useChat } from "@/hooks/useChat";
import {
  useConversation,
  useConversations,
  useDeleteConversation,
} from "@/hooks/useConversations";
import { useCallback, useEffect, useMemo, useState } from "react";

export function ChatPage() {
  const { isAuthenticated, isGuest, isInitializing, login, user } = useAuth();

  const principalText = user.principal?.toText() ?? null;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  const conversationsQuery = useConversations(isAuthenticated, principalText);
  const conversationQuery = useConversation(
    activeId,
    isAuthenticated,
    principalText,
  );
  const deleteMutation = useDeleteConversation(principalText);

  const chat = useChat({
    isAuthenticated,
    principal: principalText,
    onConversationCreated: (id) => setActiveId(id),
  });

  const { loadMessages, reset, setActiveConversation } = chat;

  const summaries = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  );

  const sidebarConversations = useMemo(
    () =>
      summaries.map((summary) => ({
        id: summary.id.toString(),
        title: summary.title,
      })),
    [summaries],
  );

  // Load a persisted conversation into the message list when one is selected.
  useEffect(() => {
    if (!isAuthenticated || !activeId) return;
    const data = conversationQuery.data;
    if (!data) return;
    const loaded: ChatMessageView[] = data.messages.map((message) => ({
      id: message.id.toString(),
      role: message.role,
      content: message.content,
    }));
    loadMessages(loaded);
    setActiveConversation(activeId);
  }, [
    isAuthenticated,
    activeId,
    conversationQuery.data,
    loadMessages,
    setActiveConversation,
  ]);

  const handleNewChat = useCallback(() => {
    reset();
    setActiveId(null);
    setIsSidebarOpen(false);
  }, [reset]);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setIsSidebarOpen(false);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
      if (id === activeId) {
        reset();
        setActiveId(null);
      }
    },
    [activeId, deleteMutation, reset],
  );

  const activeTitle = useMemo(() => {
    if (!activeId) return "New Conversation";
    return (
      sidebarConversations.find((chat) => chat.id === activeId)?.title ??
      "New Conversation"
    );
  }, [activeId, sidebarConversations]);

  return (
    <div data-ocid="chat.page" className="flex h-screen w-full overflow-hidden">
      <ChatSidebar
        conversations={sidebarConversations}
        activeId={activeId}
        search={search}
        isOpen={isSidebarOpen}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCheckApiKey={() => setIsApiKeyOpen(true)}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex h-full flex-1 flex-col bg-background">
        <ChatHeader
          title={activeTitle}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <MessageList
          messages={chat.messages}
          isThinking={chat.isGenerating}
          onRetry={chat.retry}
          onPreset={chat.sendMessage}
        />

        {isGuest && !isInitializing && <GuestBanner onCreateAccount={login} />}

        <ChatComposer
          onSend={chat.sendMessage}
          onStop={chat.stopGenerating}
          isGenerating={chat.isGenerating}
        />
      </main>

      <SettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ApiKeyCheckDialog
        open={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
      />
    </div>
  );
}
