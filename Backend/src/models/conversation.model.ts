import mongoose, { Document, Schema } from "mongoose";

export interface ConversationDocument extends Document {
  participants: Array<mongoose.Types.ObjectId>;
  messages: Array<mongoose.Types.ObjectId>;
}

const conversationSchema = new Schema<ConversationDocument>({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

const ConversationModel = mongoose.model<ConversationDocument>(
  "Conversation",
  conversationSchema
);
export default ConversationModel;
