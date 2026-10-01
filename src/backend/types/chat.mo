import Common "common";

module {
  public type ConversationId = Common.ConversationId;
  public type MessageId = Common.MessageId;
  public type Timestamp = Common.Timestamp;
  public type MessageRole = Common.MessageRole;

  /// A single chat message as stored and returned to the frontend.
  public type ChatMessage = {
    id : MessageId;
    role : MessageRole;
    content : Text;
    createdAt : Timestamp;
  };

  /// A conversation summary for the sidebar history list.
  public type ConversationSummary = {
    id : ConversationId;
    title : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    messageCount : Nat;
  };

  /// A full conversation with all of its messages.
  public type Conversation = {
    id : ConversationId;
    title : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    messages : [ChatMessage];
  };

  /// One turn of a chat request sent by the frontend.
  public type ChatTurn = {
    role : MessageRole;
    content : Text;
  };

  /// The frontend's request to run one chat completion.
  public type ChatRequest = {
    /// Existing conversation to append to, or null to start a new one.
    conversationId : ?ConversationId;
    /// Full ordered history the model should see (oldest first).
    messages : [ChatTurn];
    /// Optional system instruction prepended to the model context.
    systemPrompt : ?Text;
  };

  /// The backend's reply to a chat request.
  public type ChatResponse = {
    /// The conversation the exchange was recorded in.
    conversationId : ConversationId;
    /// The assistant's reply text.
    reply : Text;
    /// The persisted assistant message.
    message : ChatMessage;
  };

  /// The backend's reply to a streaming chat request: the assistant reply
  /// split into ordered chunks the frontend appends as they arrive.
  public type ChatStreamResponse = {
    /// The conversation the exchange was recorded in.
    conversationId : ConversationId;
    /// The assistant's reply split into ordered chunks (concatenation = reply).
    chunks : [Text];
    /// The persisted assistant message.
    message : ChatMessage;
  };

  /// Failure modes a chat request can report to the caller.
  public type ChatError = {
    #unauthorized;
    #conversationNotFound : ConversationId;
    #emptyMessages;
    #inferenceFailed : Text;
  };
};
