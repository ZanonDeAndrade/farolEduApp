import { FirestoreUserRepository } from "../repositories/firestore/userRepository";

const repo = new FirestoreUserRepository();

export const createUser = (data: { name: string; email: string; password: string; role: string }) =>
  repo.createUser(data);

export const findUserByEmail = (email: string) => repo.findUserByEmail(email);

export const findUserById = (id: number) => repo.findUserById(id);

// Retorna todos os estudantes SEM incluir relações
export const getAllUsers = () => repo.getAllStudents();
