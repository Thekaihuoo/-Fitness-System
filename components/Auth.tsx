
import React, { useState } from 'react';
import { User, Role } from '../types';
import { storage } from '../utils/storage';
import { ShieldCheck, GraduationCap, ArrowRight, Heart, Sparkles, Activity } from 'lucide-react';
import Swal from 'sweetalert2';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [tab, setTab] = useState<'staff' | 'student'>('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users: User[] = storage.get(storage.keys.USERS, []);
    const userIndex = users.findIndex(u => u.username === username && u.password === password && (u.role === Role.ADMIN || u.role === Role.TEACHER));
    
    if (userIndex !== -1) {
      const now = new Date().toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Update lastLogin in storage for User Management
      users[userIndex].lastLogin = now;
      storage.set(storage.keys.USERS, users);
      
      onLogin(users[userIndex]);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        confirmButtonColor: '#26A69A',
        customClass: {
          popup: 'rounded-[2rem]'
        }
      });
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const students = storage.get(storage.keys.STUDENTS, []);
    const student = students.find((s: any) => s.studentId === studentId);
    
    if (student) {
      onLogin({
        id: student.id,
        username: student.studentId,
        name: student.name,
        role: Role.STUDENT,
        studentId: student.studentId
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบรหัสนักเรียน',
        text: 'กรุณาตรวจสอบรหัสประจำตัวอีกครั้ง',
        confirmButtonColor: '#26A69A',
        customClass: {
          popup: 'rounded-[2rem]'
        }
      });
    }
  };

  return (
    <div className="dynamic-bg flex flex-col items-center justify-center min-h-screen px-4 font-kanit relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-teal_custom/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-amber_custom/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="w-full max-w-md glass rounded-[3.5rem] shadow-premium overflow-hidden fade-in relative z-10 border border-white/50">
        <div className="p-10 text-center relative overflow-hidden">
          <div className="absolute top-4 right-6 text-amber_custom/50 animate-bounce">
            <Sparkles size={28} />
          </div>
          
          <div className="inline-flex p-4 mb-8 bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl lift-up border border-slate-100 ring-8 ring-white/20">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" 
              alt="DPE Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight flex items-center justify-center gap-3">
            DPE FITNESS <Activity className="text-teal_custom" size={32} />
          </h1>
          <p className="text-slate-500 font-extrabold uppercase tracking-[0.2em] text-[10px] mt-2 opacity-80">
            Student Physical Fitness System
          </p>
        </div>

        <div className="flex bg-white/20 border-t border-b border-white/30 backdrop-blur-sm">
          <button
            onClick={() => setTab('staff')}
            className={`flex-1 py-6 text-sm font-black transition-all flex items-center justify-center gap-2 border-r border-white/20 ${tab === 'staff' ? 'bg-white text-teal_custom' : 'text-slate-500 hover:bg-white/40'}`}
          >
            <ShieldCheck size={20} className={tab === 'staff' ? 'animate-pulse' : ''} />
            ครู / ผู้ดูแล
          </button>
          <button
            onClick={() => setTab('student')}
            className={`flex-1 py-6 text-sm font-black transition-all flex items-center justify-center gap-2 ${tab === 'student' ? 'bg-white text-teal_custom' : 'text-slate-500 hover:bg-white/40'}`}
          >
            <GraduationCap size={20} className={tab === 'student' ? 'animate-pulse' : ''} />
            นักเรียน
          </button>
        </div>

        <div className="p-10 bg-white/60 backdrop-blur-md">
          {tab === 'staff' ? (
            <form onSubmit={handleStaffLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-5 bg-white/80 border-2 border-slate-100 rounded-3xl shadow-sm focus:ring-8 focus:ring-teal_custom/10 focus:border-teal_custom outline-none transition-all text-slate-700 font-bold placeholder:text-slate-300"
                  placeholder="ระบุชื่อผู้ใช้งาน"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-5 bg-white/80 border-2 border-slate-100 rounded-3xl shadow-sm focus:ring-8 focus:ring-teal_custom/10 focus:border-teal_custom outline-none transition-all text-slate-700 font-bold placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-5 mt-6 text-white font-black text-sm uppercase tracking-widest bg-gradient-to-r from-teal_custom via-teal-500 to-green_custom rounded-3xl hover:shadow-2xl hover:shadow-teal-500/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                เข้าสู่ระบบ <ArrowRight size={20} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสประจำตัวนักเรียน</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full p-6 bg-white/80 border-2 border-slate-100 rounded-3xl shadow-sm focus:ring-8 focus:ring-amber_custom/10 focus:border-amber_custom outline-none transition-all text-slate-800 font-black text-center text-3xl tracking-[0.2em] placeholder:text-slate-200"
                  placeholder="00000"
                  required
                />
              </div>
              <div className="p-6 bg-amber-50/50 rounded-3xl border-2 border-amber-100/50 flex items-start gap-4">
                <div className="shrink-0 p-3 bg-amber_custom rounded-2xl text-white shadow-lg shadow-amber-500/30">
                  <Sparkles size={20} />
                </div>
                <p className="text-xs text-amber-800 font-bold leading-relaxed">กรุณากรอกรหัสประจำตัวเพื่อเข้าดูข้อมูลสมรรถภาพทางกายย้อนหลังและกราฟสรุปผลรายบุคคล</p>
              </div>
              <button
                type="submit"
                className="w-full py-5 mt-6 text-white font-black text-sm uppercase tracking-widest bg-gradient-to-r from-amber_custom via-orange_custom to-red_custom rounded-3xl hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                เข้าสู่ระบบนักเรียน <ArrowRight size={20} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Credit Section */}
      <footer className="mt-16 py-8 flex flex-col items-center justify-center gap-3 relative z-10 fade-in">
        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
          <span className="text-sm font-black text-white tracking-wide">Freeman @ Cpoy Right Krukai</span>
          <Heart size={18} className="text-red-500 fill-red-500 animate-pulse" />
        </div>
        <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.3em] bg-black/5 px-4 py-1 rounded-full">
          ฝากแชร์ ฝากติดตามด้วยนะครับ
        </p>
      </footer>
    </div>
  );
};

export default Login;
