// frontend/src/components/nutrition/LessonSection.tsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Lesson {
    id: number;
    tieu_de: string;
    hinh_anh: string; 
    tom_tat: string;
    noi_dung: string;
    loai: string;
    ngay_tao: string;
}

// Sử dụng React.forwardRef để nhận ref từ component cha
const LessonSection = React.forwardRef<HTMLDivElement>((props, ref) => {
    const navigate = useNavigate()
    
    // --- STATE CHO BÀI HỌC ---
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeLessonCategory, setActiveLessonCategory] = useState<string>("coban");

    // --- LOGIC CHO BÀI HỌC ---
    useEffect(() => {
        fetch(`http://localhost:8080/lesson`, {
            method: "GET",
            headers: { "Content-type": "application/json" }
        })
        .then((res) => res.json())
        .then((res) => {
            const data = Array.isArray(res) ? res : (res && res.data && Array.isArray(res.data)) ? res.data : [];
            setLessons(data);
        })
        .catch((error) => {
            console.error("Lỗi khi tải bài học:", error);
            setLessons([]);
        });
    }, []);

    const filteredLessons = lessons.filter(lesson => lesson.loai === activeLessonCategory);

    const handleLessonClick = (lessonId: number) => {
        navigate(`/lesson/${lessonId}`);
    };

    // --- RENDER PHỤ ---
    const renderLessonCard = (lesson: Lesson) => (
        <div 
            key={lesson.id} 
            className="bg-white rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-all duration-300 hover:scale-[1.03] shadow-md border border-gray-100"
            onClick={() => handleLessonClick(lesson.id)}
        >
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-3xl text-white">
                            {lesson.loai === 'coban' ? '📚' : '💪'}
                        </span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-teal-600 transition-colors">
                        {lesson.tieu_de}
                    </h3>
                    <p className="text-gray-600 text-sm leading-6 mb-3 line-clamp-2">
                        {lesson.tom_tat}
                    </p>
                    <span className="text-teal-500 text-sm font-semibold hover:text-teal-600">
                        Đọc thêm →
                    </span>
                </div>
            </div>
        </div>
    );

    // --- RENDER CHÍNH CỦA COMPONENT ---
    return (
        // Gắn ref vào đây
        <div ref={ref} className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">📚 Hệ thống bài học dinh dưỡng</h2>
                    <p className="text-xl text-gray-600">Từ cơ bản đến nâng cao - Xây dựng nền tảng kiến thức vững chắc</p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="bg-gray-200 rounded-lg p-2 shadow-inner">
                        <button
                            onClick={() => setActiveLessonCategory("coban")}
                            className={`px-6 py-3 mr-2 rounded-lg font-semibold transition-all ${
                                activeLessonCategory === "coban" 
                                    ? "bg-teal-500 text-white shadow-md" 
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            📖 Kiến thức cơ bản
                        </button>
                        <button
                            onClick={() => setActiveLessonCategory("tapluyen")}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                activeLessonCategory === "tapluyen" 
                                    ? "bg-teal-500 text-white shadow-md" 
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            💪 Dinh dưỡng & Tập luyện
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredLessons.length > 0 ? (
                        filteredLessons.map(renderLessonCard)
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài học</h3>
                            <p className="text-gray-600">Nội dung đang được cập nhật...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default LessonSection;