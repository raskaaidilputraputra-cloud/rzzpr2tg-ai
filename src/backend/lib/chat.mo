import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/chat";

module {
  /// Internal stored conversation record.
  public type StoredConversation = {
    id : Types.ConversationId;
    title : Text;
    createdAt : Types.Timestamp;
    updatedAt : Types.Timestamp;
    messages : [Types.ChatMessage];
  };

  /// Per-user conversation store, keyed by conversation id.
  public type ConversationStore = Map.Map<Types.ConversationId, StoredConversation>;

  /// Mutable counters shared with the actor.
  public type ChatState = {
    var nextConversationId : Nat;
    var nextMessageId : Nat;
  };

  func nowNs() : Types.Timestamp {
    Int.abs(Time.now());
  };

  func toSummary(conv : StoredConversation) : Types.ConversationSummary {
    {
      id = conv.id;
      title = conv.title;
      createdAt = conv.createdAt;
      updatedAt = conv.updatedAt;
      messageCount = conv.messages.size();
    };
  };

  func toConversation(conv : StoredConversation) : Types.Conversation {
    {
      id = conv.id;
      title = conv.title;
      createdAt = conv.createdAt;
      updatedAt = conv.updatedAt;
      messages = conv.messages;
    };
  };

  /// List conversation summaries for a user, newest first.
  public func listConversations(
    store : ConversationStore,
    user : Principal,
  ) : [Types.ConversationSummary] {
    ignore user;
    let summaries = store.values().map(toSummary).toArray();
    summaries.sort(
      func(a, b) {
        if (a.updatedAt > b.updatedAt) { #less }
        else if (a.updatedAt < b.updatedAt) { #greater }
        else { #equal };
      }
    );
  };

  /// Load one conversation owned by the user.
  public func getConversation(
    store : ConversationStore,
    user : Principal,
    id : Types.ConversationId,
  ) : ?Types.Conversation {
    ignore user;
    switch (store.get(id)) {
      case (?conv) { ?toConversation(conv) };
      case null { null };
    };
  };

  /// Create a new conversation for the user and return its id.
  public func createConversation(
    store : ConversationStore,
    state : ChatState,
    user : Principal,
    title : Text,
  ) : Types.ConversationId {
    ignore user;
    let id = state.nextConversationId;
    state.nextConversationId := id + 1;
    let now = nowNs();
    store.add(id, {
      id;
      title;
      createdAt = now;
      updatedAt = now;
      messages = [] : [Types.ChatMessage];
    });
    id;
  };

  /// Append a message to an existing conversation owned by the user.
  public func appendMessage(
    store : ConversationStore,
    state : ChatState,
    user : Principal,
    id : Types.ConversationId,
    role : Types.MessageRole,
    content : Text,
  ) : ?Types.ChatMessage {
    ignore user;
    switch (store.get(id)) {
      case null { null };
      case (?conv) {
        let messageId = state.nextMessageId;
        state.nextMessageId := messageId + 1;
        let now = nowNs();
        let message : Types.ChatMessage = {
          id = messageId;
          role;
          content;
          createdAt = now;
        };
        store.add(id, {
          id = conv.id;
          title = conv.title;
          createdAt = conv.createdAt;
          updatedAt = now;
          messages = conv.messages.concat([message]);
        });
        ?message;
      };
    };
  };

  /// Delete a conversation owned by the user. Returns whether it existed.
  public func deleteConversation(
    store : ConversationStore,
    user : Principal,
    id : Types.ConversationId,
  ) : Bool {
    ignore user;
    switch (store.get(id)) {
      case null { false };
      case (?_) {
        store.remove(id);
        true;
      };
    };
  };

  /// Split a reply into ordered chunks for incremental rendering.
  /// Concatenating the chunks reproduces the original text exactly.
  public func chunkReply(reply : Text, chunkSize : Nat) : [Text] {
    if (reply.size() == 0) { return [] };
    let size = if (chunkSize == 0) { 1 } else { chunkSize };
    let chars = reply.chars().toArray();
    let total = chars.size();
    let chunks = List.empty<Text>();
    var start = 0;
    while (start < total) {
      let remaining = total - start;
      let take = if (remaining < size) { remaining } else { size };
      chunks.add(Text.fromIter(chars.values().drop(start).take(take)));
      start += take;
    };
    chunks.toArray();
  };

  /// Derive a short conversation title from the first user message.
  public func deriveTitle(firstMessage : Text) : Text {
    let trimmed = firstMessage.trim(#predicate(func(c) { c == ' ' or c == '\n' or c == '\t' or c == '\r' }));
    if (trimmed.size() == 0) {
      "Percakapan Baru";
    } else if (trimmed.size() <= 60) {
      trimmed;
    } else {
      Text.fromIter(trimmed.chars().take(60)) # "...";
    };
  };
};
