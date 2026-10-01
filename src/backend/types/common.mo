module {
  /// A conversation identifier, unique per user.
  public type ConversationId = Nat;

  /// A message identifier, unique within a conversation.
  public type MessageId = Nat;

  /// Wall-clock timestamp in nanoseconds since the Unix epoch.
  public type Timestamp = Nat;

  /// Role of a chat message author.
  public type MessageRole = {
    #user;
    #assistant;
  };
};
