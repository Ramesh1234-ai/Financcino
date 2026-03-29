import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    totalBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageMonthlySpend: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageDailySpend: {
      type: Number,
      default: 0,
      min: 0,
    },
    savingRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    savingsGoal: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentSavings: {
      type: Number,
      default: 0,
      min: 0,
    },
    categoryBreakdown: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        categoryName: String,
        amount: Number,
        percentage: Number,
      },
    ],
    monthlyTrend: [
      {
        month: Date,
        spent: Number,
        budget: Number,
      },
    ],
    topCategories: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        categoryName: String,
        amount: Number,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Analytics = mongoose.model("Analytics", AnalyticsSchema);