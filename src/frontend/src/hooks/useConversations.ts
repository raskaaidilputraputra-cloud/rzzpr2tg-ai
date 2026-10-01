import { createActor } from "@/backend";
import type { Conversation, ConversationSummary } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const CONVERSATIONS_QUERY_KEY = ["conversations"] as const;

/**
 * Scope the conversations cache to the signed-in principal so a different
 * user never sees the previous user's cached list after logout/login.
 */
export function conversationsQueryKey(principal: string | null) {
  return [...CONVERSATIONS_QUERY_KEY, principal ?? "anonymous"] as const;
}

/** List the signed-in caller's conversations, newest first. */
export function useConversations(enabled: boolean, principal: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ConversationSummary[]>({
    queryKey: conversationsQueryKey(principal),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listConversations();
    },
    enabled: enabled && !!actor && !isFetching,
  });
}

/** Load a single conversation with its full message history. */
export function useConversation(
  id: string | null,
  enabled: boolean,
  principal: string | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Conversation | null>({
    queryKey: ["conversation", principal ?? "anonymous", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getConversation(BigInt(id));
    },
    enabled: enabled && !!actor && !isFetching && !!id,
  });
}

/** Delete one of the caller's conversations. */
export function useDeleteConversation(principal: string | null) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteConversation(BigInt(id));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: conversationsQueryKey(principal),
      });
    },
  });
}
