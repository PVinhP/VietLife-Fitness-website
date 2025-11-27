import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaWeightHanging, FaLayerGroup } from 'react-icons/fa';

// Định nghĩa các loại bánh tạ (Chuẩn Olympic)
const AVAILABLE_PLATES = [
    { weight: 25, color: 'bg-red-600 border-red-700', text: 'text-white', height: 'h-32' },
    { weight: 20, color: 'bg-blue-600 border-blue-700', text: 'text-white', height: 'h-32' },
    { weight: 15, color: 'bg-yellow-500 border-yellow-600', text: 'text-black', height: 'h-28' },
    { weight: 10, color: 'bg-green-600 border-green-700', text: 'text-white', height: 'h-24' },
    { weight: 5, color: 'bg-white border-gray-400', text: 'text-gray-800', height: 'h-20' },
    { weight: 2.5, color: 'bg-gray-800 border-black', text: 'text-white', height: 'h-16' },
    { weight: 1.25, color: 'bg-gray-400 border-gray-500', text: 'text-gray-900', height: 'h-14' },
];
const MAX_WEIGHT = 500;
const PlateCalculator = () => {
    // State: Cho phép null hoặc chuỗi rỗng để xử lý input
    const [targetWeight, setTargetWeight] = useState<number | ''>('');
    const [barWeight, setBarWeight] = useState<number>(20); 
    const [platesPerSide, setPlatesPerSide] = useState<number[]>([]);
    const [remainder, setRemainder] = useState<number>(0);
    const [error, setError] = useState<string | null>(null); // State thông báo lỗi

    useEffect(() => {
        calculatePlates();
    }, [targetWeight, barWeight]);

    // Hàm xử lý nhập liệu an toàn
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setTargetWeight('');
            setError(null);
            return;
        }
        
        const num = parseFloat(val);
        if (num < 0) return; // Chặn số âm
        setTargetWeight(num);
    };

    const calculatePlates = () => {
        // Reset kết quả
        setPlatesPerSide([]);
        setRemainder(0);
        setError(null);

        if (targetWeight === '' || targetWeight === 0) return;

        const total = Number(targetWeight);

        // --- KIỂM TRA LỖI ---
        
        // Lỗi 1: Nhỏ hơn thanh đòn
        if (total < barWeight) {
            setError(`Tổng tạ phải lớn hơn thanh đòn (${barWeight}kg)`);
            return;
        }

        // Lỗi 2: Lớn hơn giới hạn cho phép (MỚI THÊM)
        if (total > MAX_WEIGHT) {
            setError(`Mức tạ tối đa hỗ trợ là ${MAX_WEIGHT}kg`);
            return;
        }

        // --- TÍNH TOÁN ---
        const weightToLoad = total - barWeight;
        let oneSide = weightToLoad / 2;
        
        const calculatedPlates: number[] = [];

        AVAILABLE_PLATES.forEach(plate => {
            while (oneSide >= plate.weight) {
                calculatedPlates.push(plate.weight);
                oneSide -= plate.weight;
            }
        });

        setPlatesPerSide(calculatedPlates);
        setRemainder(Number((oneSide * 2).toFixed(2))); 
    };
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                <Link to="/training/tools" className="flex items-center text-gray-500 font-bold hover:text-teal-600 transition-colors mb-6">
                    <FaArrowLeft className="mr-2"/> Quay lại kho công cụ
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-slate-800 p-8 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20 -ml-10 -mt-10"></div>
                        <h1 className="text-3xl font-black mb-2 flex justify-center items-center gap-3 relative z-10">
                            <FaWeightHanging className="text-orange-400"/> BARBELL CALCULATOR
                        </h1>
                        <p className="text-gray-400 text-sm">Tính toán cách lắp bánh tạ chuẩn xác & nhanh chóng</p>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-6 mb-10 justify-center">
                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tổng mức tạ (kg)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        placeholder="VD: 100" 
                                        value={targetWeight} 
                                        onChange={handleInputChange} 
                                        className={`w-full p-4 bg-gray-50 border-2 rounded-2xl text-center text-3xl font-black text-teal-700 focus:ring-0 outline-none transition-all ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}
                                    />
                                    {error && (
                                        <p className="absolute top-full left-0 w-full text-center text-red-500 text-xs mt-1 font-bold animate-pulse">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Trọng lượng thanh đòn</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setBarWeight(20)}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${barWeight === 20 ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        20kg
                                    </button>
                                    <button 
                                        onClick={() => setBarWeight(15)}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${barWeight === 15 ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        15kg
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* VISUALIZATION SECTION */}
                        <div className="bg-gray-100 rounded-2xl p-4 md:p-10 mb-8 overflow-x-auto min-h-[200px] flex items-center justify-center">
                            {platesPerSide.length > 0 ? (
                                <div className="min-w-[600px] flex items-center justify-center relative h-48 animate-fade-in">
                                    {/* Thanh đòn */}
                                    <div className="absolute w-full h-4 bg-gray-400 rounded-full z-0 shadow-inner"></div>
                                    
                                    {/* Ống lắp tạ - Bên trái */}
                                    <div className="absolute left-0 w-1/3 h-6 bg-gray-300 border-r-4 border-gray-400 z-0 shadow-sm"></div>
                                    
                                    {/* PLATES DISPLAY */}
                                    <div className="flex items-center gap-1 z-10 flex-row-reverse mr-auto ml-10">
                                        {platesPerSide.map((weight, index) => {
                                            const plateInfo = AVAILABLE_PLATES.find(p => p.weight === weight);
                                            return (
                                                <div 
                                                    key={index}
                                                    className={`${plateInfo?.height} w-8 md:w-10 rounded-md border-2 flex items-center justify-center shadow-lg transform transition-transform hover:-translate-y-2 cursor-pointer ${plateInfo?.color}`}
                                                    title={`${weight} kg`}
                                                >
                                                    <span className={`text-[10px] md:text-xs font-bold -rotate-90 whitespace-nowrap ${plateInfo?.text}`}>
                                                        {weight}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Khóa tạ */}
                                        <div className="h-10 w-4 bg-gray-600 rounded border-l-2 border-gray-400 shadow-md"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-400 text-sm font-medium italic flex flex-col items-center">
                                    <FaLayerGroup className="text-4xl mb-2 opacity-20"/>
                                    {targetWeight ? "Chưa đủ để lắp thêm tạ..." : "Nhập mức tạ để xem cách lắp..."}
                                </div>
                            )}
                        </div>

                        {/* RESULT SUMMARY */}
                        {platesPerSide.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <FaLayerGroup className="text-teal-500"/> Cần lắp mỗi bên:
                                    </h3>
                                    <div className="space-y-2">
                                        {Array.from(new Set(platesPerSide)).map(weight => {
                                            const count = platesPerSide.filter(w => w === weight).length;
                                            const plate = AVAILABLE_PLATES.find(p => p.weight === weight);
                                            return (
                                                <div key={weight} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-black">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full ${plate?.color.split(' ')[0]}`}></div>
                                                        <span className="font-bold text-gray-700">{weight} kg</span>
                                                    </div>
                                                    <span className="text-sm font-bold bg-white px-3 py-1 rounded border border-gray-200">
                                                        x {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 text-right text-gray-500 text-sm">
                                        Tổng cộng: <span className="font-bold text-teal-600">{(Number(targetWeight) - barWeight) / 2} kg</span> / bên
                                    </div>
                                </div>

                                {remainder > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                                        <div className="text-3xl mb-2">⚠️</div>
                                        <h3 className="font-bold text-yellow-800">Dư tạ lẻ</h3>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Dư <span className="font-bold">{remainder} kg</span> không có bánh tạ phù hợp.
                                            <br/>
                                            Mức tạ thực tế trên thanh đòn: <span className="font-bold text-lg text-slate-800">{Number(targetWeight) - remainder} kg</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlateCalculator;