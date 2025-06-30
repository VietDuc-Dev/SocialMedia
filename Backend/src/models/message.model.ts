import mongoose, { Document, Schema } from "mongoose";

export interface MessageDocument extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MessageModel = mongoose.model<MessageDocument>("Message", messageSchema);
export default MessageModel;
