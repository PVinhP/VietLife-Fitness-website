import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Interface khớp với DB exercises
interface ExerciseData {
    id: number;
    exercise_name: string;
    video_urls: string;
    thumbnail_url: string;
    description: string;
    muscle_group: string;
    equipment_required: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    steps: string;
}

const ExerciseManager = () => {
    const [exercises, setExercises] = useState<ExerciseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<ExerciseData, 'id'>>({
        exercise_name: '',
        video_urls: '',
        thumbnail_url: '',
        description: '',
        muscle_group: '',
        equipment_required: '',
        difficulty: 'beginner',
        steps: ''
    });

    // 1. Fetch Exercises
    const fetchExercises = async () => {
        try {
            const res = await axios.get('https://vietlife-fitness-website-host.onrender.com/exercise', {
                params: { search: searchTerm }
            });
            setExercises(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách bài tập:", error);
            // toast.error("Không thể tải danh sách bài tập");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchExercises(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Handlers Open Modal
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            exercise_name: '', video_urls: '', thumbnail_url: '', description: '',
            muscle_group: '', equipment_required: '', difficulty: 'beginner', steps: ''
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (ex: ExerciseData) => {
        setEditingId(ex.id);
        const { id, ...rest } = ex;
        setFormData(rest);
        setIsFormOpen(true);
    };

    // 3. Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingId) {
                // UPDATE
                await axios.put(`https://vietlife-fitness-website-host.onrender.com/exercise/${editingId}`, formData, { headers });
                toast.success("Cập nhật bài tập thành công!");
            } else {
                // CREATE
                await axios.post(`https://vietlife-fitness-website-host.onrender.com/exercise`, formData, { headers });
                toast.success("Thêm bài tập mới thành công!");
            }
            setIsFormOpen(false);
            fetchExercises();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // 4. Delete
    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://vietlife-fitness-website-host.onrender.com/exercise/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa bài tập.");
            fetchExercises();
        } catch (error) {
            toast.error("Lỗi khi xóa bài tập.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🏋️ Quản lý Bài Tập</h2>
                <button onClick={handleOpenCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold flex items-center gap-2">
                    ➕ Thêm Bài Tập
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input 
                    type="text" 
                    placeholder="🔍 Tìm tên bài tập..." 
                    className="border p-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="p-4">Bài tập</th>
                            <th className="p-4">Nhóm cơ / Dụng cụ</th>
                            <th className="p-4">Độ khó</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {loading ? <tr><td colSpan={4} className="p-4 text-center">Đang tải...</td></tr> : 
                        exercises.map(ex => (
                            <tr key={ex.id} className="hover:bg-gray-50 border-b">
                                <td className="p-4 max-w-sm">
                                    <div className="flex gap-3 items-center">
                                        <img src={ex.thumbnail_url || 'https://via.placeholder.com/60'} className="w-16 h-12 object-cover rounded bg-gray-200" alt="" />
                                        <div>
                                            <div className="font-bold text-gray-900">{ex.exercise_name}</div>
                                            {ex.video_urls && <a href={ex.video_urls} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Xem Video</a>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs mb-1"><span className="font-semibold">Cơ:</span> {ex.muscle_group}</div>
                                    <div className="text-xs"><span className="font-semibold">Dụng cụ:</span> {ex.equipment_required}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        ex.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                        ex.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {ex.difficulty}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleOpenEdit(ex)} className="text-blue-600 hover:bg-blue-100 p-2 rounded">✏️</button>
                                    <button onClick={() => handleDelete(ex.id)} className="text-red-600 hover:bg-red-100 p-2 rounded">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-teal-600 p-4 text-white font-bold flex justify-between">
                            <span>{editingId ? 'Sửa Bài Tập' : 'Thêm Bài Tập Mới'}</span>
                            <button onClick={() => setIsFormOpen(false)} className="text-xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4 text-gray-700">
                            {/* Cột Trái */}
                            <div className="space-y-4 col-span-2 md:col-span-1">
                                <div>
                                    <label className="font-bold text-sm block mb-1">Tên bài tập</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" required 
                                        value={formData.exercise_name} onChange={e => setFormData({...formData, exercise_name: e.target.value})} />
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-1">Nhóm cơ tác động</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="VD: Ngực, Tay sau"
                                        value={formData.muscle_group} onChange={e => setFormData({...formData, muscle_group: e.target.value})} />
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-1">Dụng cụ cần thiết</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="VD: Tạ đơn, Ghế tập"
                                        value={formData.equipment_required} onChange={e => setFormData({...formData, equipment_required: e.target.value})} />
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-1">Độ khó</label>
                                    <select className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})}>
                                        <option value="beginner">Beginner (Dễ)</option>
                                        <option value="intermediate">Intermediate (Trung bình)</option>
                                        <option value="advanced">Advanced (Khó)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-1">Link Ảnh (Thumbnail URL)</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} />
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-1">Link Video (URL)</label>
                                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.video_urls} onChange={e => setFormData({...formData, video_urls: e.target.value})} />
                                </div>
                            </div>

                            {/* Cột Phải */}
                            <div className="space-y-4 col-span-2 md:col-span-1">
                                <div>
                                    <label className="font-bold text-sm block mb-1">Mô tả bài tập</label>
                                    <textarea className="w-full border p-2 rounded h-32 focus:ring-2 focus:ring-teal-500 outline-none" 
                                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-1">Các bước thực hiện (Mỗi bước xuống dòng)</label>
                                    <textarea className="w-full border p-2 rounded h-48 font-mono text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Bước 1: ...&#10;Bước 2: ..."
                                        value={formData.steps} onChange={e => setFormData({...formData, steps: e.target.value})} />
                                </div>
                            </div>

                            <div className="col-span-2 flex justify-end gap-3 border-t pt-4 mt-2">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-gray-100 rounded text-gray-600 hover:bg-gray-200">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded font-bold hover:bg-teal-700">Lưu Bài Tập</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExerciseManager;