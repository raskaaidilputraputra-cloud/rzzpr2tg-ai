module {
  /// Per-user profile keyed by the authenticated caller principal.
  public type UserProfile = {
    displayName : Text;
    email : ?Text;
    photoUrl : ?Text;
  };
};
