import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import groupsRoute from "./routes/groupsRoute.js";
import tagsRoute from "./routes/tagsRoute.js";
import multer from "multer";
import { asyncHandler } from "./asyncHandler.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({
  dest: "./uploads",
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File should be an image file"));
    }
    cb(null, true);
  },
});

app.post(
  "/images",
  (req, res, next) => {
    upload.array("files", 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "File error" });
    }

    const urls = req.files.map(
      (file) => `http://localhost:${process.env.PORT}/images/${file.filename}`
    );

    res.json({ urls });
  })
);

app.use("/groups", groupsRoute);
app.use("/tags", tagsRoute);

app.listen(process.env.PORT || 3000, () =>
  console.log(`server staring on ${process.env.PORT}`)
);
