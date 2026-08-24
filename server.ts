import "dotenv/config";
import express from "express";
import { configureApi } from "./server/_core/index";

const app = express();
configureApi(app);

export default app;
