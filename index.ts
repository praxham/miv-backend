import express from "express";
import "dotenv/config";
import cors from "cors";
import router from "./src/routes/router.ts";

const app = express();

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api", router);

export default app;

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => console.log("miv backend listening on port:", port));
}
