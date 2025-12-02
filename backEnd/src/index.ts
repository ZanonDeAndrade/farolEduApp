import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import professorRoutes from "./routes/professorRoutes";
import scheduleRoutes from "./routes/scheduleRoutes";
import teacherClassRoutes from "./routes/teacherClassRoutes";
import aiRoutes from "./routes/aiRoutes";
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
app.use("/api/teacher-classes", teacherClassRoutes);
app.use("/api/ai", aiRoutes);

// Handler global simples
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ message: "Erro interno no servidor" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
