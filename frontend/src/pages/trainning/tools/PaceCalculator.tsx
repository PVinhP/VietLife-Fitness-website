import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRunning, FaArrowLeft, FaCalculator, FaClock, FaTachometerAlt } from 'react-icons/fa';

const DISTANCES = [
    { label: 'Tùy chỉnh', value: 0 },
    { label: '5K (5 km)', value: 5 },
    { label: '10K (10 km)', value: 10 },
    { label: 'Half Marathon (21.1 km)', value: 21.0975 },
    { label: 'Full Marathon (42.2 km)', value: 42.195 },
];

const PaceCalculator = () => {
    // Tab: 'pace' (Tính Tốc độ) hoặc 'time' (Tính Thời gian)
    const [mode, setMode] = useState<'pace' | 'time'>('pace');

    // Inputs
    const [distance, setDistance] = useState<number | ''>(5);
    const [hours, setHours] = useState<number | ''>('');
    const [minutes, setMinutes] = useState<number | ''>(25);
    const [seconds, setSeconds] = useState<number | ''>(0);
    
    // Inputs cho Mode 'time' (Nhập Pace)
    const [paceMin, setPaceMin] = useState<number | ''>(5);
    const [paceSec, setPaceSec] = useState<number | ''>(0);

    // Results
    const [resultPace, setResultPace] = useState<string>('');
    const [resultSpeed, setResultSpeed] = useState<string>('');
    const [resultTime, setResultTime] = useState<string>('');

    // Logic Tính toán
    useEffect(() => {
        calculate();
    }, [distance, hours, minutes, seconds, paceMin, paceSec, mode]);

    const calculate = () => {
        const dist = Number(distance);
        if (!dist || dist <= 0) return;

        if (mode === 'pace') {
            // MODE 1: Có Quãng đường + Thời gian -> Tính Pace
            const totalMinutes = (Number(hours) * 60) + Number(minutes) + (Number(seconds) / 60);
            if (totalMinutes <= 0) return;

            const paceDecimal = totalMinutes / dist; // phút trên mỗi km
            const pMin = Math.floor(paceDecimal);
            const pSec = Math.round((paceDecimal - pMin) * 60);
            
            // Xử lý giây 60
            const finalPMin = pSec === 60 ? pMin + 1 : pMin;
            const finalPSec = pSec === 60 ? 0 : pSec;

            const speedKmh = (dist / (totalMinutes / 60)).toFixed(1);

            setResultPace(`${finalPMin}:${finalPSec < 10 ? '0' : ''}${finalPSec}`);
            setResultSpeed(speedKmh);
        } else {
            // MODE 2: Có Quãng đường + Pace -> Tính Thời gian đích
            const pMin = Number(paceMin);
            const pSec = Number(paceSec);
            if (pMin <= 0 && pSec <= 0) return;

            const paceInMinutes = pMin + (pSec / 60);
            const totalTimeInMinutes = dist * paceInMinutes;

            const h = Math.floor(totalTimeInMinutes / 60);
            const m = Math.floor(totalTimeInMinutes % 60);
            const s = Math.round((totalTimeInMinutes - Math.floor(totalTimeInMinutes)) * 60);

            setResultTime(`${h > 0 ? h + ' giờ ' : ''}${m} phút ${s} giây`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
            <div className="max-w-2xl mx-auto">
                {/* Nav Back */}
                <Link to="/training/tools" className="flex items-center text-gray-500 font-bold hover:text-teal-600 transition-colors mb-6">
                    <FaArrowLeft className="mr-2"/> Quay lại kho công cụ
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-slate-800 p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                        <h1 className="text-3xl font-black mb-2 flex justify-center items-center gap-3 relative z-10">
                            <FaRunning className="text-teal-400"/> PACE CALCULATOR
                        </h1>
                        <p className="text-gray-400 text-sm">Tính tốc độ chạy bộ & Dự báo thành tích Marathon</p>
                    </div>

                    {/* Tabs Switcher */}
                    <div className="flex border-b border-gray-100">
                        <button 
                            onClick={() => setMode('pace')}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'pace' ? 'bg-white text-teal-600 border-b-2 border-teal-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            ⚡ Tính Tốc độ (Pace)
                        </button>
                        <button 
                            onClick={() => setMode('time')}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${mode === 'time' ? 'bg-white text-teal-600 border-b-2 border-teal-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            ⏱️ Dự tính Thời gian
                        </button>
                    </div>

                    <div className="p-8">
                        {/* Common Input: Distance */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Chọn Cự ly</label>
                            <div className="flex gap-2 flex-wrap mb-3">
                                {DISTANCES.slice(1).map((d) => (
                                    <button 
                                        key={d.value}
                                        onClick={() => setDistance(d.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${distance === d.value ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-400'}`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={distance} 
                                    onChange={(e) => setDistance(Number(e.target.value))}
                                    // Sửa text color ở đây: text-gray-800
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                                <span className="absolute right-4 top-4 text-gray-400 font-bold">km</span>
                            </div>
                        </div>

                        {/* INPUTS FOR MODE: PACE */}
                        {mode === 'pace' && (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Thời gian chạy (H : M : S)</label>
                                <div className="flex gap-4 mb-8">
                                    {/* Sửa text color ở đây: text-gray-800 */}
                                    <input type="number" placeholder="00" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-1/3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"/>
                                    <input type="number" placeholder="25" value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="w-1/3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"/>
                                    <input type="number" placeholder="00" value={seconds} onChange={e => setSeconds(Number(e.target.value))} className="w-1/3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"/>
                                </div>

                                {/* RESULT PACE */}
                                <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-teal-600 font-bold text-sm uppercase mb-1">Pace của bạn</p>
                                        <p className="text-4xl font-black text-teal-800">{resultPace || "--:--"}</p>
                                        <p className="text-xs text-teal-600 font-medium">phút / km</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 font-bold text-xs uppercase mb-1">Tốc độ</p>
                                        <p className="text-2xl font-bold text-gray-600">{resultSpeed || "0"} <span className="text-sm">km/h</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INPUTS FOR MODE: TIME */}
                        {mode === 'time' && (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pace mục tiêu (Phút : Giây / km)</label>
                                <div className="flex gap-4 mb-8">
                                    <div className="w-1/2 relative">
                                        {/* Sửa text color ở đây: text-gray-800 */}
                                        <input type="number" placeholder="5" value={paceMin} onChange={e => setPaceMin(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"/>
                                        <span className="absolute right-3 top-5 text-gray-400 text-xs font-bold">min</span>
                                    </div>
                                    <div className="w-1/2 relative">
                                        <input type="number" placeholder="30" value={paceSec} onChange={e => setPaceSec(Number(e.target.value))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"/>
                                        <span className="absolute right-3 top-5 text-gray-400 text-xs font-bold">sec</span>
                                    </div>
                                </div>

                                {/* RESULT TIME */}
                                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                                    <p className="text-gray-400 font-bold text-sm uppercase mb-2">Thành tích dự kiến</p>
                                    <p className="text-3xl md:text-4xl font-black text-white tracking-tight">{resultTime || "-- giờ -- phút"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaceCalculator;