const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const { sendEmail } = require("./sendEmail"); // ✅ correct import
const ConnectionRequestModel = require("../models/connectionRequest");

// Runs every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    console.log(listOfEmails);

    for (const email of listOfEmails) {
      try {
        const res = await sendEmail(
          email,
          "New Friend Requests pending for " + email,
          "There are so many friend requests pending, please login to codemate and accept or reject the requests."
        );
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.error(err);
  }
});