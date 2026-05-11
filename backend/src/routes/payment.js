const express = require("express");
const paymentRouter = express.Router();
const crypto = require("crypto");

const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants")



paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    // Save it in my database
    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOneAndUpdate(
      {
        orderId: razorpay_order_id,
        userId: req.user._id,
      },
      {
        paymentId: razorpay_payment_id,
        status: "success",
      },
      { returnDocument: "after" }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const membershipType = payment.notes.membershipType;

    const membershipStartedAt = new Date();
    const membershipExpiresAt = new Date(membershipStartedAt);

    if (membershipType === "monthly") {
      membershipExpiresAt.setMonth(membershipExpiresAt.getMonth() + 1);
    } else if (membershipType === "yearly") {
      membershipExpiresAt.setFullYear(membershipExpiresAt.getFullYear() + 1);
    } else {
      return res.status(400).json({ message: "Invalid membership type" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isPremium: true,
        membershipType,
        membershipStartedAt,
        membershipExpiresAt,
      },
      { new: true }
    );

    res.json({
      message: "Payment verified successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = paymentRouter;