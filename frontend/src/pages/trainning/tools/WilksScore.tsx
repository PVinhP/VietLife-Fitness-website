import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalculator, FaTrophy, FaMars, FaVenus, FaDumbbell } from 'react-icons/fa';

const WilksScore = () => {
    // State
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [bodyWeight, setBodyWeight] = useState<number | ''>('');
    const [liftedWeight, setLiftedWeight] = useState<number | ''>('');
    const [score, setScore] = useState<number | null>(null);
    const [level, setLevel] = useState<string>('');

    // Tự động tính khi nhập đủ
    useEffect(() => {
        calculateWilks();
    }, [gender, bodyWeight, liftedWeight]);

    const calculateWilks = () => {
        const bw = Number(bodyWeight);
        const lifted = Number(liftedWeight);

        if (!bw || !lifted || bw <= 0) {
            setScore(null);
            return;
        }

        // HỆ SỐ CHUẨN WILKS (Metric - kg)
        // Công thức: Coeff = 500 / (a + bx + cx^2 + dx^3 + ex^4 + fx^5)
        // x = trọng lượng cơ thể
        let a, b, c, d, e, f;

        if (gender === 'male') {
            a = -216.0475144;
            b = 16.2606339;
            c = -0.002388645;
            d = -0.00113732;
            e = 7.01863E-06;
            f = -1.291E-08;
        } else {
            a = 594.31747775582;
            b = -27.23842536447;
            c = 0.82112226871;
            d = -0.00930733913;
            e = 4.731582E-05;
            f = -9.054E-08;
        }

        const x = bw;
        const denominator = a + (b * x) + (c * Math.pow(x, 2)) + (d * Math.pow(x, 3)) + (e * Math.pow(x, 4)) + (f * Math.pow(x, 5));
        const coeff = 500 / denominator;
        const result = coeff * lifted;

        setScore(Number(result.toFixed(2)));
        determineLevel(result);
    };

    // Đánh giá trình độ dựa trên điểm Wilks
    const determineLevel = (s: number) => {
        if (s < 200) setLevel('Người mới (Beginner)');
        else if (s < 300) setLevel('Trung bình (Intermediate)');
        else if (s < 400) setLevel('Khá giỏi (Advanced)');
        else if (s < 500) setLevel('Vận động viên (Elite)');
        else setLevel('Quái vật (World Class) 👽');
    };

    // Hàm xử lý nhập liệu an toàn
    const handleInputChange = (setter: any, value: string) => {
        if (value === '') setter('');
        else if (Number(value) >= 0) setter(Number(value));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
            <div className="max-w-2xl mx-auto">
                <Link to="/training/tools" className="flex items-center text-gray-500 font-bold hover:text-teal-600 transition-colors mb-6">
                    <FaArrowLeft className="mr-2"/> Quay lại kho công cụ
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-slate-800 p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                        <h1 className="text-3xl font-black mb-2 flex justify-center items-center gap-3 relative z-10">
                            <FaCalculator className="text-purple-400"/> WILKS SCORE
                        </h1>
                        <p className="text-gray-400 text-sm">Tính sức mạnh tương đối - Ai là người khỏe nhất?</p>
                    </div>

                    <div className="p-8">
                        {/* 1. Chọn Giới tính */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                            <button 
                                onClick={() => setGender('male')}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${gender === 'male' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <FaMars className="text-lg"/> NAM
                            </button>
                            <button 
                                onClick={() => setGender('female')}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${gender === 'female' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <FaVenus className="text-lg"/> NỮ
                            </button>
                        </div>

                        {/* 2. Nhập thông số */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cân nặng (kg)</label>
                                <input 
                                    type="number" 
                                    placeholder="VD: 70" 
                                    value={bodyWeight}
                                    onChange={(e) => handleInputChange(setBodyWeight, e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xl font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tổng tạ nâng (kg)</label>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        placeholder="Squat + Bench + Dead" 
                                        value={liftedWeight}
                                        onChange={(e) => handleInputChange(setLiftedWeight, e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xl font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                    {/* Tooltip gợi ý */}
                                    <div className="absolute top-full mt-2 left-0 w-full bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center z-10 pointer-events-none">
                                        Tổng của 3 bài: Squat + Bench Press + Deadlift
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Kết quả */}
                        {score ? (
                            <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100 text-center animate-fade-in-up relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-purple-600 font-bold text-sm uppercase mb-2">Điểm Wilks của bạn</p>
                                    <div className="text-5xl md:text-6xl font-black text-purple-800 mb-4 tracking-tighter">
                                        {score}
                                    </div>
                                    
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-purple-100">
                                        <FaTrophy className="text-yellow-500"/>
                                        <span className="font-bold text-gray-700">{level}</span>
                                    </div>
                                </div>
                                
                                {/* Decor background */}
                                <FaDumbbell className="absolute -bottom-4 -right-4 text-9xl text-purple-200 opacity-20 transform -rotate-45"/>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Nhập cân nặng và thành tích để xem thứ hạng của bạn
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WilksScore;