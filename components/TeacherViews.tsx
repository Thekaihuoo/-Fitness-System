
import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { User, Student, Class, FitnessRecord, FitnessLevel, TestItem, Assignment } from '../types';
import { ITEM_COLORS } from '../constants';
import { Save, UserPlus, Info, Calculator, CheckCircle2, LayoutGrid } from 'lucide-react';
import Swal from 'sweetalert2';

interface TeacherViewsProps {
  activeTab: string;
  user: User;
}

const TeacherViews: React.FC<TeacherViewsProps> = ({ activeTab, user }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [fitnessData, setFitnessData] = useState<Record<string, Partial<FitnessRecord>>>({});

  const assignedClasses = classes.filter(c => 
    assignments.some(a => a.teacherId === user.id && a.classId === c.id)
  );

  const assignedTests = testItems.filter(ti => 
    assignments.some(a => 
      a.teacherId === user.id && 
      a.classId === selectedClassId && 
      a.testItemIds.includes(ti.id)
    )
  );

  useEffect(() => {
    setClasses(storage.get(storage.keys.CLASSES, []));
    setAssignments(storage.get(storage.keys.ASSIGNMENTS, []));
    setTestItems(storage.get(storage.keys.TEST_ITEMS, []));
  }, []);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    if (!classId) {
      setStudentsInClass([]);
      return;
    }

    const allStudents = storage.get(storage.keys.STUDENTS, []);
    const filtered = allStudents.filter((s: Student) => s.classId === classId);
    setStudentsInClass(filtered);

    const allRecords: FitnessRecord[] = storage.get(storage.keys.RECORDS, []);
    const initialData: Record<string, Partial<FitnessRecord>> = {};
    
    filtered.forEach((s: Student) => {
      const studentRecords = allRecords.filter(r => r.studentId === s.id).sort((a,b) => b.date.localeCompare(a.date));
      if (studentRecords.length > 0) {
        initialData[s.id] = { ...studentRecords[0] };
      } else {
        initialData[s.id] = { 
          studentId: s.id, 
          weight: 0, 
          height: 0, 
          bmi: 0,
          results: testItems.map(item => ({ testItemId: item.id, score: 0, level: FitnessLevel.FAIR }))
        };
      }
    });
    setFitnessData(initialData);
  };

  const calculateBMI = (weight: number, height: number): number => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
    }
    return 0;
  };

  const handleInputChange = (studentId: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFitnessData(prev => {
      const current = { ...prev[studentId] };
      if (field === 'weight') {
        current.weight = numValue;
        current.bmi = calculateBMI(numValue, current.height || 0);
      } else if (field === 'height') {
        current.height = numValue;
        current.bmi = calculateBMI(current.weight || 0, numValue);
      }
      return { ...prev, [studentId]: current };
    });
  };

  const handleScoreChange = (studentId: string, testItemId: string, score: string) => {
    const numScore = parseFloat(score) || 0;
    setFitnessData(prev => {
      const current = { ...prev[studentId] };
      const results = [...(current.results || [])];
      const index = results.findIndex(r => r.testItemId === testItemId);
      if (index > -1) {
        results[index] = { ...results[index], score: numScore };
      } else {
        results.push({ testItemId, score: numScore, level: FitnessLevel.FAIR });
      }
      current.results = results;
      return { ...prev, [studentId]: current };
    });
  };

  const handleSave = () => {
    Swal.fire({
      title: 'บันทึกข้อมูลหรือไม่?',
      text: `บันทึกข้อมูลนักเรียน ${studentsInClass.length} คน ลงในระบบถาวร`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#26A69A',
      confirmButtonText: 'ยืนยันการบันทึก',
      cancelButtonText: 'ตรวจสอบอีกครั้ง'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentRecords = storage.get(storage.keys.RECORDS, []);
        const newBatch = (Object.values(fitnessData) as Partial<FitnessRecord>[]).map(d => ({
          ...d,
          id: d.id || Date.now().toString() + Math.random(),
          date: new Date().toISOString()
        }));
        
        const studentIdsInBatch = new Set(studentsInClass.map(s => s.id));
        const filteredRecords = currentRecords.filter((r: FitnessRecord) => !studentIdsInBatch.has(r.studentId));
        
        storage.set(storage.keys.RECORDS, [...filteredRecords, ...newBatch]);
        
        Swal.fire({
          icon: 'success',
          title: 'บันทึกข้อมูลเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  if (activeTab === 'home') {
    return (
      <div className="max-w-7xl mx-auto space-y-10 fade-in">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-0 flex flex-col md:flex-row md:items-center justify-between gap-8 lift-up">
          <div>
            <h2 className="text-3xl font-black text-slate-800">บันทึกผลการทดสอบ</h2>
            <p className="text-slate-500 font-medium">ระบุน้ำหนัก ส่วนสูง และสถิติการทดสอบตามรายการที่มอบหมาย</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal_custom transition-all text-sm font-bold min-w-[250px] shadow-sm"
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
            >
              <option value="">-- เลือกชั้นเรียน --</option>
              {assignedClasses.length > 0 ? assignedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : <option disabled>ไม่มีห้องที่มอบหมาย</option>}
            </select>
            <button 
              onClick={handleSave}
              disabled={!selectedClassId}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal_custom to-teal-700 text-white rounded-2xl font-black hover:shadow-2xl disabled:opacity-30 shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
            >
              <Save size={20} />
              บันทึกคะแนน
            </button>
          </div>
        </div>

        {selectedClassId ? (
          <div className="bg-white rounded-[3.5rem] shadow-2xl border-0 overflow-hidden fade-in lift-up">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-800 text-white uppercase text-[10px] font-black tracking-widest border-b">
                      <th className="px-8 py-8 sticky left-0 bg-slate-800 z-10 border-r border-slate-700">รายชื่อนักเรียน</th>
                      <th className="px-8 py-8 text-center border-r border-slate-700">น้ำหนัก (kg)</th>
                      <th className="px-8 py-8 text-center border-r border-slate-700">ส่วนสูง (cm)</th>
                      <th className="px-8 py-8 bg-teal-600 text-white font-black border-r border-teal-500 text-center">BMI (Auto)</th>
                      {assignedTests.map(item => (
                        <th key={item.id} className="px-8 py-8 text-center" style={{ backgroundColor: ITEM_COLORS[item.id] || '#64748b' }}>
                          {item.name} <span className="text-[8px] opacity-70 block">({item.unit})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsInClass.map((s, i) => {
                      const data = fitnessData[s.id] || {};
                      return (
                        <tr key={s.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-teal-50/20 transition-colors group`}>
                          <td className="px-8 py-6 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-[4px_0_10px_rgba(0,0,0,0.02)] border-r group-hover:bg-teal-50/20 transition-colors">
                            {s.name}
                            <div className="text-[10px] text-slate-400 font-mono tracking-tighter opacity-70">ID: {s.studentId}</div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <input type="number" step="0.1" className="w-20 p-4 bg-white border-2 border-slate-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl text-center font-bold transition-all outline-none shadow-sm" value={data.weight || ''} onChange={(e) => handleInputChange(s.id, 'weight', e.target.value)} />
                          </td>
                          <td className="px-8 py-6 text-center">
                            <input type="number" step="0.1" className="w-20 p-4 bg-white border-2 border-slate-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl text-center font-bold transition-all outline-none shadow-sm" value={data.height || ''} onChange={(e) => handleInputChange(s.id, 'height', e.target.value)} />
                          </td>
                          <td className="px-8 py-6 bg-teal-50/30 border-r text-center">
                            <div className={`text-2xl font-black ${data.bmi ? 'text-teal_custom' : 'text-slate-200'}`}>
                              {data.bmi || '0.00'}
                            </div>
                          </td>
                          {assignedTests.map(item => (
                            <td key={item.id} className="px-8 py-6 text-center">
                              <input 
                                type="number" 
                                className="w-24 p-4 border-2 border-transparent focus:bg-white focus:ring-4 rounded-2xl text-center font-black transition-all outline-none shadow-sm" 
                                style={{ backgroundColor: `${ITEM_COLORS[item.id]}15`, color: ITEM_COLORS[item.id], focusRingColor: `${ITEM_COLORS[item.id]}30` }}
                                value={data.results?.find(r => r.testItemId === item.id)?.score || ''} 
                                onChange={(e) => handleScoreChange(s.id, item.id, e.target.value)} 
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 text-slate-300 animate-fadeIn lift-up">
            <LayoutGrid size={100} className="mb-8 opacity-10" />
            <p className="text-3xl font-black mb-2">เลือกชั้นเรียน</p>
            <p className="text-sm font-medium">กรุณาเลือกชั้นเรียนจาก Dropdown เพื่อเริ่มการบันทึกผลการทดสอบสมรรถภาพ</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-20 text-slate-400 fade-in">
      <p className="font-black text-2xl uppercase tracking-widest opacity-20">Settings Module Development</p>
    </div>
  );
};

export default TeacherViews;
