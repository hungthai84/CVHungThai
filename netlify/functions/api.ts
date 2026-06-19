import express from "express";
import serverless from "serverless-http";
import { apiRouter } from "../../api-routes";

const app = express();

app.use(express.json({ limit: "50mb" }));

// Route handlers for various potential incoming URL forms from Netlify rewrite rules
app.use("/.netlify/functions/api", apiRouter);
app.use("/api", apiRouter);
app.use("/", apiRouter);

export const handler = serverless(app);
