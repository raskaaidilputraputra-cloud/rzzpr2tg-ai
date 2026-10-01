import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import ChatLib "../lib/chat";
import Inference "../lib/inference";
import Types "../types/chat";

mixin (
  accessControlState : AccessControl.AccessControlState,
  stores : Map.Map<Principal, ChatLib.ConversationStore>,
  chatState : ChatLib.ChatState,
) {
  /// List the caller's conversations, newest first.
  public query ({ caller }) func listConversations() : async [Types.ConversationSummary] {
    ignore accessControlState;
    if (caller.isAnonymous()) { return [] };
    switch (stores.get(caller)) {
      case (?store) { ChatLib.listConversations(store, caller) };
      case null { [] };
    };
  };

  /// Load one of the caller's conversations.
  public query ({ caller }) func getConversation(
    id : Types.ConversationId,
  ) : async ?Types.Conversation {
    ignore accessControlState;
    if (caller.isAnonymous()) { return null };
    switch (stores.get(caller)) {
      case (?store) { ChatLib.getConversation(store, caller, id) };
      case null { null };
    };
  };

  /// Delete one of the caller's conversations.
  public shared ({ caller }) func deleteConversation(
    id : Types.ConversationId,
  ) : async Bool {
    ignore accessControlState;
    if (caller.isAnonymous()) { return false };
    switch (stores.get(caller)) {
      case (?store) { ChatLib.deleteConversation(store, caller, id) };
      case null { false };
    };
  };

  /// Run a chat completion and persist the exchange for signed-in users.
  public shared ({ caller }) func sendChatMessage(
    request : Types.ChatRequest,
  ) : async Types.ChatResponse {
    ignore accessControlState;
    if (request.messages.size() == 0) {
      Runtime.trap("Tidak ada pesan untuk dikirim");
    };

    let reply = try {
      await* Inference.runChat<system>(request.messages, request.systemPrompt);
    } catch (_) {
      Runtime.trap("Gagal menghubungi layanan AI. Silakan coba lagi.");
    };

    let lastUser = request.messages.filter(func(turn) { turn.role == #user });
    let firstUserText = switch (lastUser.size()) {
      case 0 { "" };
      case _ { lastUser[0].content };
    };

    if (caller.isAnonymous()) {
      // Guests are temporary: return the reply without persisting anything.
      let now = Int.abs(Time.now());
      return {
        conversationId = 0;
        reply;
        message = {
          id = 0;
          role = #assistant;
          content = reply;
          createdAt = now;
        };
      };
    };

    let store = switch (stores.get(caller)) {
      case (?s) { s };
      case null {
        let s = Map.empty<Types.ConversationId, ChatLib.StoredConversation>();
        stores.add(caller, s);
        s;
      };
    };

    let conversationId = switch (request.conversationId) {
      case (?id) {
        if (ChatLib.getConversation(store, caller, id) == null) {
          Runtime.trap("Percakapan tidak ditemukan");
        };
        id;
      };
      case null {
        ChatLib.createConversation(store, chatState, caller, ChatLib.deriveTitle(firstUserText));
      };
    };

    for (turn in request.messages.values()) {
      ignore ChatLib.appendMessage(store, chatState, caller, conversationId, turn.role, turn.content);
    };

    let message = switch (ChatLib.appendMessage(store, chatState, caller, conversationId, #assistant, reply)) {
      case (?m) { m };
      case null { Runtime.trap("Gagal menyimpan balasan") };
    };

    {
      conversationId;
      reply;
      message;
    };
  };

  /// Run a chat completion and return the reply split into ordered chunks so
  /// the frontend can render it incrementally. Persists the exchange for
  /// signed-in users exactly like `sendChatMessage`; guests stay unpersisted.
  public shared ({ caller }) func sendChatMessageStream(
    request : Types.ChatRequest,
  ) : async Types.ChatStreamResponse {
    ignore accessControlState;
    if (request.messages.size() == 0) {
      Runtime.trap("Tidak ada pesan untuk dikirim");
    };

    let reply = try {
      await* Inference.runChat<system>(request.messages, request.systemPrompt);
    } catch (_) {
      Runtime.trap("Gagal menghubungi layanan AI. Silakan coba lagi.");
    };

    let chunks = ChatLib.chunkReply(reply, 24);

    let lastUser = request.messages.filter(func(turn) { turn.role == #user });
    let firstUserText = switch (lastUser.size()) {
      case 0 { "" };
      case _ { lastUser[0].content };
    };

    if (caller.isAnonymous()) {
      // Guests are temporary: return the reply without persisting anything.
      let now = Int.abs(Time.now());
      return {
        conversationId = 0;
        chunks;
        message = {
          id = 0;
          role = #assistant;
          content = reply;
          createdAt = now;
        };
      };
    };

    let store = switch (stores.get(caller)) {
      case (?s) { s };
      case null {
        let s = Map.empty<Types.ConversationId, ChatLib.StoredConversation>();
        stores.add(caller, s);
        s;
      };
    };

    let conversationId = switch (request.conversationId) {
      case (?id) {
        if (ChatLib.getConversation(store, caller, id) == null) {
          Runtime.trap("Percakapan tidak ditemukan");
        };
        id;
      };
      case null {
        ChatLib.createConversation(store, chatState, caller, ChatLib.deriveTitle(firstUserText));
      };
    };

    for (turn in request.messages.values()) {
      ignore ChatLib.appendMessage(store, chatState, caller, conversationId, turn.role, turn.content);
    };

    let message = switch (ChatLib.appendMessage(store, chatState, caller, conversationId, #assistant, reply)) {
      case (?m) { m };
      case null { Runtime.trap("Gagal menyimpan balasan") };
    };

    {
      conversationId;
      chunks;
      message;
    };
  };
};
