import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- INTERFACES ---
interface ExerciseItem {
    id: number;
    exercise_id: number;
    exercise_name: string;
    thumbnail_url: string;
    sets: number;
    reps: string;
    difficulty: string;
    muscle_group: string;
}

interface DaySchedule {
    day_number: number;
    day_name: string;
    exercises: ExerciseItem[];
}

interface PlanDetailType {
    id: number;
    name: string;
    description: string;
    level: string;
    duration_weeks: number;
    days_per_week: number;
    image_url: string;
    schedule: DaySchedule[];
}

const PlanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showTips, setShowTips] = useState(false);
    // State dữ liệu
    const [plan, setPlan] = useState<PlanDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [completedExercises, setCompletedExercises] = useState<number[]>([]);
    
    // State quản lý đóng/mở các ngày: { 1: true, 2: false ... } (Key là day_number)
    const [expandedDays, setExpandedDays] = useState<{[key: number]: boolean}>({});

    const token = localStorage.getItem("token");
    const today = new Date().toISOString().split('T')[0]; 

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy giáo án
                const planRes = await axios.get(`http://localhost:8080/api/plans/${id}`);
                setPlan(planRes.data);

                // Mặc định mở ngày đầu tiên (Day 1), các ngày khác đóng
                if (planRes.data.schedule.length > 0) {
                    setExpandedDays({ [planRes.data.schedule[0].day_number]: true });
                }

                // 2. Lấy tiến độ
                if (token) {
                    try {
                        const progressRes = await axios.get(`http://localhost:8080/api/workout-progress/check-status`, {
                            params: { planId: id, date: today },
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        
                        if (Array.isArray(progressRes.data)) {
                            setCompletedExercises(progressRes.data);
                        } else {
                            setCompletedExercises([]);
                        }
                    } catch (err) {
                        console.error("Không tải được tiến độ", err);
                        setCompletedExercises([]);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải giáo án:", error);
                toast.error("Không thể tải dữ liệu giáo án.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, token, today]);

    // --- HANDLERS ---

    const handleViewExercise = (exerciseId: number) => {
        navigate('/exercise', { 
            state: { selectedExerciseId: exerciseId, fromPlan: true } 
        });
    };

    const handleCheckIn = async (exerciseId: number, e: React.MouseEvent) => {
        e.stopPropagation(); 
        
        if (!token) {
            toast.warn("Bạn cần đăng nhập để lưu kết quả!");
            return;
        }

        const isCurrentlyChecked = completedExercises.includes(exerciseId);
        
        if (isCurrentlyChecked) {
            setCompletedExercises(prev => prev.filter(id => id !== exerciseId));
        } else {
            setCompletedExercises(prev => [...prev, exerciseId]);
            toast.success("Tuyệt vời! Đã hoàn thành 💪", { autoClose: 1000, hideProgressBar: true });
        }

        try {
            await axios.post(`http://localhost:8080/api/workout-progress/toggle`, {
                planId: id,
                exerciseId: exerciseId,
                date: today
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            toast.error("Lỗi kết nối!");
            // Revert nếu lỗi
            if (isCurrentlyChecked) {
                setCompletedExercises(prev => [...prev, exerciseId]);
            } else {
                setCompletedExercises(prev => prev.filter(id => id !== exerciseId));
            }
        }
    };

    // Hàm Toggle đóng mở ngày
    const toggleDay = (dayNumber: number) => {
        setExpandedDays(prev => ({
            ...prev,
            [dayNumber]: !prev[dayNumber] // Đảo ngược trạng thái
        }));
    };

    // --- RENDER ---

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div></div>;
    if (!plan) return <div className="p-10 text-center">Giáo án không tồn tại!</div>;

    // Tính tổng bài đã hoàn thành trong ngày hôm nay
    const completedTodayCount = completedExercises.length;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <ToastContainer />

            {/* 1. HERO SECTION */}
            <div className="relative h-[350px] lg:h-[450px]">
                <img src={plan.image_url} alt={plan.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                    <div className="max-w-5xl mx-auto">
                        <button onClick={() => navigate('/training/plans')} className="mb-4 flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium">
                            ← Quay lại danh sách
                        </button>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{plan.name}</h1>
                        
                        {/* Stats Badges */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs uppercase font-bold">
                                {plan.level}
                            </span>
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs uppercase font-bold">
                                {plan.duration_weeks} Tuần
                            </span>
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs uppercase font-bold">
                                {plan.days_per_week} Buổi/tuần
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CONTENT */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
                
                {/* Info Box: Tiến độ tổng quan */}
                <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border-l-4 border-teal-500 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Hôm nay ({today})</p>
                        <p className="text-teal-700 font-bold text-lg">Đã tập {completedTodayCount} bài</p>
                    </div>
                    {completedTodayCount > 0 && <span className="text-2xl">🔥</span>}
                </div>
                {/* Mẹo tập luyện (Accordion Style) */}
                <div className="border border-yellow-200 rounded-xl bg-yellow-50 mb-8 overflow-hidden transition-all duration-300 shadow-sm">
                    <button 
                        onClick={() => setShowTips(!showTips)}
                        className="w-full flex items-center justify-between p-4 text-yellow-800 font-bold hover:bg-yellow-100 transition-colors focus:outline-none"
                    >
                        <span className="flex items-center gap-2 uppercase text-sm tracking-wider">
                            <span className="text-xl">💡</span> Những lưu ý an toàn
                        </span>
                        <span className={`transform transition-transform duration-300 ${showTips ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>
                    
                    {/* Phần nội dung sổ xuống */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showTips ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-4 pt-0 text-sm text-yellow-900/90 border-t border-yellow-200/50">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <li className="flex items-start gap-2 bg-white/60 p-2 rounded border border-yellow-100">
                                    <span className="text-green-500">✅</span>
                                    <span>Khởi động kỹ 5-10 phút (xoay khớp, đi bộ).</span>
                                </li>
                                <li className="flex items-start gap-2 bg-white/60 p-2 rounded border border-yellow-100">
                                    <span className="text-blue-500">⏱️</span>
                                    <span>Nghỉ giữa hiệp: <strong>60-90 giây</strong>.</span>
                                </li>
                                <li className="flex items-start gap-2 bg-white/60 p-2 rounded border border-yellow-100">
                                    <span className="text-blue-400">💧</span>
                                    <span>Uống nước từng ngụm nhỏ liên tục.</span>
                                </li>
                                <li className="flex items-start gap-2 bg-white/60 p-2 rounded border border-yellow-100">
                                    <span className="text-red-500">🛑</span>
                                    <span>Nếu đau bất thường, hãy dừng lại ngay.</span>
                                </li>
                                <li className="flex items-start gap-2 bg-white/60 p-2 rounded border border-yellow-100 md:col-span-2">
                                    <span className="text-orange-500">⚖️</span>
                                    <span>Chọn mức tạ sao cho 2 cái cuối cùng gần như thất bại (RPE 8-9).</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* DANH SÁCH NGÀY TẬP (ACCORDION) */}
                <div className="space-y-4">
                    {plan.schedule.map((day) => {
                        // Tính tiến độ của RIÊNG ngày này
                        const dayExerciseIds = day.exercises.map(ex => ex.exercise_id);
                        const completedCountInDay = dayExerciseIds.filter(id => completedExercises.includes(id)).length;
                        const totalInDay = day.exercises.length;
                        const percent = totalInDay > 0 ? Math.round((completedCountInDay / totalInDay) * 100) : 0;
                        
                        // Kiểm tra trạng thái đóng/mở
                        const isExpanded = expandedDays[day.day_number];

                        return (
                            <div key={day.day_number} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300">
                                
                                {/* HEADER NGÀY (Click để đóng/mở) */}
                                <div 
                                    onClick={() => toggleDay(day.day_number)}
                                    className={`px-6 py-4 cursor-pointer transition-colors flex flex-col gap-3 ${isExpanded ? 'bg-teal-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-800'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded text-xs font-mono ${isExpanded ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                                                Ngày {day.day_number}
                                            </span>
                                            {day.day_name}
                                        </h3>
                                        
                                        {/* Mũi tên xoay */}
                                        <svg 
                                            className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    {/* Thanh Tiến độ Mini (Luôn hiện) */}
                                    <div className="w-full flex items-center gap-3">
                                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isExpanded ? 'bg-teal-800/30' : 'bg-gray-200'}`}>
                                            <div 
                                                className={`h-full transition-all duration-500 ${percent === 100 ? 'bg-green-400' : (isExpanded ? 'bg-yellow-300' : 'bg-teal-500')}`} 
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-bold ${isExpanded ? 'text-teal-100' : 'text-gray-400'}`}>
                                            {percent}%
                                        </span>
                                    </div>
                                </div>

                                {/* DANH SÁCH BÀI TẬP (Nội dung sổ xuống) */}
                                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="divide-y divide-gray-100 border-t border-gray-100">
                                        {day.exercises.map((ex, index) => {
                                            const isDone = completedExercises.includes(ex.exercise_id);
                                            return (
                                                <div 
                                                    key={index} 
                                                    onClick={() => handleViewExercise(ex.exercise_id)}
                                                    className={`p-4 flex items-center gap-4 transition-all cursor-pointer group ${
                                                        isDone ? 'bg-teal-50/50' : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {/* Checkbox */}
                                                    <div 
                                                        onClick={(e) => handleCheckIn(ex.exercise_id, e)}
                                                        className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-90 ${
                                                            isDone 
                                                            ? 'bg-teal-500 border-teal-500 text-white shadow-md scale-105' 
                                                            : 'border-gray-300 text-transparent hover:border-teal-400 hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                    </div>

                                                    {/* Thumbnail */}
                                                    <div className={`w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative ${isDone ? 'opacity-50 grayscale' : ''}`}>
                                                        {ex.thumbnail_url ? (
                                                            <img src={ex.thumbnail_url} alt={ex.exercise_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">No Pic</div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-bold text-sm md:text-base text-gray-800 truncate group-hover:text-teal-700 transition-colors ${isDone ? 'line-through decoration-teal-500 decoration-2 text-gray-400' : ''}`}>
                                                            {ex.exercise_name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                                                                {ex.muscle_group}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className={`text-right flex-shrink-0 ${isDone ? 'opacity-50' : ''}`}>
                                                        <div className="text-xs text-gray-500">
                                                            <span className="font-bold text-teal-600">{ex.sets}</span> hiệp
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            <span className="font-bold text-gray-800">{ex.reps}</span> cái
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Footer của ngày */}
                                    <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t border-gray-100">
                                        Nghỉ 60-90s giữa các hiệp • Uống đủ nước
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PlanDetail;