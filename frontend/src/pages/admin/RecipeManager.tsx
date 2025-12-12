import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    difficulty: 'Dễ' | 'Trung bình' | 'Khó';
    instructions: string;
    // Fields from join
    calories?: number;
    original_food_name?: string;
}

interface NutritionSimple {
    id: number;
    food_name: string;
    calories: number;
}

const RecipeManager = () => {
    const [recipes, setRecipes] = useState<RecipeData[]>([]);
    const [nutritionList, setNutritionList] = useState<NutritionSimple[]>([]); // Để chọn món ăn liên kết
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<RecipeData, 'recipe_id'>>({
        nutrition_data_id: null, name: '', description: '', image_url: '', video_url: '',
        serving_size: 1, prep_time: 15, cook_time: 15, difficulty: 'Dễ', instructions: ''
    });

    // 1. Fetch Data
   const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // [THAY ĐỔI Ở ĐÂY] Đổi URL từ '/recipes' thành '/recipes/admin-list'
            const resRecipe = await axios.get('http://localhost:8080/recipes/admin-list', {
                params: { search: searchTerm }, headers
            });
            
            // Controller admin trả về { recipes: [...] }
            setRecipes(resRecipe.data.recipes || []);

            // Lấy danh sách Nutrition (để hiển thị trong dropdown chọn món)
            // Lưu ý: API food nên có endpoint trả về list gọn nhẹ, ở đây mình dùng api food cũ
            const resFood = await axios.get('http://localhost:8080/food', { headers });
            setNutritionList(resFood.data);

        } catch (error) {
            console.error(error);
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

    const handleOpenEdit = (recipe: RecipeData) => {
        setEditingId(recipe.recipe_id);
        const { recipe_id, calories, original_food_name, ...rest } = recipe;
        setFormData(rest);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingId) {
                await axios.put(`http://localhost:8080/recipes/${editingId}`, formData, { headers });
                toast.success("Đã cập nhật công thức!");
            } else {
                await axios.post(`http://localhost:8080/recipes/create`, formData, { headers });
                toast.success("Đã tạo công thức mới!");
            }
            setIsFormOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Lỗi xử lý.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa công thức này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/recipes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
                <button onClick={handleOpenCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold">
                    ➕ Thêm Công thức
                </button>
            </div>

            <div className="mb-6">
                <input type="text" placeholder="🔍 Tìm tên món..." className="border p-2 rounded-lg w-72"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="p-4">Tên Công thức</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Độ khó</th>
                            <th className="p-4">Dinh dưỡng (Link)</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {recipes.map(r => (
                            <tr key={r.recipe_id} className="hover:bg-gray-50 border-b">
                                <td className="p-4">
                                    <div className="font-bold">{r.name}</div>
                                    <a href={r.video_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                        Xem Video
                                    </a>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs">Prep: {r.prep_time}m</div>
                                    <div className="text-xs">Cook: {r.cook_time}m</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        r.difficulty === 'Dễ' ? 'bg-green-100 text-green-700' :
                                        r.difficulty === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>{r.difficulty}</span>
                                </td>
                                <td className="p-4">
                                    {r.original_food_name ? (
                                        <div className="text-xs text-gray-600">
                                            <div>🔗 {r.original_food_name}</div>
                                            <div className="font-bold text-teal-600">{r.calories} Kcal</div>
                                        </div>
                                    ) : <span className="text-gray-400 italic">-- Chưa link --</span>}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleOpenEdit(r)} className="text-blue-600 hover:bg-blue-100 p-2 rounded">✏️</button>
                                    <button onClick={() => handleDelete(r.recipe_id)} className="text-red-600 hover:bg-red-100 p-2 rounded">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-teal-600 p-4 text-white font-bold flex justify-between">
                            <span>{editingId ? 'Sửa Công thức' : 'Tạo Công thức mới'}</span>
                            <button onClick={() => setIsFormOpen(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4 text-gray-700">
                            {/* Cột 1 */}
                            <div className="space-y-3">
                                <label className="font-bold text-sm">Tên món ăn</label>
                                <input className="w-full border p-2 rounded" required 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

                                <label className="font-bold text-sm">Liên kết Dinh dưỡng (Nutrition Data)</label>
                                <select className="w-full border p-2 rounded bg-gray-50"
                                    value={formData.nutrition_data_id || ''} 
                                    onChange={e => setFormData({...formData, nutrition_data_id: Number(e.target.value)})}
                                >
                                    <option value="">-- Chọn dữ liệu gốc --</option>
                                    {nutritionList.map(n => (
                                        <option key={n.id} value={n.id}>{n.food_name} ({n.calories} cal)</option>
                                    ))}
                                </select>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold">Chuẩn bị (phút)</label>
                                        <input type="number" className="w-full border p-2 rounded" 
                                            value={formData.prep_time} onChange={e => setFormData({...formData, prep_time: Number(e.target.value)})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold">Nấu (phút)</label>
                                        <input type="number" className="w-full border p-2 rounded" 
                                            value={formData.cook_time} onChange={e => setFormData({...formData, cook_time: Number(e.target.value)})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold">Độ khó</label>
                                        <select className="w-full border p-2 rounded"
                                            value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})}>
                                            <option value="Dễ">Dễ</option>
                                            <option value="Trung bình">Trung bình</option>
                                            <option value="Khó">Khó</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold">Khẩu phần (người)</label>
                                        <input type="number" className="w-full border p-2 rounded" 
                                            value={formData.serving_size} onChange={e => setFormData({...formData, serving_size: Number(e.target.value)})} />
                                    </div>
                                </div>
                            </div>

                            {/* Cột 2 */}
                            <div className="space-y-3">
                                <label className="font-bold text-sm">Link Ảnh (URL)</label>
                                <input className="w-full border p-2 rounded" placeholder="https://..."
                                    value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />

                                <label className="font-bold text-sm">Link Video (YouTube)</label>
                                <input className="w-full border p-2 rounded" placeholder="https://..."
                                    value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} />

                                <label className="font-bold text-sm">Mô tả ngắn</label>
                                <textarea className="w-full border p-2 rounded h-20"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>

                            {/* Hàng Full: Hướng dẫn */}
                            <div className="col-span-2 mt-2">
                                <label className="font-bold text-sm block mb-1">Hướng dẫn chi tiết (Các bước)</label>
                                <textarea className="w-full border p-2 rounded h-32 font-mono text-sm" placeholder="Bước 1: ... &#10;Bước 2: ..."
                                    value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} />
                            </div>

                            <div className="col-span-2 flex justify-end gap-3 border-t pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded font-bold">Lưu Công thức</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeManager;