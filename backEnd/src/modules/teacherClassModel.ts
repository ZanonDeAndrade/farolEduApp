import {
  CreateTeacherClassInput,
  PublicTeacherClassFilters,
} from "../repositories/teacherClassRepository";
import { FirestoreTeacherClassRepository } from "../repositories/firestore/teacherClassRepository";

const repo = new FirestoreTeacherClassRepository();

export const createTeacherClass = (input: CreateTeacherClassInput) => repo.createTeacherClass(input);

export const updateTeacherClassByTeacher = (teacherId: number, classId: number, data: Partial<CreateTeacherClassInput>) =>
  repo.updateTeacherClassByTeacher(teacherId, classId, data);

export const deleteTeacherClassByTeacher = (teacherId: number, classId: number) =>
  repo.deleteTeacherClassByTeacher(teacherId, classId);

export const getTeacherClassesByTeacher = (teacherId: number) => repo.getTeacherClassesByTeacher(teacherId);

export const getPublicTeacherClasses = (filters: PublicTeacherClassFilters) => repo.getPublicTeacherClasses(filters);
