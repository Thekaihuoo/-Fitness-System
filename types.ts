
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum FitnessLevel {
  VERY_GOOD = 'ดีมาก',
  GOOD = 'ดี',
  FAIR = 'ปานกลาง',
  POOR = 'ต่ำ',
  VERY_POOR = 'ต่ำมาก'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  studentId?: string; // Linked student record if role is STUDENT
  lastLogin?: string; // ISO string or formatted date
}

export interface Class {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  gender: Gender;
  birthDate: string;
  classId: string;
  weight?: number;
  height?: number;
}

export interface TestItem {
  id: string;
  name: string;
  unit: string;
  description: string;
}

export interface Assignment {
  id: string;
  teacherId: string;
  classId: string;
  testItemIds: string[];
}

export interface FitnessRecord {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  results: {
    testItemId: string;
    score: number;
    level: FitnessLevel;
  }[];
}
