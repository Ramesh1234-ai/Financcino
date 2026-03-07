import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "other"],
      default: "cash",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receiptImage: {
      type: String,
      default: null,
    },
    tags: [String],
    notes: {
      type: String,
      default: null,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", null],
      default: null,
    },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("Expense", ExpenseSchema);