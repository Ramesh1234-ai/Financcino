import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: "#3498db",
    },
    icon: {
      type: String,
      default: "tag",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
export const Category = mongoose.model("Category", CategorySchema);
