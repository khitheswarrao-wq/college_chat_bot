import { Request, Response } from "express";
import { authService } from "../services/authService";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required", code: "VALIDATION_ERROR" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required", code: "VALIDATION_ERROR" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format", code: "VALIDATION_ERROR" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters", code: "VALIDATION_ERROR" });
    }

    const user = await authService.register({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
    res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    if (error.message === "Email already in use") {
      return res.status(400).json({ success: false, message: "An account with this email already exists", code: "VALIDATION_ERROR" });
    }
    res.status(500).json({ success: false, message: "Internal server error", code: "SERVER_ERROR" });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.status(200).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ success: false, message: "Invalid email or password", code: "AUTH_REQUIRED" });
    }
    res.status(500).json({ success: false, message: "Internal server error", code: "SERVER_ERROR" });
  }
};

export const logout = async (req: Request, res: Response) => {
  // JWT is stateless; client discards the token
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: ["id", "name", "email", "role", "createdAt"],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found", code: "USER_NOT_FOUND" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", code: "SERVER_ERROR" });
  }
};
