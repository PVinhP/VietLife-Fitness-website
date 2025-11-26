import React from 'react';

// Định nghĩa lại interface cho props
interface ExerciseCardProps {
    exercise: {
        id: number;
        exercise_name: string;
        thumbnail_url: string;
        muscle_group: string;
        equipment_required: string;
        difficulty?: string; // Cột mới
    };
    onClick: () => void; // Hàm xử lý khi click vào card
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
    return (
        <div 
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-teal-100 group"
            onClick={onClick}
        >
            {/* 1. Phần Ảnh Thumbnail */}
            <div className="aspect-video overflow-hidden relative bg-gray-100">
                {exercise.thumbnail_url ? (
                    <img 
                        src={exercise.thumbnail_url} 
                        alt={exercise.exercise_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                    </div>
                )}
                
                {/* Overlay icon Play khi hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                    <div className="bg-white/90 p-3 rounded-full shadow-lg">
                        <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* 2. Phần Nội dung */}
            <div className="p-4">
                {/* Tên bài & Badge Độ khó */}
                <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-teal-600 transition-colors" title={exercise.exercise_name}>
                        {exercise.exercise_name}
                    </h3>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                        exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-600' :
                        exercise.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600' // Mặc định là Beginner
                    }`}>
                        {exercise.difficulty || 'Easy'}
                    </span>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="truncate">{exercise.muscle_group}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="truncate">{exercise.equipment_required}</span>
                    </div>
                </div>

                {/* Footer Card */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">VietLife Library</span>
                    <span className="text-sm font-semibold text-teal-600 group-hover:translate-x-1 transition-transform flex items-center">
                        Tập ngay <span className="ml-1">→</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ExerciseCard;