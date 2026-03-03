import express, { Application, Request, Response } from "express";
import cors from "cors";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
app.use("/api/v1", IndexRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello from Public-HealthCare-Backend");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
