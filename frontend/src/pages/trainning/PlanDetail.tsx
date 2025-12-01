import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';

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
    
    // State
    const [plan, setPlan] = useState<PlanDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [completedExercises, setCompletedExercises] = useState<number[]>([]);
    
    // State quản lý đóng/mở các ngày
    const [expandedDays, setExpandedDays] = useState<{[key: number]: boolean}>({});
    const [showTips, setShowTips] = useState(false);

    const token = localStorage.getItem("token");
    const today = new Date().toISOString().split('T')[0]; 

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const planRes = await axios.get(`http://localhost:8080/api/plans/${id}`);
                setPlan(planRes.data);

                if (planRes.data.schedule.length > 0) {
                    setExpandedDays({ [planRes.data.schedule[0].day_number]: true });
                }

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
                        setCompletedExercises([]);
                    }
                }
            } catch (error) {
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
            // Hiệu ứng pháo hoa nhỏ khi check
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#0d9488', '#facc15'] 
            });
        }

        try {
            await axios.post(`http://localhost:8080/api/workout-progress/toggle`, {
                planId: id,
                exerciseId: exerciseId,
                date: today
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            toast.error("Lỗi kết nối!");
            if (isCurrentlyChecked) setCompletedExercises(prev => [...prev, exerciseId]);
            else setCompletedExercises(prev => prev.filter(id => id !== exerciseId));
        }
    };

    // --- MỚI: HÀM XỬ LÝ GHI CHÚ ---
    const handleAddNote = async (exerciseId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!token) {
            toast.warn("Vui lòng đăng nhập để ghi chú!");
            return;
        }

        const note = window.prompt("Ghi chú cho bài tập này (VD: Tạ 30kg):");
        
        if (note !== null) {
            try {
                await axios.post(`http://localhost:8080/api/workout-progress/note`, {
                    planId: id,
                    exerciseId: exerciseId,
                    date: today,
                    note: note
                }, { headers: { Authorization: `Bearer ${token}` } });
                
                toast.info("Đã lưu ghi chú 📝");
            } catch (error) {
                toast.error("Lỗi khi lưu ghi chú");
            }
        }
    };

    const toggleDay = (dayNumber: number) => {
        setExpandedDays(prev => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
    };

    // --- RENDER ---

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div></div>;
    if (!plan) return <div className="p-10 text-center">Giáo án không tồn tại!</div>;

    const completedTodayCount = completedExercises.length;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <ToastContainer autoClose={2000} />

            {/* 1. HERO SECTION */}
            <div className="relative h-[350px] lg:h-[450px] overflow-hidden group">
                <img 
                    src={plan.image_url} 
                    alt={plan.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white z-10">
                    <div className="max-w-6xl mx-auto animate-fade-in-up">
                        <button onClick={() => navigate('/training/plans')} className="mb-6 flex items-center gap-2 text-teal-200 hover:text-white transition-colors font-bold text-sm uppercase tracking-wide">
                            ← Quay lại danh sách
                        </button>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-lg leading-tight">
                            {plan.name}
                        </h1>
                        <p className="text-gray-200 text-lg max-w-2xl mb-8 font-light leading-relaxed drop-shadow-md">
                            {plan.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4">
                            {[plan.level, `${plan.duration_weeks} Tuần`, `${plan.days_per_week} Buổi/tuần`].map((badge, idx) => (
                                <span key={idx} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-sm font-bold shadow-lg">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                
                {/* PROGRESS CARD */}
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 border border-gray-100">
                    <div className="flex items-center gap-6 w-full">
                        <div className="relative w-20 h-20 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-teal-500 transition-all duration-1000 ease-out" strokeDasharray={`${(completedTodayCount / 10) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-black text-teal-700">{completedTodayCount}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Tiến độ hôm nay ({today})</h3>
                            <p className="text-2xl font-bold text-gray-800">
                                {completedTodayCount === 0 ? "Sẵn sàng chưa?" : "Đang làm rất tốt!"} 
                                <span className="ml-2 text-2xl">{completedTodayCount > 0 ? "🔥" : "🚀"}</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Hoàn thành các bài tập bên dưới để tích điểm.</p>
                        </div>
                    </div>
                </div>

                {/* TIPS ACCORDION */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl mb-10 overflow-hidden shadow-sm">
                    <button 
                        onClick={() => setShowTips(!showTips)}
                        className="w-full flex items-center justify-between p-5 text-yellow-900 font-bold hover:bg-yellow-100/50 transition-colors"
                    >
                        <span className="flex items-center gap-3">
                            <span className="bg-yellow-200 p-2 rounded-lg text-lg">💡</span> 
                            LƯU Ý TRƯỚC KHI TẬP
                        </span>
                        <span className={`transform transition-transform duration-300 ${showTips ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showTips ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-6 pt-0 border-t border-yellow-200/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
                                    <span className="text-2xl">⏱️</span>
                                    <div>
                                        <p className="font-bold text-yellow-900 text-sm">Nghỉ giữa hiệp</p>
                                        <p className="text-xs text-yellow-800">60 - 90 giây</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
                                    <span className="text-2xl">💧</span>
                                    <div>
                                        <p className="font-bold text-yellow-900 text-sm">Nước uống</p>
                                        <p className="text-xs text-yellow-800">Từng ngụm nhỏ liên tục</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
                                    <span className="text-2xl">⚖️</span>
                                    <div>
                                        <p className="font-bold text-yellow-900 text-sm">Mức tạ</p>
                                        <p className="text-xs text-yellow-800">Đủ nặng để 2 cái cuối mỏi nhừ</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
                                    <span className="text-2xl">🛑</span>
                                    <div>
                                        <p className="font-bold text-yellow-900 text-sm">An toàn</p>
                                        <p className="text-xs text-yellow-800">Đau khớp thì dừng ngay</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DAILY SCHEDULE */}
                <div className="space-y-6">
                    {plan.schedule.map((day) => {
                        const dayExerciseIds = day.exercises.map(ex => ex.exercise_id);
                        const completedCountInDay = dayExerciseIds.filter(id => completedExercises.includes(id)).length;
                        const totalInDay = day.exercises.length;
                        const percent = totalInDay > 0 ? Math.round((completedCountInDay / totalInDay) * 100) : 0;
                        const isExpanded = expandedDays[day.day_number];
                        const isDayComplete = percent === 100 && totalInDay > 0;

                        return (
                            <div 
                                key={day.day_number} 
                                className={`rounded-3xl transition-all duration-500 border ${isExpanded ? 'shadow-2xl border-teal-500 ring-2 ring-teal-100 transform scale-[1.01]' : 'shadow-md border-gray-100 bg-white hover:shadow-lg'}`}
                            >
                                {/* Header Ngày */}
                                <div 
                                    onClick={() => toggleDay(day.day_number)}
                                    className={`p-5 cursor-pointer rounded-t-3xl flex flex-col gap-3 transition-colors ${isExpanded ? 'bg-teal-600 text-white' : 'bg-white text-gray-800'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isExpanded ? 'bg-white text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                                                D{day.day_number}
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold">{day.day_name}</h3>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {isDayComplete && <span className="bg-green-400 text-white text-xs font-bold px-2 py-1 rounded shadow-sm animate-bounce">DONE</span>}
                                            <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>

                                    <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isDayComplete ? 'bg-green-400' : (isExpanded ? 'bg-yellow-300' : 'bg-teal-500')}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Body Ngày (Bài tập) */}
                                <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-white rounded-b-3xl ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="divide-y divide-gray-50">
                                        {day.exercises.map((ex, index) => {
                                            const isDone = completedExercises.includes(ex.exercise_id);
                                            return (
                                                <div 
                                                    key={index} 
                                                    onClick={() => handleViewExercise(ex.exercise_id)}
                                                    className={`p-4 md:p-6 flex items-center gap-4 md:gap-6 group transition-all cursor-pointer ${isDone ? 'bg-teal-50/40' : 'hover:bg-gray-50'}`}
                                                >
                                                    {/* Checkbox */}
                                                    <div 
                                                        onClick={(e) => handleCheckIn(ex.exercise_id, e)}
                                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                                            isDone 
                                                            ? 'bg-teal-500 border-teal-500 text-white scale-110 shadow-lg shadow-teal-200' 
                                                            : 'border-gray-200 text-transparent hover:border-teal-400 hover:bg-white'
                                                        }`}
                                                    >
                                                        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                    </div>

                                                    {/* Thumbnail */}
                                                    <div className={`w-16 h-16 md:w-24 md:h-20 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 relative shadow-sm ${isDone ? 'opacity-60 grayscale' : ''}`}>
                                                        <img src={ex.thumbnail_url} alt={ex.exercise_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg className="w-8 h-8 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                                                        </div>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isDone ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                                {ex.muscle_group}
                                                            </span>
                                                        </div>
                                                        <h4 className={`font-bold text-base md:text-lg text-gray-800 truncate group-hover:text-teal-600 transition-colors ${isDone ? 'line-through decoration-teal-500 decoration-2 text-gray-400' : ''}`}>
                                                            {ex.exercise_name}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 mt-1 hidden md:block">Bấm để xem video hướng dẫn</p>
                                                    </div>

                                                    {/* --- NÚT GHI CHÚ (MỚI THÊM) --- */}
                                                    <div 
                                                        onClick={(e) => handleAddNote(ex.exercise_id, e)}
                                                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0"
                                                        title="Thêm ghi chú"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </div>

                                                    {/* Stats Box (ĐÃ CHỈNH FONT TO HƠN) */}
                                                    <div className="flex gap-2 text-center">
                                                        <div className={`px-3 py-2 rounded-lg border min-w-[60px] ${isDone ? 'bg-white/50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Set</div>
                                                            {/* Font XL cho to rõ */}
                                                            <div className="font-mono font-black text-teal-600 text-xl">{ex.sets}</div>
                                                        </div>
                                                        <div className={`px-3 py-2 rounded-lg border min-w-[60px] ${isDone ? 'bg-white/50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Rep</div>
                                                            {/* Font XL cho to rõ */}
                                                            <div className="font-mono font-black text-gray-800 text-xl">{ex.reps}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100 font-medium">
                                        💡 Mẹo: Bấm vào icon ✏️ để ghi lại mức tạ hôm nay.
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