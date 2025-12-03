import React, { useState, useEffect } from 'react';
import { FaDumbbell, FaUtensils, FaRobot, FaRedo, FaCheckCircle, FaFire } from 'react-icons/fa';
import { MOCK_AI_PLAN } from './ai_data_mock'; // Import dữ liệu giả

const AIPlanDashboard = () => {
    // State giả lập quá trình loading của AI
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');

    // Giả lập hiệu ứng AI đang suy nghĩ
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000); // 3 giây
        return () => clearTimeout(timer);
    }, []);

    // --- MÀN HÌNH CHỜ (LOADING SCREEN) ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-teal-400 rounded-full animate-spin"></div>
                    <FaRobot className="absolute inset-0 m-auto text-4xl text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 animate-pulse text-center">VietLife AI đang thiết kế lộ trình...</h2>
                <div className="flex flex-col gap-2 text-sm text-teal-300/70 text-center">
                    <p>✓ Đang phân tích chỉ số cơ thể...</p>
                    <p>✓ Đang tính toán TDEE & Macro...</p>
                    <p>✓ Đang lựa chọn bài tập phù hợp...</p>
                </div>
            </div>
        );
    }

    // --- MÀN HÌNH CHÍNH (DASHBOARD) ---
    const { analysis, workout_schedule, nutrition_plan } = MOCK_AI_PLAN;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            
            {/* 1. HEADER PHÂN TÍCH (AI ANALYSIS) */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-6 md:p-10 rounded-b-[40px] shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
                                🤖
                            </div>
                            <div>
                                <p className="text-teal-300 text-xs font-bold uppercase tracking-wider">Trợ lý ảo VietLife</p>
                                <h1 className="text-2xl font-bold">Lộ trình dành riêng cho {MOCK_AI_PLAN.user_name}</h1>
                            </div>
                        </div>
                        <button className="text-white/60 hover:text-white transition-colors" title="Tạo lại">
                            <FaRedo />
                        </button>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <h2 className="text-xl font-bold text-teal-300 mb-3">{analysis.title}</h2>
                        <p className="text-gray-200 leading-relaxed text-sm md:text-base">
                            "{analysis.content}"
                        </p>
                        <div className="flex gap-2 mt-4 flex-wrap">
                            {analysis.tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 bg-teal-500/20 text-teal-200 text-xs font-bold rounded-full border border-teal-500/30">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. BODY CONTENT */}
            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
                
                {/* Tabs Switcher */}
                <div className="flex bg-white rounded-full p-1 shadow-lg mb-8 w-fit mx-auto">
                    <button 
                        onClick={() => setActiveTab('workout')}
                        className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'workout' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500 hover:text-teal-600'}`}
                    >
                        <FaDumbbell /> Lịch Tập
                    </button>
                    <button 
                        onClick={() => setActiveTab('nutrition')}
                        className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'nutrition' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:text-orange-500'}`}
                    >
                        <FaUtensils /> Thực Đơn
                    </button>
                </div>

                {/* TAB: WORKOUT PLAN */}
                {activeTab === 'workout' && (
                    <div className="space-y-6 animate-fade-in-up">
                        {workout_schedule.map((day, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                                <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
                                    <h3 className="font-bold text-teal-800">{day.day}</h3>
                                    <span className="text-xs font-bold bg-white px-3 py-1 rounded text-teal-600 shadow-sm">
                                        {day.focus}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {day.exercises.map((ex) => (
                                        <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0">
                                                    {/* Chỗ này sau này sẽ là ảnh thumb bài tập */}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm">{ex.name}</h4>
                                                    <p className="text-xs text-gray-500">ID: {ex.id}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-teal-600">{ex.sets} set</div>
                                                <div className="font-mono text-xs text-gray-500">{ex.reps} rep</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB: NUTRITION PLAN */}
                {activeTab === 'nutrition' && (
                    <div className="animate-fade-in-up">
                        {/* Macro Summary */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <div className="bg-orange-500 text-white p-3 rounded-2xl text-center shadow-lg shadow-orange-200">
                                <div className="text-[10px] uppercase font-bold opacity-80">Calo</div>
                                <div className="text-xl font-black">{nutrition_plan.calories}</div>
                            </div>
                            <div className="bg-white p-3 rounded-2xl text-center border border-gray-100 shadow-sm">
                                <div className="text-[10px] uppercase font-bold text-gray-400">Đạm</div>
                                <div className="text-lg font-bold text-gray-800">{nutrition_plan.macro.p}g</div>
                            </div>
                            <div className="bg-white p-3 rounded-2xl text-center border border-gray-100 shadow-sm">
                                <div className="text-[10px] uppercase font-bold text-gray-400">Tinh bột</div>
                                <div className="text-lg font-bold text-gray-800">{nutrition_plan.macro.c}g</div>
                            </div>
                            <div className="bg-white p-3 rounded-2xl text-center border border-gray-100 shadow-sm">
                                <div className="text-[10px] uppercase font-bold text-gray-400">Béo</div>
                                <div className="text-lg font-bold text-gray-800">{nutrition_plan.macro.f}g</div>
                            </div>
                        </div>

                        {/* Meal List */}
                        <div className="space-y-4">
                            {nutrition_plan.meals.map((meal, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 flex gap-4 items-start">
                                    <div className="w-16 flex-shrink-0 text-center">
                                        <span className="text-xs font-bold text-orange-400 uppercase">{meal.time}</span>
                                        <div className="w-10 h-10 bg-orange-100 rounded-full mx-auto mt-2 flex items-center justify-center text-orange-600">
                                            <FaUtensils size={14}/>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">{meal.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                            {meal.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* FLOATING ACTION BUTTON (Chatbot Trigger) */}
            <button className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-teal-600 transition-colors z-50 animate-bounce-slow">
                <FaRobot size={24} />
            </button>
        </div>
    );
};

export default AIPlanDashboard;