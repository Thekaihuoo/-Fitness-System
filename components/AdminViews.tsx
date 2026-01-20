
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';
import { User, Role, Class, Student, Gender, Assignment, TestItem, FitnessRecord, FitnessLevel } from '../types';
import { ITEM_COLORS } from '../constants';
import { 
  Plus, Trash2, Edit2, Search, Users, BookOpen, Users2, Activity, 
  ClipboardCheck, ClipboardList, UserPlus, Download, BarChart3, TrendingUp, 
  PieChart as PieIcon, UserCircle, FileSpreadsheet, Clock, Sparkles 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie 
} from 'recharts';
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

  const COLORS = ['#26A69A', '#AED581', '#FFCA28', '#FF8A65', '#EF5350', '#8E24AA', '#3949AB'];

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
      showConfirmButton: false,
      customClass: { popup: 'rounded-[2.5rem]' }
    });
  };

  const handleExportIndividual = () => {
    const selectedStudent = students.find(s => s.id === reportStudentId);
    const latestRecord = records.filter(r => r.studentId === reportStudentId).sort((a,b) => b.date.localeCompare(a.date))[0];
    if (!selectedStudent || !latestRecord) return;
    const headers = ['รายการทดสอบ', 'หน่วย', 'สถิติที่ทำได้', 'ระดับคุณภาพ'];
    const rows = latestRecord.results.map(res => {
      const item = testItems.find(ti => ti.id === res.testItemId);
      return [item?.name || '', item?.unit || '', res.score.toString(), res.level];
    });
    exportToCSV(headers, rows, `fitness_report_${selectedStudent.studentId}`);
  };

  const handleExportClass = () => {
    const selectedClass = classes.find(c => c.id === reportClassId);
    if (!selectedClass) return;
    const headers = ['เลขประจำตัว', 'ชื่อ-นามสกุล', 'น้ำหนัก (kg)', 'ส่วนสูง (cm)', 'BMI', 'สถานะการประเมิน'];
    const rows = students.filter(s => s.classId === reportClassId).map(s => {
      const latest = records.filter(r => r.studentId === s.id).sort((a,b) => b.date.localeCompare(a.date))[0];
      return [s.studentId, s.name, (latest?.weight || s.weight || '-').toString(), (latest?.height || s.height || '-').toString(), latest?.bmi.toString() || '-', latest ? 'ประเมินแล้ว' : 'รอดำเนินการ'];
    });
    exportToCSV(headers, rows, `class_fitness_report_${selectedClass.name}`);
  };

  const handleExportSummary = () => {
    if (!summaryStats) return;
    const headers = ['หมวดหมู่', 'รายการ', 'จำนวนนักเรียน (คน)'];
    const rows: string[][] = [];
    rows.push(['BMI Distribution', '', '']);
    summaryStats.bmiStats.forEach(stat => rows.push(['', stat.name, stat.value.toString()]));
    rows.push(['', '', '']);
    rows.push(['Fitness Level Overall', '', '']);
    summaryStats.levelStats.forEach(stat => rows.push(['', stat.name, stat.count.toString()]));
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
      cancelButtonText: 'ยกเลิก',
      customClass: { popup: 'rounded-[2rem]' }
    }).then((result) => {
      if (result.isConfirmed) {
        const currentData = storage.get(key, []);
        const newData = currentData.filter((item: any) => item.id !== id);
        storage.set(key, newData);
        loadAll();
        Swal.fire({ title: 'ลบสำเร็จ!', text: 'ข้อมูลถูกลบเรียบร้อยแล้ว', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
      }
    });
  };

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
    <div className="space-y-12 fade-in bg-transparent">
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600/90 via-teal-700/90 to-teal-900/90 p-16 rounded-[4rem] text-white shadow-2xl lift-up group border border-white/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-8">
            <Sparkles size={16} className="text-amber-300" /> Administrator Panel
          </div>
          <h3 className="text-5xl font-black mb-6 leading-tight tracking-tight">ระบบบันทึกและประเมินผล<br/>สมรรถภาพทางกาย <span className="text-amber-300">DPE 2019</span></h3>
          <p className="text-teal-50/70 text-lg font-medium mb-12 leading-relaxed">แพลตฟอร์มอัจฉริยะเพื่อการติดตามสุขภาพนักเรียนอย่างเป็นระบบ วิเคราะห์สถิติและประเมินผลตามเกณฑ์มาตรฐานกรมพลศึกษา</p>
          <div className="flex flex-wrap gap-5">
            <button onClick={() => setReportType('summary')} className="px-10 py-5 bg-white text-teal-900 rounded-[1.8rem] font-black text-sm shadow-xl hover:bg-teal-50 hover:-translate-y-1 transition-all active:scale-95">ดูรายงานสรุปสถิติ</button>
            <div className="px-10 py-5 bg-teal-500/20 border border-white/20 backdrop-blur-md text-white rounded-[1.8rem] font-black text-sm">Dashboard v1.3.2</div>
          </div>
        </div>
        <BarChart3 className="absolute right-[-60px] bottom-[-60px] w-96 h-96 text-white/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Users size={28} />, label: 'นักเรียน', count: students.length, color: 'from-pink-500 to-pink-400' },
          { icon: <BookOpen size={28} />, label: 'ชั้นเรียน', count: classes.length, color: 'from-blue-500 to-blue-400' },
          { icon: <Activity size={28} />, label: 'รายการทดสอบ', count: testItems.length, color: 'from-amber-500 to-amber-400' },
          { icon: <UserCircle size={28} />, label: 'ผู้ใช้ระบบ', count: users.length, color: 'from-purple-500 to-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-white/40 flex flex-col items-center text-center lift-up group">
            <div className={`w-20 h-20 bg-gradient-to-tr ${stat.color} text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-5xl font-black text-slate-800 mb-2">{stat.count}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-10 fade-in bg-transparent">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] shadow-xl flex items-center justify-between border-b-4 border-purple-500 border border-white/40">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-purple-50/80 text-purple-600 rounded-[1.5rem] shadow-sm"><Users size={32} /></div>
           <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">จัดการผู้ใช้งาน</h2>
              <p className="text-sm font-medium text-slate-500">ควบคุมสิทธิ์และตรวจสอบการเข้าใช้งานของผู้ใช้</p>
           </div>
        </div>
        <button onClick={() => handleUserAction()} className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-[1.8rem] text-sm font-black hover:shadow-2xl hover:scale-105 transition-all shadow-xl active:scale-95"><Plus size={22} /> เพิ่มผู้ใช้</button>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-[3.5rem] shadow-xl overflow-hidden border border-white/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b">
              <th className="px-10 py-8">User Profile</th>
              <th className="px-10 py-8">Login ID</th>
              <th className="px-10 py-8">Permission</th>
              <th className="px-10 py-8">Last Login</th>
              <th className="px-10 py-8 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u, i) => (
              <tr key={u.id} className="hover:bg-purple-50/30 transition-colors duration-300">
                <td className="px-10 py-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center font-black text-lg">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 text-base">{u.name}</span>
                   </div>
                </td>
                <td className="px-10 py-6 font-mono text-xs text-slate-500">{u.username}</td>
                <td className="px-10 py-6">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${u.role === Role.ADMIN ? 'bg-indigo-600 text-white' : 'bg-teal-500 text-white'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-10 py-6 text-[11px] font-bold text-slate-400">
                  {u.lastLogin || <span className="italic font-normal">No recent activity</span>}
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleUserAction(u)} className="p-4 text-teal-600 hover:bg-teal-50/50 rounded-2xl transition-all shadow-sm active:scale-90"><Edit2 size={20}/></button>
                    <button onClick={() => handleDelete(u.id, storage.keys.USERS, u.name)} className="p-4 text-red-500 hover:bg-red-50/50 rounded-2xl transition-all shadow-sm active:scale-90"><Trash2 size={20}/></button>
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
    <div className="space-y-10 fade-in bg-transparent">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] shadow-xl flex items-center justify-between border-b-4 border-blue-500 border border-white/40">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-blue-50/80 text-blue-600 rounded-[1.5rem] shadow-sm"><BookOpen size={32} /></div>
           <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">จัดการชั้นเรียน</h2>
              <p className="text-sm font-medium text-slate-500">เพิ่ม ลบ หรือแก้ไขข้อมูลระดับชั้นและห้องเรียน</p>
           </div>
        </div>
        <button onClick={handleAddClass} className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-[1.8rem] text-sm font-black hover:shadow-2xl transition-all shadow-xl active:scale-95"><Plus size={22} /> เพิ่มชั้นเรียน</button>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-[3.5rem] shadow-xl overflow-hidden border border-white/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b">
              <th className="px-10 py-8">Room / Level</th>
              <th className="px-10 py-8 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classes.map((c, i) => (
              <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-10 py-8 font-black text-slate-700 text-lg">{c.name}</td>
                <td className="px-10 py-8 text-center">
                  <button onClick={() => handleDelete(c.id, storage.keys.CLASSES, c.name)} className="p-4 text-red-500 hover:bg-red-50/50 rounded-2xl transition-all shadow-sm active:scale-90"><Trash2 size={22}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-10 fade-in bg-transparent">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] shadow-xl flex items-center justify-between border-b-4 border-amber-500 border border-white/40">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-amber-50/80 text-amber-600 rounded-[1.5rem] shadow-sm"><Activity size={32} /></div>
           <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">รายการทดสอบสมรรถภาพ</h2>
              <p className="text-sm font-medium text-slate-500">กำหนดเกณฑ์การให้คะแนนและวิธีการทดสอบ</p>
           </div>
        </div>
        <button onClick={() => handleTestAction()} className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-300 text-white rounded-[1.8rem] text-sm font-black shadow-xl hover:scale-105 transition-all active:scale-95"><Plus size={22} /> เพิ่มรายการ</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testItems.map(ti => (
          <div key={ti.id} className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-white/60 lift-up relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-3 h-full" style={{ backgroundColor: ITEM_COLORS[ti.id] || '#cbd5e1' }}></div>
             <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="px-5 py-2.5 bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-2xl border border-slate-100">{ti.unit}</div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleTestAction(ti)} className="p-3 text-teal-600 hover:bg-teal-50/50 rounded-2xl transition-all active:scale-90"><Edit2 size={20}/></button>
                     <button onClick={() => handleDelete(ti.id, storage.keys.TEST_ITEMS, ti.name)} className="p-3 text-red-500 hover:bg-red-50/50 rounded-2xl transition-all active:scale-90"><Trash2 size={20}/></button>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">{ti.name}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 flex-1">{ti.description}</p>
                <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ITEM_COLORS[ti.id] }}></div>
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">DPE Standard Registered</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-10 fade-in bg-transparent">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] shadow-xl border-b-4 border-orange-500 flex items-center gap-6 border border-white/40">
        <div className="p-4 bg-orange-50/80 text-orange-600 rounded-[1.5rem] shadow-sm"><ClipboardCheck size={32} /></div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">มอบหมายงานทดสอบ</h2>
          <p className="text-sm font-medium text-slate-500">จัดสรรความรับผิดชอบให้นักเรียนแต่ละชั้นเรียน</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-white/60 lift-up space-y-10">
            <h3 className="font-black text-slate-800 text-xl">สร้างการมอบหมาย</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsible Teacher</label>
                <select className="w-full p-5 bg-white/60 border-2 border-slate-100 rounded-[1.5rem] font-bold text-sm outline-none focus:border-orange-500" value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
                  <option value="">-- เลือกครู --</option>
                  {users.filter(u => u.role === Role.TEACHER).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Class</label>
                <select className="w-full p-5 bg-white/60 border-2 border-slate-100 rounded-[1.5rem] font-bold text-sm outline-none focus:border-orange-500" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                  <option value="">-- เลือกชั้นเรียน --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Selections</label>
                <div className="bg-white/40 backdrop-blur-sm p-6 rounded-[1.8rem] border-2 border-slate-100 space-y-4 max-h-72 overflow-y-auto custom-scrollbar">
                  {testItems.map(ti => (
                    <label key={ti.id} className="flex items-center gap-4 p-3.5 hover:bg-white rounded-2xl cursor-pointer transition-all group">
                      <input type="checkbox" checked={selectedTestItemIds.includes(ti.id)} onChange={() => handleToggleTestItemSelection(ti.id)} className="w-6 h-6 rounded-lg border-2 border-slate-300 text-orange-500 focus:ring-orange-500/20" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-orange-600">{ti.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleConfirmAssignment} className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-400 text-white rounded-[1.8rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all">Assign Tasks</button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-md rounded-[4rem] shadow-xl overflow-hidden border border-white/60">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b">
                  <th className="px-10 py-8">Teacher</th>
                  <th className="px-10 py-8">Room</th>
                  <th className="px-10 py-8">Tests</th>
                  <th className="px-10 py-8 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a, i) => (
                  <tr key={a.id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="px-10 py-6 font-bold text-slate-800 text-base">{users.find(u => u.id === a.teacherId)?.name}</td>
                    <td className="px-10 py-6"><span className="px-5 py-2 bg-white/90 text-orange-600 border-2 border-orange-100 rounded-2xl text-[11px] font-black">{classes.find(c => c.id === a.classId)?.name}</span></td>
                    <td className="px-10 py-6">
                       <div className="flex flex-wrap gap-2">
                          {a.testItemIds.map(id => (
                            <span key={id} className="px-3 py-1 bg-white/80 text-slate-500 rounded-lg text-[9px] font-black border border-slate-100">{testItems.find(t => t.id === id)?.name}</span>
                          ))}
                       </div>
                    </td>
                    <td className="px-10 py-6 text-center"><button onClick={() => handleDelete(a.id, storage.keys.ASSIGNMENTS, 'การมอบหมาย')} className="p-4 text-red-500 hover:bg-red-50/50 rounded-2xl shadow-sm transition-all"><Trash2 size={20}/></button></td>
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
    const selectedStudent = students.find(s => s.id === reportStudentId);
    const studentRecords = records.filter(r => r.studentId === reportStudentId).sort((a,b) => b.date.localeCompare(a.date));
    const latestRecord = studentRecords[0];
    const radarData = latestRecord ? testItems.map(item => {
      const result = latestRecord.results.find(res => res.testItemId === item.id);
      return { subject: item.name, value: result ? Math.min(result.score * 5, 100) : 0, fullMark: 100 };
    }) : [];

    return (
      <div className="space-y-10 fade-in bg-transparent">
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8 border-b-4 border-indigo-600 border border-white/40">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-indigo-50/80 text-indigo-600 rounded-[1.5rem] shadow-sm"><BarChart3 size={32} /></div>
             <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">รายงานผลสมรรถภาพ</h2>
                <p className="text-sm font-medium text-slate-500">วิเคราะห์ข้อมูลเชิงลึกด้วยระบบ Visual Data</p>
             </div>
          </div>
          <div className="flex bg-slate-100/60 backdrop-blur-sm p-2 rounded-[1.8rem] shadow-inner">
            {(['individual', 'class', 'summary'] as const).map((type) => (
              <button key={type} onClick={() => setReportType(type)} className={`px-8 py-3.5 text-xs font-black rounded-[1.4rem] transition-all duration-300 ${reportType === type ? 'bg-indigo-600 text-white shadow-xl translate-y-[-2px]' : 'text-slate-500 hover:text-slate-700'}`}>
                {type === 'individual' ? 'INDIVIDUAL' : type === 'class' ? 'CLASSROOM' : 'SCHOOL SUMMARY'}
              </button>
            ))}
          </div>
        </div>

        {reportType === 'individual' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-10">
              <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-white/60 lift-up group">
                <h3 className="font-black text-slate-800 mb-8 flex items-center gap-4 text-xl"><Search size={26} className="text-indigo-600"/> ค้นหานักเรียน</h3>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Profile</label>
                    <select className="w-full p-5 bg-white/60 border-2 border-slate-100 rounded-[1.8rem] outline-none focus:border-indigo-600 font-bold text-sm" value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)}>
                      <option value="">-- เลือกนักเรียน --</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} ({classes.find(c => c.id === s.classId)?.name})</option>)}
                    </select>
                  </div>
                  {selectedStudent && (
                    <div className="pt-10 border-t border-slate-100 text-center animate-fadeIn">
                      <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-[2.2rem] flex items-center justify-center text-5xl font-black shadow-xl">
                        {selectedStudent.name.charAt(0)}
                      </div>
                      <h4 className="font-black text-2xl text-slate-800">{selectedStudent.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">รหัสประจำตัว: {selectedStudent.studentId}</p>
                      <button 
                        onClick={handleExportIndividual}
                        className="mt-10 w-full flex items-center justify-center gap-3 py-5 bg-indigo-50/80 text-indigo-700 rounded-[1.8rem] text-xs font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white hover:shadow-xl transition-all duration-300"
                      >
                        <FileSpreadsheet size={18} /> EXPORT CSV DATA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
               {latestRecord ? (
                 <div className="bg-white/80 backdrop-blur-md p-12 rounded-[4rem] shadow-xl border border-white/60 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="font-black text-slate-800 text-2xl tracking-tight">Fitness Spider Chart</h3>
                       <button className="flex items-center gap-3 px-6 py-3 bg-white/90 border-2 border-slate-100 text-slate-500 rounded-[1.5rem] text-xs font-black hover:bg-slate-50 transition-all shadow-sm"><Download size={16}/> Print Report</button>
                    </div>
                    <div className="flex-1 min-h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
                          <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 13, fontWeight: '900'}} />
                          <Radar name="สมรรถภาพ" dataKey="value" stroke="#4F46E5" strokeWidth={4} fill="#4F46E5" fillOpacity={0.3} />
                          <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-100/50 p-24 text-slate-300">
                    <BarChart3 size={100} className="mb-10 opacity-10" />
                    <p className="font-black text-3xl mb-3 text-slate-300/50">No Data Found</p>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">กรุณาเลือกนักเรียนที่มีประวัติการทดสอบแล้ว</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {reportType === 'class' && (
           <div className="space-y-10 fade-in bg-transparent">
              <div className="bg-white/80 backdrop-blur-md p-12 rounded-[4rem] shadow-xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Classroom Selector</label>
                  <select 
                    className="w-full p-5 bg-white/60 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-600 font-black text-sm transition-all"
                    value={reportClassId}
                    onChange={(e) => setReportClassId(e.target.value)}
                  >
                    <option value="">-- เลือกชั้นเรียน --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {reportClassId && (
                  <button 
                    onClick={handleExportClass}
                    className="flex items-center justify-center gap-4 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-sm font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <FileSpreadsheet size={22} /> EXPORT CLASSROOM DATA
                  </button>
                )}
              </div>

              {reportClassId ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="bg-white/80 backdrop-blur-md p-12 rounded-[4rem] shadow-xl border border-white/60">
                      <h3 className="font-black text-slate-800 text-2xl mb-12 tracking-tight">Fitness Level Distribution</h3>
                      <div className="h-[400px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.values(FitnessLevel).map(level => ({
                               name: level,
                               count: records.filter(r => {
                                 const student = students.find(s => s.id === r.studentId);
                                 return student?.classId === reportClassId && r.results.some(res => res.level === level);
                               }).length
                            }))}>
                               <XAxis dataKey="name" tick={{fontSize: 11, fontWeight: '900', fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                               <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
                               <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
                               <Bar dataKey="count" fill="#4F46E5" radius={[15, 15, 0, 0]}>
                                  {Object.values(FitnessLevel).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="bg-white/80 backdrop-blur-md rounded-[4rem] shadow-xl border border-white/60 overflow-hidden flex flex-col h-full">
                      <div className="p-10 border-b bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-black text-slate-800 text-xl tracking-tight">Individual Progress Tracking</h3>
                      </div>
                      <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                        <table className="w-full text-left text-sm">
                           <thead className="bg-white/90 sticky top-0 uppercase text-[9px] font-black tracking-[0.2em] z-10 border-b">
                              <tr><th className="px-10 py-6">รายชื่อ</th><th className="px-10 py-6">BMI</th><th className="px-10 py-6 text-center">สถานะ</th></tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {students.filter(s => s.classId === reportClassId).map(s => {
                                const latest = records.filter(r => r.studentId === s.id).sort((a,b) => b.date.localeCompare(a.date))[0];
                                return (
                                  <tr key={s.id} className="hover:bg-indigo-50/20 transition-all">
                                     <td className="px-10 py-6 font-bold text-slate-700">{s.name}</td>
                                     <td className="px-10 py-6 font-black text-indigo-600">{latest?.bmi || '-'}</td>
                                     <td className="px-10 py-6 text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black shadow-sm ${latest ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                          {latest ? 'DONE' : 'PENDING'}
                                        </div>
                                     </td>
                                  </tr>
                                );
                              })}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="py-32 text-center bg-white/80 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-100/50 text-slate-300">
                  <BookOpen size={100} className="mx-auto mb-10 opacity-5" />
                  <p className="font-black text-3xl">กรุณาเลือกชั้นเรียน</p>
                </div>
              )}
           </div>
        )}

        {reportType === 'summary' && (
           <div className="space-y-12 fade-in bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-white/60 flex items-center gap-8 lift-up overflow-hidden relative">
                    <div className="p-6 bg-indigo-100/80 text-indigo-600 rounded-[2rem]"><Users size={32}/></div>
                    <div><p className="text-5xl font-black text-slate-800">{students.length}</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total Students</p></div>
                 </div>
                 <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-white/60 flex items-center gap-8 lift-up overflow-hidden relative">
                    <div className="p-6 bg-purple-100/80 text-purple-600 rounded-[2rem]"><ClipboardCheck size={32}/></div>
                    <div><p className="text-5xl font-black text-slate-800">{records.length}</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total Records</p></div>
                 </div>
                 <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-white/60 flex items-center gap-8 lift-up overflow-hidden relative">
                    <div className="p-6 bg-amber-100/80 text-amber-600 rounded-[2rem]"><TrendingUp size={32}/></div>
                    <div><p className="text-5xl font-black text-slate-800">{(records.length / (students.length || 1) * 100).toFixed(0)}%</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Completion Rate</p></div>
                 </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-12 rounded-[4rem] shadow-xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-10">
                 <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">รายงานสรุปภาพรวมโรงเรียน</h3>
                    <p className="text-slate-500 font-medium mt-2">Export comprehensive dataset for physical health analysis.</p>
                 </div>
                 <button 
                  onClick={handleExportSummary}
                  className="flex items-center justify-center gap-4 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-sm font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <FileSpreadsheet size={24} /> EXPORT SUMMARY REPORT
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="bg-white/80 backdrop-blur-md p-12 rounded-[4.5rem] shadow-xl border border-white/60 lift-up group">
                    <h3 className="font-black text-slate-800 text-2xl mb-14 tracking-tight text-center uppercase tracking-widest">BMI Analysis Distribution</h3>
                    <div className="h-[450px]">
                       {summaryStats?.bmiStats && summaryStats.bmiStats.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={summaryStats.bmiStats} innerRadius={100} outerRadius={140} paddingAngle={10} dataKey="value">
                                {summaryStats.bmiStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} stroke="none" />)}
                              </Pie>
                              <Tooltip contentStyle={{borderRadius: '25px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                              <Legend verticalAlign="bottom" height={40} iconType="circle" />
                            </PieChart>
                          </ResponsiveContainer>
                       ) : (
                          <div className="h-full flex items-center justify-center text-slate-300">No Statistics Available</div>
                       )}
                    </div>
                 </div>
                 <div className="bg-white/80 backdrop-blur-md p-12 rounded-[4.5rem] shadow-xl border border-white/60 lift-up group">
                    <h3 className="font-black text-slate-800 text-2xl mb-14 tracking-tight text-center uppercase tracking-widest">Global Quality Metrics</h3>
                    <div className="h-[450px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={summaryStats?.levelStats || []} layout="vertical">
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" tick={{fontSize: 12, fontWeight: '900', fill: '#64748b'}} axisLine={false} tickLine={false} />
                             <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '20px', border: 'none'}} />
                             <Bar dataKey="count" radius={[0, 20, 20, 0]}>
                                {(summaryStats?.levelStats || []).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  };

  const renderStudentsManagement = () => (
    <div className="space-y-10 fade-in bg-transparent">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3.5rem] shadow-xl border-b-4 border-pink-500 flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-white/40">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-pink-50/80 text-pink-600 rounded-[1.5rem] shadow-sm"><Users2 size={32} /></div>
           <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">จัดการข้อมูลนักเรียน</h2>
              <p className="text-sm font-medium text-slate-500">จัดการทะเบียนประวัตินักเรียนทุกระดับชั้น</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <select className="px-6 py-5 bg-white/60 border-2 border-slate-100 rounded-[1.8rem] text-sm font-black outline-none focus:border-pink-500 min-w-[200px]" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
            <option value="">ทุกระดับชั้น</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => handleAddStudent()} className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-pink-600 to-pink-400 text-white rounded-[1.8rem] text-sm font-black shadow-xl hover:scale-105 transition-all"><UserPlus size={20}/> เพิ่มรายคน</button>
          <button onClick={bulkAddStudents} className="flex items-center gap-3 px-10 py-5 bg-slate-100/80 text-slate-600 rounded-[1.8rem] text-sm font-black hover:bg-slate-200/80 transition-all"><ClipboardList size={20}/> เพิ่มแบบกลุ่ม</button>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-[3.5rem] shadow-xl overflow-hidden border border-white/60">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b">
              <th className="px-10 py-8">Student ID</th>
              <th className="px-10 py-8">Full Name</th>
              <th className="px-10 py-8 text-center">Gender</th>
              <th className="px-10 py-8">Room</th>
              <th className="px-10 py-8">Stats (W/H)</th>
              <th className="px-10 py-8 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.filter(s => !selectedClassId || s.classId === selectedClassId).map((s, i) => (
              <tr key={s.id} className="hover:bg-pink-50/20 transition-all group">
                <td className="px-10 py-6 font-black text-pink-500 font-mono text-base">{s.studentId}</td>
                <td className="px-10 py-6 font-bold text-slate-700 text-base">{s.name}</td>
                <td className="px-10 py-6 text-center">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${s.gender === Gender.MALE ? 'bg-blue-600 text-white' : 'bg-pink-500 text-white'}`}>
                    {s.gender}
                  </span>
                </td>
                <td className="px-10 py-6 font-bold text-slate-400">{classes.find(c => c.id === s.classId)?.name}</td>
                <td className="px-10 py-6">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-600">{s.weight || '-'} KG</span>
                    <span className="text-[11px] font-bold text-slate-300">{s.height || '-'} CM</span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleAddStudent(s)} className="p-4 text-teal-600 hover:bg-teal-50/50 rounded-2xl transition-all shadow-sm active:scale-90"><Edit2 size={20}/></button>
                    <button onClick={() => handleDelete(s.id, storage.keys.STUDENTS, s.name)} className="p-4 text-red-500 hover:bg-red-50/50 rounded-2xl transition-all shadow-sm active:scale-90"><Trash2 size={20}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  async function handleUserAction(u?: User) {
    const isEdit = !!u;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่',
      html: `
        <div class="text-left space-y-4 px-2 font-kanit">
          <input id="swal-name" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="ชื่อ-นามสกุล" value="${u?.name || ''}">
          <input id="swal-username" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="Username" value="${u?.username || ''}">
          <input id="swal-password" type="password" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="Password" value="${u?.password || ''}">
          <select id="swal-role" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100">
            <option value="${Role.TEACHER}" ${u?.role === Role.TEACHER ? 'selected' : ''}>คุณครู (Teacher)</option>
            <option value="${Role.ADMIN}" ${u?.role === Role.ADMIN ? 'selected' : ''}>ผู้ดูแลระบบ (Admin)</option>
          </select>
        </div>
      `,
      confirmButtonColor: '#9333EA',
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
        Swal.fire({ title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกชื่อและชื่อผู้ใช้', icon: 'error', customClass: { popup: 'rounded-[2rem]' } });
        return;
      }
      const current = storage.get(storage.keys.USERS, []);
      if (isEdit) {
        storage.set(storage.keys.USERS, current.map((item: User) => item.id === u.id ? { ...item, ...formValues } : item));
      } else {
        storage.set(storage.keys.USERS, [...current, { id: Date.now().toString(), ...formValues, lastLogin: null }]);
      }
      loadAll();
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลเรียบร้อยแล้ว', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
    }
  }

  async function handleAddStudent(s?: Student) {
    const isEdit = !!s;
    const { value: formValues } = await Swal.fire({
      title: isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่',
      html: `
        <div class="text-left space-y-4 px-2 font-kanit">
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสประจำตัว</label>
            <input id="swal-sid" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="รหัสประจำตัว" value="${s?.studentId || ''}">
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
            <input id="swal-sname" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="ชื่อ-นามสกุล" value="${s?.name || ''}">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เพศ</label>
              <select id="swal-sgender" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100">
                <option value="${Gender.MALE}" ${s?.gender === Gender.MALE ? 'selected' : ''}>ชาย</option>
                <option value="${Gender.FEMALE}" ${s?.gender === Gender.FEMALE ? 'selected' : ''}>หญิง</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันเกิด</label>
              <input id="swal-sbdate" type="date" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" value="${s?.birthDate || ''}">
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชั้นเรียน</label>
            <select id="swal-sclass" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100">
              <option value="">-- เลือกชั้น --</option>
              ${classes.map(c => `<option value="${c.id}" ${s?.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">น้ำหนักปัจจุบัน (กก.)</label>
              <input id="swal-sweight" type="number" step="0.1" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="น้ำหนัก" value="${s?.weight || ''}">
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ส่วนสูงปัจจุบัน (ซม.)</label>
              <input id="swal-sheight" type="number" step="0.1" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="ส่วนสูง" value="${s?.height || ''}">
            </div>
          </div>
        </div>
      `,
      confirmButtonColor: '#EC4899',
      confirmButtonText: 'บันทึกข้อมูล',
      preConfirm: () => ({
        studentId: (document.getElementById('swal-sid') as HTMLInputElement).value,
        name: (document.getElementById('swal-sname') as HTMLInputElement).value,
        gender: (document.getElementById('swal-sgender') as HTMLSelectElement).value,
        birthDate: (document.getElementById('swal-sbdate') as HTMLInputElement).value,
        classId: (document.getElementById('swal-sclass') as HTMLSelectElement).value,
        weight: parseFloat((document.getElementById('swal-sweight') as HTMLInputElement).value) || undefined,
        height: parseFloat((document.getElementById('swal-sheight') as HTMLInputElement).value) || undefined,
      })
    });

    if (formValues) {
      if (!formValues.studentId || !formValues.name || !formValues.classId) {
        Swal.fire({ title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', icon: 'error', customClass: { popup: 'rounded-[2rem]' } });
        return;
      }
      const current = storage.get(storage.keys.STUDENTS, []);
      if (isEdit) {
        storage.set(storage.keys.STUDENTS, current.map((item: Student) => item.id === s.id ? { ...item, ...formValues } : item));
      } else {
        storage.set(storage.keys.STUDENTS, [...current, { id: 's' + Date.now(), ...formValues }]);
      }
      loadAll();
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลเรียบร้อยแล้ว', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
    }
  }

  async function handleAddClass() {
    const { value: name } = await Swal.fire({
      title: 'เพิ่มชั้นเรียน',
      input: 'text',
      inputLabel: 'ชื่อระดับชั้น / ห้องเรียน',
      inputPlaceholder: 'เช่น ป.1/1',
      confirmButtonColor: '#2563EB',
      showCancelButton: true,
      customClass: { popup: 'rounded-[3rem] p-8' }
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
      title: isEdit ? 'แก้ไขรายการทดสอบ' : 'เพิ่มรายการใหม่',
      html: `
        <div class="text-left space-y-4 px-2 font-kanit">
          <input id="swal-tiname" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="ชื่อรายการ" value="${ti?.name || ''}">
          <input id="swal-tiunit" class="swal2-input w-full m-0 rounded-2xl border-2 border-slate-100" placeholder="หน่วยวัด" value="${ti?.unit || ''}">
          <textarea id="swal-tidesc" class="swal2-textarea w-full m-0 rounded-[1.8rem] border-2 border-slate-100" placeholder="คำอธิบาย">${ti?.description || ''}</textarea>
        </div>
      `,
      confirmButtonColor: '#F59E0B',
      confirmButtonText: 'บันทึกรายการ',
      customClass: { popup: 'rounded-[3.5rem] p-10' },
      preConfirm: () => ({
        name: (document.getElementById('swal-tiname') as HTMLInputElement).value,
        unit: (document.getElementById('swal-tiunit') as HTMLInputElement).value,
        description: (document.getElementById('swal-tidesc') as HTMLTextAreaElement).value,
      })
    });
    if (formValues) {
      if (!formValues.name || !formValues.unit) {
        Swal.fire({ title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกชื่อรายการและหน่วยวัด', icon: 'error', customClass: { popup: 'rounded-[2rem]' } });
        return;
      }
      const current = storage.get(storage.keys.TEST_ITEMS, []);
      if (isEdit) {
        storage.set(storage.keys.TEST_ITEMS, current.map((item: TestItem) => item.id === ti.id ? { ...item, ...formValues } : item));
      } else {
        storage.set(storage.keys.TEST_ITEMS, [...current, { id: 'ti' + Date.now(), ...formValues }]);
      }
      loadAll();
      Swal.fire({ title: 'สำเร็จ', text: 'บันทึกข้อมูลเรียบร้อยแล้ว', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
    }
  }

  function handleToggleTestItemSelection(id: string) { 
    setSelectedTestItemIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); 
  }

  function handleConfirmAssignment() {
    if (!selectedTeacherId || !selectedClassId || selectedTestItemIds.length === 0) {
      Swal.fire({ title: 'ข้อมูลไม่ครบ', text: 'กรุณาเลือกครู ชั้นเรียน และรายการทดสอบ', icon: 'warning', customClass: { popup: 'rounded-[2rem]' } });
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
    Swal.fire({ title: 'สำเร็จ', text: 'มอบหมายงานเรียบร้อยแล้ว', icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
  }

  async function bulkAddStudents() {
    const { value: text } = await Swal.fire({
      title: 'นำเข้าข้อมูลแบบกลุ่ม',
      input: 'textarea',
      inputLabel: 'รูปแบบ: รหัส,ชื่อ,เพศ(M/F),วันเกิด(YYYY-MM-DD)',
      inputPlaceholder: '1001,นายสมชาย ใจดี,M,2010-05-15\n1002,นางสาวใจดี รักเรียน,F,2010-06-20',
      confirmButtonColor: '#EC4899',
      confirmButtonText: 'นำเข้าข้อมูล',
      showCancelButton: true,
      customClass: { popup: 'rounded-[3rem] p-8' }
    });
    if (text) {
      if (!selectedClassId) {
        Swal.fire({ title: 'ระบุชั้นเรียน', text: 'กรุณาเลือกชั้นเรียนจาก Dropdown เพื่อกำหนดกลุ่มเป้าหมาย', icon: 'warning', customClass: { popup: 'rounded-[2rem]' } });
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
      Swal.fire({ title: 'สำเร็จ', text: `นำเข้านักเรียน ${newStudents.length} คนเรียบร้อยแล้ว`, icon: 'success', customClass: { popup: 'rounded-[2rem]' } });
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 bg-transparent">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'classes' && renderClasses()}
      {activeTab === 'students' && renderStudentsManagement()}
      {activeTab === 'tests' && renderTests()}
      {activeTab === 'assignments' && renderAssignments()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default AdminViews;
