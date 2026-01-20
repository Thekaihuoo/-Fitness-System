
import React, { useMemo } from 'react';
import { User, Student, FitnessRecord, FitnessLevel } from '../types';
import { storage } from '../utils/storage';
import { TEST_ITEMS, ITEM_COLORS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Activity, Weight, Ruler, BarChart2, Star, Target, Zap, ChevronRight, UserCircle, Heart } from 'lucide-react';

interface StudentViewsProps {
  studentUser: User;
}

const StudentViews: React.FC<StudentViewsProps> = ({ studentUser }) => {
  const studentData = useMemo(() => {
    const allStudents: Student[] = storage.get(storage.keys.STUDENTS, []);
    return allStudents.find(s => s.studentId === studentUser.studentId);
  }, [studentUser.studentId]);

  const latestRecord = useMemo(() => {
    const allRecords: FitnessRecord[] = storage.get(storage.keys.RECORDS, []);
    const studentRecords = allRecords
      .filter(r => r.studentId === studentUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return studentRecords[0] || null;
  }, [studentUser.id]);

  const performanceData = useMemo(() => {
    if (!latestRecord) {
      return TEST_ITEMS.map(i => ({ subject: i.name, value: 0, fullMark: 100 }));
    }

    return TEST_ITEMS.map(item => {
      const scoreData = latestRecord.results.find(r => r.testItemId === item.id);
      let value = scoreData ? Math.min(scoreData.score * 5, 100) : 0;
      if (item.id === 'bmi') value = latestRecord.bmi > 0 ? 80 : 0;
      return {
        subject: item.name,
        value: value,
        fullMark: 100
      };
    });
  }, [latestRecord]);

  const summary = useMemo(() => {
    const weight = latestRecord?.weight || studentData?.weight || 0;
    const height = latestRecord?.height || studentData?.height || 0;
    
    let bmi = 0;
    if (weight > 0 && height > 0) {
      const hInMeters = height / 100;
      bmi = parseFloat((weight / (hInMeters * hInMeters)).toFixed(2));
    }

    const status = bmi > 0 ? (bmi < 18.5 ? 'ผอม' : bmi < 23 ? 'สมส่วน' : 'เริ่มอ้วน') : '-';
    
    return {
      weight,
      height,
      bmi: latestRecord?.bmi || bmi || 0,
      status
    };
  }, [latestRecord, studentData]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 fade-in pb-16">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border-0 flex flex-col items-center text-center lift-up group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform"></div>
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-blue-300 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 relative z-10">
            <Weight size={32} />
          </div>
          <p className="text-5xl font-black text-slate-800 mb-1 relative z-10">{summary.weight || '-'}</p>
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest relative z-10">น้ำหนัก (กิโลกรัม)</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border-0 flex flex-col items-center text-center lift-up group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform"></div>
          <div className="w-16 h-16 bg-gradient-to-tr from-amber_custom to-amber-300 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 relative z-10">
            <Ruler size={32} />
          </div>
          <p className="text-5xl font-black text-slate-800 mb-1 relative z-10">{summary.height || '-'}</p>
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest relative z-10">ส่วนสูง (เซนติเมตร)</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border-0 flex flex-col items-center text-center lift-up group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform"></div>
          <div className="w-16 h-16 bg-gradient-to-tr from-teal_custom to-teal-300 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 relative z-10">
            <Activity size={32} />
          </div>
          <p className="text-5xl font-black text-slate-800 mb-1 relative z-10">{summary.bmi || '-'}</p>
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest relative z-10">BMI ({summary.status})</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Profile Card */}
        <div className="lg:w-1/3">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border-0 text-center relative overflow-hidden lift-up h-full">
            <div className="absolute top-0 left-0 w-32 h-32 bg-slate-50 rounded-full -ml-16 -mt-16 opacity-50 z-0"></div>
            <div className="relative z-10">
              <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-teal_custom via-teal-500 to-green_custom rounded-[3rem] flex items-center justify-center text-white text-5xl font-black mb-8 shadow-2xl shadow-teal-500/30">
                {studentUser.name.charAt(0)}
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">{studentUser.name}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">รหัสประจำตัว: {studentUser.studentId}</p>
              
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Health Profile Status</p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-5 py-2 rounded-2xl text-xs font-black shadow-sm ${summary.status === 'สมส่วน' ? 'bg-teal_custom text-white' : 'bg-amber_custom text-white'}`}>
                    {summary.status === '-' ? 'ยังไม่มีข้อมูล' : summary.status}
                  </span>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-slate-300">
                <Star size={16} className="fill-current" />
                <Star size={16} className="fill-current" />
                <Star size={16} className="fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="lg:flex-1 space-y-12">
          {/* Spider Chart Section */}
          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-0 lift-up overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target size={120} />
             </div>
             <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Target size={28} className="text-teal_custom" />
                  ภาพรวมสมรรถภาพ
                </h3>
                <div className="px-5 py-2 bg-teal-50 text-[10px] font-black text-teal-600 rounded-xl border-2 border-teal-100 uppercase tracking-widest">DPE Standard 2024</div>
             </div>
             <div className="h-[400px] w-full relative z-10">
                {latestRecord ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                      <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                      <Radar
                        name="Fitness Progress"
                        dataKey="value"
                        stroke="#26A69A"
                        strokeWidth={4}
                        fill="#26A69A"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-200">
                    <BarChart2 size={120} className="mb-6 opacity-5" />
                    <p className="text-2xl font-black text-slate-300">รอกำหนดรายการทดสอบ</p>
                  </div>
                )}
             </div>
          </div>

          {/* Test Detail Cards */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 ml-2">
              <Zap size={28} className="text-amber_custom fill-amber_custom" />
              รายละเอียดผลการทดสอบ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {latestRecord ? latestRecord.results.map((res) => {
                 const item = TEST_ITEMS.find(i => i.id === res.testItemId);
                 if (!item) return null;
                 const themeColor = ITEM_COLORS[item.id] || '#cbd5e1';
                 return (
                   <div key={res.testItemId} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-0 lift-up overflow-hidden relative group">
                     <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 group-hover:scale-125 transition-transform" style={{ backgroundColor: themeColor }}></div>
                     <div className="absolute left-0 top-0 w-2 h-full" style={{ backgroundColor: themeColor }}></div>
                     
                     <div className="flex justify-between items-start mb-6">
                       <div className="p-3 rounded-2xl" style={{ backgroundColor: `${themeColor}20` }}>
                          <Activity size={24} style={{ color: themeColor }} />
                       </div>
                       <div className="text-right">
                         <span className="px-3 py-1 rounded-full text-[9px] font-black text-white shadow-md uppercase tracking-tighter" style={{ backgroundColor: themeColor }}>ระดับ: {res.level}</span>
                       </div>
                     </div>
                     
                     <h4 className="text-xl font-black text-slate-800 mb-2">{item.name}</h4>
                     
                     <div className="flex items-end justify-between mt-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">สถิติที่ทำได้</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black" style={{ color: themeColor }}>{res.score}</span>
                            <span className="text-sm font-bold text-slate-400">{item.unit}</span>
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                          <ChevronRight size={20} className="text-slate-300" />
                        </div>
                     </div>
                   </div>
                 );
               }) : (
                 <div className="col-span-full py-20 bg-white rounded-[3rem] text-center border-4 border-dashed border-slate-50">
                    <Activity size={64} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-slate-300 font-bold text-lg">คุณครูยังไม่ได้บันทึกผลการทดสอบสมรรถภาพ</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentViews;
