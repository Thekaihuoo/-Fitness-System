
import { User, Role, Class, Student, Assignment, FitnessRecord, TestItem } from '../types';
import { TEST_ITEMS as INITIAL_TEST_ITEMS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'dpe_users',
  CLASSES: 'dpe_classes',
  STUDENTS: 'dpe_students',
  ASSIGNMENTS: 'dpe_assignments',
  RECORDS: 'dpe_records',
  TEST_ITEMS: 'dpe_test_items'
};

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '0000', name: 'ผู้ดูแลระบบ', role: Role.ADMIN },
  { id: '2', username: 'teacher1', password: '123', name: 'ครูสมชาย ใจดี', role: Role.TEACHER }
];

const INITIAL_CLASSES: Class[] = [
  { id: 'c1', name: 'ป.1/1' },
  { id: 'c2', name: 'ป.6/2' }
];

export const storage = {
  get: <T,>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) storage.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) storage.set(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) storage.set(STORAGE_KEYS.STUDENTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) storage.set(STORAGE_KEYS.ASSIGNMENTS, []);
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) storage.set(STORAGE_KEYS.RECORDS, []);
    if (!localStorage.getItem(STORAGE_KEYS.TEST_ITEMS)) storage.set(STORAGE_KEYS.TEST_ITEMS, INITIAL_TEST_ITEMS);
  },
  keys: STORAGE_KEYS
};
