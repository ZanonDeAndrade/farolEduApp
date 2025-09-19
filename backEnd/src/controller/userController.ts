
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, getAllUsers, findUserById } from "../modules/userModel";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: "Dados incompletos" });

  const existingUser = await findUserByEmail(email);
  if (existingUser) return res.status(400).json({ message: "Email já cadastrado" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword, role });

  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Senha incorreta" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
};

export const listUsers = async (_req: Request, res: Response) => {
  const users = await getAllUsers();
  res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await findUserById(id);
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
  res.json(user);
};
