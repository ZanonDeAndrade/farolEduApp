import { User } from "./models";

export interface IUserRepository {
  createUser(data: { name: string; email: string; password: string; role: string }): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: number): Promise<User | null>;
  getAllStudents(): Promise<User[]>;
  createFromGoogle(data: { name: string; email: string; googleUid: string; role: string }): Promise<User>;
  linkGoogleAccount(userId: number, googleUid: string): Promise<void>;
  updateLastLogin(userId: number): Promise<void>;
  updateUserPhoto(userId: number, photoUrl: string): Promise<User | null>;
}
