import mongoose from "mongoose";
const ReceiptSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    extractedData: {
      text: String,
      dates: [String],
      total: Number,
      items: [
        {
          description: String,
          amount: Number,
        },
      ],
      confidence: Number,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
export const Receipt = mongoose.model("Receipt", ReceiptSchema);
