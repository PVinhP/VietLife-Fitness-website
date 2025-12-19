// src/pages/workout/DailyWorkoutSession.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlayCircle, FaCheckCircle, FaDumbbell, FaClock } from 'react-icons/fa';

interface Exercise {
    exercise_id?: number;
    name: string;
    sets: string;
    reps: string;
    note: string;
    thumbnail_url?: string;
    video_url?: string;
    is_real?: boolean;
}

const DailyWorkoutSession = () => {
    const navigate = useNavigate();
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch bài tập hôm nay
    useEffect(() => {
        const fetchTodayWorkout = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/ai-plan/today-workout', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (data.hasPlan && data.workout) {
                    setWorkout(data.workout);
                }
            } catch (error) {
                console.error("Lỗi tải bài tập:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTodayWorkout();
    }, []);
        // Hàm xử lý khi bấm Hoàn thành
    const handleFinishWorkout = () => {
        // 1. Có thể gọi API lưu trạng thái hoàn thành vào DB tại đây (nếu cần)
        
        // 2. Thông báo
        alert("🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc buổi tập hôm nay.");
        
        // 3. Chuyển hướng về Dashboard
        navigate('/profile/dashboard');
        
        // 4. QUAN TRỌNG: Cuộn lên đầu trang ngay lập tức
        window.scrollTo(0, 0);
    };

    if (loading) return <div className="p-10 text-center">Đang tải bài tập...</div>;
    if (!workout) return <div className="p-10 text-center">Hôm nay không có bài tập nào!</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{workout.day} - {workout.focus}</h1>
                    <p className="text-sm text-gray-500">{workout.exercises.length} bài tập</p>
                </div>
            </div>

            {/* List Bài Tập */}
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {workout.exercises.map((ex: Exercise, idx: number) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative group cursor-pointer">
                            {ex.thumbnail_url ? (
                                <img src={ex.thumbnail_url} alt={ex.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FaDumbbell size={24}/>
                                </div>
                            )}
                            {ex.video_url && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaPlayCircle className="text-white text-2xl"/>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{ex.name}</h3>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded">
                                    {ex.sets} Sets
                                </span>
                                <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded">
                                    {ex.reps} Reps
                                </span>
                            </div>

                            {ex.note && (
                                <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                                    💡 Lưu ý: {ex.note}
                                </p>
                            )}
                        </div>

                        {/* Checkbox hoàn thành (Giả lập) */}
                        <div className="flex items-center justify-center pl-2 border-l">
                            <input type="checkbox" className="w-6 h-6 text-green-600 rounded focus:ring-green-500 cursor-pointer" />
                        </div>
                    </div>
                ))}

                <button 
                    className="w-full mt-8 bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition transform active:scale-95 flex items-center justify-center gap-2"
                    onClick={handleFinishWorkout}
                >
                    <FaCheckCircle /> HOÀN THÀNH BUỔI TẬP
                </button>
            </div>
        </div>
    );
};

export default DailyWorkoutSession;