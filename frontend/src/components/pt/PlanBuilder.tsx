import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExerciseSelectorModal from '../../components/pt/ExerciseSelectorModal'; 

interface PlanBuilderProps {
  onClose: () => void;
  onSuccess: () => void;
  editingPlanId?: number | null; // ID của giáo án đang sửa (nếu có)
}

// --- INTERFACES ---
interface BuilderExercise {
    tempId: number; 
    id: number;     
    name: string;
    image: string;
    sets: number;
    reps: string;
}

interface BuilderDay {
    dayNumber: number;
    dayName: string; 
    exercises: BuilderExercise[];
}

// Định nghĩa kiểu dữ liệu cho PlanInfo để tránh lỗi TypeScript
interface PlanInfo {
    name: string;
    description: string;
    level: string;
    duration_weeks: number;
    days_per_week: number; // Sử dụng snake_case khớp với DB
    image_url: string;
}

const PlanBuilder = ({ onClose, onSuccess, editingPlanId }: PlanBuilderProps) => {
    
    // 1. STATE: THÔNG TIN CHUNG
    const [planInfo, setPlanInfo] = useState<PlanInfo>({
        name: '',
        description: '',
        level: 'Beginner',
        duration_weeks: 4,
        days_per_week: 3, // Mặc định 3 buổi
        image_url: ''
    });

    // 2. STATE: LỊCH TẬP (Mặc định 3 buổi)
    const [schedule, setSchedule] = useState<BuilderDay[]>([
        { dayNumber: 1, dayName: 'Buổi 1', exercises: [] },
        { dayNumber: 2, dayName: 'Buổi 2', exercises: [] },
        { dayNumber: 3, dayName: 'Buổi 3', exercises: [] },
    ]);

    // 3. STATE: MODAL & UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- EFFECT: LOAD DỮ LIỆU CŨ KHI SỬA ---
    useEffect(() => {
        if (editingPlanId) {
            const fetchPlanData = async () => {
                try {
                    const res = await axios.get(`http://localhost:8080/api/plans/${editingPlanId}`);
                    const data = res.data;

                    // 1. Điền thông tin chung (Map từ DB sang State)
                    setPlanInfo({
                        name: data.name,
                        description: data.description,
                        level: data.level,
                        duration_weeks: data.duration_weeks,
                        days_per_week: data.days_per_week, // Đảm bảo DB trả về đúng trường này
                        image_url: data.image_url || ''
                    });

                    // 2. Map lịch tập
                    if (data.schedule && Array.isArray(data.schedule)) {
                        const mappedSchedule = data.schedule.map((day: any) => ({
                            dayNumber: day.day_number,
                            dayName: day.day_name,
                            exercises: day.exercises.map((ex: any) => ({
                                tempId: Date.now() + Math.random(), 
                                id: ex.exercise_id, // ID gốc của bài tập
                                name: ex.exercise_name,
                                image: ex.thumbnail_url,
                                sets: ex.sets,
                                reps: ex.reps
                            }))
                        }));
                        setSchedule(mappedSchedule);
                    }
                } catch (error) {
                    toast.error("Lỗi tải dữ liệu giáo án cũ");
                    console.error(error);
                }
            };
            fetchPlanData();
        }
    }, [editingPlanId]);

    // --- HANDLERS ---

    // Thay đổi số buổi/tuần -> Tự động sinh lại danh sách ngày
    const handleDaysChange = (num: number) => {
        setPlanInfo(prev => ({ ...prev, days_per_week: num }));
        
        const newSchedule = Array.from({ length: num }, (_, i) => {
            const existingDay = schedule[i];
            return {
                dayNumber: i + 1,
                dayName: existingDay?.dayName || `Buổi ${i + 1}`,
                exercises: existingDay?.exercises || []
            };
        });
        setSchedule(newSchedule);
    };

    const handleDayNameChange = (dayIndex: number, newName: string) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].dayName = newName;
        setSchedule(newSchedule);
    };

    const openAddExercise = (dayIndex: number) => {
        setCurrentDayIndex(dayIndex);
        setIsModalOpen(true);
    };

    const handleAddExerciseToDay = (exercise: any, sets: number, reps: string) => {
        if (currentDayIndex === null) return;

        const newExercise: BuilderExercise = {
            tempId: Date.now(), 
            id: exercise.id,
            name: exercise.name || exercise.exercise_name,
            image: exercise.thumbnail_url || exercise.image_url || "https://via.placeholder.com/150", 
            sets,
            reps
        };

        const newSchedule = [...schedule];
        newSchedule[currentDayIndex].exercises.push(newExercise);
        setSchedule(newSchedule);
    };

    const removeExercise = (dayIndex: number, exTempId: number) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].exercises = newSchedule[dayIndex].exercises.filter(e => e.tempId !== exTempId);
        setSchedule(newSchedule);
    };

    // --- LƯU GIÁO ÁN (QUAN TRỌNG) ---
    const handleSavePlan = async () => {
        // Validate
        if (!planInfo.name.trim()) return toast.error("Vui lòng nhập tên giáo án!");
        const hasExercises = schedule.some(d => d.exercises.length > 0);
        if (!hasExercises) return toast.error("Giáo án chưa có bài tập nào!");

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            
            // Payload gửi đi
            const payload = {
                ...planInfo, 
                schedule: schedule.map(day => ({
                    dayNumber: day.dayNumber,
                    dayName: day.dayName,
                    exercises: day.exercises.map(ex => ({
                        id: ex.id,    
                        sets: ex.sets,
                        reps: ex.reps
                    }))
                }))
            };

            // 🔥 LOGIC PHÂN BIỆT TẠO MỚI / CẬP NHẬT 🔥
            if (editingPlanId) {
                // Nếu đang sửa -> Gọi PUT
                await axios.put(`http://localhost:8080/api/plans/${editingPlanId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("✅ Cập nhật giáo án thành công!");
            } else {
                // Nếu tạo mới -> Gọi POST
                await axios.post('http://localhost:8080/api/plans', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("🎉 Tạo giáo án mới thành công!");
            }

            onSuccess(); // Báo cho component cha reload list
            onClose();   // Đóng modal
            
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || "Lỗi khi lưu giáo án";
            if (error.response?.status === 403) {
                toast.error("Bạn không có quyền thực hiện (Chỉ Admin/PT)!");
            } else {
                toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // 1. LỚP NỀN MỜ
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            
            {/* 2. KHUNG CHỨA */}
            <div className="bg-white w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl relative">
        

                {/* 3. NỘI DUNG CHÍNH */}
                <div className="p-6 bg-gray-50 min-h-full">
                    
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                            <span className="text-4xl">🛠️</span> 
                            {editingPlanId ? "Chỉnh Sửa Giáo Án" : "Xây Dựng Giáo Án"}
                        </h1>
                        <button 
                            onClick={onClose}
                            className="text-red-500 hover:text-gray-700 font-medium px-4 py-2 border border-transparent hover:border-red-200 rounded"
                        >
                            Hủy bỏ
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* --- CỘT TRÁI: THÔNG TIN --- */}
                        <div className="lg:col-span-1 space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                            <h2 className="font-bold text-xl mb-4 text-teal-800 border-b pb-2">Thông tin cơ bản</h2>
                            
                            <div>
                                <label className="block font-bold text-sm mb-1 text-gray-700">Tên giáo án <span className="text-red-500">*</span></label>
                                <input 
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-black" 
                                    value={planInfo.name} 
                                    onChange={e => setPlanInfo({...planInfo, name: e.target.value})} 
                                    placeholder="VD: Tăng cơ 4 tuần..." 
                                />
                            </div>
                            
                            <div>
                                <label className="block font-bold text-sm mb-1 text-gray-700">Mô tả ngắn</label>
                                <textarea 
                                    className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-teal-500 outline-none resize-none text-black" 
                                    value={planInfo.description} 
                                    onChange={e => setPlanInfo({...planInfo, description: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-sm mb-1 text-gray-700">Cấp độ</label>
                                    <select 
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-black" 
                                        value={planInfo.level} 
                                        onChange={e => setPlanInfo({...planInfo, level: e.target.value})}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="All Levels">All Levels</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-sm mb-1 text-gray-700">Độ dài (Tuần)</label>
                                    <input 
                                        type="number" min={1} max={12}
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-black" 
                                        value={planInfo.duration_weeks} 
                                        onChange={e => setPlanInfo({...planInfo, duration_weeks: Number(e.target.value)})} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-sm mb-1 text-gray-700">Link Ảnh bìa</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-black" 
                                    value={planInfo.image_url} 
                                    onChange={e => setPlanInfo({...planInfo, image_url: e.target.value})} 
                                    placeholder="https://..." 
                                />
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <label className="block font-bold text-sm mb-2 text-gray-700">Số buổi tập / tuần</label>
                                <select 
                                    className="w-full border border-teal-200 bg-teal-50 p-3 rounded-lg font-bold text-teal-800 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer" 
                                    value={planInfo.days_per_week} 
                                    onChange={e => handleDaysChange(Number(e.target.value))}
                                >
                                    {[1,2,3,4,5,6,7].map(num => (
                                        <option key={num} value={num}>{num} buổi</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2 italic">*Lưu ý: Thay đổi số buổi sẽ reset lịch tập bên phải.</p>
                            </div>

                            <button 
                                onClick={handleSavePlan} 
                                disabled={isSubmitting}
                                className={`w-full text-white py-4 rounded-xl font-bold mt-6 shadow-lg flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 transform active:scale-95'}`}
                            >
                                {isSubmitting ? 'ĐANG LƯU...' : (editingPlanId ? '💾 CẬP NHẬT GIÁO ÁN' : '💾 Hoàn tất & Lưu')}
                            </button>
                        </div>

                        {/* --- CỘT PHẢI: LỊCH TRÌNH --- */}
                        <div className="lg:col-span-2 space-y-6 pb-20">
                            {schedule.map((day, dayIndex) => (
                                <div key={day.dayNumber} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                                    
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                D{day.dayNumber}
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Tên buổi tập</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-teal-500 outline-none font-bold text-lg text-gray-800 placeholder-gray-300 transition-colors"
                                                    value={day.dayName}
                                                    onChange={(e) => handleDayNameChange(dayIndex, e.target.value)}
                                                    placeholder={`Ví dụ: Ngực & Tay sau`}
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => openAddExercise(dayIndex)}
                                            className="text-sm bg-white border border-teal-500 text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-500 hover:text-white transition-all shadow-sm flex items-center gap-1"
                                        >
                                            <span>+</span> Thêm bài tập
                                        </button>
                                    </div>

                                    {/* Danh sách bài tập */}
                                    <div className="p-4 space-y-3 min-h-[100px]">
                                        {day.exercises.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-6 border-2 border-dashed border-gray-100 rounded-xl">
                                                <span className="text-2xl mb-2">📭</span>
                                                <p className="text-sm italic">Chưa có bài tập nào</p>
                                            </div>
                                        ) : (
                                            day.exercises.map((ex, exIndex) => (
                                                <div key={ex.tempId} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all group">
                                                    <span className="font-bold text-gray-300 w-6 text-center">{exIndex + 1}</span>
                                                    
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img 
                                                            src={ex.image} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => e.currentTarget.src = "https://via.placeholder.com/150"}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-800 truncate">{ex.name}</h4>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">Sets: {ex.sets}</span>
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">Reps: {ex.reps}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => removeExercise(dayIndex, ex.tempId)}
                                                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Xóa bài này"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ExerciseSelectorModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSelect={handleAddExerciseToDay}
            />
        </div>
    );
};

export default PlanBuilder;