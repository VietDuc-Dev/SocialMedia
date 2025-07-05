import { Router } from "express";
import {
  deleteSessionIdController,
  getSessionsController,
} from "../controllers/session.controller";

const sessionRoutes = Router();

sessionRoutes.get("/", getSessionsController);

sessionRoutes.delete("/:id", deleteSessionIdController);

export default sessionRoutes;
