import mongoose, { Document, mongo, Schema } from "mongoose";

export interface PostDocument extends Document {
  caption: string | null;
  image: string;
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId | null;
  comments: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
  {
    caption: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model<PostDocument>("Post", postSchema);
export default PostModel;
