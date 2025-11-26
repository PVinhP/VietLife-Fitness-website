import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ExerciseItem {
    id: number; // ID trong bảng workout_plan_exercises
    exercise_id: number; // ID trong bảng exercises gốc
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
    const [plan, setPlan] = useState<PlanDetailType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/plans/${id}`);
                setPlan(res.data);
            } catch (error) {
                console.error("Lỗi tải chi tiết giáo án:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleViewExercise = (exerciseId: number) => {
        // Chuyển sang trang Exercise Library, tự động mở bài tập đó
        // (Logic này đã được bạn xử lý ở Exercise.tsx rồi)
        navigate('/exercise', { 
            state: { 
                selectedExerciseId: exerciseId,
                fromPlan: true // Để sau này làm nút Back quay lại đây (nếu muốn)
            } 
        });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div></div>;
    if (!plan) return <div className="p-10 text-center">Không tìm thấy giáo án!</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. Hero Section */}
            <div className="relative h-[400px] lg:h-[500px]">
                <img src={plan.image_url} alt={plan.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                    <div className="max-w-5xl mx-auto">
                        <button onClick={() => navigate('/training/plans')} className="mb-4 flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                            ← Quay lại danh sách
                        </button>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{plan.name}</h1>
                        <p className="text-gray-200 text-lg md:text-xl max-w-3xl mb-6 line-clamp-2 md:line-clamp-none">
                            {plan.description}
                        </p>
                        
                        {/* Stats Badges */}
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                <span className="block text-xs text-gray-300 uppercase">Trình độ</span>
                                <span className="font-bold">{plan.level}</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                <span className="block text-xs text-gray-300 uppercase">Thời lượng</span>
                                <span className="font-bold">{plan.duration_weeks} Tuần</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                <span className="block text-xs text-gray-300 uppercase">Tần suất</span>
                                <span className="font-bold">{plan.days_per_week} Buổi/tuần</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Schedule List */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="space-y-8">
                    {plan.schedule.map((day) => (
                        <div key={day.day_number} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            {/* Day Header */}
                            <div className="bg-teal-600 px-6 py-4 flex justify-between items-center text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <span className="bg-white/20 px-3 py-1 rounded text-sm">Ngày {day.day_number}</span>
                                    {day.day_name}
                                </h3>
                                <span className="text-sm opacity-90">{day.exercises.length} bài tập</span>
                            </div>

                            {/* Exercises List */}
                            <div className="divide-y divide-gray-100">
                                {day.exercises.map((ex, index) => (
                                    <div 
                                        key={index} 
                                        onClick={() => handleViewExercise(ex.exercise_id)}
                                        className="p-4 flex items-center gap-4 hover:bg-teal-50 transition-colors cursor-pointer group"
                                    >
                                        {/* Number */}
                                        <span className="text-gray-400 font-bold text-lg w-6">{index + 1}</span>
                                        
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200">
                                            <img src={ex.thumbnail_url} alt={ex.exercise_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors line-clamp-1">
                                                {ex.exercise_name}
                                            </h4>
                                            <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">{ex.muscle_group}</span>
                                            </div>
                                        </div>

                                        {/* Sets/Reps Badges */}
                                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-end md:items-center text-right">
                                            <div className="text-sm">
                                                <span className="block text-gray-400 text-xs uppercase">Sets</span>
                                                <span className="font-bold text-teal-600">{ex.sets}</span>
                                            </div>
                                            <div className="text-sm w-16">
                                                <span className="block text-gray-400 text-xs uppercase">Reps</span>
                                                <span className="font-bold text-gray-800">{ex.reps}</span>
                                            </div>
                                            {/* Arrow Icon */}
                                            <svg className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlanDetail;