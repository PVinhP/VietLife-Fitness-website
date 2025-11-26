import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExerciseCard from '../../components/ExerciseCard'; // Tái sử dụng cái này!

// Định nghĩa kiểu dữ liệu
interface SportDetailType {
    id: number;
    name: string;
    description: string;
    image_url: string;
    exercises: any[]; // List bài tập
}

const SportDetail = () => {
    const { slug } = useParams(); // Lấy slug từ URL
    const navigate = useNavigate();
    const [sport, setSport] = useState<SportDetailType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Thay localhost bằng URL thật của bạn
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

    // Hàm chuyển hướng khi click vào bài tập
    const handleViewExercise = (exercise: any) => {
        navigate(`/exercise`, { 
            state: { 
                selectedExerciseId: exercise.id,
                fromSport: true // <--- THÊM DÒNG NÀY: Đánh dấu là đến từ trang Thể thao
            } 
        });
    };

    if (loading) return <div className="p-10 text-center">Đang tải chiến thuật... ⚽</div>;
    if (!sport) return <div className="p-10 text-center">Không tìm thấy môn này!</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. Header Hero Section (Ảnh nền to đẹp) */}
            <div className="relative h-[400px]">
                <img 
                    src={sport.image_url} 
                    alt={sport.name} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/training/sports" className="text-teal-300 hover:text-white mb-4 inline-block font-medium">
                            ← Quay lại danh sách
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
                            {sport.name}
                        </h1>
                        <p className="text-xl text-gray-200 max-w-3xl">
                            {sport.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Danh sách bài tập bổ trợ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-teal-600 w-2 h-10 rounded-full"></div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Các bài tập bổ trợ</h2>
                        <p className="text-gray-500">Thực hiện các bài này 2-3 lần/tuần để thấy hiệu quả.</p>
                    </div>
                </div>

                {/* Grid Bài tập (Tái sử dụng ExerciseCard) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sport.exercises.length > 0 ? (
                        sport.exercises.map((ex) => (
                            <ExerciseCard 
                                key={ex.id} 
                                exercise={ex} 
                                onClick={() => handleViewExercise(ex)} 
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic col-span-3 text-center py-10">
                            Chưa có bài tập nào được cập nhật cho môn này.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SportDetail;