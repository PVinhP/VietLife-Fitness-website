// FILE: frontend/src/pages/nutrition/RecipeDetailModal.tsx

import React, { useEffect, useState } from 'react';

interface RecipeDetail {
    recipe_id: number;
    name: string;
    description: string;
    image_url: string;
    calories: number;
    protein_g: number;
    fat_g: number;
    carb_g: number;
    prep_time: number;
    cook_time: number;
    difficulty: string;
    instructions: string;
    video_url?: string;
}

interface RecipeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipeId: number | null;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ isOpen, onClose, recipeId }) => {
    const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && recipeId) {
            const fetchDetail = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`http://localhost:8080/recipes/${recipeId}`);
                    const data = await res.json();
                    if (data.success) {
                        setRecipe(data.recipe);
                    }
                } catch (error) {
                    console.error("Lỗi tải chi tiết:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetail();
        } else {
            setRecipe(null);
        }
    }, [isOpen, recipeId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            {/* Container chính - Mô phỏng theo hình ảnh user gửi */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        🍽️ Chi tiết món ăn
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                        </div>
                    ) : recipe ? (
                        <div className="flex flex-col md:flex-row h-full">
                            
                            {/* Cột Trái: Ảnh & Thông tin cơ bản */}
                            <div className="w-full md:w-2/5 bg-gray-50 p-6 border-r border-gray-100 flex flex-col gap-6">
                                <div className="rounded-xl overflow-hidden shadow-md h-64 md:h-auto md:aspect-square relative">
                                    <img 
                                        src={recipe.image_url || 'https://via.placeholder.com/400'} 
                                        alt={recipe.name} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-teal-600 shadow-sm">
                                        {recipe.difficulty}
                                    </div>
                                </div>

                                {/* Bảng dinh dưỡng */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Giá trị dinh dưỡng</h3>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase">Calories</div>
                                            <div className="text-xl font-extrabold text-orange-600">{recipe.calories}</div>
                                        </div>
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase">Protein</div>
                                            <div className="text-xl font-bold text-blue-600">{recipe.protein_g}g</div>
                                        </div>
                                        <div className="p-2 bg-yellow-50 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase">Fat</div>
                                            <div className="text-xl font-bold text-yellow-600">{recipe.fat_g}g</div>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase">Carb</div>
                                            <div className="text-xl font-bold text-green-600">{recipe.carb_g}g</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thời gian */}
                                <div className="flex justify-between text-sm text-gray-600 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className='flex flex-col items-center'>
                                        <span className='text-xs uppercase text-gray-400'>Chuẩn bị</span>
                                        <span className='font-bold text-gray-800'>{recipe.prep_time}p</span>
                                    </div>
                                    <div className='w-px bg-gray-200'></div>
                                    <div className='flex flex-col items-center'>
                                        <span className='text-xs uppercase text-gray-400'>Nấu</span>
                                        <span className='font-bold text-gray-800'>{recipe.cook_time}p</span>
                                    </div>
                                    <div className='w-px bg-gray-200'></div>
                                    <div className='flex flex-col items-center'>
                                        <span className='text-xs uppercase text-gray-400'>Tổng</span>
                                        <span className='font-bold text-gray-800'>{recipe.prep_time + recipe.cook_time}p</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cột Phải: Nội dung chi tiết */}
                            <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-[80vh]">
                                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{recipe.name}</h1>
                                <p className="text-gray-500 italic mb-6">{recipe.description}</p>

                                {/* Ingredients (Nếu có data thì hiển thị, hiện tại giả lập từ mô tả hoặc để trống nếu chưa có bảng riêng) */}
                                {/* <div className="mb-8">
                                    <h3 className="text-xl font-bold text-teal-700 mb-4 flex items-center">
                                        🥗 Nguyên liệu
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li>Dữ liệu nguyên liệu đang cập nhật...</li>
                                    </ul>
                                </div> */}

                                {/* Hướng dẫn làm */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-teal-700 mb-4 flex items-center bg-teal-50 p-2 rounded-lg inline-block">
                                        📝 Hướng dẫn thực hiện
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Tách chuỗi instructions theo dòng mới để hiển thị đẹp hơn */}
                                        {recipe.instructions ? recipe.instructions.split('\n').map((step, index) => (
                                            step.trim() && (
                                                <div key={index} className="flex gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed mt-1">
                                                        {step}
                                                    </p>
                                                </div>
                                            )
                                        )) : (
                                            <p>Chưa có hướng dẫn cụ thể.</p>
                                        )}
                                    </div>
                                </div>

                                {recipe.video_url && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Video Hướng Dẫn</h3>
                                        <a href={recipe.video_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-2">
                                            ▶️ Xem video hướng dẫn tại đây
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-500">Không tìm thấy dữ liệu.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailModal;