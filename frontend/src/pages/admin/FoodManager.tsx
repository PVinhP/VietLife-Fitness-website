import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// 1. Cập nhật Interface: food_group bây giờ là ID (number)
interface FoodData {
    id: number;
    food_name: string;
    food_group: number; // <-- Đổi từ string sang number
    description: string;
    image_url: string;
    unit: string;
    calories: number;
    water_g: number;
    protein_g: number;
    fats_g: number;
    carbs_g: number;
    fiber_g: number;
}

// 2. Interface cho Nhóm thực phẩm lấy từ DB
interface FoodGroup {
    id: number;
    name: string;
    color_class: string;
}

const FoodManager = () => {
    const [foods, setFoods] = useState<FoodData[]>([]);
    const [groups, setGroups] = useState<FoodGroup[]>([]); // State lưu danh sách nhóm
    const [loading, setLoading] = useState(true);
    
    // State Filter và Search
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState(''); // Lưu ID dưới dạng string để dễ xử lý trong select

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<FoodData, 'id'>>({
        food_name: '', 
        food_group: 1, // Mặc định ID = 1 (Tinh bột) hoặc ID đầu tiên lấy được
        description: '', image_url: '', unit: '100g',
        calories: 0, water_g: 0, protein_g: 0, fats_g: 0, carbs_g: 0, fiber_g: 0
    });

    // --- 3. Fetch Dữ Liệu (Nhóm & Thực phẩm) ---
    
    // Fetch danh sách nhóm trước
    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get('http://localhost:8080/food/groups', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách nhóm:", error);
        }
    };

    // Fetch thực phẩm
    const fetchFoods = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get('http://localhost:8080/food', {
                params: { search: searchTerm, group: groupFilter }, // groupFilter giờ gửi ID (VD: "1") lên server
                headers: { Authorization: `Bearer ${token}` }
            });
            setFoods(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchGroups khi component mount
    useEffect(() => {
        fetchGroups();
    }, []);

    // Gọi fetchFoods khi filter thay đổi
    useEffect(() => {
        const timer = setTimeout(() => fetchFoods(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, groupFilter]);

    // Handle Form
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            food_name: '', 
            food_group: groups.length > 0 ? groups[0].id : 1, // Reset về nhóm đầu tiên
            description: '', image_url: '', unit: '100g',
            calories: 0, water_g: 0, protein_g: 0, fats_g: 0, carbs_g: 0, fiber_g: 0
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (food: FoodData) => {
        setEditingId(food.id);
        const { id, ...data } = food;
        setFormData(data);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            // Ép kiểu food_group về number để chắc chắn
            const submitData = {
                ...formData,
                food_group: Number(formData.food_group)
            };

            if (editingId) {
                await axios.put(`http://localhost:8080/food/${editingId}`, submitData, { headers });
                toast.success("Cập nhật thành công!");
            } else {
                await axios.post(`http://localhost:8080/food/create`, submitData, { headers });
                toast.success("Thêm món mới thành công!");
            }
            setIsFormOpen(false);
            fetchFoods();
        } catch (error) {
            toast.error("Có lỗi xảy ra!");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa món này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/food/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa.");
            fetchFoods();
        } catch (error) {
            toast.error("Lỗi khi xóa.");
        }
    };

    // Helper: Tìm thông tin nhóm dựa trên ID để hiển thị
    const getGroupInfo = (id: number) => {
        const group = groups.find(g => g.id === id);
        return group || { name: 'Unknown', color_class: 'bg-gray-100 text-gray-500' };
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🍎 Quản lý Thực phẩm</h2>
                <button onClick={handleOpenCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold flex items-center gap-2">
                    ➕ Thêm món ăn
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-4 mb-6 text-gray-700">
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Tìm món ăn..." 
                        className="pl-10 pr-4 py-2 border rounded-lg w-64 outline-none focus:ring-2 focus:ring-teal-500"
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>

                <select 
                    className="border px-4 py-2 rounded-lg outline-none cursor-pointer bg-white hover:border-teal-500 transition" 
                    value={groupFilter} 
                    onChange={e => setGroupFilter(e.target.value)}
                >
                    <option value="">-- Tất cả nhóm --</option>
                    {/* Render nhóm từ API */}
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Món ăn</th>
                            <th className="p-4">Nhóm</th>
                            <th className="p-4 text-center">Calories</th>
                            <th className="p-4">Macros (P - C - F)</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {loading ? <tr><td colSpan={5} className="p-4 text-center">Đang tải...</td></tr> : 
                        foods.map(food => {
                            const groupInfo = getGroupInfo(food.food_group);
                            return (
                                <tr key={food.id} className="hover:bg-gray-50 border-b last:border-0">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={food.image_url || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded-md object-cover bg-gray-200" />
                                        <div>
                                            <div className="font-bold">{food.food_name}</div>
                                            <div className="text-xs text-gray-500">{food.unit}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {/* Hiển thị Nhóm với Màu sắc từ DB */}
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${groupInfo.color_class}`}>
                                            {groupInfo.name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-teal-600 text-lg">
                                        {food.calories}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2 text-xs font-bold text-white">
                                            <span className="bg-red-400 px-2 py-1 rounded" title="Protein">Protein: {food.protein_g}</span>
                                            <span className="bg-yellow-400 px-2 py-1 rounded" title="Carbs">Carbs: {food.carbs_g}</span>
                                            <span className="bg-blue-400 px-2 py-1 rounded" title="Fat">Fat: {food.fats_g}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleOpenEdit(food)} className="text-blue-600 hover:bg-blue-100 p-2 rounded">✏️</button>
                                        <button onClick={() => handleDelete(food.id)} className="text-red-600 hover:bg-red-100 p-2 rounded">🗑️</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-teal-600 p-4 text-white font-bold flex justify-between">
                            <span>{editingId ? 'Sửa món ăn' : 'Thêm món mới'}</span>
                            <button onClick={() => setIsFormOpen(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            {/* Cột Trái: Thông tin chung */}
                            <div className="col-span-2 md:col-span-1 space-y-3 text-gray-700">
                                <h4 className="font-bold text-gray-700 border-b pb-1">Thông tin chung</h4>
                                <input className="w-full border p-2 rounded" placeholder="Tên món ăn" required
                                    value={formData.food_name} onChange={e => setFormData({...formData, food_name: e.target.value})} />
                                
                                <label className="text-sm font-semibold">Nhóm thực phẩm</label>
                                <select 
                                    className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-teal-500" 
                                    value={formData.food_group} 
                                    onChange={e => setFormData({...formData, food_group: Number(e.target.value)})}
                                >
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>

                                <input className="w-full border p-2 rounded" placeholder="Đơn vị (VD: 100g, 1 bát)"
                                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                                
                                <input className="w-full border p-2 rounded" placeholder="Link ảnh (URL)"
                                    value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />

                                <textarea className="w-full border p-2 rounded h-20" placeholder="Mô tả chi tiết..."
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            {/* Cột Phải: Dinh dưỡng (Giữ nguyên) */}
                            <div className="col-span-2 md:col-span-1 space-y-3 text-gray-700">
                                <h4 className="font-bold text-gray-700 border-b pb-1">Dinh dưỡng (per unit)</h4>
                                
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold">🔥 Calories</label>
                                    <input type="number" className="border p-2 rounded w-24 text-right"
                                        value={formData.calories} onChange={e => setFormData({...formData, calories: parseInt(e.target.value) || 0})} />
                                </div>

                                <div className="grid grid-cols-2 gap-3 ">
                                    <div>
                                        <label className="text-xs text-red-600 font-bold block">Protein (g)</label>
                                        <input type="number" step="0.1" className="border p-2 rounded w-full"
                                            value={formData.protein_g} onChange={e => setFormData({...formData, protein_g: parseFloat(e.target.value) || 0})} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-yellow-600 font-bold block">Carbs (g)</label>
                                        <input type="number" step="0.1" className="border p-2 rounded w-full"
                                            value={formData.carbs_g} onChange={e => setFormData({...formData, carbs_g: parseFloat(e.target.value) || 0})} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-blue-600 font-bold block">Fats (g)</label>
                                        <input type="number" step="0.1" className="border p-2 rounded w-full"
                                            value={formData.fats_g} onChange={e => setFormData({...formData, fats_g: parseFloat(e.target.value) || 0})} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-green-600 font-bold block">Fiber (g)</label>
                                        <input type="number" step="0.1" className="border p-2 rounded w-full"
                                            value={formData.fiber_g} onChange={e => setFormData({...formData, fiber_g: parseFloat(e.target.value) || 0})} />
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <label className="text-xs text-blue-400 font-bold block">Nước (g)</label>
                                    <input type="number" className="border p-2 rounded w-full"
                                        value={formData.water_g} onChange={e => setFormData({...formData, water_g: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>

                            <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2 text-gray-600 bg-gray-100 rounded">Hủy</button>
                                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded font-bold hover:bg-teal-700">
                                    {editingId ? 'Lưu thay đổi' : 'Thêm món ăn'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodManager;