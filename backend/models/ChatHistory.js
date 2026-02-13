import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    relevantChunks: {
      type: [Number],
      default: [],
    },
  },
  { _id: false } // prevents extra _id for each message
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    messages: {
      type: [messageSchema],
      default: [], // ensures empty array if none
    },
  },
  { timestamps: true }
);

// Prevent duplicate chat history for same user + document
chatHistorySchema.index(
  { userId: 1, documentId: 1 },
  { unique: true }
);

export default mongoose.model("ChatHistory", chatHistorySchema);
