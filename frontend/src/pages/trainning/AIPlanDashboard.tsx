import React, { useState, useEffect } from 'react';
import NutritionTab from './../../components/NutritionTab';
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
    FaFire,
    FaPlayCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ExerciseModal, { ExerciseDetail } from './../../components/ExerciseModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- 1. DEFINITIONS & INTERFACES ---

interface Exercise {
    exercise_id?: number;
    name: string;
    sets: string;
    reps: string;
    note: string;
    thumbnail_url?: string;
    video_url?: string;
    is_real?: boolean;
    difficulty?: string;
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

// Cập nhật Interface để hỗ trợ dynamic keys (week_2, week_3...)
interface AIPlanData {
    analysis: {
        bmi: string;
        tdee: string;
        advice: string;
        goal_summary?: string; 
    };
    roadmap: RoadmapPhase[]; 
    week_1_detail: DayPlan[];
    week_2_detail?: DayPlan[];
    week_3_detail?: DayPlan[];
    week_4_detail?: DayPlan[];
    nutrition: {
        // Hỗ trợ cả cấu trúc cũ (để tránh lỗi) và cấu trúc mới
        calories?: number;
        macro_split?: string; 
        menu?: Menu[];
        
        // Cấu trúc mới cho NutritionTab
        summary?: {
            total_calories: number;
            macro_ratio: { protein: string; carbs: string; fat: string };
            advice: string;
        };
        weekly_menu?: {
            day: string;
            meals: any[];
        }[];
    };
    [key: string]: any; // Cho phép truy cập dynamic keys
}

const AIPlanDashboard = () => {
    const navigate = useNavigate();
    
    // --- 2. STATE MANAGEMENT ---
    const [plan, setPlan] = useState<AIPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');

    const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<ExerciseDetail | null>(null);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // MỚI: Quản lý tuần đang xem và trạng thái hoàn thành
    const [currentWeekIndex, setCurrentWeekIndex] = useState(1);
    const [completingWeek, setCompletingWeek] = useState(false);

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
                await fetchAIPlan(true); 
                return;
            }

            if (response.status === 400 && data.action === 'REDIRECT_TO_WIZARD') {
                alert("Bạn cần cập nhật hồ sơ sức khỏe trước khi xem lộ trình.");
                navigate('/plan'); 
                return;
            }

            if (!response.ok) {
                throw new Error(data.msg || "Không thể tải lộ trình.");
            }

            setPlan(data.plan);
            
            // Logic tự động chuyển sang tuần mới nhất có dữ liệu
            if (data.plan) {
                if (data.plan.week_4_detail) setCurrentWeekIndex(4);
                else if (data.plan.week_3_detail) setCurrentWeekIndex(3);
                else if (data.plan.week_2_detail) setCurrentWeekIndex(2);
                else setCurrentWeekIndex(1);
            }

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
    
    // --- MỚI: HÀM HOÀN THÀNH TUẦN (ADAPTIVE LEARNING) ---
    const handleCompleteWeek = async (feedback: string) => {
        if (!plan) return;
        setCompletingWeek(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/ai-plan/next-week', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    currentWeek: currentWeekIndex, 
                    feedback: feedback // 'easy', 'medium', 'hard'
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Cập nhật plan mới (đã có tuần tiếp theo)
                setPlan(data.plan); 
                // Chuyển view sang tuần mới
                setCurrentWeekIndex(prev => prev + 1); 
                // Cuộn lên đầu trang
                window.scrollTo({ top: 0, behavior: 'smooth' });
                alert(`🎉 Tuyệt vời! AI đã điều chỉnh và mở khóa Tuần ${currentWeekIndex + 1} cho bạn.`);
            } else {
                alert(data.msg || "Có lỗi xảy ra khi tạo tuần mới.");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server.");
        } finally {
            setCompletingWeek(false);
        }
    };

    // --- [SỬA LẠI] HÀM XỬ LÝ CLICK BÀI TẬP ---
    const handleExerciseClick = async (ex: Exercise) => {
        if (!ex.is_real || !ex.exercise_id) return;

        setLoadingDetail(true);
        try {
            const token = localStorage.getItem('token');
            // Gọi API lấy danh sách bài tập (hoặc API chi tiết nếu có: /exercise/{id})
            // Ở đây tôi giả định dùng lại endpoint lấy tất cả rồi tìm (giống Exercise.tsx) 
            // để đảm bảo code chạy được ngay với backend hiện tại của bạn.
            // TỐT NHẤT: Bạn nên có endpoint: GET /exercise/${ex.exercise_id}
            
            const response = await fetch('http://localhost:8080/exercise', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data: ExerciseDetail[] = await response.json();
            
            const found = data.find(item => item.id === ex.exercise_id);
            
            if (found) {
                setSelectedExerciseDetail(found);
                setShowExerciseModal(true);
            } else {
                toast.error("Không tìm thấy thông tin chi tiết bài tập.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải chi tiết bài tập.");
        } finally {
            setLoadingDetail(false);
        }
    };

    // Hàm đóng modal
    const closeExerciseModal = () => {
        setShowExerciseModal(false);
        setSelectedExerciseDetail(null);
    };
    
    const handleEditPreferences = () => {
        navigate('/plan', { state: { isEditing: true } });
    };

    // --- RENDER HELPERS ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-teal-400 rounded-full animate-spin"></div>
                    <FaRobot className="absolute inset-0 m-auto text-4xl text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 animate-pulse text-center">VietLife AI đang phân tích...</h2>
                <div className="text-teal-300/70 text-sm">Đang thiết kế lộ trình tối ưu nhất...</div>
            </div>
        );
    }

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

    // Lấy dữ liệu của tuần đang chọn
    const currentWeekData = currentWeekIndex === 1 
        ? plan.week_1_detail 
        : plan[`week_${currentWeekIndex}_detail`];

    // --- HÀM CẬP NHẬT MÓN ĂN (Đã sửa lỗi TypeScript) ---
    const handleUpdateMeal = (dayIdx: number, mealIdx: number, newMeal: any) => {
        // 1. Kiểm tra an toàn: Nếu không có plan hoặc chưa có menu thì dừng luôn
        if (!plan || !plan.nutrition.weekly_menu) return;

        // 2. Clone deep plan
        const newPlan = { ...plan };
        
        // 3. Cập nhật món ăn
        // SỬA LỖI Ở ĐÂY: Thêm dấu ? trước .[dayIdx] để kiểm tra tồn tại
        if (newPlan.nutrition.weekly_menu?.[dayIdx]) {
            
            // Thêm dấu ! sau weekly_menu để khẳng định với TypeScript là nó chắc chắn có dữ liệu
            newPlan.nutrition.weekly_menu![dayIdx].meals[mealIdx] = newMeal;
            
            setPlan(newPlan);
        }
    };
    // --- THÊM HÀM KÍCH HOẠT LỘ TRÌNH ---
    const handleActivatePlan = async () => {
        const confirmStart = window.confirm("Bạn có chắc muốn bắt đầu lộ trình từ hôm nay? Lịch sẽ được tính bắt đầu từ ngày hôm nay.");
        if (!confirmStart) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/ai-plan/activate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("🎉 Đã kích hoạt lộ trình! Hãy quay lại Dashboard để xem bài tập hôm nay.");
                // Tùy chọn: Chuyển hướng ngay về Dashboard chính
                navigate('/profile/dashboard');
            } else {
                toast.error(data.msg || "Không thể kích hoạt.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối server.");
        }
    };
    // --- MAIN RENDER ---
    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {loadingDetail && (
                <div className="fixed inset-0 z-[110] bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white p-4 rounded-full shadow-lg animate-spin">
                        <FaRedo className="text-teal-600" />
                    </div>
                </div>
            )}

            {/* [THÊM] Nhúng Component Modal vào đây */}
            <ExerciseModal 
                isOpen={showExerciseModal}
                exercise={selectedExerciseDetail}
                onClose={closeExerciseModal}
            />
            {/* A. HEADER AREA */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white p-6 md:p-10 rounded-b-[40px] shadow-2xl relative overflow-hidden">
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
                        
                        <div className="flex gap-3">
                            <button 
                            onClick={handleActivatePlan}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition-all px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-orange-900/20 " 
                        >
                            <FaPlayCircle /> Bắt đầu ngay
                        </button>
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
                
                {/* 1. ROADMAP 4 TUẦN (INTERACTIVE) */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-teal-50">
                    <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <FaCalendarAlt className="text-teal-600"/> Lộ trình 4 Tuần
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plan.roadmap?.map((week, idx) => {
                            // Logic kiểm tra xem tuần này đã mở khóa chưa
                            const isUnlocked = idx === 0 || plan[`week_${week.week}_detail`];
                            const isSelected = week.week === currentWeekIndex;

                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => isUnlocked && setCurrentWeekIndex(week.week)}
                                    className={`relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                                        isSelected 
                                        ? 'bg-gradient-to-br from-teal-50 to-white border-teal-500 ring-2 ring-teal-500 shadow-md transform -translate-y-1' 
                                        : isUnlocked
                                            ? 'bg-white border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                                            : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                    }`}
                                >
                                    {/* Badge trạng thái */}
                                    {isSelected && (
                                        <div className="absolute -top-3 -right-2 bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                            ĐANG XEM
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-teal-700' : 'text-gray-500'}`}>
                                            Tuần {week.week}
                                        </span>
                                        {!isUnlocked ? (
                                            <FaLock className="text-gray-400 text-xs" />
                                        ) : (
                                            // Nếu là tuần cũ (nhỏ hơn tuần hiện tại đang có) thì hiện check
                                            week.week < 4 && plan[`week_${week.week + 1}_detail`] && (
                                                <FaCheckCircle className="text-green-500 text-xs" />
                                            )
                                        )}
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{week.phase}</h4>
                                    <p className="text-xs text-teal-600 font-bold mb-2">{week.focus}</p>
                                    <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">{week.desc}</p>
                                </div>
                            );
                        })}
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
                            Lịch tập Tuần {currentWeekIndex}
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
                            <h3 className="text-xl font-bold text-slate-800">Chi tiết Tuần {currentWeekIndex}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {currentWeekIndex < 4 ? "Hoàn thành tuần này để mở khóa lộ trình tiếp theo" : "Chúc mừng bạn đã đến chặng cuối!"}
                            </p>
                        </div>

                        {/* DANH SÁCH BÀI TẬP CỦA TUẦN ĐANG CHỌN */}
                        {currentWeekData ? (
                            <div className="grid gap-6">
                                {currentWeekData.map((day: DayPlan, idx: number) => (
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
                                                    <div 
                                                        key={exIdx} 
                                                        onClick={() => handleExerciseClick(ex)} // Đã trỏ vào hàm mới
                                                        className={`p-4 sm:p-5 flex items-center justify-between transition-colors group ${
                                                            ex.is_real ? 'cursor-pointer hover:bg-teal-50/40' : 'cursor-default hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4 flex-1">
                                                            {/* THUMBNAIL */}
                                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                                {ex.thumbnail_url ? (
                                                                    <img 
                                                                        src={ex.thumbnail_url} 
                                                                        alt={ex.name} 
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                                        <FaDumbbell size={20} />
                                                                    </div>
                                                                )}
                                                                {ex.is_real && (
                                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                                                        <FaPlayCircle className="text-white text-xl drop-shadow-lg" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* INFO */}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h4 className={`font-bold text-sm sm:text-base line-clamp-1 ${ex.is_real ? 'text-slate-800 group-hover:text-teal-700' : 'text-gray-600'}`}>
                                                                        {ex.name}
                                                                    </h4>
                                                                    {ex.is_real ? (
                                                                        <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 font-bold">VIDEO</span>
                                                                    ) : (
                                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">AI GỢI Ý</span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs bg-white text-slate-700 px-2 py-0.5 rounded border border-gray-200 font-mono font-bold shadow-sm">
                                                                        {ex.sets} sets
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        x {ex.reps} reps
                                                                    </span>
                                                                </div>
                                                                
                                                                {ex.note && (
                                                                    <p className="text-xs text-orange-500 mt-1 flex items-center gap-1 line-clamp-1">
                                                                        <FaExclamationTriangle size={10}/> {ex.note}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {ex.is_real && (
                                                            <div className="text-gray-300 ml-2 group-hover:translate-x-1 transition-transform group-hover:text-teal-500">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center bg-gray-50/50">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-3">
                                                        <FaClock />
                                                    </div>
                                                    <p className="text-gray-500 text-sm italic">
                                                        "Cơ bắp phát triển khi bạn nghỉ ngơi. Hãy ngủ đủ giấc nhé!"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* --- KHU VỰC HOÀN THÀNH TUẦN (ADAPTIVE FEEDBACK) --- */}
                                {/* Chỉ hiện nếu đang xem tuần mới nhất được mở khóa và chưa phải tuần cuối cùng */}
                                {currentWeekIndex < 4 && !plan[`week_${currentWeekIndex + 1}_detail`] && (
                                    <div className="mt-8 bg-gradient-to-br from-white to-teal-50 p-6 rounded-2xl border border-teal-200 text-center shadow-lg relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">🎉 Bạn đã hoàn thành Tuần {currentWeekIndex}?</h3>
                                            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                                                Hãy đánh giá mức độ của tuần này để AI điều chỉnh lộ trình 
                                                <span className="font-bold text-teal-700"> Tuần {currentWeekIndex + 1}</span> phù hợp nhất với sức khỏe của bạn.
                                            </p>
                                            
                                            <div className="flex flex-wrap justify-center gap-4">
                                                <button 
                                                    onClick={() => handleCompleteWeek('easy')}
                                                    disabled={completingWeek}
                                                    className="px-5 py-3 bg-white border border-green-200 text-green-700 rounded-xl hover:bg-green-50 hover:scale-105 font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    😄 Nhẹ quá
                                                </button>
                                                <button 
                                                    onClick={() => handleCompleteWeek('medium')}
                                                    disabled={completingWeek}
                                                    className="px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 hover:scale-105 font-bold transition shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    🔥 Vừa sức
                                                </button>
                                                <button 
                                                    onClick={() => handleCompleteWeek('hard')}
                                                    disabled={completingWeek}
                                                    className="px-5 py-3 bg-white border border-red-200 text-red-700 rounded-xl hover:bg-red-50 hover:scale-105 font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    🥵 Mệt xỉu
                                                </button>
                                            </div>
                                            
                                            {completingWeek && (
                                                <div className="mt-4 flex items-center justify-center text-teal-600 text-sm font-semibold animate-pulse">
                                                    <FaRobot className="mr-2"/> AI đang phân tích và thiết kế tuần tiếp theo...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <FaLock className="mx-auto text-4xl text-gray-300 mb-4"/>
                                <h3 className="text-lg font-bold text-gray-500">Tuần này chưa được mở khóa</h3>
                                <p className="text-gray-400 text-sm">Hãy hoàn thành các tuần trước đó trước nhé!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. NUTRITION CONTENT */}
                {/* 4. NUTRITION CONTENT */}
                {activeTab === 'nutrition' && (
                    <div className="w-full">
                         {/* Truyền dữ liệu nutrition và hàm update vào NutritionTab */}
                         {/* Ép kiểu 'any' cho data nếu cấu trúc backend chưa đồng bộ hoàn toàn, 
                             giúp tránh lỗi TS trong quá trình chuyển đổi */}
                        <NutritionTab 
                            data={plan.nutrition as any} 
                            onUpdateMeal={handleUpdateMeal} 
                        />
                    </div>
                )}
            </div>

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