import { User } from "./models";

export interface IUserRepository {
  createUser(data: { name: string; email: string; password: string; role: string }): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: number): Promise<User | null>;
  getAllStudents(): Promise<User[]>;
}
