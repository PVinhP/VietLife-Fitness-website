import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaHeartbeat, FaStopwatch, FaArrowRight, FaRunning, FaCalculator, FaWeightHanging } from 'react-icons/fa';

const tools = [
    // 1. Nhóm SỨC MẠNH (Strength)
    {
        id: '1rm',
        name: 'Dự đoán sức mạnh (1RM)',
        icon: <FaDumbbell/>,
        description: 'Tính mức tạ tối đa bạn có thể nâng 1 lần. Công cụ nền tảng để chọn mức tạ cho lịch tập Strength hoặc Hypertrophy.',
        path: '/training/tools/1rm',
        color: 'bg-teal-50 text-teal-600 border-teal-200 text-black',
        badge: 'Gym'
    },
    {
        id: 'plate',
        name: 'Tính Lắp Bánh Tạ',
        icon: <FaWeightHanging/>,
        description: 'Không biết lắp mỗi bên bao nhiêu kg? Nhập tổng mức tạ, chúng tôi sẽ chỉ cho bạn cách lắp bánh tạ chuẩn nhất.',
        path: '/training/tools/plate-calculator', // (Sắp ra mắt)
        color: 'bg-gray-50 text-gray-600 border-gray-200 text-black',
        badge: 'Tiện ích'
    },

    // 2. Nhóm CARDIO & THỂ THAO
    {
        id: 'pace',
        name: 'Máy Tính Tốc Độ (Pace)',
        icon: <FaRunning/>,
        description: 'Tính tốc độ chạy bộ (Pace) hoặc dự đoán thời gian hoàn thành cự ly Marathon. Vũ khí bí mật của Runner.',
        path: '/training/tools/pace',
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200  text-black',
        badge: 'Cardio'
    },
    {
        id: 'timer',
        name: 'Đồng hồ HIIT/Tabata',
        icon: <FaStopwatch/>,
        description: 'Trợ lý đếm ngược thời gian tập luyện cường độ cao. Tùy chỉnh thời gian Tập/Nghỉ và số hiệp.',
        path: '/training/tools/timer',
        color: 'bg-orange-50 text-orange-600 border-orange-200 text-black',
        badge: 'Hỗ trợ tập'
    },

    // 3. Nhóm SỨC KHỎE (Health)
    {
        id: 'heart-rate',
        name: 'Vùng Nhịp Tim (HR)',
        icon: <FaHeartbeat/>,
        description: 'Tính vùng nhịp tim đốt mỡ (Fat Burn) và Cardio tối ưu dựa trên tuổi. Giúp bạn chạy bộ hiệu quả hơn.',
        path: '/training/tools/heartratezones', // (Sắp ra mắt)
        color: 'bg-rose-50 text-rose-600 border-rose-200 text-black',
        badge: 'Sức bền'
    },
    {
        id: 'wilks',
        name: 'Điểm sức mạnh (Wilks)',
        icon: <FaCalculator/>,
        description: 'So sánh sức mạnh tương đối giữa các vận động viên có cân nặng khác nhau (Chuẩn Powerlifting).',
        path: '/training/tools/wilks', // (Sắp ra mắt)
        color: 'bg-purple-50 text-purple-600 border-purple-200 text-black',
        badge: 'Nâng cao'
    },
];

const ToolsList = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Modern */}
            <div className="bg-slate-900 text-white py-16 px-4 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10 animate-pulse"></div>
                
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                        Kho Công Cụ <span className="text-teal-400">Tập Luyện</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Đừng tập luyện theo cảm tính. Hãy dùng những con số khoa học để đạt kết quả nhanh hơn và an toàn hơn.
                    </p>
                </div>
            </div>

            {/* Grid Tools */}
            <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <Link 
                            key={tool.id} 
                            to={tool.path}
                            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-300 group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${tool.color} shadow-sm`}>
                                    {tool.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${tool.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-10 ')}`}>
                                    {tool.badge}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                                {tool.name}
                            </h3>
                            
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">
                                {tool.description}
                            </p>
                            
                            <div className="flex items-center text-teal-600 font-bold text-sm mt-auto group-hover:translate-x-2 transition-transform">
                                Sử dụng ngay <FaArrowRight className="ml-2 text-xs"/>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Banner Quảng cáo chéo sang Dinh dưỡng */}
                <div className="mt-16 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Tập luyện chỉ chiếm 30% kết quả!</h2>
                        <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
                            70% còn lại nằm ở dinh dưỡng. Hãy kiểm tra xem bạn cần ăn bao nhiêu Calo mỗi ngày để đạt mục tiêu.
                        </p>
                        <Link to="/nutrition/tools" className="inline-block px-8 py-4 bg-white text-teal-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1">
                            🥗 Tính TDEE & Macro ngay
                        </Link>
                    </div>
                    {/* Decor circle */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
                </div>
            </div>
        </div>
    );
};

export default ToolsList;