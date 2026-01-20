
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';
import { User, Role, Class, Student, Gender, Assignment, TestItem, FitnessRecord, FitnessLevel } from '../types';
import { ITEM_COLORS } from '../constants';
import { Plus, Trash2, Edit2, Search, Users, BookOpen, Users2, Activity, Calculator, ClipboardList, ClipboardCheck, UserPlus, Info, Download, BarChart3, TrendingUp, PieChart as PieIcon, UserCircle, FileSpreadsheet, Clock } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import Swal from 'sweetalert2';

interface AdminViewsProps {
  activeTab: string;
}

const AdminViews: React.FC<AdminViewsProps> = ({ activeTab }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [records, setRecords] = useState<FitnessRecord[]>([]);
  
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTestItemIds, setSelectedTestItemIds] = useState<string[]>([]);
  
  const [reportType, setReportType] = useState<'individual' | 'class' | 'summary'>('individual');
  const [reportStudentId, setReportStudentId] = useState<string>('');
  const [reportClassId, setReportClassId] = useState<string>('');

  useEffect(() => {
    loadAll();
  }, [activeTab]);

  const loadAll = () => {
    setUsers(storage.get(storage.keys.USERS, []));
    setClasses(storage.get(storage.keys.CLASSES, []));
    setStudents(storage.get(storage.keys.STUDENTS, []));
    setAssignments(storage.get(storage.keys.ASSIGNMENTS, []));
    setTestItems(storage.get(storage.keys.TEST_ITEMS, []));
    setRecords(storage.get(storage.keys.RECORDS, []));
  };

  const exportToCSV = (headers: string[], rows: string[][], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire({
      icon: 'success',
      title: 'ส่งออกข้อมูลสำเร็จ',
      text: `ไฟล์ ${filename}.csv ถูกดาวน์โหลดแล้ว`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleExportIndividual = () => {
    const selectedStudent = students.find(s => s.id === reportStudentId);
    const latestRecord = records.filter(r => r.studentId === reportStudentId).sort((a,b) => b.date.localeCompare(a.date))[0];
    
    if (!selectedStudent || !latestRecord) return;

    const headers = ['รายการทดสอบ', 'หน่วย', 'สถิติที่ทำได้', 'ระดับคุณภาพ'];
    const rows = latestRecord.results.map(res => {
      const item = testItems.find(ti => ti.id === res.testItemId);
      return [
        item?.name || '',
        item?.unit || '',
        res.score.toString(),
        res.level
      ];
    });

    exportToCSV(headers, rows, `fitness_report_${selectedStudent.studentId}`);
  };

  const handleExportClass = () => {
    const selectedClass = classes.find(c => c.id === reportClassId);
    if (!selectedClass) return;

    const headers = ['เลขประจำตัว', 'ชื่อ-นามสกุล', 'น้ำหนัก (kg)', 'ส่วนสูง (cm)', 'BMI', 'สถานะการประเมิน'];
    const rows = students.filter(s => s.classId === reportClassId).map(s => {
      const latest = records.filter(r => r.studentId === s.id).sort((a,b) => b.date.localeCompare(a.date))[0];
      return [
        s.studentId,
        s.name,
        latest?.weight.toString() || '-',
        latest?.height.toString() || '-',
        latest?.bmi.toString() || '-',
        latest ? 'ประเมินแล้ว' : 'รอดำเนินการ'
      ];
    });

    exportToCSV(headers, rows, `class_fitness_report_${selectedClass.name}`);
  };

  const handleExportSummary = () => {
    if (!summaryStats) return;

    const headers = ['หมวดหมู่', 'รายการ', 'จำนวนนักเรียน (คน)'];
    const rows: string[][] = [];

    rows.push(['BMI Distribution', '', '']);
    summaryStats.bmiStats.forEach(stat => {
      rows.push(['', stat.name, stat.value.toString()]);
    });

    rows.push(['', '', '']);
    rows.push(['Fitness Level Overall', '', '']);
    summaryStats.levelStats.forEach(stat => {
      rows.push(['', stat.name, stat.count.toString()]);
    });

    exportToCSV(headers, rows, 'school_fitness_summary');
  };

  const handleDelete = (id: string, key: string, label: string) => {
    Swal.fire({
      title: `ยืนยันการลบ ${label}?`,
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF5350',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentData = storage.get(key, []);
        const newData = currentData.filter((item: any) => item.id !== id);
        storage.set(key, newData);
        loadAll();
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบเรียบร้อยแล้ว', 'success');
      }
    });
  };

  const COLORS = ['#26A69A', '#AED581', '#FFCA28', '#FF8A65', '#EF5350'];

  const summaryStats = useMemo(() => {
    if (records.length === 0) return null;
    const bmiStats = [
      { name: 'ผอม', value: records.filter(r => r.bmi > 0 && r.bmi < 18.5).length },
      { name: 'สมส่วน', value: records.filter(r => r.bmi >= 18.5 && r.bmi < 23).length },
      { name: 'ท้วม', value: records.filter(r => r.bmi >= 23 && r.bmi < 25).length },
      { name: 'อ้วน', value: records.filter(r => r.bmi >= 25).length }
    ].filter(s => s.value > 0);

    const levelStats = Object.values(FitnessLevel).map(level => ({
      name: level,
      count: records.filter(r => r.results.some(res => res.level === level)).length
    }));

    return { bmiStats, levelStats };
  }, [records]);

  const renderHome = () => (
    <div className="space-y-10 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Users size={28} />, label: 'นักเรียน', count: students.length, color: 'from-teal_custom to-teal-400' },
          { icon: <BookOpen size={28} />, label: 'ชั้นเรียน', count: classes.length, color: 'from-blue-500 to-blue-400' },
          { icon: <Activity size={28} />, label: 'รายการทดสอบ', count: testItems.length, color: 'from-amber_custom to-amber-300' },
          { icon: <UserCircle size={28} />, label: 'ผู้ใช้ระบบ', count: users.length, color: 'from-purple-500 to-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl border-0 flex flex-col items-center text-center lift-up group">
            <div className={`w-16 h-16 bg-gradient-to-tr ${stat.color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-4xl font-black text-slate-800 mb-1">{stat.count}</p>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-teal-600/30 lift-up">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-4xl font-black mb-6 leading-tight">ระบบบันทึกและประเมินผล<br/>สมรรถภาพทางกาย (DPE 2019)</h3>
          <p className="text-teal-50 text-lg font-medium mb-10 opacity-90 leading-relaxed">ยินดีต้อนรับสู่แดชบอร์ดผู้ดูแลระบบ จัดการข้อมูลนักเรียน คุณครู และเรียกดูรายงานสรุปผลได้จากเมนูทางด้านซ้าย</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setReportType('summary')} className="px-8 py-4 bg-white text-teal-800 rounded-2xl font-black text-sm shadow-xl hover:bg-teal-50 transition-all active:scale-95">สถิติรวมโรงเรียน</button>
            <div className="px-8 py-4 bg-teal-500/30 border border-white/20 backdrop-blur-md text-white rounded-2xl font-black text-sm">ผู้ดูแลระบบ</div>
          </div>
        </div>
        <BarChart3 className="absolute right-[-40px] bottom-[-40px] w-96 h-96 text-white/10 rotate-12" />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-8 fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between border-b-4 border-teal_custom">
        <div>
          <h2 className="text-2xl font-black text-slate-800">จัดการผู้ใช้งาน</h2>
          <p className="text-sm font-medium text-slate-500">จัดการสิทธิ์เข้าถึงของคุณครูและผู้ดูแล</p>
        </div>
        <button onClick={() => handleUserAction()} className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal_custom to-teal-700 text-white rounded-2xl text-sm font-black hover:shadow-2xl hover:scale-105 transition-all shadow-lg active:scale-95"><Plus size={20} /> เพิ่มผู้ใช้</button>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden lift-up">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-teal-600 to-teal-800 text-white font-black uppercase text-[10px] tracking-widest">
              <th className="px-8 py-6">ชื่อ-นามสกุล</th>
              <th className="px-8 py-6">Username</th>
              <th className="px-8 py-6">บทบาท</th>
              <th className="px-8 py-6">เข้าใช้งานล่าสุด</th>
              <th className="px-8 py-6 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u, i) => (
              <tr key={u.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-teal-50/20'} hover:bg-teal-50/40 transition-colors`}>
                <td className="px-8 py-5 font-bold text-slate-700">{u.name}</td>
                <td className="px-8 py-5 font-mono text-xs text-slate-500">{u.username}</td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Clock size={14} className="text-slate-300" />
                    {u.lastLogin || <span className="text-slate-200 italic font-normal">ยังไม่มีการเข้าใช้งาน</span>}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleUserAction(u)} className="p-3 text-teal-600 hover:bg-teal-100 rounded-2xl transition-all shadow-sm"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(u.id, storage.keys.USERS, u.name)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-8 fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between border-b-4 border-blue-500">
        <div><h2 className="text-2xl font-black text-slate-800">จัดการชั้นเรียน</h2><p className="text-sm font-medium text-slate-500">จัดการข้อมูลห้องเรียนและระดับชั้น</p></div>
        <button onClick={handleAddClass} className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl text-sm font-black hover:shadow-2xl transition-all shadow-lg active:scale-95"><Plus size={20} /> เพิ่มชั้นเรียน</button>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden lift-up">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black uppercase text-[10px] tracking-widest">
              <th className="px-8 py-6">ชื่อชั้นเรียน / ห้องเรียน</th>
              <th className="px-8 py-6 text-center">ตัวเลือก</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.map((c, i) => (
              <tr key={c.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'} hover:bg-blue-50/40 transition-colors`}>
                <td className="px-8 py-5 font-bold text-slate-700">{c.name}</td>
                <td className="px-8 py-5 text-center">
                  <button onClick={() => handleDelete(c.id, storage.keys.CLASSES, c.name)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-8 fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between border-b-4 border-amber_custom">
        <div><h2 className="text-2xl font-black text-slate-800">รายการทดสอบสมรรถภาพ</h2><p className="text-sm font-medium text-slate-500">ปรับแต่งเกณฑ์และคำอธิบายรายการทดสอบ</p></div>
        <button onClick={() => handleTestAction()} className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber_custom to-amber-500 text-white rounded-2xl text-sm font-black shadow-lg hover:scale-105 transition-all active:scale-95"><Plus size={20} /> เพิ่มรายการ</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testItems.map(ti => (
          <div key={ti.id} className="bg-white p-10 rounded-[2.5rem] shadow-xl border-0 lift-up relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-3 h-full" style={{ backgroundColor: ITEM_COLORS[ti.id] || '#cbd5e1' }}></div>
             <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="px-4 py-1.5 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-xl border-2 border-slate-100">{ti.unit}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleTestAction(ti)} className="p-2.5 text-teal_custom hover:bg-teal-50 rounded-xl"><Edit2 size={18}/></button>
                     <button onClick={() => handleDelete(ti.id, storage.keys.TEST_ITEMS, ti.name)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">{ti.name}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{ti.description}</p>
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ITEM_COLORS[ti.id] }}></div>
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">DPE Standard {ti.id.toUpperCase()}</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-8 fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-orange_custom">
        <h2 className="text-2xl font-black text-slate-800">มอบหมายงานทดสอบ</h2>
        <p className="text-sm font-medium text-slate-500">กำหนดคุณครูผู้รับผิดชอบรายห้องเรียน</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border-0 lift-up space-y-8">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <ClipboardCheck size={24} className="text-orange_custom" /> สร้างการมอบหมาย
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">คุณครู</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-orange_custom transition-all" value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
                  <option value="">-- เลือกครู --</option>
                  {users.filter(u => u.role === Role.TEACHER).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">ชั้นเรียน</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-orange_custom transition-all" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                  <option value="">-- เลือกชั้นเรียน --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">รายการทดสอบ</label>
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 space-y-3 max-h-60 overflow-y-auto">
                  {testItems.map(ti => (
                    <label key={ti.id} className="flex items-center gap-3 p-2.5 hover:bg-white rounded-xl cursor-pointer transition-all group">
                      <input type="checkbox" checked={selectedTestItemIds.includes(ti.id)} onChange={() => handleToggleTestItemSelection(ti.id)} className="w-5 h-5 rounded-lg border-2 border-slate-300 text-orange_custom focus:ring-orange_custom/20" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-orange_custom">{ti.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleConfirmAssignment} className="w-full py-4 bg-gradient-to-r from-orange_custom to-orange-400 text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">บันทึกมอบหมายงาน</button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden lift-up">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-orange_custom to-orange-400 text-white font-black uppercase text-[10px] tracking-widest">
                  <th className="px-8 py-6">ครู</th>
                  <th className="px-8 py-6">ชั้น</th>
                  <th className="px-8 py-6">รายการ</th>
                  <th className="px-8 py-6 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a, i) => (
                  <tr key={a.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-orange-50/20'} hover:bg-orange-50/40 transition-colors`}>
                    <td className="px-8 py-5 font-bold text-slate-800">{users.find(u => u.id === a.teacherId)?.name}</td>
                    <td className="px-8 py-5"><span className="px-3 py-1 bg-white text-orange_custom border-2 border-orange-100 rounded-xl text-[10px] font-black">{classes.find(c => c.id === a.classId)?.name}</span></td>
                    <td className="px-8 py-5">
                       <div className="flex flex-wrap gap-1.5">
                          {a.testItemIds.map(id => (
                            <span key={id} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold border">{testItems.find(t => t.id === id)?.name}</span>
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-center"><button onClick={() => handleDelete(a.id, storage.keys.ASSIGNMENTS, 'การมอบหมาย')} className="p-3 text-red-500 hover:bg-red-100 rounded-2xl shadow-sm transition-all"><Trash2 size={18}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => {
    return (
      <div className="space-y-8 fade-in text-center py-20">
         <p className="text-slate-400 font-bold">Reporting Module Loading...</p>
      </div>
    );
  };

  const renderStudentsManagement = () => (
    <div className="space-y-8 fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-4 border-teal_custom flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div><h2 className="text-2xl font-black text-slate-800">จัดการนักเรียน</h2><p className="text-sm font-medium text-slate-500">จัดการรายชื่อและข้อมูลพื้นฐานนักเรียน</p></div>
        <div className="flex flex-wrap gap-3">
          <select className="px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-teal_custom transition-all" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
            <option value="">ทุกชั้นเรียน</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => handleAddStudent()} className="flex items-center gap-2 px-6 py-3.5 bg-teal_custom text-white rounded-2xl text-sm font-black shadow-lg shadow-teal-500/20 hover:scale-105 transition-all"><UserPlus size={18}/>รายคน</button>
          <button onClick={bulkAddStudents} className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"><ClipboardList size={18}/>แบบกลุ่ม</button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden lift-up">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-teal-600 to-teal-800 text-white font-black uppercase text-[10px] tracking-widest">
              <th className="px-8 py-6">รหัส</th>
              <th className="px-8 py-6">ชื่อ-นามสกุล</th>
              <th className="px-8 py-6">เพศ</th>
              <th className="px-8 py-6">ชั้น</th>
              <th className="px-8 py-6 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.filter(s => !selectedClassId || s.classId === selectedClassId).map((s, i) => (
              <tr key={s.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-teal-50/20'} hover:bg-teal-50/40 transition-colors`}>
                <td className="px-8 py-5 font-black text-teal_custom font-mono">{s.studentId}</td>
                <td className="px-8 py-5 font-bold text-slate-800">{s.name}</td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1 rounded-xl text-[10px] font-black tracking-wider ${s.gender === Gender.MALE ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {s.gender === Gender.MALE ? 'MALE' : 'FEMALE'}
                  </span>
                </td>
                <td className="px-8 py-5 font-bold text-slate-400">{classes.find(c => c.id === s.classId)?.name}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleAddStudent(s)} className="p-3 text-teal-600 hover:bg-teal-100 rounded-2xl transition-all shadow-sm"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(s.id, storage.keys.STUDENTS, s.name)} className="p-3 text-red-500 hover:bg-red-100 rounded-2xl transition-all shadow-sm"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-16 px-4">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'classes' && renderClasses()}
      {activeTab === 'students' && renderStudentsManagement()}
      {activeTab === 'tests' && renderTests()}
      {activeTab === 'assignments' && renderAssignments()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );

  async function handleAddStudent(s?: Student) {
    const isEdit = !!s;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่',
      html: `
        <div class="text-left space-y-4 px-2">
          <input id="swal-sid" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="รหัสประจำตัว" value="${s?.studentId || ''}">
          <input id="swal-sname" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="ชื่อ-นามสกุล" value="${s?.name || ''}">
          <select id="swal-sgender" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100">
            <option value="${Gender.MALE}" ${s?.gender === Gender.MALE ? 'selected' : ''}>ชาย</option>
            <option value="${Gender.FEMALE}" ${s?.gender === Gender.FEMALE ? 'selected' : ''}>หญิง</option>
          </select>
          <input id="swal-sbdate" type="date" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" value="${s?.birthDate || ''}">
          <select id="swal-sclass" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100">
            <option value="">-- เลือกชั้น --</option>
            ${classes.map(c => `<option value="${c.id}" ${s?.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      `,
      confirmButtonColor: '#26A69A',
      confirmButtonText: 'บันทึกข้อมูล',
      preConfirm: () => ({
        studentId: (document.getElementById('swal-sid') as HTMLInputElement).value,
        name: (document.getElementById('swal-sname') as HTMLInputElement).value,
        gender: (document.getElementById('swal-sgender') as HTMLSelectElement).value,
        birthDate: (document.getElementById('swal-sbdate') as HTMLInputElement).value,
        classId: (document.getElementById('swal-sclass') as HTMLSelectElement).value,
      })
    });

    if (formValues) {
      if (!formValues.studentId || !formValues.name || !formValues.classId) {
        Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
        return;
      }
      const current = storage.get(storage.keys.STUDENTS, []);
      if (isEdit) {
        storage.set(storage.keys.STUDENTS, current.map((item: Student) => item.id === s.id ? { ...item, ...formValues } : item));
      } else {
        storage.set(storage.keys.STUDENTS, [...current, { id: 's' + Date.now(), ...formValues }]);
      }
      loadAll();
      Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
    }
  }

  async function bulkAddStudents() {
    const { value: text } = await Swal.fire({
      title: 'เพิ่มนักเรียนแบบกลุ่ม',
      input: 'textarea',
      inputLabel: 'รูปแบบ: รหัส,ชื่อ,เพศ(M/F),วันเกิด(YYYY-MM-DD)',
      inputPlaceholder: '1001,นายสมชาย,M,2010-05-15\n1002,นางสาวใจดี,F,2010-06-20',
      confirmButtonColor: '#26A69A',
      confirmButtonText: 'นำเข้าข้อมูล',
      showCancelButton: true
    });
    if (text) {
      if (!selectedClassId) {
        Swal.fire('ระบุชั้นเรียน', 'กรุณาเลือกชั้นเรียนจาก Dropdown ก่อนเพื่อระบุห้องเรียนให้นักเรียนที่จะนำเข้า', 'warning');
        return;
      }
      const lines = text.split('\n').filter(l => l.trim());
      const newStudents = lines.map(line => {
        const parts = line.split(',');
        return {
          id: 's' + Math.random().toString(36).substr(2, 9),
          studentId: parts[0]?.trim() || '',
          name: parts[1]?.trim() || '',
          gender: parts[2]?.trim().toUpperCase() === 'M' || parts[2]?.trim().includes('ชาย') ? Gender.MALE : Gender.FEMALE,
          birthDate: parts[3]?.trim() || '',
          classId: selectedClassId
        };
      });
      const current = storage.get(storage.keys.STUDENTS, []);
      storage.set(storage.keys.STUDENTS, [...current, ...newStudents]);
      loadAll();
      Swal.fire('สำเร็จ', `นำเข้านักเรียน ${newStudents.length} คนเรียบร้อยแล้ว`, 'success');
    }
  }

  async function handleUserAction(u?: User) {
    const isEdit = !!u;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่',
      html: `
        <div class="text-left space-y-4 px-2">
          <input id="swal-name" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="ชื่อ-นามสกุล" value="${u?.name || ''}">
          <input id="swal-username" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="Username" value="${u?.username || ''}">
          <input id="swal-password" type="password" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="Password" value="${u?.password || ''}">
          <select id="swal-role" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100">
            <option value="${Role.TEACHER}" ${u?.role === Role.TEACHER ? 'selected' : ''}>คุณครู (Teacher)</option>
            <option value="${Role.ADMIN}" ${u?.role === Role.ADMIN ? 'selected' : ''}>ผู้ดูแลระบบ (Admin)</option>
          </select>
        </div>
      `,
      confirmButtonColor: '#26A69A',
      confirmButtonText: 'บันทึกสิทธิ์',
      preConfirm: () => ({
        name: (document.getElementById('swal-name') as HTMLInputElement).value,
        username: (document.getElementById('swal-username') as HTMLInputElement).value,
        password: (document.getElementById('swal-password') as HTMLInputElement).value,
        role: (document.getElementById('swal-role') as HTMLSelectElement).value
      })
    });
    if (formValues) {
      if (!formValues.name || !formValues.username) {
        Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อและชื่อผู้ใช้', 'error');
        return;
      }
      const current = storage.get(storage.keys.USERS, []);
      if (isEdit) {
        storage.set(storage.keys.USERS, current.map((item: User) => item.id === u.id ? { ...item, ...formValues } : item));
      } else {
        storage.set(storage.keys.USERS, [...current, { id: Date.now().toString(), ...formValues, lastLogin: null }]);
      }
      loadAll();
      Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
    }
  }

  async function handleAddClass() {
    const { value: name } = await Swal.fire({
      title: 'เพิ่มชั้นเรียน',
      input: 'text',
      inputLabel: 'ชื่อระดับชั้น / ห้องเรียน',
      inputPlaceholder: 'เช่น ป.1/1',
      confirmButtonColor: '#26A69A',
      showCancelButton: true
    });
    if (name) {
      const current = storage.get(storage.keys.CLASSES, []);
      storage.set(storage.keys.CLASSES, [...current, { id: 'c' + Date.now(), name }]);
      loadAll();
    }
  }

  async function handleTestAction(ti?: TestItem) {
    const isEdit = !!ti;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'แก้ไขรายการทดสอบ' : 'เพิ่มรายการทดสอบใหม่',
      html: `
        <div class="text-left space-y-4 px-2">
          <input id="swal-tiname" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="ชื่อรายการทดสอบ" value="${ti?.name || ''}">
          <input id="swal-tiunit" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="หน่วยวัด" value="${ti?.unit || ''}">
          <textarea id="swal-tidesc" class="swal2-textarea w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="คำอธิบาย">${ti?.description || ''}</textarea>
        </div>
      `,
      confirmButtonColor: '#26A69A',
      confirmButtonText: 'บันทึกข้อมูล',
      preConfirm: () => ({
        name: (document.getElementById('swal-tiname') as HTMLInputElement).value,
        unit: (document.getElementById('swal-tiunit') as HTMLInputElement).value,
        description: (document.getElementById('swal-tidesc') as HTMLTextAreaElement).value,
      })
    });
    if (formValues) {
      if (!formValues.name || !formValues.unit) {
        Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อรายการและหน่วยวัด', 'error');
        return;
      }
      const current = storage.get(storage.keys.TEST_ITEMS, []);
      if (isEdit) {
        storage.set(storage.keys.TEST_ITEMS, current.map((item: TestItem) => item.id === ti.id ? { ...item, ...formValues } : item));
      } else {
        storage.set(storage.keys.TEST_ITEMS, [...current, { id: 'ti' + Date.now(), ...formValues }]);
      }
      loadAll();
      Swal.fire('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
    }
  }

  function handleToggleTestItemSelection(id: string) { 
    setSelectedTestItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); 
  }

  function handleConfirmAssignment() {
    if (!selectedTeacherId || !selectedClassId || selectedTestItemIds.length === 0) {
      Swal.fire('ข้อมูลไม่ครบ', 'กรุณาเลือกครู ชั้นเรียน และรายการทดสอบ', 'warning');
      return;
    }
    const current = storage.get(storage.keys.ASSIGNMENTS, []);
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      teacherId: selectedTeacherId,
      classId: selectedClassId,
      testItemIds: selectedTestItemIds
    };
    storage.set(storage.keys.ASSIGNMENTS, [...current, newAssignment]);
    setSelectedTestItemIds([]);
    loadAll();
    Swal.fire('สำเร็จ', 'มอบหมายงานเรียบร้อยแล้ว', 'success');
  }
};

export default AdminViews;
