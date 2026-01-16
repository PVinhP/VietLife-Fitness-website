import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- Interfaces ---
interface Sport {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
}

interface Skill {
    id: number;
    name: string;
    description: string;
    video_url: string;
    difficulty: 'Basic' | 'Intermediate' | 'Advanced';
}

interface LinkedExercise {
    exercise_id: number;
    exercise_name: string;
    thumbnail_url: string;
    reason: string;
}

interface SimpleExercise {
    id: number;
    exercise_name: string;
}

const SportManager = () => {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'exercises'>('info');
    const [editingSportId, setEditingSportId] = useState<number | null>(null);

    // Data State cho Modal
    const [sportForm, setSportForm] = useState<Omit<Sport, 'id'>>({ name: '', slug: '', description: '', image_url: '' });
    const [currentSkills, setCurrentSkills] = useState<Skill[]>([]);
    const [currentExercises, setCurrentExercises] = useState<LinkedExercise[]>([]);
    
    // Dữ liệu dùng để chọn khi thêm mới
    const [allExercisesList, setAllExercisesList] = useState<SimpleExercise[]>([]);
    
    // Form nhỏ để thêm Skill/Exercise
    const [newSkill, setNewSkill] = useState({ name: '', description: '', video_url: '', difficulty: 'Basic' });
    const [newExerciseLink, setNewExerciseLink] = useState({ exercise_id: 0, reason: '' });

    // --- FETCH DATA ---
    const fetchSports = async () => {
        try {
            const res = await axios.get('https://vietlife-fitness-website-host.onrender.com/api/sports');
            setSports(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllExercises = async () => {
        // Lấy danh sách bài tập để dropdown
        try {
            const res = await axios.get('https://vietlife-fitness-website-host.onrender.com/exercise'); // Dùng API Exercise cũ
            setAllExercisesList(res.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchSports();
        fetchAllExercises();
    }, []);

    // --- OPEN MODAL HANDLERS ---
    const handleCreate = () => {
        setEditingSportId(null);
        setSportForm({ name: '', slug: '', description: '', image_url: '' });
        setCurrentSkills([]);
        setCurrentExercises([]);
        setActiveTab('info');
        setIsModalOpen(true);
    };

    const handleEdit = async (id: number) => {
        setEditingSportId(id);
        setActiveTab('info');
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`https://vietlife-fitness-website-host.onrender.com/api/sports/${id}/detail`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { skills, exercises, ...info } = res.data;
            setSportForm(info);
            setCurrentSkills(skills);
            setCurrentExercises(exercises);
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Lỗi tải chi tiết");
        }
    };

    // --- SUBMIT HANDLERS (INFO) ---
    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            if (editingSportId) {
                await axios.put(`https://vietlife-fitness-website-host.onrender.com/api/sports/${editingSportId}`, sportForm, { headers });
                toast.success("Cập nhật thông tin thành công");
            } else {
                const res = await axios.post(`https://vietlife-fitness-website-host.onrender.com/api/sports`, sportForm, { headers });
                setEditingSportId(res.data.id); // Set ID để chuyển sang tab khác được
                toast.success("Tạo môn thể thao thành công. Hãy thêm kỹ năng!");
            }
            fetchSports();
        } catch (error) {
            toast.error("Lỗi lưu thông tin");
        }
    };

    // --- HANDLERS (SKILLS) ---
    const handleAddSkill = async () => {
        if (!editingSportId) return toast.warn("Vui lòng lưu thông tin môn thể thao trước");
        try {
            const token = localStorage.getItem("token");
            await axios.post(`https://vietlife-fitness-website-host.onrender.com/api/sports/skill`, { ...newSkill, sport_id: editingSportId }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã thêm kỹ năng");
            // Refresh local
            handleEdit(editingSportId); 
            setNewSkill({ name: '', description: '', video_url: '', difficulty: 'Basic' });
        } catch (error) { toast.error("Lỗi thêm kỹ năng"); }
    };

    const handleDeleteSkill = async (skillId: number) => {
        if(!window.confirm("Xóa kỹ năng này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://vietlife-fitness-website-host.onrender.com/api/sports/skill/${skillId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa kỹ năng");
            if(editingSportId) handleEdit(editingSportId);
        } catch (error) { toast.error("Lỗi xóa"); }
    };

    // --- HANDLERS (EXERCISES) ---
    const handleLinkExercise = async () => {
        if (!editingSportId) return toast.warn("Lưu môn thể thao trước");
        if (newExerciseLink.exercise_id === 0) return toast.warn("Chọn bài tập");
        
        try {
            const token = localStorage.getItem("token");
            await axios.post(`https://vietlife-fitness-website-host.onrender.com/api/sports/exercise`, { ...newExerciseLink, sport_id: editingSportId }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã liên kết bài tập");
            handleEdit(editingSportId);
        } catch (error: any) { toast.error(error.response?.data?.message || "Lỗi liên kết"); }
    };

    const handleUnlinkExercise = async (exerciseId: number) => {
        if(!window.confirm("Gỡ bài tập này khỏi môn thể thao?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://vietlife-fitness-website-host.onrender.com/api/sports/exercise/${editingSportId}/${exerciseId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã gỡ bài tập");
            if(editingSportId) handleEdit(editingSportId);
        } catch (error) { toast.error("Lỗi xóa"); }
    };

    // Delete Sport
    const handleDeleteSport = async (id: number) => {
        if (!window.confirm("CẢNH BÁO: Xóa môn thể thao sẽ xóa hết kỹ năng liên quan!")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`https://vietlife-fitness-website-host.onrender.com/api/sports/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa môn thể thao");
            fetchSports();
        } catch (error) { toast.error("Lỗi xóa"); }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">⚽ Quản lý Môn Thể Thao</h2>
                <button onClick={handleCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold">
                    ➕ Thêm Môn Mới
                </button>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="p-4">Môn thể thao</th>
                            <th className="p-4">Mô tả ngắn</th>
                            <th className="p-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? <tr><td colSpan={3} className="p-4 text-center">Đang tải...</td></tr> : 
                        sports.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 border-b">
                                <td className="p-4 flex gap-3 items-center">
                                    <img src={s.image_url} className="w-16 h-10 object-cover rounded" alt="" />
                                    <span className="font-bold text-black">{s.name}</span>
                                </td>
                                <td className="p-4 text-gray-500 max-w-md truncate">{s.description}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleEdit(s.id)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded font-medium">Quản lý</button>
                                    <button onClick={() => handleDeleteSport(s.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-teal-600 p-4 text-white font-bold flex justify-between items-center shrink-0">
                            <span>{editingSportId ? `Chỉnh sửa: ${sportForm.name}` : 'Thêm Môn Thể Thao Mới'}</span>
                            <button onClick={() => setIsModalOpen(false)} className="text-2xl">&times;</button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b shrink-0">
                            <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 font-bold ${activeTab === 'info' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:bg-gray-50'}`}>1. Thông tin chung</button>
                            <button onClick={() => setActiveTab('skills')} disabled={!editingSportId} className={`flex-1 py-3 font-bold ${activeTab === 'skills' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:bg-gray-50 disabled:opacity-50'}`}>2. Kỹ năng (Drills)</button>
                            <button onClick={() => setActiveTab('exercises')} disabled={!editingSportId} className={`flex-1 py-3 font-bold ${activeTab === 'exercises' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:bg-gray-50 disabled:opacity-50'}`}>3. Bài tập bổ trợ</button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1">
                            
                            {/* TAB 1: INFO */}
                            {activeTab === 'info' && (
                                <form onSubmit={handleSaveInfo} className="space-y-4 text-black">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Tên môn</label>
                                            <input required className="w-full border p-2 rounded " value={sportForm.name} onChange={e => setSportForm({...sportForm, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Slug (URL)</label>
                                            <input required className="w-full border p-2 rounded" placeholder="vd: bong-da" value={sportForm.slug} onChange={e => setSportForm({...sportForm, slug: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Hình ảnh (URL)</label>
                                        <input className="w-full border p-2 rounded" value={sportForm.image_url} onChange={e => setSportForm({...sportForm, image_url: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Mô tả</label>
                                        <textarea className="w-full border p-2 rounded h-32" value={sportForm.description} onChange={e => setSportForm({...sportForm, description: e.target.value})} />
                                    </div>
                                    <div className="text-right">
                                        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700">Lưu Thông Tin</button>
                                    </div>
                                </form>
                            )}

                            {/* TAB 2: SKILLS */}
                            {activeTab === 'skills' && (
                                <div>
                                    <div className="bg-gray-50 p-4 rounded mb-6 border text-gray-700">
                                        <h4 className="font-bold mb-2 text-sm text-gray-700">Thêm Kỹ năng mới</h4>
                                        <div className="grid grid-cols-2 gap-3 mb-3 text-black">
                                            <input placeholder="Tên kỹ năng" className="border p-2 rounded" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} />
                                            <select className="border p-2 rounded" value={newSkill.difficulty} onChange={e => setNewSkill({...newSkill, difficulty: e.target.value})}>
                                                <option value="Basic">Cơ bản</option>
                                                <option value="Intermediate">Trung bình</option>
                                                <option value="Advanced">Nâng cao</option>
                                            </select>
                                            <input placeholder="Video URL (Youtube)" className="border p-2 rounded col-span-2" value={newSkill.video_url} onChange={e => setNewSkill({...newSkill, video_url: e.target.value})} />
                                            <textarea placeholder="Mô tả kỹ thuật..." className="border p-2 rounded col-span-2" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} />
                                        </div>
                                        <button onClick={handleAddSkill} className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600">Thêm Kỹ Năng</button>
                                    </div>

                                    <table className="w-full text-sm text-black">
                                        <thead><tr className="bg-gray-100 text-left"><th className="p-2">Tên</th><th className="p-2">Độ khó</th><th className="p-2">Action</th></tr></thead>
                                        <tbody>
                                            {currentSkills.map(s => (
                                                <tr key={s.id} className="border-b">
                                                    <td className="p-2 font-bold">{s.name}</td>
                                                    <td className="p-2">{s.difficulty}</td>
                                                    <td className="p-2"><button onClick={() => handleDeleteSkill(s.id)} className="text-red-500 hover:underline">Xóa</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* TAB 3: EXERCISES */}
                            {activeTab === 'exercises' && (
                                <div>
                                    <div className="bg-gray-50 p-4 rounded mb-6 border text-gray-700">
                                        <h4 className="font-bold mb-2 text-sm text-gray-700">Liên kết bài tập Gym có sẵn</h4>
                                        <div className="flex gap-2 mb-2">
                                            <select className="border p-2 rounded flex-1" value={newExerciseLink.exercise_id} onChange={e => setNewExerciseLink({...newExerciseLink, exercise_id: parseInt(e.target.value)})}>
                                                <option value={0}>-- Chọn bài tập --</option>
                                                {allExercisesList.map(ex => (
                                                    <option key={ex.id} value={ex.id}>{ex.exercise_name}</option>
                                                ))}
                                            </select>
                                            <input placeholder="Lý do (VD: Tăng lực sút)" className="border p-2 rounded flex-1" value={newExerciseLink.reason} onChange={e => setNewExerciseLink({...newExerciseLink, reason: e.target.value})} />
                                        </div>
                                        <button onClick={handleLinkExercise} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Liên kết</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentExercises.map(ex => (
                                            <div key={ex.exercise_id} className="border rounded p-3 flex gap-3 items-center bg-white shadow-sm">
                                                <img src={ex.thumbnail_url} className="w-12 h-12 object-cover rounded" alt="" />
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm">{ex.exercise_name}</div>
                                                    <div className="text-xs text-gray-500">Lý do: {ex.reason}</div>
                                                </div>
                                                <button onClick={() => handleUnlinkExercise(ex.exercise_id)} className="text-red-500 hover:bg-red-50 p-1 rounded">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SportManager;