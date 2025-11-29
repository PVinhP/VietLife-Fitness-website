import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- Interface ---
interface ExerciseWithReason {
    id: number;
    exercise_name: string;
    thumbnail_url: string;
    muscle_group: string;
    equipment_required: string;
    reason: string;
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

    const handleViewExercise = (exercise: ExerciseWithReason) => {
        navigate(`/exercise`, { 
            state: { selectedExerciseId: exercise.id, fromSport: true } 
        });
    };

    // --- HÀM XỬ LÝ LINK YOUTUBE ---
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        // Trường hợp 1: Link dạng embed sẵn (https://www.youtube.com/embed/...)
        if (url.includes('/embed/')) return url;

        // Trường hợp 2: Link dạng xem thường (https://www.youtube.com/watch?v=...)
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/)([^&?]*))/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // Trả về nguyên gốc nếu không parse được
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-teal-600 font-bold text-xl animate-pulse">Đang tải chiến thuật... ⚽</div></div>;
    if (!sport) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-500 text-xl">Không tìm thấy môn thể thao này!</div></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* HERO SECTION */}
            <div className="relative h-[400px]">
                <img src={sport.image_url} alt={sport.name} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/training/sports" className="text-teal-300 hover:text-white mb-4 inline-flex items-center font-medium transition-colors">
                            <span className="mr-2">←</span> Quay lại danh sách
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">{sport.name}</h1>
                        <p className="text-xl text-gray-200 max-w-3xl leading-relaxed">{sport.description}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* PHẦN BÀI TẬP BỔ TRỢ (GYM) */}
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
                                <div key={ex.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full">
                                    <div className="aspect-video overflow-hidden relative">
                                        <img src={ex.thumbnail_url} alt={ex.exercise_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h4 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">{ex.exercise_name}</h4>
                                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 mb-6 flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">💡</span>
                                                <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">Tại sao cần tập?</p>
                                            </div>
                                            <p className="text-sm text-teal-900 font-medium leading-relaxed">{ex.reason || "Bổ trợ nhóm cơ quan trọng."}</p>
                                        </div>
                                        <button onClick={() => handleViewExercise(ex)} className="w-full py-3 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
                                            Xem hướng dẫn tập
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-100 rounded-xl"><p className="text-gray-500">Chưa có bài tập bổ trợ nào được cập nhật.</p></div>
                    )}
                </div>

                {/* --- 3. PHẦN KỸ NĂNG CHUYÊN MÔN (VIDEO NHÚNG) --- */}
                {sport.skills && sport.skills.length > 0 && (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-orange-500 w-2 h-10 rounded-full"></div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Kỹ Năng Chuyên Môn</h2>
                                <p className="text-gray-500">Các bài tập kỹ thuật (Drills) giúp bạn chơi hay hơn trên sân.</p>
                            </div>
                        </div>
                        

                        <div className="space-y-8">
                            {sport.skills.map((skill) => (
                                <div key={skill.id} className="bg-white p-6 rounded-2xl shadow-lg border border-orange-50 hover:border-orange-200 transition-all flex flex-col md:flex-row gap-6">
                                    
                                    {/* Video Player - Dùng iframe */}
                                    <div className="w-full md:w-80 aspect-video rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-black">
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={getEmbedUrl(skill.video_url)} 
                                            title={skill.name}
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-2">
                                            <h3 className="text-2xl font-bold text-gray-800 hover:text-orange-600 transition-colors cursor-pointer">
                                                {skill.name}
                                            </h3>
                                            <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide self-start ${
                                                skill.difficulty === 'Basic' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                {skill.difficulty}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-600 leading-relaxed text-lg mb-4">
                                            {skill.description}
                                        </p>

                                        {/* Nút mở rộng xem trên Youtube nếu muốn */}
                                        <a 
                                            href={skill.video_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-orange-500 text-sm font-semibold hover:underline flex items-center gap-1 mt-auto"
                                        >
                                            Xem nguồn Youtube ↗
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