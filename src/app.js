import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import groupsRoute from "./routes/groupsRoute.js";
import tagsRoute from "./routes/tagsRoute.js";
import multer from "multer";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "./uploads" });
app.use("/images", express.static("uploads"));

app.post("/images", upload.single("attachment"), (req, res) => {
  console.log(req.file);
  const urls = [`/images/${req.file.filename}`];
  res.json({ urls });
});

app.use("/groups", groupsRoute);
app.use("/tags", tagsRoute);

app.listen(process.env.PORT || 3000, () =>
  console.log(`server staring on ${process.env.PORT}`)
);
