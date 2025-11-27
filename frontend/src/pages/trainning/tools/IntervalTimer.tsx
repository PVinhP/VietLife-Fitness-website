import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaPause, FaRedo, FaArrowLeft, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const IntervalTimer = () => {
    // --- State ---
    const [workTime, setWorkTime] = useState<number | ''>(20); 
    const [restTime, setRestTime] = useState<number | ''>(10); 
    const [rounds, setRounds] = useState<number | ''>(8);
    const [soundOn, setSoundOn] = useState(true);

    const [isActive, setIsActive] = useState(false);
    const [isWorkPhase, setIsWorkPhase] = useState(true); 
    const [currentRound, setCurrentRound] = useState(1);
    
    const [timeLeft, setTimeLeft] = useState<number>(20);
    const [totalTimeForPhase, setTotalTimeForPhase] = useState<number>(20); 

    const timerRef = useRef<any>(null);

    // --- HỆ THỐNG ÂM THANH (Double Beep) ---
    const playBeep = useCallback(() => {
        if (!soundOn) return;
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.value = 880;
            gain.gain.value = 0.1;

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio Error", e);
        }
    }, [soundOn]);

    const playWhistle = useCallback(() => {
        if (!soundOn) return;
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            const playTone = (freq: number, startTime: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'square';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = ctx.currentTime;
            playTone(1200, now, 0.1);
            playTone(1200, now + 0.15, 0.4);

        } catch (e) {
            console.error("Whistle Error", e);
        }
    }, [soundOn]);

    // --- Logic Reset ---
    const resetTimer = useCallback(() => {
        setIsActive(false);
        setIsWorkPhase(true);
        setCurrentRound(1);
        const w = typeof workTime === 'number' ? workTime : 0;
        setTimeLeft(w);
        setTotalTimeForPhase(w);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, [workTime]);

    const finishWorkout = useCallback(() => {
        setIsActive(false);
        playWhistle();
        setTimeout(playWhistle, 500);
        setTimeout(playWhistle, 1000);
        
        alert("🎉 Chúc mừng! Bạn đã hoàn thành bài tập.");
        resetTimer();
    }, [resetTimer, playWhistle]);

    // --- Logic Chuyển Pha ---
    const handlePhaseSwitch = useCallback(() => {
        playWhistle();

        const rTime = typeof restTime === 'number' ? restTime : 0;
        const wTime = typeof workTime === 'number' ? workTime : 0;
        const maxRounds = typeof rounds === 'number' ? rounds : 0;

        if (isWorkPhase) {
            if (currentRound < maxRounds) {
                setIsWorkPhase(false);
                setTimeLeft(rTime);
                setTotalTimeForPhase(rTime);
            } else {
                finishWorkout();
            }
        } else {
            setIsWorkPhase(true);
            setCurrentRound((prev) => prev + 1);
            setTimeLeft(wTime);
            setTotalTimeForPhase(wTime);
        }
    }, [isWorkPhase, currentRound, rounds, restTime, workTime, playWhistle, finishWorkout]); 

    // --- useEffect đếm ngược ---
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            if (timeLeft <= 3 && timeLeft >= 1) playBeep();

            timerRef.current = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            handlePhaseSwitch();
        }

        return () => clearTimeout(timerRef.current);
    }, [isActive, timeLeft, handlePhaseSwitch, playBeep]); 

    // --- useEffect cập nhật input ---
    useEffect(() => {
        if (!isActive) {
            const w = typeof workTime === 'number' ? workTime : 0;
            setTimeLeft(w);
            setTotalTimeForPhase(w);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workTime]);

    const toggleTimer = () => setIsActive(!isActive);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = totalTimeForPhase > 0 ? timeLeft / totalTimeForPhase : 0;
    const strokeDashoffset = circumference - (progress * circumference);

    const applyPreset = (w: number, r: number, rnd: number) => {
        if(isActive) return;
        setWorkTime(w);
        setRestTime(r);
        setRounds(rnd);
    };

    // --- CẬP NHẬT: Hàm xử lý nhập liệu (Chặn số âm) ---
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, value: string) => {
        if (value === '') {
            setter('');
        } else {
            const num = Number(value);
            // Chỉ cập nhật nếu là số dương (>= 0)
            if (num >= 0) {
                setter(num);
            }
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-700 py-6 px-4 flex flex-col ${isWorkPhase ? 'bg-orange-50' : 'bg-blue-50'}`}>
            <div className="max-w-md mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/training/tools" className="flex items-center text-gray-500 font-bold hover:text-teal-600 transition-colors">
                        <FaArrowLeft className="mr-2"/> Quay lại
                    </Link>
                    <button onClick={() => setSoundOn(!soundOn)} className="text-gray-500 hover:text-teal-600 transition-colors">
                        {soundOn ? <FaVolumeUp size={20}/> : <FaVolumeMute size={20}/>}
                    </button>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-4 border-white relative">
                    
                    <div className={`py-4 text-center text-white transition-colors duration-500 ${isWorkPhase ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        <h2 className="text-3xl font-black uppercase tracking-widest animate-pulse">
                            {isActive ? (isWorkPhase ? "🔥 WORK" : "❄️ REST") : "READY"}
                        </h2>
                        <div className="flex justify-center gap-1 mt-1 opacity-90 text-sm font-medium">
                            <span>ROUND</span>
                            <span className="bg-white/20 px-2 rounded text-white">{currentRound} / {rounds}</span>
                        </div>
                    </div>

                    <div className="p-8 flex flex-col items-center">
                        <div className="relative w-64 h-64 mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="128" cy="128" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                                <circle cx="128" cy="128" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`transition-all duration-1000 ease-linear ${isWorkPhase ? 'text-orange-500' : 'text-blue-500'}`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-6xl font-black font-mono transition-colors duration-300 ${isWorkPhase ? 'text-gray-800' : 'text-blue-600'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-gray-400 text-sm font-bold tracking-wide mt-2">
                                    {isActive ? "SECONDS LEFT" : "TOTAL TIME"}
                                </span>
                            </div>
                        </div>

                        {!isActive && (
                            <div className="w-full animate-fade-in-up">
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 text-center">Tập (s)</label>
                                        <input 
                                            type="number" 
                                            min="0" // Thêm min để chặn nút giảm
                                            value={workTime} 
                                            onChange={(e) => handleInputChange(setWorkTime, e.target.value)} 
                                            className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-xl text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 text-center">Nghỉ (s)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={restTime} 
                                            onChange={(e) => handleInputChange(setRestTime, e.target.value)} 
                                            className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-xl text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 text-center">Hiệp</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={rounds} 
                                            onChange={(e) => handleInputChange(setRounds, e.target.value)} 
                                            className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-xl text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mb-6 justify-center">
                                    <button onClick={() => applyPreset(20, 10, 8)} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full hover:bg-teal-100 border border-teal-200">Tabata (20/10)</button>
                                    <button onClick={() => applyPreset(40, 20, 10)} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full hover:bg-teal-100 border border-teal-200">HIIT (40/20)</button>
                                    <button onClick={() => applyPreset(60, 60, 5)} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full hover:bg-teal-100 border border-teal-200">Boxer (1/1)</button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 w-full">
                            <button onClick={toggleTimer} className={`flex-1 py-4 rounded-2xl font-bold text-lg text-white shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-teal-600 hover:bg-teal-700'}`}>
                                {isActive ? <><FaPause className="mr-2"/> TẠM DỪNG</> : <><FaPlay className="mr-2"/> BẮT ĐẦU TẬP</>}
                            </button>
                            
                            <button onClick={resetTimer} className="w-16 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95 border border-gray-200">
                                <FaRedo/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntervalTimer;