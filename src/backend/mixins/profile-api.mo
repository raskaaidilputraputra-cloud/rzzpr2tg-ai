import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import ProfileLib "../lib/profile";
import Types "../types/profile";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Principal, Types.UserProfile>,
) {
  /// Read the caller's own profile.
  public query ({ caller }) func getCallerUserProfile() : async ?Types.UserProfile {
    ignore accessControlState;
    if (caller.isAnonymous()) { return null };
    ProfileLib.getProfile(profiles, caller);
  };

  /// Create or replace the caller's own profile.
  public shared ({ caller }) func saveCallerUserProfile(
    profile : Types.UserProfile,
  ) : async () {
    ignore accessControlState;
    if (caller.isAnonymous()) { return };
    ProfileLib.saveProfile(profiles, caller, profile);
  };

  /// Read a profile by principal. A caller may only read its own profile;
  /// admins may read any profile. Anonymous callers receive null.
  public query ({ caller }) func getUserProfile(
    user : Principal,
  ) : async ?Types.UserProfile {
    if (caller.isAnonymous()) { return null };
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    ProfileLib.getProfile(profiles, user);
  };
};
