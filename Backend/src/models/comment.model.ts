import mongoose, { Document, Schema } from "mongoose";

export interface CommentDocument extends Document {
  text: String;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model<CommentDocument>("Comment", commentSchema);
export default CommentModel;
