import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. SỬA INTERFACE CHO KHỚP VỚI API (giống bên Exercise.tsx)
interface Exercise {
    id: number;
    exercise_name: string;  // Sửa từ 'name' -> 'exercise_name'
    thumbnail_url: string;  // Sửa từ 'image_url' -> 'thumbnail_url'
    muscle_group: string;   // Sửa từ 'muscle' -> 'muscle_group'
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    // Lưu ý: onSelect vẫn giữ nguyên, nhưng dữ liệu truyền ra sẽ là object Exercise chuẩn
    onSelect: (exercise: Exercise, sets: number, reps: string) => void;
}

const ExerciseSelectorModal = ({ isOpen, onClose, onSelect }: Props) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form nhập sets/reps
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState('12');
    const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

    useEffect(() => {
        if (isOpen) {
            axios.get('http://localhost:8080/exercise')
                .then(res => setExercises(res.data))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleAdd = () => {
        if (selectedEx) {
            // Khi chọn xong, truyền object chuẩn ra ngoài
            onSelect(selectedEx, sets, reps);
            onClose();
            // Reset
            setSelectedEx(null);
            setSets(3);
            setReps('12');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl h-[80vh] rounded-xl flex flex-col shadow-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">Chọn bài tập</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <input 
                        type="text" 
                        placeholder="🔍 Tìm bài tập (VD: Squat)..." 
                        className="w-full border p-2 rounded text-black"
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2 text-black">
                    {exercises
                        // 2. SỬA LẠI LOGIC FILTER (Dùng exercise_name)
                        .filter(ex => (ex.exercise_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(ex => (
                        <div 
                            key={ex.id} 
                            onClick={() => setSelectedEx(ex)}
                            className={`flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-teal-50 ${selectedEx?.id === ex.id ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : ''}`}
                        >
                            {/* 3. SỬA LẠI HIỂN THỊ (Dùng thumbnail_url và exercise_name) */}
                            <img 
                                src={ex.thumbnail_url} 
                                alt="" 
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => e.currentTarget.src = "https://via.placeholder.com/150"} // Fallback nếu ảnh lỗi
                            />
                            <div>
                                <p className="font-bold">{ex.exercise_name}</p>
                                <span className="text-xs bg-gray-100 px-2 rounded">{ex.muscle_group}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer: Nhập Sets/Reps */}
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-black">Số hiệp (Sets)</label>
                            <input type="number" value={sets} onChange={e => setSets(Number(e.target.value))} className="border p-2 rounded w-20 text-black" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-black">Số cái (Reps)</label>
                            <input type="text" value={reps} onChange={e => setReps(e.target.value)} className="border p-2 rounded w-20 text-black" />
                        </div>
                    </div>
                    <button 
                        disabled={!selectedEx}
                        onClick={handleAdd}
                        className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 disabled:bg-gray-300"
                    >
                        ➕ Thêm vào giáo án
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseSelectorModal;