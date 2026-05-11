const cron = require("node-cron");
const User = require("../models/user");

const startCleanupTask = () => {
  // Runs every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running daily account cleanup...");
      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await User.deleteMany({
        isDeleted: true,
        deletedAt: { $lt: sevenDaysAgo }
      });

      console.log(`Cleanup complete. Deleted ${result.deletedCount} expired accounts.`);
      
      const expiredPremiumUsers = await User.updateMany(
        {
          isPremium: true,
          membershipExpiresAt: { $lte: new Date() },
        },
        {
          $set: {
            isPremium: false,
            membershipType: null,
          },
        }
      );

      console.log(
        `Premium cleanup complete. Expired ${expiredPremiumUsers.modifiedCount} memberships.`
      );

    } catch (err) {
      console.error("Cleanup Task Error:", err.message);
    }
  });
};

module.exports = startCleanupTask;