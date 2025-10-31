// frontend/src/components/nutrition/NutritionTools.tsx

import React, { useState, useEffect } from 'react'
import useDebounce from "../../hook/useDebounce" // Cập nhật đường dẫn
import { FaSearch, FaCalculator } from 'react-icons/fa'

// Interface riêng cho component này
interface searchList {
    id: number;
    food_name: string;
    calories: number;
    water_g: number;
    protein_g: number;
    fats_g: number;
    carbs_g: number;
    fiber_g: number;
}

function NutritionTools() {
    // --- STATE CHO CÔNG CỤ ---
    const [Query, setQuery] = useState("");
    const [list, setList] = useState<searchList[]>([]);
    const searchResults = useDebounce(Query, 1000)
    const [activeToolTab, setActiveToolTab] = useState<'search' | 'calculator'>('search');
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

    // --- LOGIC CHO CÔNG CỤ ---

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

    // Calculator
    const handleCalculatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCalculatorInput({
            ...calculatorInput,
            [e.target.name]: parseFloat(e.target.value)
        });
    };

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const { age, gender, weight, height, activity } = calculatorInput;
        let bmr = 0;
        
        if (gender === 1) { // Nam
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else { // Nữ
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        const tdee = bmr * activity;
        
        setCalculatorResult({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
        });
    };

    // --- RENDER PHỤ ---

    const InfoCard = ({ title, value, unit, color }: { title: string, value: number, unit: string, color: string }) => (
        <div className={`bg-gradient-to-r from-${color}-500 to-${color}-600 p-3 rounded-lg text-center text-white shadow`}>
            <div className="font-semibold text-sm opacity-90">{title}</div>
            <div className="text-2xl font-bold">{value}{unit}</div>
        </div>
    );

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
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                📊 Giá trị dinh dưỡng (tính cho 100g)
                            </h3>
                            {list.map((item, i) => (
                                <div key={i} className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                                    <h4 className="text-2xl font-bold text-gray-800 mb-4 text-center">{item.food_name}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <InfoCard title="Calo" value={item.calories} unit="" color="red" />
                                        <InfoCard title="Protein" value={item.protein_g} unit="g" color="blue" />
                                        <InfoCard title="Carbs" value={item.carbs_g} unit="g" color="green" />
                                        <InfoCard title="Chất béo" value={item.fats_g} unit="g" color="yellow" />
                                        <InfoCard title="Chất xơ" value={item.fiber_g} unit="g" color="teal" />
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

    const renderCalculator = () => (
        <form onSubmit={handleCalculate} className="space-y-4">
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
                Tính toán
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


    // --- RENDER CHÍNH CỦA COMPONENT ---
    return (
        <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-center mb-8 bg-gray-200 rounded-lg p-2">
                        <button
                            onClick={() => setActiveToolTab('search')}
                            className={`w-1/2 py-3 px-4 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${
                                activeToolTab === 'search' 
                                    ? 'bg-teal-500 text-white shadow' 
                                    : 'text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            <FaSearch className="mr-2" /> 🥦 Tra cứu Calo
                        </button>
                        <button
                            onClick={() => setActiveToolTab('calculator')}
                            className={`w-1/2 py-3 px-4 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${
                                activeToolTab === 'calculator' 
                                    ? 'bg-teal-500 text-white shadow' 
                                    : 'text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            <FaCalculator className="mr-2" /> 🧮 Tính TDEE
                        </button>
                    </div>
                    
                    <div>
                        {activeToolTab === 'search' ? renderFoodSearch() : renderCalculator()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NutritionTools;