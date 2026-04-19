const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password!");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
  "firstName","lastName","profilePic","gender","age","about","skills",
  "experience","github","linkedin","twitter","discord"
];

  return Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};