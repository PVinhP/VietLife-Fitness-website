import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- Interface ---
interface Plan {
    id: number;
    name: string;
    description: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration_weeks: number;
    days_per_week: number;
    image_url: string;
}

interface PlanDay {
    dayNumber: number;
    dayName: string;
    exercises: ScheduledExercise[];
}

interface ScheduledExercise {
    id: number; // ID bài tập gốc
    exercise_name: string;
    sets: number;
    reps: string;
}

interface SimpleExercise {
    id: number;
    exercise_name: string;
}

const PlanManager = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'schedule'>('info');

    // Data Form
    const [planForm, setPlanForm] = useState<Omit<Plan, 'id'>>({
        name: '', description: '', level: 'Beginner',
        duration_weeks: 4, days_per_week: 3, image_url: ''
    });
    
    // Lịch tập (Mảng các ngày)
    const [schedule, setSchedule] = useState<PlanDay[]>([]);

    // Danh sách bài tập để chọn (Dropdown)
    const [allExercises, setAllExercises] = useState<SimpleExercise[]>([]);

    // --- FETCH ---
    const fetchPlans = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/plans');
            setPlans(res.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchPlans();
        // Lấy danh sách bài tập để dùng cho dropdown chọn bài
        axios.get('http://localhost:8080/exercise').then(res => setAllExercises(res.data));
    }, []);

    // --- HANDLERS ---
    const handleOpenCreate = () => {
        setEditingPlanId(null);
        setPlanForm({ name: '', description: '', level: 'Beginner', duration_weeks: 4, days_per_week: 3, image_url: '' });
        // Khởi tạo lịch trống dựa trên số ngày tập
        generateEmptySchedule(3); 
        setActiveTab('info');
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (id: number) => {
        setEditingPlanId(id);
        setActiveTab('info');
        try {
            const res = await axios.get(`http://localhost:8080/api/plans/${id}`);
            const { schedule: fetchedSchedule, ...info } = res.data;
            setPlanForm(info);
            // Map dữ liệu về đúng format frontend nếu cần
            setSchedule(fetchedSchedule.map((d: any) => ({
                dayNumber: d.day_number,
                dayName: d.day_name,
                exercises: d.exercises.map((e: any) => ({
                    id: e.exercise_id, // ID gốc
                    exercise_name: e.exercise_name,
                    sets: e.sets,
                    reps: e.reps
                }))
            })));
            setIsModalOpen(true);
        } catch (error) { toast.error("Lỗi tải chi tiết"); }
    };

    // Tạo khung lịch trống
    const generateEmptySchedule = (days: number) => {
        const newSchedule: PlanDay[] = [];
        for(let i=1; i<=days; i++) {
            newSchedule.push({ dayNumber: i, dayName: `Ngày ${i}: ...`, exercises: [] });
        }
        setSchedule(newSchedule);
    };

    // Xử lý thay đổi số buổi/tuần -> update lịch
    const handleDaysChange = (days: number) => {
        setPlanForm({...planForm, days_per_week: days});
        // Logic đơn giản: Nếu tăng thì push thêm, giảm thì cắt bớt
        if (days > schedule.length) {
            const diff = days - schedule.length;
            const newDays = [];
            for(let i=1; i<=diff; i++) {
                newDays.push({ dayNumber: schedule.length + i, dayName: `Ngày ${schedule.length + i}: ...`, exercises: [] });
            }
            setSchedule([...schedule, ...newDays]);
        } else if (days < schedule.length) {
            setSchedule(schedule.slice(0, days));
        }
    };

    // Thêm bài tập vào ngày
    const addExerciseToDay = (dayIndex: number, exerciseId: number) => {
        const exInfo = allExercises.find(e => e.id === exerciseId);
        if (!exInfo) return;

        const newSchedule = [...schedule];
        newSchedule[dayIndex].exercises.push({
            id: exInfo.id,
            exercise_name: exInfo.exercise_name,
            sets: 3,
            reps: '10-12'
        });
        setSchedule(newSchedule);
    };

    // Xóa bài tập khỏi ngày
    const removeExerciseFromDay = (dayIndex: number, exIndex: number) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].exercises.splice(exIndex, 1);
        setSchedule(newSchedule);
    };

    // Submit Tổng (Lưu cả Plan + Schedule)
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            const payload = { ...planForm, schedule }; // Gộp hết vào 1 cục gửi đi

            if (editingPlanId) {
                await axios.put(`http://localhost:8080/api/plans/${editingPlanId}`, payload, { headers });
                toast.success("Cập nhật giáo án thành công");
            } else {
                await axios.post(`http://localhost:8080/api/plans`, payload, { headers });
                toast.success("Tạo giáo án thành công");
            }
            setIsModalOpen(false);
            fetchPlans();
        } catch (error) { toast.error("Lỗi lưu giáo án"); }
    };

    const handleDelete = async (id: number) => {
        if(!window.confirm("Xóa giáo án này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:8080/api/plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Đã xóa");
            fetchPlans();
        } catch (error) { toast.error("Lỗi xóa"); }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px] animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📋 Quản lý Giáo Án Tập Luyện</h2>
                <button onClick={handleOpenCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-bold">
                    ➕ Tạo Giáo Án Mới
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(p => (
                    <div key={p.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white">
                        <img src={p.image_url || 'https://via.placeholder.com/300x150'} className="w-full h-40 object-cover" alt="" />
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{p.level}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.description}</p>
                            <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
                                <span>🗓 {p.duration_weeks} tuần</span>
                                <span>💪 {p.days_per_week} buổi/tuần</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => handleOpenEdit(p.id)} className="flex-1 bg-teal-50 text-teal-700 py-2 rounded hover:bg-teal-100 font-medium">Sửa lịch tập</button>
                                <button onClick={() => handleDelete(p.id)} className="px-3 bg-red-50 text-red-600 rounded hover:bg-red-100">🗑</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FULL SCREEN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="bg-teal-600 p-4 text-white font-bold flex justify-between items-center shrink-0">
                            <span>{editingPlanId ? 'Chỉnh sửa Giáo án & Lịch tập' : 'Thiết kế Giáo án Mới'}</span>
                            <button onClick={() => setIsModalOpen(false)} className="text-2xl">&times;</button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b bg-gray-50 shrink-0">
                            <button onClick={() => setActiveTab('info')} className={`px-8 py-3 font-bold ${activeTab === 'info' ? 'bg-white text-teal-600 border-t-2 border-teal-600' : 'text-gray-500'}`}>1. Thông tin chung</button>
                            <button onClick={() => setActiveTab('schedule')} className={`px-8 py-3 font-bold ${activeTab === 'schedule' ? 'bg-white text-teal-600 border-t-2 border-teal-600' : 'text-gray-500'}`}>2. Thiết kế Lịch tập ({planForm.days_per_week} ngày)</button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 text-gray-800">
                            {activeTab === 'info' ? (
                                <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
                                    <div className="space-y-4">
                                        <div><label className="font-bold block mb-1">Tên giáo án</label><input className="w-full border p-2 rounded" value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="font-bold block mb-1">Cấp độ</label>
                                                <select className="w-full border p-2 rounded" value={planForm.level} onChange={e => setPlanForm({...planForm, level: e.target.value as any})}>
                                                    <option value="Beginner">Mới bắt đầu</option><option value="Intermediate">Trung bình</option><option value="Advanced">Nâng cao</option>
                                                </select>
                                            </div>
                                            <div><label className="font-bold block mb-1">Số tuần (Duration)</label><input type="number" className="w-full border p-2 rounded" value={planForm.duration_weeks} onChange={e => setPlanForm({...planForm, duration_weeks: parseInt(e.target.value)})} /></div>
                                        </div>
                                        <div><label className="font-bold block mb-1">Số buổi tập / tuần</label>
                                            <input type="number" min={1} max={7} className="w-full border p-2 rounded" value={planForm.days_per_week} 
                                                onChange={e => handleDaysChange(parseInt(e.target.value))} />
                                            <p className="text-xs text-gray-500 mt-1">*Thay đổi số này sẽ thêm/bớt ngày trong tab Lịch tập</p>
                                        </div>
                                        <div><label className="font-bold block mb-1">Link Ảnh bìa</label><input className="w-full border p-2 rounded" value={planForm.image_url} onChange={e => setPlanForm({...planForm, image_url: e.target.value})} /></div>
                                        <div><label className="font-bold block mb-1">Mô tả</label><textarea className="w-full border p-2 rounded h-32" value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} /></div>
                                    </div>
                                    <div className="mt-6 text-right"><button onClick={() => setActiveTab('schedule')} className="bg-teal-600 text-white px-6 py-2 rounded font-bold">Tiếp tục: Xếp lịch &rarr;</button></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {schedule.map((day, dayIndex) => (
                                        <div key={dayIndex} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                                <input className="font-bold text-lg text-teal-800 bg-transparent border-b border-transparent focus:border-teal-500 outline-none w-1/2" 
                                                    value={day.dayName} 
                                                    onChange={e => {
                                                        const newSchedule = [...schedule];
                                                        newSchedule[dayIndex].dayName = e.target.value;
                                                        setSchedule(newSchedule);
                                                    }} 
                                                />
                                                <div className="flex gap-2">
                                                    <select className="border p-1 rounded text-sm w-48" 
                                                        onChange={e => {
                                                            if(e.target.value) {
                                                                addExerciseToDay(dayIndex, parseInt(e.target.value));
                                                                e.target.value = ""; // Reset
                                                            }
                                                        }}>
                                                        <option value="">+ Thêm bài tập...</option>
                                                        {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.exercise_name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Exercises List in Day */}
                                            {day.exercises.length > 0 ? (
                                                <div className="space-y-2">
                                                    {day.exercises.map((ex, exIndex) => (
                                                        <div key={exIndex} className="flex items-center gap-4 bg-gray-50 p-2 rounded border hover:bg-gray-100">
                                                            <span className="font-bold text-sm w-6">{exIndex + 1}.</span>
                                                            <div className="flex-1 font-medium">{ex.exercise_name}</div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                Sets: <input className="w-12 border p-1 rounded text-center" type="number" value={ex.sets} 
                                                                    onChange={e => {
                                                                        const newSchedule = [...schedule];
                                                                        newSchedule[dayIndex].exercises[exIndex].sets = parseInt(e.target.value);
                                                                        setSchedule(newSchedule);
                                                                    }} />
                                                                Reps: <input className="w-20 border p-1 rounded text-center" value={ex.reps} 
                                                                    onChange={e => {
                                                                        const newSchedule = [...schedule];
                                                                        newSchedule[dayIndex].exercises[exIndex].reps = e.target.value;
                                                                        setSchedule(newSchedule);
                                                                    }} />
                                                            </div>
                                                            <button onClick={() => removeExerciseFromDay(dayIndex, exIndex)} className="text-red-500 hover:text-red-700 px-2">✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-400 italic text-sm">Chưa có bài tập nào. Hãy chọn bài tập từ dropdown góc phải.</div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3 shadow-lg">
                                        <button onClick={() => setActiveTab('info')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Quay lại</button>
                                        <button onClick={handleSave} className="bg-teal-600 text-white px-8 py-2 rounded-lg font-bold shadow hover:bg-teal-700">HOÀN TẤT & LƯU</button>
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

export default PlanManager;