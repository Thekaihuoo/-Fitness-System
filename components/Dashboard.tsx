
import React, { useState } from 'react';
import { User, Role } from '../types';
import { LayoutDashboard, Users, Users2, BookOpen, ClipboardCheck, LogOut, Menu, X, Settings, Activity, BarChart3, Heart } from 'lucide-react';
import AdminDashboard from './AdminViews';
import TeacherDashboard from './TeacherViews';
import StudentDashboard from './StudentViews';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const adminMenu = [
    { id: 'home', icon: <LayoutDashboard size={20} />, label: 'แผงควบคุม' },
    { id: 'users', icon: <Users size={20} />, label: 'จัดการผู้ใช้งาน' },
    { id: 'classes', icon: <BookOpen size={20} />, label: 'จัดการชั้นเรียน' },
    { id: 'students', icon: <Users2 size={20} />, label: 'จัดการนักเรียน' },
    { id: 'tests', icon: <Activity size={20} />, label: 'รายการทดสอบ' },
    { id: 'assignments', icon: <ClipboardCheck size={20} />, label: 'มอบหมายงาน' },
    { id: 'reports', icon: <BarChart3 size={20} />, label: 'รายงานผล' },
  ];

  const teacherMenu = [
    { id: 'home', icon: <LayoutDashboard size={20} />, label: 'บันทึกคะแนน' },
    { id: 'reports', icon: <BarChart3 size={20} />, label: 'รายงานผล' },
    { id: 'profile', icon: <Settings size={20} />, label: 'โปรไฟล์' },
  ];

  const studentMenu = [
    { id: 'home', icon: <LayoutDashboard size={20} />, label: 'ผลการทดสอบ' },
  ];

  const currentMenu = user.role === Role.ADMIN ? adminMenu : user.role === Role.TEACHER ? teacherMenu : studentMenu;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-kanit">
      {/* Sidebar - Mobile Toggle Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1.5 rounded-2xl shadow-lg lift-up">
                <img src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-black text-lg leading-tight uppercase tracking-tight">DPE System</h1>
                <p className="text-[9px] text-teal-100 font-black tracking-[0.15em] uppercase opacity-80">Fitness 2019</p>
              </div>
            </div>
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 px-4 py-8 overflow-y-auto space-y-1.5">
            {currentMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all duration-300 ${activeTab === item.id ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-xl shadow-teal-600/20 translate-x-1' : 'text-slate-400 hover:bg-teal-50 hover:text-teal-600'}`}
              >
                <span className={`${activeTab === item.id ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-6 mt-auto">
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal_custom to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] uppercase font-black text-teal_custom tracking-widest">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-red_custom font-black text-sm hover:bg-red-50 rounded-[1.5rem] transition-all active:scale-95 border-2 border-transparent hover:border-red-100"
            >
              <LogOut size={20} />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-xl px-8 flex items-center justify-between lg:justify-end shrink-0 shadow-sm z-30 border-b border-slate-100">
          <button className="lg:hidden p-3 text-teal-600 bg-teal-50 rounded-2xl shadow-sm lift-up" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="hidden lg:flex items-center gap-6">
             <div className="px-5 py-2 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black border-2 border-teal-100 uppercase tracking-[0.15em] shadow-sm">
               Digital Fitness Ecosystem
             </div>
            <span className="text-xs font-black text-slate-300 italic">v1.2.8 Premium Standard</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 fade-in flex flex-col">
          <div className="flex-1">
            {user.role === Role.ADMIN && <AdminDashboard activeTab={activeTab} />}
            {user.role === Role.TEACHER && <TeacherDashboard activeTab={activeTab} user={user} />}
            {user.role === Role.STUDENT && <StudentDashboard studentUser={user} />}
          </div>
          
          {/* Footer Branding */}
          <footer className="mt-16 py-10 border-t border-slate-200 flex flex-col items-center justify-center gap-3 opacity-60">
            <div className="flex items-center gap-3 text-sm font-black text-slate-700">
              <span className="tracking-wide">Freeman @ Cpoy Right Krukai</span>
              <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase">ฝากแชร์ ฝากติดตามด้วยนะครับ</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
