import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import professorRoutes from "./routes/professorRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import { PORT } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());


app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // ajuste p/ seu front
    credentials: true,
  }));

app.use("/api/users", userRoutes);
app.use("/api/professors", professorRoutes);
app.use("/api/schedules", scheduleRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
