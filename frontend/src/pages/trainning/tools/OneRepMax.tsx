// frontend/src/pages/training/tools/OneRepMax.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';

const OneRepMax = () => {
    const [weight, setWeight] = useState<number | ''>('');
    const [reps, setReps] = useState<number | ''>('');
    const [result, setResult] = useState<number | null>(null);
    const [formulaDetails, setFormulaDetails] = useState({ epley: 0, brzycki: 0, lombardi: 0 });

    const calculate1RM = () => {
        const w = Number(weight);
        const r = Number(reps);

        if (!w || !r) return;
        
        // Nếu reps = 1 thì 1RM chính là weight
        if (r === 1) {
            setResult(w);
            setFormulaDetails({ epley: w, brzycki: w, lombardi: w });
            return;
        }

        // 1. Công thức Epley (Phổ biến nhất)
        const epley = w * (1 + r / 30);
        
        // 2. Công thức Brzycki (Chính xác cao khi reps < 10)
        // Lưu ý: Brzycki có thể ra số âm hoặc vô cực nếu reps >= 37, nhưng trong tập luyện hiếm ai test max > 30 reps
        const brzycki = w * (36 / (37 - r));

        // 3. Công thức Lombardi (Mũ số học)
        const lombardi = w * Math.pow(r, 0.10);

        // Tính trung bình cộng (Consensus)
        const avg1RM = (epley + brzycki + lombardi) / 3;

        setResult(Math.round(avg1RM));
        setFormulaDetails({
            epley: Math.round(epley),
            brzycki: Math.round(brzycki),
            lombardi: Math.round(lombardi)
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <Link to="/training/tools" className="flex items-center text-teal-600 font-medium mb-6 hover:underline">
                    <FaArrowLeft className="mr-2"/> Quay lại danh sách
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-teal-600 p-8 text-white text-center">
                        <FaDumbbell className="text-5xl mx-auto mb-4 opacity-80" />
                        <h1 className="text-3xl font-bold">Dự Đoán Sức Mạnh (1RM)</h1>
                        <p className="text-teal-100 mt-2">Tính sức mạnh tối đa dựa trên đa công thức khoa học (Epley, Brzycki, Lombardi).</p>
                    </div>

                    <div className="p-8">
                        {/* Input Form */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mức tạ đã nâng (kg)</label>
                                <input 
                                    type="number" 
                                    value={weight}
                                    onChange={(e) => setWeight(Number(e.target.value))}
                                    placeholder="VD: 60"
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-xl font-bold text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Số lần lặp (Reps)</label>
                                <input 
                                    type="number" 
                                    value={reps}
                                    onChange={(e) => setReps(Number(e.target.value))}
                                    placeholder="VD: 8"
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-xl font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={calculate1RM}
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 text-lg"
                        >
                            TÍNH KẾT QUẢ
                        </button>

                        {/* Result Section */}
                        {result && (
                            <div className="mt-10 animate-fade-in-up">
                                <div className="text-center mb-8">
                                    <p className="text-gray-500 uppercase tracking-wide text-xs font-bold">Sức mạnh tối đa ước tính (1RM)</p>
                                    <div className="text-6xl font-black text-teal-700 mt-2 tracking-tighter">
                                        {result} <span className="text-2xl text-gray-400 font-normal">kg</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400 flex justify-center gap-4">
                                        <span>Epley: {formulaDetails.epley}kg</span>
                                        <span>•</span>
                                        <span>Brzycki: {formulaDetails.brzycki}kg</span>
                                        <span>•</span>
                                        <span>Lombardi: {formulaDetails.lombardi}kg</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-8">
                                    <h3 className="font-bold text-gray-800 mb-6 text-lg flex items-center">
                                        <FaInfoCircle className="text-teal-500 mr-2"/>
                                        Mức tạ tập luyện khuyên dùng:
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Row: Sức mạnh */}
                                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                            <div>
                                                <span className="font-bold text-red-700 block text-lg">Tăng Sức Mạnh (Strength)</span>
                                                <span className="text-xs text-red-500 font-medium">1 - 5 reps (85-100% 1RM)</span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-800">{Math.round(result * 0.85)} - {result} kg</span>
                                        </div>

                                        {/* Row: Tăng cơ */}
                                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                                            <div>
                                                <span className="font-bold text-green-700 block text-lg">Tăng Cơ Bắp (Hypertrophy)</span>
                                                <span className="text-xs text-green-500 font-medium">8 - 12 reps (70-80% 1RM)</span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-800">{Math.round(result * 0.70)} - {Math.round(result * 0.80)} kg</span>
                                        </div>

                                        {/* Row: Sức bền */}
                                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <div>
                                                <span className="font-bold text-blue-700 block text-lg">Tăng Sức Bền (Endurance)</span>
                                                <span className="text-xs text-blue-500 font-medium">15+ reps (50-65% 1RM)</span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-800">{Math.round(result * 0.50)} - {Math.round(result * 0.65)} kg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OneRepMax;