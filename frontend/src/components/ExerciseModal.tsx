import React, { useState } from 'react';
import { FaTimes, FaLayerGroup, FaDumbbell } from 'react-icons/fa';

// Định nghĩa interface đầy đủ cho bài tập chi tiết
export interface ExerciseDetail {
    id: number;
    exercise_name: string;
    video_urls: string;
    thumbnail_url: string;
    description: string;
    muscle_group: string;
    equipment_required: string;
    steps: string;
    difficulty?: string;
}

interface ExerciseModalProps {
    exercise: ExerciseDetail | null;
    isOpen: boolean;
    onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, isOpen, onClose }) => {
    if (!isOpen || !exercise) return null;

    const parseSteps = (stepsString: string): string[] => {
        if (!stepsString) return [];
        return stepsString.split('\\n');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 flex flex-col custom-scrollbar">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all backdrop-blur-md"
                >
                    <FaTimes size={18} />
                </button>

                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-6 pr-10">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                            exercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-600' :
                            exercise.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-600' :
                            'bg-green-100 text-green-600'
                        }`}>
                            {exercise.difficulty || 'Beginner'}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-800">{exercise.exercise_name}</h1>
                    </div>

                    {/* Video */}
                    {exercise.video_urls && (
                        <div className="mb-8 rounded-xl overflow-hidden shadow-lg bg-black aspect-video relative group">
                            <video className="w-full h-full object-contain" controls autoPlay muted loop>
                                <source src={exercise.video_urls} type="video/mp4" />
                                Trình duyệt của bạn không hỗ trợ video.
                            </video>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex items-start gap-4">
                            <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
                                <FaLayerGroup size={20}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-teal-800 text-sm uppercase">Nhóm cơ</h3>
                                <p className="text-gray-700 font-medium">{exercise.muscle_group}</p>
                            </div>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex items-start gap-4">
                            <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
                                <FaDumbbell size={20}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-teal-800 text-sm uppercase">Dụng cụ</h3>
                                <p className="text-gray-700 font-medium">{exercise.equipment_required}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description & Steps */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-teal-500 pl-3">Mô tả</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{exercise.description}</p>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-teal-500 pl-3">Hướng dẫn</h3>
                            <div className="space-y-4">
                                {parseSteps(exercise.steps).map((step, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm border border-slate-200">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-700 mt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-20">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseModal;