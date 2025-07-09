import { Router } from "express";
import {
  deleteUserController,
  editProfileController,
  followOrUnfollowController,
  getCurrentUserController,
  getSuggestedUsersController,
} from "../controllers/user.controller";
import upload from "../middlewares/multer";

const userRoutes = Router();

userRoutes.get("/current", getCurrentUserController);

userRoutes.post("/edit", upload.single("profilePhoto"), editProfileController);

userRoutes.delete("/delete", deleteUserController);

userRoutes.get("/suggested", getSuggestedUsersController);

userRoutes.post("/:id/followorunfollow", followOrUnfollowController);

export default userRoutes;
