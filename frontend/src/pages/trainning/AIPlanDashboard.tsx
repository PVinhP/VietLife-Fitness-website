import React, { useState, useEffect } from 'react';
import { 
    FaDumbbell, 
    FaUtensils, 
    FaRobot, 
    FaRedo, 
    FaExclamationTriangle, 
    FaEdit, 
    FaCalendarAlt, 
    FaLock,
    FaCheckCircle,
    FaClock,
    FaFire
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// --- 1. DEFINITIONS & INTERFACES ---
interface Exercise {
    name: string;
    sets: string;
    reps: string;
    note: string;
}

interface DayPlan {
    day: string;
    focus: string;
    exercises: Exercise[];
}

interface RoadmapPhase {
    week: number;
    phase: string;
    focus: string;
    desc: string;
}

interface Menu {
    meal: string;
    suggestion: string;
}

interface AIPlanData {
    analysis: {
        bmi: string;
        tdee: string;
        advice: string;
        goal_summary?: string; // Mới: Tóm tắt mục tiêu (VD: Tăng cơ, Giảm mỡ)
    };
    roadmap: RoadmapPhase[]; // Mới: Lộ trình 4 tuần
    week_1_detail: DayPlan[]; // Đổi tên từ schedule -> week_1_detail
    nutrition: {
        calories: number;
        macro_split?: string; // Mới: Tỉ lệ dinh dưỡng
        menu: Menu[];
    };
}

const AIPlanDashboard = () => {
    const navigate = useNavigate();
    
    // --- 2. STATE MANAGEMENT ---
    const [plan, setPlan] = useState<AIPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');

    // --- 3. API FETCHING LOGIC ---
    const fetchAIPlan = async (forceRegenerate: boolean = false): Promise<void> => {
        if (forceRegenerate) {
            setIsRegenerating(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            // Endpoint logic
            let url = 'http://localhost:8080/api/ai-plan/current';
            let method = 'GET';

            if (forceRegenerate) {
                url = 'http://localhost:8080/api/ai-plan/generate';
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            // Handle Case: Chưa có lộ trình (404) -> Tự động tạo mới
            if (response.status === 404 && !forceRegenerate) {
                console.log("Chưa có lộ trình, hệ thống đang tự tạo mới...");
                await fetchAIPlan(true); 
                return;
            }

            // Handle Case: Chưa có profile sức khỏe
            if (response.status === 400 && data.action === 'REDIRECT_TO_WIZARD') {
                alert("Bạn cần cập nhật hồ sơ sức khỏe trước khi xem lộ trình.");
                navigate('/plan'); // Chuyển hướng về trang nhập liệu
                return;
            }

            if (!response.ok) {
                throw new Error(data.msg || "Không thể tải lộ trình.");
            }

            // Success
            setPlan(data.plan);

        } catch (err: any) {
            console.error("Lỗi:", err);
            setError(err.message || "Lỗi kết nối server");
        } finally {
            setIsLoading(false);
            setIsRegenerating(false);
        }
    };

    useEffect(() => {
        fetchAIPlan(false);
    }, []);

    const handleEditPreferences = () => {
        navigate('/plan', { state: { isEditing: true } });
    };

    // --- 4. RENDER: LOADING SCREEN ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-teal-400 rounded-full animate-spin"></div>
                    <FaRobot className="absolute inset-0 m-auto text-4xl text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 animate-pulse text-center">VietLife AI đang phân tích...</h2>
                <div className="text-teal-300/70 text-sm">Đang thiết kế lộ trình 4 tuần tối ưu nhất</div>
            </div>
        );
    }

    // --- 5. RENDER: ERROR SCREEN ---
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
                <button 
                    onClick={() => fetchAIPlan(true)} 
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2 shadow-lg"
                >
                    <FaRedo /> Thử lại
                </button>
            </div>
        );
    }

    if (!plan) return null;

    // --- 6. RENDER: MAIN DASHBOARD ---
    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            
            {/* A. HEADER AREA */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-6 md:p-10 rounded-b-[40px] shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10">
                                🤖
                            </div>
                            <div>
                                <p className="text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">Trợ lý ảo VietLife</p>
                                <h1 className="text-2xl md:text-3xl font-bold">Lộ trình Cá nhân hóa</h1>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button 
                                onClick={handleEditPreferences}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm" 
                            >
                                <FaEdit /> Sửa hồ sơ
                            </button>
                            
                            <button 
                                onClick={() => fetchAIPlan(true)} 
                                disabled={isRegenerating}
                                className={`flex items-center gap-2 bg-teal-600 hover:bg-teal-500 transition-all px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-teal-900/50 ${isRegenerating ? 'opacity-70 cursor-wait' : ''}`} 
                            >
                                <FaRedo className={isRegenerating ? 'animate-spin' : ''} /> 
                                {isRegenerating ? 'Đang tạo lại...' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>

                    {/* AI Analysis Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:bg-white/15 transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-400"></div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 text-sm font-bold text-teal-300">
                            <span className="flex items-center gap-2"><FaClock className="text-teal-400"/> BMI: {plan.analysis?.bmi}</span>
                            <span className="flex items-center gap-2"><FaFire className="text-orange-400"/> TDEE: {plan.analysis?.tdee}</span>
                            {plan.analysis?.goal_summary && (
                                <span className="flex items-center gap-2 text-yellow-300 border-l border-white/20 pl-6">
                                    🎯 Mục tiêu: {plan.analysis.goal_summary}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-200 leading-relaxed text-sm md:text-base italic pl-2 border-l-2 border-teal-500/30">
                            "{plan.analysis?.advice}"
                        </p>
                    </div>
                </div>
            </div>

            {/* B. BODY CONTENT */}
            <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20 space-y-8">
                
                {/* 1. ROADMAP 4 TUẦN (MỚI) */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-teal-50">
                    <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <FaCalendarAlt className="text-teal-600"/> Lộ trình 4 Tuần của bạn
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plan.roadmap?.map((week, idx) => (
                            <div 
                                key={idx} 
                                className={`relative p-5 rounded-xl border transition-all duration-300 ${
                                    week.week === 1 
                                    ? 'bg-gradient-to-br from-teal-50 to-white border-teal-200 ring-2 ring-teal-500/20 shadow-md transform -translate-y-1' 
                                    : 'bg-gray-50 border-gray-100 opacity-80 hover:opacity-100 hover:shadow-sm'
                                }`}
                            >
                                {week.week === 1 && (
                                    <div className="absolute -top-3 -right-2 bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                        ĐANG TẬP
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${week.week === 1 ? 'text-teal-700' : 'text-gray-500'}`}>
                                        Tuần {week.week}
                                    </span>
                                    {week.week > 1 && <FaLock className="text-gray-300 text-xs" />}
                                </div>
                                
                                <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{week.phase}</h4>
                                <p className="text-xs text-teal-600 font-bold mb-2">{week.focus}</p>
                                <p className="text-[11px] text-gray-500 leading-normal line-clamp-3">{week.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. TAB SWITCHER */}
                <div className="flex justify-center">
                    <div className="flex bg-white rounded-full p-1.5 shadow-md border border-gray-100">
                        <button 
                            onClick={() => setActiveTab('workout')}
                            className={`px-8 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                                activeTab === 'workout' 
                                ? 'bg-slate-800 text-white shadow-lg transform scale-105' 
                                : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
                            }`}
                        >
                            <FaDumbbell className={activeTab === 'workout' ? 'text-teal-400' : ''} /> 
                            Chi tiết Tuần 1
                        </button>
                        <button 
                            onClick={() => setActiveTab('nutrition')}
                            className={`px-8 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
                                activeTab === 'nutrition' 
                                ? 'bg-orange-500 text-white shadow-lg transform scale-105' 
                                : 'text-gray-500 hover:text-orange-500 hover:bg-gray-50'
                            }`}
                        >
                            <FaUtensils className={activeTab === 'nutrition' ? 'text-white' : ''} /> 
                            Dinh dưỡng
                        </button>
                    </div>
                </div>

                {/* 3. WORKOUT CONTENT */}
                {activeTab === 'workout' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800">Lịch tập Tuần 1</h3>
                            <p className="text-sm text-gray-500 mt-1">Hoàn thành tuần này để mở khóa lộ trình tiếp theo</p>
                        </div>

                        <div className="grid gap-6">
                            {plan.week_1_detail?.map((day, idx) => (
                                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-800 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{day.day}</h3>
                                                <p className="text-xs text-teal-600 font-bold uppercase tracking-wide">{day.focus}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Badge số bài tập */}
                                        {day.exercises.length > 0 ? (
                                            <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold border border-teal-100">
                                                {day.exercises.length} bài tập
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                                <FaCheckCircle className="text-gray-400"/> Ngày nghỉ
                                            </span>
                                        )}
                                    </div>

                                    {/* Exercise List */}
                                    <div className="divide-y divide-gray-50">
                                        {day.exercises.length > 0 ? (
                                            day.exercises.map((ex, exIdx) => (
                                                <div key={exIdx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                                                    <div className="flex items-center gap-4">
                                                        {/* Thumbnail Placeholder */}
                                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors">
                                                            <FaDumbbell size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-700 text-sm sm:text-base group-hover:text-teal-700 transition-colors">{ex.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{ex.sets} sets</span>
                                                                <span className="text-xs text-gray-500">{ex.reps} reps</span>
                                                            </div>
                                                            {ex.note && (
                                                                <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                                                    <FaExclamationTriangle size={10}/> {ex.note}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            /* Empty State for Rest Day */
                                            <div className="p-8 text-center bg-gray-50/50">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3">
                                                    <FaClock />
                                                </div>
                                                <p className="text-gray-500 text-sm italic">
                                                    "Cơ bắp phát triển khi bạn nghỉ ngơi. Hãy ngủ đủ giấc và ăn uống đầy đủ nhé!"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. NUTRITION CONTENT */}
                {activeTab === 'nutrition' && (
                    <div className="animate-fade-in-up space-y-6">
                        
                        {/* Nutrition Summary Card */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg shadow-orange-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                            <div className="relative z-10 text-center">
                                <h3 className="text-sm font-bold uppercase opacity-90 mb-2">Tổng năng lượng mục tiêu</h3>
                                <div className="text-4xl font-black mb-4">{plan.nutrition?.calories} <span className="text-lg font-medium">kcal/ngày</span></div>
                                
                                {plan.nutrition?.macro_split && (
                                    <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                                        <p className="text-sm font-bold">{plan.nutrition.macro_split}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plan.nutrition?.menu?.map((meal, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 flex gap-4 items-start hover:shadow-md transition-all hover:-translate-y-1">
                                    <div className="w-14 flex-shrink-0 text-center">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-orange-600 shadow-sm mb-2">
                                            <FaUtensils size={14}/>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{meal.meal}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-sm md:text-base border-b border-gray-100 pb-1 mb-2">Gợi ý món ăn</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {meal.suggestion}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Inline CSS for Custom Animations */}
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .cursor-wait {
                    cursor: wait;
                }
            `}</style>
        </div>
    );
};

export default AIPlanDashboard;