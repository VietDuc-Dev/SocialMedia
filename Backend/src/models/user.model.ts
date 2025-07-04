import mongoose, { Document, Schema } from "mongoose";
import { GenderEnum, GenderEnumType } from "../enums/user.enum";
import { compareValue, hashValue } from "../utils/bcrypy";

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture: string | null;
  bio: string | null;
  gender: GenderEnumType;
  followers: mongoose.Types.ObjectId | null;
  following: mongoose.Types.ObjectId | null;
  posts: mongoose.Types.ObjectId | null;
  bookmarks: mongoose.Types.ObjectId | null;
  verified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: null,
    },
    followers: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    posts: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    bookmarks: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (value: string) {
  return compareValue(value, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
