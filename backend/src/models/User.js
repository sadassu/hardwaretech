import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    googleId: {
      type: String,
    },

    avatar: {
      type: String,
    },

    roles: {
      type: [String],
      enum: ["user", "admin", "cashier"],
      default: ["user"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    verificationCode: { type: String },

    verificationCodeExpires: { type: Date },

    verificationTokenHash: String,
    verificationTokenExpires: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.statics.signup = async ({
  name,
  email,
  password,
  confirmPassword,
  verificationTokenHash,
  verificationTokenExpires,
  avatar,
}) => {
  if (!email || !password || !name || !confirmPassword) {
    throw Error("All fields must be filled");
  }

  if (password !== confirmPassword) {
    throw Error("Passwords do not match");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error(
      "Password must be stronger. It should include at least 8 characters, uppercase, lowercase, numbers, and symbols."
    );
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hash,
    verificationTokenHash,
    verificationTokenExpires,
    avatar,
  });

  return user;
};

userSchema.statics.changePassword = async function (
  userId,
  password,
  confirmPassword
) {
  const user = await this.findById(userId);

  if (!user) {
    throw Error("User does not exist");
  }

  if (!password || !confirmPassword) {
    throw Error("All fields must be filled");
  }

  if (password !== confirmPassword) {
    throw Error("Passwords do not match");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error(
      "Password must be stronger. It should include at least 8 characters, uppercase, lowercase, numbers, and symbols."
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  user.password = hash;
  await user.save();

  return user;
};

//static login method
userSchema.statics.login = async function (email, password) {
  //validation
  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Incorrect email");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }

  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
