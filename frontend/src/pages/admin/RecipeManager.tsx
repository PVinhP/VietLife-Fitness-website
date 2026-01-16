import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Interface cho dữ liệu hiển thị trên bảng và form
interface RecipeData {
    recipe_id: number;
    nutrition_data_id: number | null;
    name: string;
    description: string;
    image_url: string;
    video_url: string;
    serving_size: number;
    prep_time: number;
    cook_time: number;
    difficulty: string; 
    instructions: string;
    
    // Các trường dữ liệu từ bảng nutrition (để hiển thị)
    original_food_name?: string;
    calories?: number;
    protein_g?: number;
    fat_g?: number;
    carb_g?: number;
}

interface NutritionSimple {
    id: number;
    food_name: string;
    calories: number;
    protein_g: number;
    fat_g: number;
    carb_g: number;
}

const RecipeManager = () => {
    const [recipes, setRecipes] = useState<RecipeData[]>([]);
    const [nutritionList, setNutritionList] = useState<NutritionSimple[]>([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false); // Trạng thái loading khi nhấn sửa

    const [formData, setFormData] = useState<Omit<RecipeData, 'recipe_id' | 'calories' | 'protein_g' | 'fat_g' | 'carb_g' | 'original_food_name'>>({
        nutrition_data_id: null, 
        name: '', 
        description: '', 
        image_url: '', 
        video_url: '',
        serving_size: 1, 
        prep_time: 15, 
        cook_time: 15, 
        difficulty: 'Dễ', 
        instructions: ''
    });

    // 1. Fetch Data List
   const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const resRecipe = await axios.get('https://vietlife-fitness-website-host.onrender.com/recipes', {
                params: { search: searchTerm }, headers
            });
            
            setRecipes(resRecipe.data.recipes || []);

            const resFood = await axios.get('https://vietlife-fitness-website-host.onrender.com/food', { headers });
            setNutritionList(resFood.data);

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Handlers
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            nutrition_data_id: nutritionList.length > 0 ? nutritionList[0].id : null,
            name: '', description: '', image_url: '', video_url: '',
            serving_size: 1, prep_time: 10, cook_time: 10, difficulty: 'Dễ', instructions: ''
        });
        setIsFormOpen(true);
    };

    // [QUAN TRỌNG] Cập nhật hàm này để fetch chi tiết instructions
    const handleOpenEdit = async (recipe: RecipeData) => {
        setEditingId(recipe.recipe_id);
        setIsFormOpen(true);
        setIsLoadingDetail(true);

        // Điền tạm dữ liệu có sẵn từ list để người dùng không thấy form trắng trơn
        const { 
            recipe_id, calories, protein_g, fat_g, carb_g, original_food_name, 
            instructions, // instructions từ list có thể bị thiếu/rỗng
            ...rest 
        } = recipe;
        
        setFormData({
            ...rest,
            instructions: instructions || 'Đang tải nội dung chi tiết...'
        });

        try {
            // Gọi API chi tiết để lấy "instructions" đầy đủ
            // Giả định API chi tiết là: GET /recipes/:id (giống bên DetailModal)
            const res = await axios.get(`https://vietlife-fitness-website-host.onrender.com/recipes/${recipe.recipe_id}`);
            const data = res.data;
            
            if (data.success && data.recipe) {
                const fullDetail = data.recipe;
                setFormData({
                    nutrition_data_id: fullDetail.nutrition_data_id,
                    name: fullDetail.name,
                    description: fullDetail.description,
                    image_url: fullDetail.image_url,
                    video_url: fullDetail.video_url,
                    serving_size: fullDetail.serving_size,
                    prep_time: fullDetail.prep_time,
                    cook_time: fullDetail.cook_time,
                    difficulty: fullDetail.difficulty,
                    instructions: fullDetail.instructions || '' // Lấy instructions chuẩn từ DB
                });
            }
        } catch (error) {
            console.error("Lỗi lấy chi tiết:", error);
            toast.error("Không tải được hướng dẫn chi tiết.");
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingId) {
                await axios.put(`https://vietlife-fitness-website-host.onrender.com/recipes/${editingId}`, formData, { headers });
                toast.success("Đã cập nhật công thức!");
            } else {
                await axios.post(`https://vietlife-fitness-website-host.onrender.com/recipes/create`, formData, { headers });
                toast.success("Đã tạo công thức mới!");
            }
            setIsFormOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Lỗi xử lý.");
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa công thức này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://vietlife-fitness-website-host.onrender.com/recipes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa.");
            fetchData();
        } catch (error) {
            toast.error("Lỗi khi xóa.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🧑‍🍳 Quản lý Công thức (Recipes)</h2>
                <button onClick={handleOpenCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold flex items-center gap-2">
                    <span>➕</span> Thêm Công thức
                </button>
            </div>

            <div className="mb-6">
                <input type="text" placeholder="🔍 Tìm tên món..." className="border p-2 rounded-lg w-72 focus:ring-2 focus:ring-teal-500 outline-none"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="p-4 w-1/4">Tên Công thức</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Độ khó</th>
                            <th className="p-4 w-1/3">Dinh dưỡng (Calo/Macros)</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {recipes.map(r => (
                            <tr key={r.recipe_id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={r.image_url || 'https://via.placeholder.com/40'} 
                                            alt={r.name} 
                                            className="w-12 h-12 rounded object-cover border"
                                        />
                                        <div>
                                            <div className="font-bold text-gray-800">{r.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs text-gray-500">Chuẩn bị: <b>{r.prep_time}p</b></div>
                                    <div className="text-xs text-gray-500">Nấu: <b>{r.cook_time}p</b></div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        r.difficulty === 'Dễ' ? 'bg-green-100 text-green-700' :
                                        r.difficulty === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {r.difficulty}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {r.nutrition_data_id ? (
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-400 italic mb-1">
                                                {r.original_food_name}
                                            </div>
                                            <div className="flex gap-2 text-xs">
                                                <span className="bg-orange-100 text-orange-700 px-2 rounded font-bold">🔥 {r.calories}</span>
                                                <span className="bg-blue-100 text-blue-700 px-2 rounded font-bold">P: {r.protein_g}</span>
                                                <span className="bg-yellow-100 text-yellow-700 px-2 rounded font-bold">F: {r.fat_g}</span>
                                                <span className="bg-green-100 text-green-700 px-2 rounded font-bold">C: {r.carb_g}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">-- Chưa liên kết --</span>
                                    )}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleOpenEdit(r)} className="text-blue-600 hover:bg-blue-50 p-2 rounded" title="Sửa">✏️</button>
                                    <button onClick={() => handleDelete(r.recipe_id)} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Xóa">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in-up">
                        <div className="bg-teal-600 p-4 text-white font-bold flex justify-between items-center shadow-md">
                            <span className="text-lg flex items-center gap-2">
                                {editingId ? '✏️ Chỉnh sửa Công thức' : '➕ Tạo Công thức mới'}
                                {isLoadingDetail && <span className="text-xs font-normal bg-teal-700 px-2 py-1 rounded ml-2 animate-pulse">Đang tải chi tiết...</span>}
                            </span>
                            <button onClick={() => setIsFormOpen(false)} className="hover:bg-teal-700 p-1 rounded transition">✖️</button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 flex-1">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                                {/* Cột Trái */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="font-bold text-sm mb-1 block">Tên món ăn <span className="text-red-500">*</span></label>
                                        <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required 
                                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>

                                    <div>
                                        <label className="font-bold text-sm mb-1 block">Liên kết Dinh dưỡng</label>
                                        <select className="w-full border p-2.5 rounded-lg bg-gray-50"
                                            value={formData.nutrition_data_id || ''} 
                                            onChange={e => setFormData({...formData, nutrition_data_id: Number(e.target.value)})}
                                        >
                                            <option value="">-- Chọn dữ liệu gốc --</option>
                                            {nutritionList.map(n => (
                                                <option key={n.id} value={n.id}>
                                                    {n.food_name} ({n.calories} cal | P:{n.protein_g} F:{n.fat_g} C:{n.carb_g})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Chuẩn bị (phút)</label>
                                            <input type="number" className="w-full border p-2.5 rounded-lg" 
                                                value={formData.prep_time} onChange={e => setFormData({...formData, prep_time: Number(e.target.value)})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Nấu (phút)</label>
                                            <input type="number" className="w-full border p-2.5 rounded-lg" 
                                                value={formData.cook_time} onChange={e => setFormData({...formData, cook_time: Number(e.target.value)})} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Độ khó</label>
                                            <select className="w-full border p-2.5 rounded-lg"
                                                value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                                                <option value="Dễ">Dễ</option>
                                                <option value="Trung bình">Trung bình</option>
                                                <option value="Khó">Khó</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Khẩu phần</label>
                                            <input type="number" className="w-full border p-2.5 rounded-lg" 
                                                value={formData.serving_size} onChange={e => setFormData({...formData, serving_size: Number(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>

                                {/* Cột Phải */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="font-bold text-sm mb-1 block">Link Ảnh</label>
                                        <input className="w-full border p-2.5 rounded-lg" 
                                            value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                                        {formData.image_url && <img src={formData.image_url} alt="Preview" className="h-20 w-20 object-cover mt-2 rounded border" />}
                                    </div>

                                    <div>
                                        <label className="font-bold text-sm mb-1 block">Link Video</label>
                                        <input className="w-full border p-2.5 rounded-lg" 
                                            value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} />
                                    </div>

                                    <div>
                                        <label className="font-bold text-sm mb-1 block">Mô tả ngắn</label>
                                        <textarea className="w-full border p-2.5 rounded-lg h-20"
                                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                    </div>
                                </div>

                                {/* Hướng dẫn - Full Width */}
                                <div className="md:col-span-2 border-t pt-4">
                                    <label className="font-bold text-sm text-teal-700 mb-2 block flex items-center gap-2">
                                        📝 Hướng dẫn thực hiện (Xuống dòng cho mỗi bước)
                                    </label>
                                    <textarea 
                                        className={`w-full border border-gray-300 p-3 rounded-lg h-48 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-teal-500 outline-none ${isLoadingDetail ? 'bg-gray-100 animate-pulse' : 'bg-white'}`}
                                        placeholder="Bước 1: ..."
                                        value={formData.instructions} 
                                        onChange={e => setFormData({...formData, instructions: e.target.value})} 
                                        disabled={isLoadingDetail}
                                    />
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 bg-gray-100 rounded-lg font-medium">Hủy bỏ</button>
                                    <button type="submit" disabled={isLoadingDetail} className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-bold shadow-md hover:bg-teal-700 disabled:bg-gray-400">
                                        {editingId ? 'Lưu Thay Đổi' : 'Tạo Mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeManager;