import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import groupsRoute from "./routes/groupsRoute.js";
import tagsRoute from "./routes/tagsRoute.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/groups", groupsRoute);
app.use("/tags", tagsRoute);

app.listen(process.env.PORT || 3000, () =>
  console.log(`server staring on ${process.env.PORT}`)
);
