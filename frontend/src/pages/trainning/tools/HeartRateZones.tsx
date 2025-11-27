// frontend/src/pages/training/tools/HeartRateZones.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaArrowLeft, FaRunning, FaFireAlt, FaStopwatch } from 'react-icons/fa';

const HeartRateZones = () => {
    const [age, setAge] = useState<number | ''>('');
    const [restingHR, setRestingHR] = useState<number | ''>(''); // Nhịp tim nghỉ
    const [maxHRResult, setMaxHRResult] = useState<number>(0);
    const [zones, setZones] = useState<any[]>([]);

    const calculateZones = (e: React.FormEvent) => {
        e.preventDefault();
        const a = Number(age);
        const rhr = Number(restingHR);

        if (!a) return;

        // 1. Tính nhịp tim tối đa (Max Heart Rate - Tanaka Formula: chính xác hơn 220-age cho người > 40t, nhưng 220-age phổ biến hơn. Ở đây dùng 220-age cho chuẩn cơ bản)
        const maxHR = 220 - a;
        setMaxHRResult(maxHR);

        // 2. Tính Heart Rate Reserve (HRR) nếu có Resting HR (Công thức Karvonen)
        // Target HR = ((Max HR − Resting HR) × %Intensity) + Resting HR
        
        const calculateZone = (minPct: number, maxPct: number) => {
            if (rhr > 0) {
                // Karvonen Formula
                const min = Math.round(((maxHR - rhr) * minPct) + rhr);
                const max = Math.round(((maxHR - rhr) * maxPct) + rhr);
                return { min, max };
            } else {
                // Traditional Formula
                const min = Math.round(maxHR * minPct);
                const max = Math.round(maxHR * maxPct);
                return { min, max };
            }
        };

        const calculatedZones = [
            {
                id: 1,
                name: "Vùng 1: Khởi động / Hồi phục",
                desc: "Nhẹ nhàng, có thể nói chuyện thoải mái.",
                intensity: "50% - 60%",
                range: calculateZone(0.5, 0.6),
                color: "bg-gray-100 text-gray-600 border-gray-200",
                icon: <FaStopwatch/>
            },
            {
                id: 2,
                name: "Vùng 2: Đốt mỡ (Fat Burn)",
                desc: "Vùng quan trọng nhất để giảm cân & xây dựng nền tảng.",
                intensity: "60% - 70%",
                range: calculateZone(0.6, 0.7),
                color: "bg-blue-50 text-blue-600 border-blue-200",
                icon: <FaFireAlt/>
            },
            {
                id: 3,
                name: "Vùng 3: Aerobic (Tim mạch)",
                desc: "Tăng sức bền, hơi thở bắt đầu gấp hơn.",
                intensity: "70% - 80%",
                range: calculateZone(0.7, 0.8),
                color: "bg-green-50 text-green-600 border-green-200",
                icon: <FaRunning/>
            },
            {
                id: 4,
                name: "Vùng 4: Anaerobic (Kỵ khí)",
                desc: "Tập cường độ cao, cơ bắp bắt đầu mỏi.",
                intensity: "80% - 90%",
                range: calculateZone(0.8, 0.9),
                color: "bg-orange-50 text-orange-600 border-orange-200",
                icon: <FaHeartbeat/>
            },
            {
                id: 5,
                name: "Vùng 5: VO2 Max (Tối đa)",
                desc: "Chỉ duy trì được thời gian rất ngắn. Dành cho VĐV.",
                intensity: "90% - 100%",
                range: calculateZone(0.9, 1.0),
                color: "bg-red-50 text-red-600 border-red-200",
                icon: <FaHeartbeat/>
            }
        ];

        setZones(calculatedZones);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <Link to="/training/tools" className="flex items-center text-teal-600 font-medium mb-6 hover:underline">
                    <FaArrowLeft className="mr-2"/> Quay lại danh sách
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-rose-500 p-8 text-white text-center">
                        <FaHeartbeat className="text-5xl mx-auto mb-4 animate-pulse" />
                        <h1 className="text-3xl font-bold">Vùng Nhịp Tim (Cardio Zones)</h1>
                        <p className="text-rose-100 mt-2">Tính vùng nhịp tim đốt mỡ tối ưu theo công thức Karvonen.</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={calculateZones} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tuổi của bạn</label>
                                    <input 
                                        type="number" 
                                        value={age}
                                        onChange={(e) => setAge(Number(e.target.value))}
                                        placeholder="VD: 25"
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-xl font-bold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Nhịp tim nghỉ (Tùy chọn)
                                        <span className="ml-1 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Chính xác hơn</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        value={restingHR}
                                        onChange={(e) => setRestingHR(Number(e.target.value))}
                                        placeholder="VD: 60"
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-xl font-bold"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Đo khi mới ngủ dậy buổi sáng.</p>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1 text-lg">
                                TÍNH VÙNG NHỊP TIM
                            </button>
                        </form>

                        {/* Results */}
                        {zones.length > 0 && (
                            <div className="mt-10 animate-fade-in">
                                <div className="text-center mb-6">
                                    <p className="text-gray-500 text-sm">Nhịp tim tối đa ước tính</p>
                                    <p className="text-4xl font-black text-gray-800">{maxHRResult} <span className="text-xl font-medium text-gray-400">bpm</span></p>
                                </div>

                                <div className="space-y-4">
                                    {zones.map((zone) => (
                                        <div key={zone.id} className={`flex items-center p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all ${zone.color.replace('bg-', 'border-l-').split(' ')[2]} bg-white`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 flex-shrink-0 ${zone.color}`}>
                                                {zone.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-gray-800">{zone.name}</h4>
                                                    <span className="text-sm font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{zone.range.min} - {zone.range.max} bpm</span>
                                                </div>
                                                <p className="text-sm text-gray-500">{zone.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                    <strong>💡 Mẹo cho Lộ trình:</strong> 
                                    <ul className="list-disc ml-5 mt-1 space-y-1">
                                        <li>Để <strong>giảm cân</strong>: Tập trung duy trì ở <strong>Vùng 2</strong> trong thời gian dài (30-60 phút).</li>
                                        <li>Để <strong>tăng sức bền</strong>: Chạy ở <strong>Vùng 3</strong>.</li>
                                        <li>Chỉ tập Vùng 4-5 khi có nền tảng thể lực tốt (HIIT).</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeartRateZones;