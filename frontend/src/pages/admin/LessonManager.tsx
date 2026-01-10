import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Interface khớp với DB lesson của bạn
interface LessonData {
    id: number;
    tieu_de: string;
    hinh_anh: string;
    tom_tat: string;
    noi_dung: string;
    loai: 'coban' | 'tapluyen';
    thoi_gian_doc: number;
    do_kho: 'de' | 'trung-binh' | 'kho';
    luot_xem: number;
    ngay_tao: string;
}

const LessonManager = () => {
    const [lessons, setLessons] = useState<LessonData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // Form Data State
    const [formData, setFormData] = useState<Omit<LessonData, 'id' | 'luot_xem' | 'ngay_tao'>>({
        tieu_de: '', hinh_anh: '', tom_tat: '', noi_dung: '',
        loai: 'coban', thoi_gian_doc: 5, do_kho: 'trung-binh'
    });

    // 1. Fetch Lessons
    const fetchLessons = async () => {
        try {
            // Gọi API GET cũ của bạn
            const res = await axios.get('https://vietlife-fitness-website-host.onrender.com/lesson', {
                params: { search: searchTerm }
            });
            // API trả về mảng trực tiếp hoặc object {data: []} tùy logic cũ, ta xử lý cả 2
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setLessons(data);
        } catch (error) {
            console.error("Lỗi fetch lesson:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchLessons(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Handlers Open Modal
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            tieu_de: '', hinh_anh: '', tom_tat: '', noi_dung: '',
            loai: 'coban', thoi_gian_doc: 5, do_kho: 'trung-binh'
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (lesson: LessonData) => {
        setEditingId(lesson.id);
        // Lấy các trường cần sửa, bỏ các trường hệ thống
        const { id, luot_xem, ngay_tao, ...rest } = lesson;
        setFormData(rest);
        setIsFormOpen(true);
    };

    // 3. Submit Form (Create / Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingId) {
                // UPDATE
                await axios.put(`https://vietlife-fitness-website-host.onrender.com/lesson/${editingId}`, formData, { headers });
                toast.success("Cập nhật bài học thành công!");
            } else {
                // CREATE
                await axios.post(`https://vietlife-fitness-website-host.onrender.com/lesson`, formData, { headers });
                toast.success("Tạo bài học mới thành công!");
            }
            setIsFormOpen(false);
            fetchLessons(); // Reload lại bảng
        } catch (error) {
            toast.error("Lỗi xử lý. Kiểm tra lại quyền Admin.");
        }
    };

    // 4. Delete
    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa bài học này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://vietlife-fitness-website-host.onrender.com/lesson/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa.");
            fetchLessons();
        } catch (error) {
            toast.error("Lỗi khi xóa.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📚 Quản lý Bài học</h2>
                <button onClick={handleOpenCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold flex items-center gap-2">
                    ➕ Viết bài mới
                </button>
            </div>

            <div className="mb-6 text-black">
                <input 
                    type="text" 
                    placeholder="🔍 Tìm tiêu đề bài viết..." 
                    className="border p-2 rounded-lg w-80 outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="p-4">Bài học</th>
                            <th className="p-4">Phân loại</th>
                            <th className="p-4">Thông tin</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {isLoading ? <tr><td colSpan={4} className="p-4 text-center">Đang tải...</td></tr> : 
                        lessons.map(l => (
                            <tr key={l.id} className="hover:bg-gray-50 border-b">
                                <td className="p-4 max-w-md">
                                    <div className="flex gap-3">
                                        <img src={l.hinh_anh || 'https://via.placeholder.com/50'} className="w-16 h-12 object-cover rounded bg-gray-200" alt="" />
                                        <div>
                                            <div className="font-bold text-gray-900 line-clamp-1" title={l.tieu_de}>{l.tieu_de}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{l.tom_tat}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        l.loai === 'coban' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                        {l.loai === 'coban' ? 'Cơ bản' : 'Tập luyện'}
                                    </span>
                                </td>
                                <td className="p-4 text-xs">
                                    <div className="mb-1">⏱️ {l.thoi_gian_doc} phút</div>
                                    <div className={`font-bold ${
                                        l.do_kho === 'de' ? 'text-green-600' : 
                                        l.do_kho === 'trung-binh' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {l.do_kho === 'de' ? 'Dễ' : l.do_kho === 'trung-binh' ? 'TB' : 'Khó'}
                                    </div>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleOpenEdit(l)} className="text-blue-600 hover:bg-blue-100 p-2 rounded">✏️</button>
                                    <button onClick={() => handleDelete(l.id)} className="text-red-600 hover:bg-red-100 p-2 rounded">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-teal-600 p-4 text-white font-bold flex justify-between">
                            <span>{editingId ? 'Sửa Bài học' : 'Viết Bài mới'}</span>
                            <button onClick={() => setIsFormOpen(false)} className="text-xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4 text-gray-700">
                            {/* Cột Trái */}
                            <div className="space-y-3 col-span-2 md:col-span-1">
                                <label className="font-bold text-sm">Tiêu đề</label>
                                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" required 
                                    value={formData.tieu_de} onChange={e => setFormData({...formData, tieu_de: e.target.value})} />

                                <label className="font-bold text-sm">Link Hình ảnh</label>
                                <input className="w-full border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none" 
                                    value={formData.hinh_anh} onChange={e => setFormData({...formData, hinh_anh: e.target.value})} />

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold">Loại bài</label>
                                        <select className="w-full border p-2 rounded"
                                            value={formData.loai} onChange={e => setFormData({...formData, loai: e.target.value as any})}>
                                            <option value="coban">Kiến thức cơ bản</option>
                                            <option value="tapluyen">Kỹ thuật tập luyện</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold">Độ khó</label>
                                        <select className="w-full border p-2 rounded"
                                            value={formData.do_kho} onChange={e => setFormData({...formData, do_kho: e.target.value as any})}>
                                            <option value="de">Dễ</option>
                                            <option value="trung-binh">Trung bình</option>
                                            <option value="kho">Khó</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <label className="font-bold text-sm">Thời gian đọc (phút)</label>
                                <input type="number" className="w-full border p-2 rounded" 
                                    value={formData.thoi_gian_doc} onChange={e => setFormData({...formData, thoi_gian_doc: Number(e.target.value)})} />
                            </div>

                            {/* Cột Phải */}
                            <div className="space-y-3 col-span-2 md:col-span-1">
                                <label className="font-bold text-sm">Tóm tắt ngắn</label>
                                <textarea className="w-full border p-2 rounded h-40 focus:ring-2 focus:ring-teal-500 outline-none" required
                                    value={formData.tom_tat} onChange={e => setFormData({...formData, tom_tat: e.target.value})} />
                            </div>

                            {/* Full Row: Nội dung */}
                            <div className="col-span-2 mt-2">
                                <label className="font-bold text-sm block mb-1">Nội dung chi tiết (Markdown / HTML)</label>
                                <textarea className="w-full border p-2 rounded h-64 font-mono text-sm focus:ring-2 focus:ring-teal-500 outline-none" 
                                    placeholder="Viết nội dung bài học ở đây..."
                                    value={formData.noi_dung} onChange={e => setFormData({...formData, noi_dung: e.target.value})} />
                            </div>

                            <div className="col-span-2 flex justify-end gap-3 border-t pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-gray-100 rounded text-gray-600">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded font-bold hover:bg-teal-700">Lưu Bài học</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonManager;