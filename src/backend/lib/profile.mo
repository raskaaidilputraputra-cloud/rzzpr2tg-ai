import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/profile";

module {
  /// Per-user profile store keyed by principal.
  public type ProfileStore = Map.Map<Principal, Types.UserProfile>;

  /// Read a user's profile.
  public func getProfile(store : ProfileStore, user : Principal) : ?Types.UserProfile {
    store.get(user);
  };

  /// Create or replace a user's profile.
  public func saveProfile(
    store : ProfileStore,
    user : Principal,
    profile : Types.UserProfile,
  ) : () {
    store.add(user, profile);
  };
};
