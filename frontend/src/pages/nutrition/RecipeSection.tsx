// FILE: frontend/src/pages/nutrition/RecipeSection.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- I. INTERFACES VÀ HẰNG SỐ ---

interface Recipe {
    recipeId: number; // Đổi tên từ recipe_id (nếu cần, nhưng controller đã trả về đúng)
    name: string;
    description: string;
    imageUrl: string; // Đổi tên từ image_url
    calories: number;
    prep_time: number;
    cook_time: number;
    // Backend trả về mealType và goal, khớp với interface
    mealType: 'Bữa sáng' | 'Bữa trưa' | 'Bữa tối' | 'Ăn vặt'; 
    goal: 'Giảm mỡ' | 'Tăng cơ' | 'Ăn sạch';
    difficulty: 'Dễ' | 'Trung bình' | 'Khó';
}

interface Filters {
    meal: string;
    goal: string;
    time: string;
    calorie: string;
}

const DEFAULT_FILTERS: Filters = {
    meal: 'Tất cả',
    goal: 'Tất cả',
    time: 'Tất cả',
    calorie: 'Tất cả',
};

// (XÓA) Dữ liệu mẫu DUMMY_RECIPES đã bị xóa.

const FILTERS_OPTIONS = {
    MEAL: ['Tất cả', 'Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Ăn vặt'],
    GOAL: ['Tất cả', 'Giảm mỡ', 'Tăng cơ', 'Ăn sạch'],
    TIME: ['Tất cả', 'Dưới 15 phút', '15-30 phút', 'Trên 30 phút'],
    CALORIE: ['Tất cả', 'Dưới 300 Calo', '300-500 Calo', 'Trên 500 Calo'],
};

// (XÓA) Các hàm logic lọc matchesCalorie và matchesTime đã bị xóa
// (Backend sẽ xử lý logic lọc này)


// --- II. COMPONENT FILTER MODAL (Không thay đổi) ---
// ... (Giữ nguyên toàn bộ component FilterGroupInModal và FilterModal) ...

// Component con hiển thị nhóm nút lọc trong Modal
const FilterGroupInModal: React.FC<{
    title: string;
    filters: string[];
    activeFilter: string;
    onSelect: (value: string) => void;
}> = ({ title, filters, activeFilter, onSelect }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => onSelect(filter)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all border ${
                        activeFilter === filter 
                            ? "bg-teal-500 text-white font-bold border-teal-500" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-teal-50"
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
    </div>
);

// Component Modal Bộ Lọc Chính
const FilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    activeFilters: Filters;
    onApply: (filters: Filters) => void;
}> = ({ isOpen, onClose, activeFilters, onApply }) => {
    // State tạm thời chỉ tồn tại trong Modal
    const [tempFilters, setTempFilters] = useState<Filters>(activeFilters);

    // Đồng bộ state tạm thời với state chính khi Modal mở
    useEffect(() => {
        if (isOpen) {
            setTempFilters(activeFilters);
        }
    }, [isOpen, activeFilters]);

    if (!isOpen) return null;

    // Cập nhật bộ lọc tạm thời
    const handleTempFilterChange = (type: keyof Filters, value: string) => {
        setTempFilters(prev => ({ ...prev, [type]: value }));
    };

    // Áp dụng bộ lọc và đóng modal
    const handleApply = () => {
        onApply(tempFilters);
        onClose();
    };

    // Đặt lại bộ lọc về mặc định
    const handleReset = () => {
        setTempFilters(DEFAULT_FILTERS);
        onApply(DEFAULT_FILTERS);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                
                {/* Header Modal */}
                <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold">⚙️ Tùy chọn Bộ lọc</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600">
                        {/* Icon X */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Body Modal - Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <FilterGroupInModal 
                        title="Lọc theo Bữa ăn" 
                        filters={FILTERS_OPTIONS.MEAL} 
                        activeFilter={tempFilters.meal} 
                        onSelect={(v) => handleTempFilterChange('meal', v)} 
                    />
                    <FilterGroupInModal 
                        title="Lọc theo Mục tiêu" 
                        filters={FILTERS_OPTIONS.GOAL} 
                        activeFilter={tempFilters.goal} 
                        onSelect={(v) => handleTempFilterChange('goal', v)} 
                    />
                    <FilterGroupInModal 
                        title="Lọc theo Calo" 
                        filters={FILTERS_OPTIONS.CALORIE} 
                        activeFilter={tempFilters.calorie} 
                        onSelect={(v) => handleTempFilterChange('calorie', v)} 
                    />
                    <FilterGroupInModal 
                        title="Lọc theo Thời gian (Tổng)" 
                        filters={FILTERS_OPTIONS.TIME} 
                        activeFilter={tempFilters.time} 
                        onSelect={(v) => handleTempFilterChange('time', v)} 
                    />
                </div>

                {/* Footer Modal - Hành động */}
                <div className="p-6 border-t flex justify-between gap-4 flex-shrink-0">
                    <button 
                        onClick={handleReset} 
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition"
                    >
                        Đặt lại
                    </button>
                    <button 
                        onClick={handleApply} 
                        className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg font-bold hover:bg-teal-600 transition shadow-lg"
                    >
                        Áp dụng Bộ lọc
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- III. COMPONENT CHÍNH RECIPESECTION (ĐÃ SỬA) ---

function RecipeSection() {
    // (SỬA) Khởi tạo recipes là mảng rỗng
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Filters>(DEFAULT_FILTERS);

    // (THÊM) State cho loading và error
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleApplyFilters = useCallback((newFilters: Filters) => {
        setActiveFilters(newFilters);
    }, []);

    // (XÓA) LOGIC LỌC TỔNG HỢP (useMemo) đã bị xóa
    // (Backend sẽ xử lý việc lọc)

    // (THÊM) useEffect để fetch dữ liệu từ API khi filter hoặc searchTerm thay đổi
    useEffect(() => {
        // Định nghĩa hàm fetch
        const fetchRecipes = async () => {
            setIsLoading(true);
            setError(null);

            // 1. Xây dựng query string từ state
            const params = new URLSearchParams();
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            // Gửi cả giá trị 'Tất cả' hoặc giá trị cụ thể
            params.append('meal', activeFilters.meal);
            params.append('goal', activeFilters.goal);
            params.append('time', activeFilters.time);
            params.append('calorie', activeFilters.calorie);
            
            // 2. Gọi API (Giả định backend chạy trên port 8080)
            // Đảm bảo backend đã bật CORS (bạn đã làm trong index.js)
            const API_URL = 'http://localhost:8080/recipes';
            const queryString = params.toString();

            try {
                const response = await fetch(`${API_URL}?${queryString}`);
                
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    // 3. Cập nhật state với dữ liệu từ API
                    // Controller của bạn trả về `image_url`, `recipe_id`...
                    // Chúng ta cần đảm bảo nó khớp với interface `Recipe`
                    const formattedData = data.recipes.map((recipe: any) => ({
                        ...recipe,
                        // Đảm bảo các trường khớp 100%
                        recipeId: recipe.recipe_id,
                        imageUrl: recipe.image_url,
                        calories: recipe.calories,
                        prep_time: recipe.prep_time,
                        cook_time: recipe.cook_time,
                    }));
                    setRecipes(formattedData);
                } else {
                    throw new Error(data.message || 'Không thể tải công thức');
                }

            } catch (err: any) {
                console.error("Lỗi khi fetch công thức:", err);
                setError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
                setRecipes([]); // Xóa danh sách cũ nếu có lỗi
            } finally {
                setIsLoading(false);
            }
        };

        // Gọi hàm fetch
        fetchRecipes();

    }, [searchTerm, activeFilters]); // Phụ thuộc: Chạy lại khi 2 giá trị này thay đổi


    // Đếm số lượng bộ lọc đang được áp dụng
    const activeFilterCount = useMemo(() => {
        return Object.values(activeFilters).filter(f => f !== 'Tất cả').length;
    }, [activeFilters]);

    // Hàm render card công thức (Không đổi)
    const renderRecipeCard = (recipe: Recipe) => (
        <Link 
            key={recipe.recipeId} 
            to={`/dinh-duong/cong-thuc/${recipe.recipeId}`}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all hover:-translate-y-2 hover:shadow-xl border border-gray-100 block"
        >
            {/* (SỬA) Đảm bảo dùng đúng tên trường 'imageUrl' */}
            <img src={recipe.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={recipe.name} className="w-full h-48 object-cover" />
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-red-500">{recipe.calories} Calo</span>
                    <span className="text-teal-500 font-semibold text-sm">
                        Xem chi tiết →
                    </span>
                </div>
            </div>
        </Link>
    );

    // Hàm render nội dung chính (Loading, Error, Results)
    const renderContent = () => {
        // (THÊM) Ưu tiên hiển thị Loading
        if (isLoading) {
            return (
                <div className="col-span-full text-center py-12">
                    <h3 className="text-xl font-bold text-teal-600">Đang tải công thức...</h3>
                    {/* Bạn có thể thêm spinner tại đây */}
                </div>
            );
        }

        // (THÊM) Hiển thị nếu có lỗi
        if (error) {
            return (
                <div className="col-span-full text-center py-12 bg-red-50 rounded-xl shadow-inner">
                    <h3 className="text-xl font-bold text-red-700 mb-2">Đã xảy ra lỗi</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            );
        }

        // (SỬA) Hiển thị khi không có kết quả
        // (Sử dụng 'recipes' thay vì 'filteredRecipes')
        if (recipes.length === 0) {
            return (
                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-inner">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy công thức nào phù hợp</h3>
                    <p className="text-gray-600">Hãy thử điều chỉnh các bộ lọc hoặc từ khóa tìm kiếm.</p>
                </div>
            );
        }

        // (SỬA) Hiển thị kết quả
        // (Sử dụng 'recipes' thay vì 'filteredRecipes')
        return recipes.map(renderRecipeCard);
    };

    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">🔎 Thư Viện Công Thức (Recipes)</h2>
                    <p className="text-xl text-gray-600">Khám phá hàng trăm món ăn phù hợp với mọi mục tiêu.</p>
                </div>

                {/* Thanh Tìm Kiếm và Nút Lọc (Không đổi) */}
                <div className="flex gap-4 mb-12 max-w-4xl mx-auto">
                    
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên món, nguyên liệu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-teal-500 focus:border-teal-500 text-lg"
                        />
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center p-4 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-700 hover:bg-teal-50 hover:border-teal-500 transition relative min-w-[100px]"
                        title="Bộ lọc nâng cao"
                    >
                        <span className="text-xl mr-2">⚙️</span>
                        <span className='font-semibold'>Lọc ({activeFilterCount})</span>
                        
                        {activeFilterCount > 0 && (
                            <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* (SỬA) Danh Sách Công Thức - Gọi hàm renderContent */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {renderContent()}
                </div>
            </div>
            
            {/* Component Modal Bộ Lọc (Không đổi) */}
            <FilterModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                activeFilters={activeFilters}
                onApply={handleApplyFilters}
            />
        </div>
    );
}

export default RecipeSection;