import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    // Clerk authentication ID (for synced users)
    clerkId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // Allow null values for non-Clerk users
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please provide a valid email"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null, // null for Clerk users
      minlength: 6,
      select: false, // Don't return password by default
    },
    profilePicture: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
export const User = mongoose.model("User", UserSchema);
