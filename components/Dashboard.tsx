
import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  LayoutDashboard, Users, Users2, BookOpen, 
  ClipboardCheck, LogOut, Menu, X, Settings, 
  Activity, BarChart3, Heart, Sparkles, GraduationCap 
} from 'lucide-react';
import AdminDashboard from './AdminViews';
import TeacherDashboard from './TeacherViews';
import StudentDashboard from './StudentViews';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const adminMenu: MenuItem[] = [
    { id: 'home', icon: <LayoutDashboard size={22} />, label: 'แผงควบคุม', color: 'from-teal-500 to-teal-400' },
    { id: 'users', icon: <Users size={22} />, label: 'จัดการผู้ใช้งาน', color: 'from-purple-600 to-purple-400' },
    { id: 'classes', icon: <BookOpen size={22} />, label: 'จัดการชั้นเรียน', color: 'from-blue-600 to-blue-400' },
    { id: 'students', icon: <Users2 size={22} />, label: 'จัดการนักเรียน', color: 'from-pink-500 to-pink-400' },
    { id: 'tests', icon: <Activity size={22} />, label: 'รายการทดสอบ', color: 'from-amber-500 to-amber-400' },
    { id: 'assignments', icon: <ClipboardCheck size={22} />, label: 'มอบหมายงาน', color: 'from-orange-600 to-orange-400' },
    { id: 'reports', icon: <BarChart3 size={22} />, label: 'รายงานผล', color: 'from-indigo-600 to-indigo-400' },
  ];

  const teacherMenu: MenuItem[] = [
    { id: 'home', icon: <ClipboardCheck size={22} />, label: 'บันทึกคะแนน', color: 'from-teal-600 to-teal-400' },
    { id: 'reports', icon: <BarChart3 size={22} />, label: 'รายงานผล', color: 'from-indigo-600 to-indigo-400' },
    { id: 'profile', icon: <Settings size={22} />, label: 'โปรไฟล์', color: 'from-slate-600 to-slate-400' },
  ];

  const studentMenu: MenuItem[] = [
    { id: 'home', icon: <GraduationCap size={22} />, label: 'ผลการทดสอบ', color: 'from-teal-600 to-teal-400' },
  ];

  const currentMenu = user.role === Role.ADMIN ? adminMenu : user.role === Role.TEACHER ? teacherMenu : studentMenu;

  return (
    <div className="flex h-screen overflow-hidden font-kanit bg-transparent">
      {/* Sidebar - Mobile Toggle Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 sidebar-glass border-r border-white/40 shadow-2xl transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-purple-500 to-amber-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-20 h-20 bg-white p-2.5 rounded-[2.2rem] shadow-xl lift-up">
                <img src="https://img5.pic.in.th/file/secure-sv1/-668e94e3b2fda05e3.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-none">DPE FITNESS</h1>
              <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] mt-2 opacity-80">Smart Evaluation</p>
            </div>
            <button className="lg:hidden absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-6 py-4 overflow-y-auto space-y-3 custom-scrollbar">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">เมนูหลัก / Menu</p>
            {currentMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full group relative flex items-center gap-4 px-6 py-4 rounded-[1.8rem] text-sm font-bold transition-all duration-300 overflow-hidden ${
                  activeTab === item.id 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-teal-500/20 translate-x-1` 
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                {activeTab === item.id && (
                  <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>
                )}
                
                <span className={`${activeTab === item.id ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'} transition-transform duration-300`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.label}</span>
                
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer - User Profile */}
          <div className="p-8 mt-auto">
            <div className="relative overflow-hidden p-6 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white/60 flex items-center gap-4 mb-6 group transition-all hover:bg-white hover:shadow-xl">
              <div className="relative w-14 h-14 shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-teal_custom to-purple-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-teal_custom to-teal-400 flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:rotate-6 transition-transform">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                  <p className="text-[10px] uppercase font-black text-teal-600 tracking-widest">{user.role}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-[1.8rem] transition-all active:scale-95 border-2 border-transparent hover:border-red-100"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-transparent">
        {/* Header Navigation */}
        <header className="h-24 bg-white/30 backdrop-blur-2xl px-10 flex items-center justify-between lg:justify-end shrink-0 z-30 border-b border-white/20">
          <button className="lg:hidden p-4 text-teal-600 bg-white/60 rounded-2xl shadow-sm lift-up active:scale-90 transition-all" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="hidden lg:flex items-center gap-8">
             <div className="flex items-center gap-2 px-6 py-2.5 bg-white/60 border-2 border-white/80 rounded-full shadow-sm text-[10px] font-black text-slate-500 uppercase tracking-widest">
               <Sparkles size={14} className="text-amber-500" />
               Current Term: 2/2567
             </div>
             <div className="px-6 py-2.5 bg-teal-50/60 text-teal-700 rounded-full text-[10px] font-black border-2 border-teal-100 uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
               <Activity size={14} />
               Health Ecosystem
             </div>
            <span className="text-[10px] font-black text-slate-400 italic uppercase tracking-tighter">Premium v1.3.2</span>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-14 custom-scrollbar bg-transparent">
          <div className="flex-1 min-h-[calc(100vh-200px)]">
            {user.role === Role.ADMIN && <AdminDashboard activeTab={activeTab} />}
            {user.role === Role.TEACHER && <TeacherDashboard activeTab={activeTab} user={user} />}
            {user.role === Role.STUDENT && <StudentDashboard studentUser={user} />}
          </div>
          
          {/* Dashboard Footer Branding */}
          <footer className="mt-20 py-12 border-t border-slate-300/30 flex flex-col items-center justify-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 text-sm font-black text-slate-800">
              <span className="tracking-wide">Freeman @ Cpoy Right Krukai</span>
              <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
               <span className="w-12 h-px bg-slate-400"></span>
               <p className="text-[10px] font-bold text-slate-600 tracking-[0.3em] uppercase">ฝากแชร์ ฝากติดตามด้วยนะครับ</p>
               <span className="w-12 h-px bg-slate-400"></span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
