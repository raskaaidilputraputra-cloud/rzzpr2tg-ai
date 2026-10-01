import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type ChatMessage = {
    id : Nat;
    role : { #user; #assistant };
    content : Text;
    createdAt : Nat;
  };

  type StoredConversation = {
    id : Nat;
    title : Text;
    createdAt : Nat;
    updatedAt : Nat;
    messages : [ChatMessage];
  };

  type UserProfile = {
    displayName : Text;
    email : ?Text;
    photoUrl : ?Text;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    conversations : Map.Map<Principal, Map.Map<Nat, StoredConversation>>;
    profiles : Map.Map<Principal, UserProfile>;
    chatState : { var nextConversationId : Nat; var nextMessageId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      conversations = Map.empty();
      profiles = Map.empty();
      chatState = { var nextConversationId = 0; var nextMessageId = 0 };
    };
  };
};
