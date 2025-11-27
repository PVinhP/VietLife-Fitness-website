import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface ExerciseWithReason {
    id: number;
    exercise_name: string;
    thumbnail_url: string;
    muscle_group: string;
    equipment_required: string;
    reason: string; // Cột lý do quan trọng
}

interface Skill {
    id: number;
    name: string;
    description: string;
    video_url: string;
    difficulty: string;
}

interface SportDetailType {
    id: number;
    name: string;
    description: string;
    image_url: string;
    exercises: ExerciseWithReason[];
    skills: Skill[]; 
}

const SportDetail = () => {
    const { slug } = useParams(); 
    const navigate = useNavigate();
    const [sport, setSport] = useState<SportDetailType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Gọi API lấy chi tiết môn + bài tập + kỹ năng
                const res = await axios.get(`http://localhost:8080/api/sports/${slug}`);
                setSport(res.data);
            } catch (error) {
                console.error("Lỗi tải trang chi tiết", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    // Hàm chuyển hướng sang xem video bài tập Gym
    const handleViewExercise = (exercise: ExerciseWithReason) => {
        navigate(`/exercise`, { 
            state: { 
                selectedExerciseId: exercise.id,
                fromSport: true // Đánh dấu để nút "Quay lại" hoạt động đúng
            } 
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-teal-600 font-bold text-xl animate-pulse">Đang tải chiến thuật... ⚽</div>
        </div>
    );
    
    if (!sport) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-gray-500 text-xl">Không tìm thấy môn thể thao này!</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* --- 1. HERO SECTION (Ảnh bìa) --- */}
            <div className="relative h-[400px]">
                <img 
                    src={sport.image_url} 
                    alt={sport.name} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/training/sports" className="text-teal-300 hover:text-white mb-4 inline-flex items-center font-medium transition-colors">
                            <span className="mr-2">←</span> Quay lại danh sách
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            {sport.name}
                        </h1>
                        <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">
                            {sport.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* --- 2. PHẦN BÀI TẬP BỔ TRỢ (GYM/FITNESS) --- */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-teal-600 w-2 h-10 rounded-full"></div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Thể Lực & Sức Mạnh</h2>
                            <p className="text-gray-500">Các bài tập Gym nền tảng giúp nâng cao hiệu suất thi đấu.</p>
                        </div>
                    </div>

                    {sport.exercises.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sport.exercises.map((ex) => (
                                <div 
                                    key={ex.id} 
                                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video overflow-hidden relative">
                                        <img 
                                            src={ex.thumbnail_url} 
                                            alt={ex.exercise_name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h4 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                                            {ex.exercise_name}
                                        </h4>
                                        
                                        {/* Box Lý do (Điểm nhấn) */}
                                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mb-6 flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">💡</span>
                                                <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">Tại sao cần tập?</p>
                                            </div>
                                            <p className="text-sm text-teal-900 font-medium leading-relaxed">
                                                {ex.reason || "Bổ trợ nhóm cơ quan trọng, giúp tăng sức bền và sức mạnh."}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => handleViewExercise(ex)}
                                            className="w-full py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                                        >
                                            Xem hướng dẫn tập
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-100 rounded-xl">
                            <p className="text-gray-500">Chưa có bài tập bổ trợ nào được cập nhật.</p>
                        </div>
                    )}
                </div>

                {/* --- 3. PHẦN KỸ NĂNG CHUYÊN MÔN (SKILLS) --- */}
                {sport.skills && sport.skills.length > 0 && (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-orange-500 w-2 h-10 rounded-full"></div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Kỹ Năng Chuyên Môn</h2>
                                <p className="text-gray-500">Các bài tập kỹ thuật (Drills) giúp bạn chơi hay hơn trên sân.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {sport.skills.map((skill) => (
                                <div key={skill.id} className="bg-white p-6 rounded-2xl shadow-md border border-orange-50 hover:border-orange-200 transition-all flex flex-col md:flex-row gap-6">
                                    {/* Video Placeholder */}
                                    <div className="w-full md:w-72 aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-white flex-shrink-0 relative overflow-hidden group">
                                        {/* Nếu muốn nhúng Youtube thật thì dùng iframe ở đây */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">▶</span>
                                        <span className="absolute bottom-3 left-3 text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Video Demo</span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2">
                                            <h3 className="text-2xl font-bold text-gray-800">{skill.name}</h3>
                                            <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide self-start ${
                                                skill.difficulty === 'Basic' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                {skill.difficulty}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                                            {skill.description}
                                        </p>
                                        
                                        <a 
                                            href={skill.video_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                                        >
                                            📺 Xem video hướng dẫn chi tiết trên Youtube
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SportDetail;