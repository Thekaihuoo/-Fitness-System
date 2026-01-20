
import { TestItem } from './types';

export const TEST_ITEMS: TestItem[] = [
  { id: 'bmi', name: 'ดัชนีมวลกาย (BMI)', unit: 'kg/m²', description: 'ประเมินความสมส่วนของร่างกาย' },
  { id: 'sit_reach', name: 'นั่งงอตัวไปข้างหน้า', unit: 'ซม.', description: 'ประเมินความอ่อนตัว' },
  { id: 'push_up', name: 'ดันพื้นประยุกต์ 30 วินาที', unit: 'ครั้ง', description: 'ความแข็งแรงของกล้ามเนื้อแขน/ไหล่' },
  { id: 'sit_up', name: 'ลุก-นั่ง 60 วินาที', unit: 'ครั้ง', description: 'ความแข็งแรงของกล้ามเนื้อท้อง' },
  { id: 'step_test', name: 'ยืนยกเข่าขึ้นลง 3 นาที', unit: 'ครั้ง', description: 'ความอดทนของระบบหัวใจและไหลเวียนเลือด' }
];

export const ITEM_COLORS: Record<string, string> = {
  'bmi': '#26A69A',      // Teal
  'sit_reach': '#AED581', // Light Green
  'push_up': '#FF8A65',   // Deep Orange
  'sit_up': '#FFCA28',    // Amber
  'step_test': '#EF5350', // Red
};

export const APP_COLORS = {
  primary: '#26A69A',
  secondary: '#AED581',
  accent: '#FFCA28',
  warning: '#FF8A65',
  danger: '#EF5350',
};
