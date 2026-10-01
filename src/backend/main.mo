import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import TextValue "mo:caffeineai-oql/TextValue";
import ChatLib "lib/chat";
import ProfileTypes "types/profile";
import ChatApiMixin "mixins/chat-api";
import ProfileApiMixin "mixins/profile-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let conversations : Map.Map<Principal, ChatLib.ConversationStore>;
  let profiles : Map.Map<Principal, ProfileTypes.UserProfile>;
  let chatState : ChatLib.ChatState;

  include ChatApiMixin(accessControlState, conversations, chatState);
  include ProfileApiMixin(accessControlState, profiles);

  /// All conversations across every user, as (owner, conversation) pairs.
  func allConversations() : Iter.Iter<(Principal, ChatLib.StoredConversation)> {
    conversations.entries().flatMap(
      func((owner, store)) {
        store.values().map(func(conv) { (owner, conv) });
      }
    );
  };

  /// Conversations for one subject, or all when unrestricted (schema seeding).
  func scopedConversations(subject : ?Principal) : Iter.Iter<(Principal, ChatLib.StoredConversation)> {
    switch (subject) {
      case (?owner) {
        switch (conversations.get(owner)) {
          case (?store) { store.values().map(func(conv) { (owner, conv) }) };
          case null { Iter.empty() };
        };
      };
      case null { allConversations() };
    };
  };

  /// All profiles across every user, as (owner, profile) pairs.
  func allProfiles() : Iter.Iter<(Principal, ProfileTypes.UserProfile)> {
    profiles.entries();
  };

  /// Profiles for one subject, or all when unrestricted (schema seeding).
  func scopedProfiles(subject : ?Principal) : Iter.Iter<(Principal, ProfileTypes.UserProfile)> {
    switch (subject) {
      case (?owner) {
        switch (profiles.get(owner)) {
          case (?profile) { Iter.singleton((owner, profile)) };
          case null { Iter.empty() };
        };
      };
      case null { allProfiles() };
    };
  };

  transient let anyPrincipal = Principal.fromText("aaaaa-aa");

  include Expose({
    entities = [
      OQL.Entity.newScoped(
        "conversation",
        scopedConversations,
        "Conversation",
        "id",
        func(_ : (Principal, ChatLib.StoredConversation)) : Entity.Row = [],
      )
        .sample((anyPrincipal, {
          id = 0;
          title = "";
          createdAt = 0;
          updatedAt = 0;
          messages = [];
        }))
        .payload("owner", func((owner, _)) = owner)
        .payload("id", func((_, conv)) = conv.id)
        .payload("title", func((_, conv)) = conv.title)
        .payload("createdAt", func((_, conv)) = conv.createdAt)
        .payload("updatedAt", func((_, conv)) = conv.updatedAt)
        .payload("messageCount", func((_, conv)) = conv.messages.size())
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      OQL.Entity.newScoped(
        "profile",
        scopedProfiles,
        "Profile",
        "owner",
        func(_ : (Principal, ProfileTypes.UserProfile)) : Entity.Row = [],
      )
        .sample((anyPrincipal, { displayName = ""; email = null; photoUrl = null }))
        .payload("owner", func((owner, _)) = owner)
        .payload("displayName", func((_, profile)) = profile.displayName)
        .payload("email", func((_, profile)) = profile.email ?? "")
        .payload("photoUrl", func((_, profile)) = profile.photoUrl ?? "")
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
    ];
  });

  include ApiDocMixin();
};
