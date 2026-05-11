import "./index.css";

export const isPremiumActive = (user) => {
  if (!user?.isPremium) return false;
  if (!user.membershipExpiresAt) return true;

  return new Date(user.membershipExpiresAt) > new Date();
};

const PremiumVerifiedBadge = ({ user }) => {
  if (!isPremiumActive(user)) return null;

  return (
    <span
      className="premium-verified-badge"
      title="Premium verified developer"
      aria-label="Premium verified developer"
    >
      ✓
    </span>
  );
};

export default PremiumVerifiedBadge;
