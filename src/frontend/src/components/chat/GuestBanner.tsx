interface GuestBannerProps {
  onCreateAccount: () => void;
}

export function GuestBanner({ onCreateAccount }: GuestBannerProps) {
  return (
    <div
      data-ocid="chat.guest_banner"
      className="flex shrink-0 items-center justify-between gap-3 bg-skybrand-600 px-4 py-2.5 text-xs text-primary-foreground"
    >
      <span>⚠️ You are chatting as Guest. Your chat history is temporary.</span>
      <button
        type="button"
        data-ocid="chat.create_account_button"
        onClick={onCreateAccount}
        className="shrink-0 rounded-lg bg-card px-3 py-1 font-bold text-skybrand-700 shadow-subtle transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Create Account
      </button>
    </div>
  );
}
