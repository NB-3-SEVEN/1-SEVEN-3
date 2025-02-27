import express from "express";
import { postGroup } from "../api/group.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send("Groups route is working!");
});

router.route("/").post(postGroup);

export default router;
