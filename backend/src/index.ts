import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database";
import { initVectorStore } from "./rag/vectorStore";

// Models (must be imported before sync)
import "./models/User";
import "./models/Document";
import "./models/DocumentChunk";
import "./models/Conversation";
import "./models/Message";
import "./models/Feedback";

// Routes
import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});

app.use(corsMiddleware);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api", conversationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models (create tables if not exist)
    await sequelize.sync({ alter: false });
    console.log("Database models synchronized.");

    // Initialize vector store safely
    try {
      await initVectorStore();
    } catch (vError) {
      console.warn("Vector store initialization notice:", vError);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
