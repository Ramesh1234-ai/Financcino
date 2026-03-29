import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    budgetLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is spent
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", BudgetSchema);
