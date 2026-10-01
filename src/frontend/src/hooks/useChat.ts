import { MessageRole, createActor } from "@/backend";
import type { ChatTurn } from "@/backend";
import { conversationsQueryKey } from "@/hooks/useConversations";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

export const RZZPR2TG_SYSTEM_PROMPT =
  "Anda adalah RzzPr2tg Ai, asisten AI yang cerdas, ramah, dan serba bisa. " +
  "Jawab dalam bahasa yang digunakan pengguna (Indonesia atau Inggris). " +
  "Berikan jawaban yang akurat, jelas, dan terstruktur. " +
  "Dukung penuh penulisan kode dalam berbagai bahasa pemrograman dengan blok kode markdown. " +
  "Jangan batasi diri pada pertanyaan atau kata kunci tertentu — pahami maksud pengguna dari percakapan.";

export interface ChatMessageView {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface UseChatOptions {
  isAuthenticated: boolean;
  principal: string | null;
  onConversationCreated?: (id: string) => void;
}

let messageCounter = 0;
function nextMessageId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${Date.now()}-${messageCounter}`;
}

/**
 * Owns the in-flight chat exchange. The reply is produced by the backend
 * (Caffeine Inference) via `sendChatMessageStream`, which returns the reply as
 * ordered chunks; this hook appends each chunk to the assistant message as it
 * is processed, and manages the optimistic message list, pending state, and
 * cancellation.
 */
export function useChat({
  isAuthenticated,
  principal,
  onConversationCreated,
}: UseChatOptions) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const lastPromptRef = useRef<string | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    lastPromptRef.current = null;
    clearRevealTimer();
    setMessages([]);
    setConversationId(null);
    setIsGenerating(false);
  }, [clearRevealTimer]);

  const loadMessages = useCallback(
    (loaded: ChatMessageView[]) => {
      cancelledRef.current = false;
      lastPromptRef.current = null;
      clearRevealTimer();
      setMessages(loaded);
      setIsGenerating(false);
    },
    [clearRevealTimer],
  );

  const setActiveConversation = useCallback((id: string | null) => {
    setConversationId(id);
  }, []);

  const runExchange = useCallback(
    async (_prompt: string, history: ChatMessageView[]) => {
      if (!actor) {
        setMessages((current) => [
          ...current,
          {
            id: nextMessageId("error"),
            role: "assistant",
            content: "Backend belum siap. Coba lagi sebentar.",
            isError: true,
          },
        ]);
        return;
      }

      cancelledRef.current = false;
      setIsGenerating(true);

      // The backend appends every entry in `request.messages` to the existing
      // conversation. Once a conversationId exists, send only the new user
      // turn so prior messages are not duplicated; for the first turn of a new
      // conversation, send the full history so the backend has the context.
      const source = conversationId
        ? history.filter((message) => message.role === "user").slice(-1)
        : history;

      const turns: ChatTurn[] = source
        .filter((message) => !message.isError)
        .slice(-16)
        .map((message) => ({
          role:
            message.role === "user" ? MessageRole.user : MessageRole.assistant,
          content: message.content,
        }));

      try {
        const response = await actor.sendChatMessageStream({
          conversationId: conversationId ? BigInt(conversationId) : undefined,
          messages: turns,
          systemPrompt: RZZPR2TG_SYSTEM_PROMPT,
        });

        if (cancelledRef.current) return;

        const newId = response.conversationId.toString();
        if (!conversationId) {
          setConversationId(newId);
          onConversationCreated?.(newId);
        }

        // The backend returns the reply as ordered chunks. Append each chunk
        // to the assistant message as it is processed so the reply renders
        // incrementally from the backend's stream rather than a client-side
        // reveal of a finished string.
        const assistantId = nextMessageId("assistant");
        setMessages((current) => [
          ...current,
          { id: assistantId, role: "assistant", content: "" },
        ]);

        for (const chunk of response.chunks) {
          if (cancelledRef.current) return;
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, content: message.content + chunk }
                : message,
            ),
          );
          // Yield to the browser so each appended chunk paints before the
          // next one is processed.
          await new Promise<void>((resolve) => {
            revealTimerRef.current = window.setTimeout(() => {
              revealTimerRef.current = null;
              resolve();
            }, 0);
          });
        }

        if (cancelledRef.current) return;

        if (isAuthenticated) {
          void queryClient.invalidateQueries({
            queryKey: conversationsQueryKey(principal),
          });
        }
      } catch {
        if (cancelledRef.current) return;
        setMessages((current) => [
          ...current,
          {
            id: nextMessageId("error"),
            role: "assistant",
            content:
              "Maaf, terjadi kesalahan saat menghubungi server. Silakan coba lagi.",
            isError: true,
          },
        ]);
      } finally {
        if (!cancelledRef.current) setIsGenerating(false);
      }
    },
    [
      actor,
      conversationId,
      isAuthenticated,
      principal,
      onConversationCreated,
      queryClient,
    ],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isGenerating) return;

      lastPromptRef.current = trimmed;
      const userMessage: ChatMessageView = {
        id: nextMessageId("user"),
        role: "user",
        content: trimmed,
      };
      const history = [...messages, userMessage];
      setMessages(history);
      void runExchange(trimmed, history);
    },
    [isGenerating, messages, runExchange],
  );

  const stopGenerating = useCallback(() => {
    cancelledRef.current = true;
    clearRevealTimer();
    setIsGenerating(false);
  }, [clearRevealTimer]);

  const retry = useCallback(() => {
    const prompt = lastPromptRef.current;
    if (!prompt) return;
    const withoutError = messages.filter((message) => !message.isError);
    setMessages(withoutError);
    void runExchange(prompt, withoutError);
  }, [messages, runExchange]);

  return {
    messages,
    isGenerating,
    conversationId,
    sendMessage,
    stopGenerating,
    retry,
    reset,
    loadMessages,
    setActiveConversation,
  };
}
