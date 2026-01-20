import { FirestoreProfessorRepository } from "../repositories/firestore/professorRepository";
import { CreateTeacherWithProfileInput } from "../repositories/professorRepository";

const repo = new FirestoreProfessorRepository();

export const createTeacherWithProfile = (data: CreateTeacherWithProfileInput) =>
  repo.createTeacherWithProfile(data);

export const getAllTeachers = () => repo.getAllTeachers();

export const getTeacherById = (id: number) => repo.getTeacherById(id);

export const getUserByEmailWithPassword = (email: string) => repo.getUserByEmailWithPassword(email);

export const getTeacherWithClasses = (id: number) => repo.getTeacherWithClasses(id);
