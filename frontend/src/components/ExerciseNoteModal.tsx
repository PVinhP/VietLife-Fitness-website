import React, { useState, useEffect } from 'react';

interface NoteHistory {
    date: string;
    note: string;
}

interface ExerciseNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    exerciseName: string;
    currentNote?: string;
    previousNotes?: NoteHistory[];
}

const ExerciseNoteModal: React.FC<ExerciseNoteModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    exerciseName,
    currentNote = '',
    previousNotes = []
}) => {
    const [note, setNote] = useState(currentNote);

    useEffect(() => {
        setNote(currentNote);
    }, [currentNote, isOpen]);

    const handleQuickAdd = (text: string) => {
        setNote(prev => prev ? `${prev}, ${text}` : text);
    };

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold">✏️ Ghi chú bài tập</h3>
                            <p className="text-sm opacity-90 mt-1">{exerciseName}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    
                    {/* Lịch sử ghi chú */}
                    {previousNotes.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold text-blue-700 uppercase">Lịch sử lần tập gần đây</span>
                            </div>
                            <div className="space-y-2">
                                {previousNotes.slice(0, 3).map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setNote(item.note)}
                                        className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-800">{item.note}</p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Textarea chính */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Nội dung ghi chú</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="VD: 30kg x 12 reps, cảm giác tốt, cần tăng tạ lần sau..."
                            className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm text-black"
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            💡 Mẹo: Ghi lại mức tạ, số reps thực tế, cảm giác để theo dõi tiến triển
                        </p>
                    </div>

                    {/* Common tags */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Thẻ phổ biến</label>
                        <div className="flex flex-wrap gap-2">
                            {['Tăng tạ', 'Giảm tạ', 'Form tốt', 'Cần cải thiện', 'Đau nhẹ'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleQuickAdd(tag)}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-orange-100 hover:text-orange-700 transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-4 flex gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                        💾 Lưu ghi chú
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseNoteModal;