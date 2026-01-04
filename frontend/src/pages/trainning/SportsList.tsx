import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // 1. Đã mở comment import axios

interface Sport {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
}

const SportsList = () => {
    const [sports, setSports] = useState<Sport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 2. Hàm gọi API thật từ Backend
        const fetchSports = async () => {
            try {
                // Đảm bảo URL này đúng với port backend của bạn (8080)
                const res = await axios.get('https://vietlife-fitness-website-host.onrender.com/api/sports');
                setSports(res.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách môn thể thao:", error);
                // Có thể thêm thông báo lỗi nhẹ ở đây nếu muốn
            } finally {
                setIsLoading(false);
            }
        };

        fetchSports();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Tập Luyện Bổ Trợ Thể Thao
                    </h1>
                    <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto">
                        Đừng chỉ chơi theo bản năng. Hãy tập Gym đúng cách để chơi thể thao giỏi hơn, mạnh hơn và hạn chế chấn thương.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
                {isLoading ? (
                    // Skeleton Loading đơn giản hoặc text loading
                    <div className="flex justify-center items-center py-20 bg-white rounded-2xl shadow-lg">
                        <div className="text-teal-600 text-xl font-semibold animate-pulse">
                            Đang tải danh sách môn thể thao...
                        </div>
                    </div>
                ) : sports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sports.map((sport) => (
                            <Link 
                                key={sport.id} 
                                to={`/training/sports/${sport.slug}`}
                                className="group relative block h-80 rounded-2xl overflow-hidden shadow-xl transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl bg-gray-200"
                            >
                                {/* Background Image with Zoom Effect */}
                                <div className="absolute inset-0">
                                    {sport.image_url ? (
                                        <img 
                                            src={sport.image_url} 
                                            alt={sport.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white">No Image</div>
                                    )}
                                    
                                    {/* Gradient Overlay để chữ dễ đọc */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <div className="transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                                            {sport.name}
                                        </h3>
                                        <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            {sport.description}
                                        </p>
                                        
                                        <span className="inline-flex items-center text-sm font-semibold text-white bg-teal-600/90 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
                                            Xem bài tập <span className="ml-2">→</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                        <p className="text-gray-500 text-lg">Chưa có môn thể thao nào được cập nhật.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SportsList;