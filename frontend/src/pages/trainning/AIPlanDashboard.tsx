import React, { useState, useEffect } from 'react';
import { FaDumbbell, FaUtensils, FaRobot, FaRedo, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Interface
interface AIPlanData {
    analysis: {
        bmi: string;
        tdee: string;
        advice: string;
    };
    schedule: {
        day: string;
        focus: string;
        exercises: {
            name: string;
            sets: string;
            reps: string;
            note: string;
        }[];
    }[];
    nutrition: {
        calories: number;
        menu: {
            meal: string;
            suggestion: string;
        }[];
    };
}

const AIPlanDashboard = () => {
    const navigate = useNavigate();
    
    // State
    const [plan, setPlan] = useState<AIPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');

    // Hàm gọi API
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

            if (response.status === 404 && !forceRegenerate) {
                console.log("Chưa có lộ trình, hệ thống đang tự tạo mới...");
                await fetchAIPlan(true); 
                return;
            }

            if (response.status === 400 && data.action === 'REDIRECT_TO_WIZARD') {
                alert("Bạn cần cập nhật hồ sơ sức khỏe trước khi xem lộ trình.");
                navigate('/wizard');
                return;
            }

            if (!response.ok) {
                throw new Error(data.msg || "Không thể tải lộ trình.");
            }

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

    // Hàm chuyển đến trang Plan để chỉnh sửa
    const handleEditPreferences = () => {
        navigate('/plan');
    };

    // LOADING SCREEN
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-teal-400 rounded-full animate-spin"></div>
                    <FaRobot className="absolute inset-0 m-auto text-4xl text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 animate-pulse text-center">VietLife AI đang phân tích...</h2>
                <div className="text-teal-300/70 text-sm">Đang tìm lộ trình phù hợp nhất với cơ thể bạn</div>
            </div>
        );
    }

    // ERROR SCREEN
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
                <button 
                    onClick={() => fetchAIPlan(true)} 
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
                >
                    <FaRedo /> Thử lại
                </button>
            </div>
        );
    }

    if (!plan) return null;

    // MAIN DASHBOARD
    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            
            {/* Header Area */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-6 md:p-10 rounded-b-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
                                🤖
                            </div>
                            <div>
                                <p className="text-teal-300 text-xs font-bold uppercase tracking-wider">Trợ lý ảo VietLife</p>
                                <h1 className="text-2xl font-bold">Lộ trình cá nhân hóa</h1>
                            </div>
                        </div>
                        
                        {/* Button Group: Edit & Refresh */}
                        <div className="flex gap-2">
                            <button 
                                onClick={handleEditPreferences}
                                className="text-white/80 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 group relative" 
                                title="Chỉnh sửa sở thích"
                            >
                                <FaEdit size={20} />
                                <span className="absolute -bottom-8 right-0 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Chỉnh sửa
                                </span>
                            </button>
                            
                            <button 
                                onClick={() => fetchAIPlan(true)} 
                                disabled={isRegenerating}
                                className={`text-white/80 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 group relative ${isRegenerating ? 'animate-spin opacity-50' : ''}`} 
                                title="Tạo lộ trình mới"
                            >
                                <FaRedo size={20} />
                                <span className="absolute -bottom-8 right-0 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Tạo lại
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <div className="flex gap-4 mb-3 text-sm font-bold text-teal-300">
                            <span>BMI: {plan.analysis?.bmi}</span>
                            <span className="opacity-50">|</span>
                            <span>TDEE: {plan.analysis?.tdee}</span>
                        </div>
                        <p className="text-gray-200 leading-relaxed text-sm md:text-base italic">
                            "{plan.analysis?.advice}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Body Content */}
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
                        {plan.schedule?.map((day, idx) => (
                            <div key={idx} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                                <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
                                    <h3 className="font-bold text-teal-800">{day.day}</h3>
                                    <span className="text-xs font-bold bg-white px-3 py-1 rounded text-teal-600 shadow-sm border border-teal-100">
                                        {day.focus}
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {day.exercises?.map((ex, exIdx) => (
                                        <div key={exIdx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{ex.name}</h4>
                                                <p className="text-xs text-gray-500 italic mt-1">{ex.note}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <div className="font-mono font-bold text-teal-600">{ex.sets} sets</div>
                                                <div className="font-mono text-xs text-gray-500">{ex.reps} reps</div>
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
                        <div className="flex justify-center mb-6">
                            <div className="bg-orange-500 text-white px-8 py-3 rounded-2xl text-center shadow-lg shadow-orange-200">
                                <div className="text-[10px] uppercase font-bold opacity-80">Tổng Calo Mục Tiêu</div>
                                <div className="text-2xl font-black">{plan.nutrition?.calories} kcal</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {plan.nutrition?.menu?.map((meal, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 flex gap-4 items-start hover:shadow-md transition-shadow">
                                    <div className="w-16 flex-shrink-0 text-center">
                                        <span className="text-xs font-bold text-orange-400 uppercase">{meal.meal}</span>
                                        <div className="w-10 h-10 bg-orange-100 rounded-full mx-auto mt-2 flex items-center justify-center text-orange-600">
                                            <FaUtensils size={14}/>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">Gợi ý món ăn</h4>
                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                            {meal.suggestion}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AIPlanDashboard;