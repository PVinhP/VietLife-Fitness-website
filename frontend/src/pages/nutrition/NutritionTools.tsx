// frontend/src/pages/nutrition/NutritionTools.tsx (Sửa lỗi hiển thị BMI)

import React, { useState, useEffect } from 'react'
import useDebounce from "../../hook/useDebounce" 
import { FaSearch, FaCalculator, FaBalanceScale, FaChartPie, FaInfoCircle } from 'react-icons/fa'

// --- (GIỮ NGUYÊN INTERFACE) ---
interface searchList {
    id: number;
    food_name: string;
    unit: string;
    calories: number;
    water_g: number;
    protein_g: number;
    fats_g: number;
    carbs_g: number;
    fiber_g: number;
}

function NutritionTools() {
    // --- (GIỮ NGUYÊN STATE) ---
    const [Query, setQuery] = useState("");
    const [list, setList] = useState<searchList[]>([]);
    const searchResults = useDebounce(Query, 1000)
    const [activeToolTab, setActiveToolTab] = useState<'search' | 'tdee' | 'bmi' | 'macros'>('search');
    const [calculatorInput, setCalculatorInput] = useState({
        age: 25,
        gender: 1,
        weight: 70,
        height: 170,
        activity: 1.375, 
    });
    const [calculatorResult, setCalculatorResult] = useState({
        bmr: 0,
        tdee: 0,
    });
    const [bmiInput, setBmiInput] = useState({
        weight: 70,
        height: 170,
    });
    const [bmiResult, setBmiResult] = useState({
        bmi: 0,
        category: "",
        advice: "", 
    });
    const [macroInput, setMacroInput] = useState({
        calories: calculatorResult.tdee > 0 ? calculatorResult.tdee : 2000,
        goal: 'maintain', 
        ratio: 'balanced', 
    });
    const [macroResult, setMacroResult] = useState({
        protein: 0,
        carbs: 0,
        fat: 0,
        targetCalories: 0,
    });

    // --- (GIỮ NGUYÊN TOÀN BỘ LOGIC TÍNH TOÁN) ---
    // Search
    useEffect(() => {
        if (!searchResults.trim()) {
            setList([]);
            return;
        }
        fetch(`http://localhost:8080/nutrition/search?name=${searchResults}`, {
            method: "GET",
            headers: { "Content-type": "application/json" }
        })
        .then((res) => res.json())
        .then((res) => {
            const data = Array.isArray(res) ? res : (res && res.data && Array.isArray(res.data)) ? res.data : [];
            setList(data);
        })
        .catch((error) => {
            console.error("Lỗi khi tìm kiếm:", error);
            setList([]);
        });
    }, [searchResults]);

    // TDEE Calculator
    const handleCalculatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCalculatorInput({
            ...calculatorInput,
            [e.target.name]: parseFloat(e.target.value)
        });
    };
    const handleCalculateTDEE = (e: React.FormEvent) => {
        e.preventDefault();
        const { age, gender, weight, height, activity } = calculatorInput;
        let bmr = 0;
        if (gender === 1) { // Nam
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else { // Nữ
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        const tdee = bmr * activity;
        const roundedTDEE = Math.round(tdee);
        
        setCalculatorResult({
            bmr: Math.round(bmr),
            tdee: roundedTDEE,
        });
        setMacroInput(prev => ({ ...prev, calories: roundedTDEE }));
    };

    // BMI Calculator
    const handleBmiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBmiInput({
            ...bmiInput,
            [e.target.name]: parseFloat(e.target.value)
        });
    };
    const getBmiCategory = (bmi: number): string => {
        if (bmi < 18.5) return "Thiếu cân";
        if (bmi >= 18.5 && bmi < 24.9) return "Bình thường";
        if (bmi >= 25 && bmi < 29.9) return "Thừa cân";
        return "Béo phì";
    };
    const handleCalculateBmi = (e: React.FormEvent) => {
        e.preventDefault();
        const { weight, height } = bmiInput;
        if (weight > 0 && height > 0) {
            const heightInMeters = height / 100;
            const heightSquared = heightInMeters * heightInMeters;
            const bmi = weight / heightSquared;
            const roundedBmi = parseFloat(bmi.toFixed(1));
            const category = getBmiCategory(roundedBmi);

            const minHealthyWeight = parseFloat((18.5 * heightSquared).toFixed(1));
            const maxHealthyWeight = parseFloat((24.9 * heightSquared).toFixed(1));
            let advice = "";

            if (category === "Thiếu cân") {
                const weightToGain = parseFloat((minHealthyWeight - weight).toFixed(1));
                advice = `Bạn cần tăng ít nhất ${weightToGain} kg để đạt mức cân nặng khỏe mạnh (từ ${minHealthyWeight} kg đến ${maxHealthyWeight} kg).`;
            } else if (category === "Thừa cân" || category === "Béo phì") {
                const weightToLose = parseFloat((weight - maxHealthyWeight).toFixed(1));
                advice = `Bạn cần giảm ít nhất ${weightToLose} kg để đạt mức cân nặng khỏe mạnh (từ ${minHealthyWeight} kg đến ${maxHealthyWeight} kg).`;
            } else {
                advice = `Bạn đang có mức cân nặng lý tưởng (${minHealthyWeight} kg - ${maxHealthyWeight} kg). Hãy tiếp tục duy trì!`;
            }

            setBmiResult({
                bmi: roundedBmi,
                category: category,
                advice: advice,
            });
        }
    };

    // Macro Calculator
    const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setMacroInput({
            ...macroInput,
            [e.target.name]: e.target.value
        });
    };
    const handleCalculateMacros = (e: React.FormEvent) => {
        e.preventDefault();
        const { calories, goal, ratio } = macroInput;
        let targetCalories = parseFloat(calories.toString());
        if (goal === 'lose') targetCalories -= 500;
        if (goal === 'gain') targetCalories += 500;
        targetCalories = Math.round(targetCalories);
        let pRatio = 0.3, cRatio = 0.4, fRatio = 0.3; 
        if (ratio === 'lowcarb') {
            pRatio = 0.4; cRatio = 0.2; fRatio = 0.4;
        } else if (ratio === 'highprotein') {
            pRatio = 0.4; cRatio = 0.3; fRatio = 0.3;
        }
        const protein = Math.round((targetCalories * pRatio) / 4); 
        const carbs = Math.round((targetCalories * cRatio) / 4); 
        const fat = Math.round((targetCalories * fRatio) / 9); 
        setMacroResult({ protein, carbs, fat, targetCalories });
    };

    // --- RENDER PHỤ ---

    // InfoCard (Đã sửa lỗi hiển thị màu)
    // InfoCard (Đã sửa lỗi VẪN GIỮ GRADIENT + Thêm hiệu ứng hover)
    // InfoCard (Đã sửa - Dùng gradient "MỜ NHẸ" sang tông nhạt hơn)
    const InfoCard = ({ title, value, unit, color }: { title: string, value: number, unit: string, color: string }) => {
        
        // Hàm này trả về các class ĐẦY ĐỦ cho gradient
        const getGradientClasses = (colorName: string): string => {
            switch (colorName) {
                // [SỬA]
                // Thay vì "to-color-600" (đậm), ta dùng "to-color-400" (nhạt hơn)
                // để tạo hiệu ứng "mờ nhẹ" mà vẫn thấy chữ.
                case 'orange': return 'from-orange-500 to-orange-200';
                case 'blue': return 'from-blue-500 to-blue-200';
                case 'green': return 'from-green-500 to-green-200';
                case 'yellow': return 'from-yellow-500 to-yellow-200';
                case 'purple': return 'from-purple-500 to-purple-200';
                case 'cyan': return 'from-cyan-500 to-cyan-200';
                case 'red': return 'from-red-500 to-red-200';
                case 'teal': return 'from-teal-500 to-teal-200';
                default: return 'from-gray-500 to-gray-200';
            }
        };

        return (
            <div 
                className={`
                    bg-gradient-to-r ${getGradientClasses(color)} 
                    p-3 rounded-lg text-center text-gray-800 shadow
                    transition-all duration-300 ease-in-out
                    hover:shadow-lg hover:scale-105
                `}
            >
                <div className="font-semibold text-sm opacity-90">{title}</div>
                <div className="text-2xl font-bold">
                    {value}
                    {/* Chỉ hiển thị đơn vị nếu nó tồn tại */}
                    {unit && (
                        // Dùng text-xl (nhỏ hơn 2xl) và ml-1 (thêm khoảng trắng)
                        <span className="text-xl font-medium ml-1">{unit}</span>
                    )}
                </div>
            </div>
        );
    };

 

    // renderFoodSearch (Cập nhật)
    const renderFoodSearch = () => (
        <div>
            <input 
                className="w-full p-4 border border-gray-300 bg-white text-gray-900 rounded-lg placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg" 
                type="text" 
                placeholder='Nhập tên thực phẩm (VD: thịt gà, cơm, trứng...)'
                value={Query}
                onChange={(e) => setQuery(e.target.value)} 
            />
            {Query.trim() && (
                <div className="mt-6">
                    {list.length > 0 ? (
                        <>
                            {/* [SỬA] Bỏ "(tính cho 100g)" khỏi tiêu đề chung */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                📊 Giá trị dinh dưỡng
                            </h3>
                            {list.map((item, i) => (
                                <div key={i} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    
                                    {/* [SỬA] Căn chỉnh lại tiêu đề món ăn */}
                                    <h4 className="text-2xl font-bold text-gray-800 mb-2 text-center">{item.food_name}</h4>
                                    
                                    {/* [THÊM] Hiển thị đơn vị (unit) lấy từ database */}
                                    <p className="text-center text-gray-600 font-medium text-lg mb-4">(Tính cho {item.unit})</p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ">
                                        <InfoCard title="Calo" value={item.calories} unit="kcal" color="orange" />
                                        <InfoCard title="Protein" value={item.protein_g} unit="g" color="blue" />
                                        <InfoCard title="Carbs" value={item.carbs_g} unit="g" color="green" />
                                        <InfoCard title="Chất béo" value={item.fats_g} unit="g" color="yellow" />
                                        <InfoCard title="Chất xơ" value={item.fiber_g} unit="g" color="purple" />
                                        <InfoCard title="Nước" value={item.water_g} unit="g" color="cyan" />
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                            <p className="text-gray-600">Không tìm thấy thông tin cho "{Query}"</p>
                            
                        </div>
                    )}
                </div>
            )}
        </div>
    );
    
    // renderTDEECalculator (Giữ nguyên)
    const renderTDEECalculator = () => (
        <form onSubmit={handleCalculateTDEE} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tuổi</label>
                    <input type="number" name="age" value={calculatorInput.age} onChange={handleCalculatorChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                    <select name="gender" value={calculatorInput.gender} onChange={handleCalculatorChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md">
                        <option value="1">Nam</option>
                        <option value="0">Nữ</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cân nặng (kg)</label>
                    <input type="number" name="weight" value={calculatorInput.weight} onChange={handleCalculatorChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chiều cao (cm)</label>
                    <input type="number" name="height" value={calculatorInput.height} onChange={handleCalculatorChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md" />
                </div>
            </div>
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Mức độ vận động</label>
                <select name="activity" value={calculatorInput.activity} onChange={handleCalculatorChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md">
                    <option value={1.2}>Ít vận động (làm việc văn phòng)</option>
                    <option value={1.375}>Vận động nhẹ (tập 1-3 ngày/tuần)</option>
                    <option value={1.55}>Vận động vừa (tập 3-5 ngày/tuần)</option>
                    <option value={1.725}>Vận động nặng (tập 6-7 ngày/tuần)</option>
                    <option value={1.9}>Vận động rất nặng (vận động viên)</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-all text-lg">
                Tính toán TDEE
            </button>
            {calculatorResult.tdee > 0 && (
                <div className="mt-6 p-6 bg-teal-50 rounded-lg text-center shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-700">Kết quả của bạn:</h3>
                    <p className="text-gray-600">BMR (Calo nền): <strong className="text-xl text-teal-600">{calculatorResult.bmr}</strong></p>
                    <p className="text-gray-800 text-xl mt-2">
                        Bạn cần khoảng <strong className="text-3xl font-bold text-teal-700">{calculatorResult.tdee}</strong> Calo/ngày để duy trì cân nặng.
                    </p>
                </div>
            )}
        </form>
    );

    // [CẬP NHẬT] Hàm render cho BMI (Đã sửa)
    const renderBmiCalculator = () => (
        <form onSubmit={handleCalculateBmi} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cân nặng (kg)</label>
                    <input type="number" name="weight" value={bmiInput.weight} onChange={handleBmiChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chiều cao (cm)</label>
                    <input type="number" name="height" value={bmiInput.height} onChange={handleBmiChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md" />
                </div>
            </div>
            <button type="submit" className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-all text-lg">
                Tính toán BMI
            </button>

            {bmiResult.bmi > 0 && (
                <div className="mt-6 p-6 bg-blue-50 rounded-lg text-center shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-700">Kết quả của bạn:</h3>
                    <p className="text-gray-800 text-xl mt-2">
                        Chỉ số BMI của bạn là <strong className="text-3xl font-bold text-blue-700">{bmiResult.bmi}</strong>
                    </p>
                    <p className="text-gray-600 text-lg">
                        Phân loại: <strong className="text-xl text-blue-600">{bmiResult.category}</strong>
                    </p>

                    {/* --- SỬA THANH BMI VÀ SỐ --- */}
                    <div className="mt-6 mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Thanh chỉ số BMI</h4>
                        {/* 1. Sửa tỷ lệ flexBasis cho đúng (14%, 26%, 20%, 40%) */}
                        <div className="relative w-full h-8 rounded-full overflow-hidden flex text-xs text-white font-bold shadow-md">
                            {/* Thang đo từ 15 -> 40 (tổng là 25 đơn vị) */}
                            {/* Thiếu cân (15 -> 18.5) = 3.5 đơn vị = 14% */}
                            <div className="flex-1 bg-blue-400 flex items-center justify-center" style={{flexBasis: '14%'}}>Thiếu cân</div>
                            {/* Bình thường (18.5 -> 25) = 6.5 đơn vị = 26% */}
                            <div className="flex-1 bg-green-500 flex items-center justify-center" style={{flexBasis: '26%'}}>Bình thường</div>
                            {/* Thừa cân (25 -> 30) = 5 đơn vị = 20% */}
                            <div className="flex-1 bg-yellow-400 flex items-center justify-center" style={{flexBasis: '20%'}}>Thừa cân</div>
                            {/* Béo phì (30 -> 40) = 10 đơn vị = 40% */}
                            <div className="flex-1 bg-red-500 flex items-center justify-center" style={{flexBasis: '40%'}}>Béo phì</div>

                            {/* Con trỏ */}
                            <div 
                                className="absolute top-0 h-full w-1.5 bg-gray-800 border-2 border-white rounded-full transition-all duration-500"
                                style={{ 
                                    // Tính vị trí % (Thang đo từ 15 đến 40, tổng là 25)
                                    left: `calc(${Math.min(Math.max((bmiResult.bmi - 15) / 25, 0), 1) * 100}%)`, 
                                    transform: 'translateX(-50%)'
                                }}
                            >
                            </div>
                        </div>
                        {/* 2. Sửa cách hiển thị số cho chính xác */}
                        <div className="relative w-full h-4 text-xs text-gray-600 mt-1">
                            <span className="absolute left-0">15</span>
                            {/* 18.5 = 14% */}
                            <span className="absolute" style={{ left: '14%', transform: 'translateX(-50%)' }}>18.5</span>
                            {/* 25 = 14% + 26% = 40% */}
                            <span className="absolute" style={{ left: '40%', transform: 'translateX(-50%)' }}>25</span>
                            {/* 30 = 40% + 20% = 60% */}
                            <span className="absolute" style={{ left: '60%', transform: 'translateX(-50%)' }}>30</span>
                            <span className="absolute right-0">40</span>
                        </div>
                    </div>
                    {/* --- KẾT THÚC SỬA LỖI --- */}

                    {/* Lời khuyên (Giữ nguyên) */}
                    <div className="mt-6 p-4 bg-white rounded-lg shadow text-left">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Lời khuyên từ VietLife:</h4>
                        <p className="text-gray-700">{bmiResult.advice}</p>
                    </div>

                </div>
            )}
        </form>
    );

    // renderMacroCalculator (Giữ nguyên)
    const renderMacroCalculator = () => (
        <form onSubmit={handleCalculateMacros} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Lượng Calo Mục tiêu (TDEE)</label>
                <input 
                    type="number" 
                    name="calories" 
                    value={macroInput.calories} 
                    onChange={handleMacroChange} 
                    className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md" 
                />
                <p className="text-xs text-gray-500 mt-1">
                    (Tự động lấy từ tab TDEE. Bạn có thể tự điều chỉnh.)
                </p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Mục tiêu của bạn</label>
                <select name="goal" value={macroInput.goal} onChange={handleMacroChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md">
                    <option value="lose">Giảm cân (Thâm hụt ~500 Calo)</option>
                    <option value="maintain">Duy trì cân nặng</option>
                    <option value="gain">Tăng cân (Dư thừa ~500 Calo)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tỷ lệ Macros</label>
                <select name="ratio" value={macroInput.ratio} onChange={handleMacroChange} className="mt-1 block w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-md">
                    <option value="balanced">Cân bằng (Carb 40%, Protein 30%, Fat 30%)</option>
                    <option value="lowcarb">Low Carb (Carb 20%, Protein 40%, Fat 40%)</option>
                    <option value="highprotein">Giàu Protein (Carb 30%, Protein 40%, Fat 30%)</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-all text-lg">
                Tính toán Macros
            </button>

            {macroResult.targetCalories > 0 && (
                <div className="mt-6 p-6 bg-green-50 rounded-lg shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">Kết quả Macros của bạn:</h3>
                    <p className="text-gray-800 text-2xl text-center mb-4">
                        Mục tiêu: <strong className="text-3xl font-bold text-green-700">{macroResult.targetCalories} Calo/ngày</strong>
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <InfoCard title="Protein" value={macroResult.protein} unit="g" color="blue" />
                        <InfoCard title="Carbs" value={macroResult.carbs} unit="g" color="green" />
                        <InfoCard title="Chất béo" value={macroResult.fat} unit="g" color="yellow" />
                    </div>
                </div>
            )}
        </form>
    );

    // Biến giải thích (Giữ nguyên)
    let toolDescription;
    switch (activeToolTab) {
        case 'search':
            toolDescription = (
                <p className="text-gray-700">
                    Dùng công cụ này để tra cứu nhanh calo và thành phần (protein, carb, fat) của các loại thực phẩm phổ biến, đặc biệt là các món ăn Việt Nam.
                </p>
            );
            break;
        case 'tdee':
            toolDescription = (
                <p className="text-gray-700">
                    <strong>TDEE</strong> (Tổng năng lượng tiêu thụ hàng ngày) là tổng số calo cơ thể bạn đốt cháy trong một ngày. Đây là con số quan trọng nhất để biết bạn nên ăn bao nhiêu calo để <strong>Giảm cân</strong>, <strong>Giữ cân</strong>, hoặc <strong>Tăng cân</strong>.
                </p>
            );
            break;
        case 'bmi':
            toolDescription = (
                <p className="text-gray-700">
                    <strong>BMI</strong> (Chỉ số khối cơ thể) là chỉ số cơ bản để đánh giá xem bạn đang ở mức <strong>Thiếu cân</strong>, <strong>Bình thường</strong>, <strong>Thừa cân</strong> hay <strong>Béo phì</strong>. 
                    <br />
                    <em className="text-sm text-gray-600">*Lưu ý: Chỉ số này không phân biệt được giữa cơ và mỡ.</em>
                </p>
            );
            break;
        case 'macros':
            toolDescription = (
                <p className="text-gray-700">
                    <strong>Macros</strong> (Chất đa lượng) là Protein, Carb và Fat. Sau khi có TDEE, công cụ này giúp bạn tính toán *chính xác* nên ăn bao nhiêu <strong>gram</strong> mỗi chất để đạt được mục tiêu của mình.
                </p>
            );
            break;
        default:
            toolDescription = null;
    }

    const renderActiveTool = () => {
        switch (activeToolTab) {
            case 'search': return renderFoodSearch();
            case 'tdee': return renderTDEECalculator();
            case 'bmi': return renderBmiCalculator();
            case 'macros': return renderMacroCalculator();
            default: return renderFoodSearch();
        }
    }

    // --- RENDER CHÍNH CỦA COMPONENT (Giữ nguyên) ---
    return (
        <div className="bg-white min-h-screen text-gray-900 py-10 md:py-16">
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Công cụ Dinh dưỡng</h2>
                            <p className="text-xl text-gray-600">Tra cứu, tính toán TDEE, BMI và Macros của bạn.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-center mb-8 bg-gray-200 rounded-lg p-2">
                            <button
                                onClick={() => setActiveToolTab('search')}
                                className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-lg font-bold text-sm sm:text-lg flex items-center justify-center transition-all ${
                                    activeToolTab === 'search' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <FaSearch className="mr-2" /> 🥦 Tra cứu
                            </button>
                            <button
                                onClick={() => setActiveToolTab('tdee')}
                                className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-lg font-bold text-sm sm:text-lg flex items-center justify-center transition-all ${
                                    activeToolTab === 'tdee' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <FaCalculator className="mr-2" /> 🧮 TDEE
                            </button>
                            <button
                                onClick={() => setActiveToolTab('bmi')}
                                className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-lg font-bold text-sm sm:text-lg flex items-center justify-center transition-all ${
                                    activeToolTab === 'bmi' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <FaBalanceScale className="mr-2" /> ⚖️ BMI
                            </button>
                            <button
                                onClick={() => setActiveToolTab('macros')}
                                className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-lg font-bold text-sm sm:text-lg flex items-center justify-center transition-all ${
                                    activeToolTab === 'macros' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <FaChartPie className="mr-2" /> 📊 Macros
                            </button>
                        </div>

                        <div className="mb-8 p-4 bg-gray-100 rounded-lg shadow-inner">
                            <div className="flex items-start space-x-3">
                                <FaInfoCircle className="flex-shrink-0 w-5 h-5 text-teal-500 mt-0.5" />
                                <div className="flex-1 text-sm">
                                    {toolDescription}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            {renderActiveTool()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NutritionTools;