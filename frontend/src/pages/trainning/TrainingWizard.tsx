import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Định nghĩa các bước câu hỏi
const questions = [
    {
        id: 1,
        question: "Kinh nghiệm tập luyện của bạn?",
        options: [
            { value: 'beginner', label: '🌱 Chưa bao giờ / Mới tập', desc: 'Tôi chưa nắm rõ kỹ thuật' },
            { value: 'intermediate', label: '🌿 Đã tập 6 tháng - 1 năm', desc: 'Tôi đã biết các bài cơ bản' },
            { value: 'advanced', label: '🌳 Trên 1 năm', desc: 'Tôi muốn thử thách cao độ' },
        ]
    },
    {
        id: 2,
        question: "Mục tiêu chính của bạn hiện tại là gì?",
        options: [
            { value: 'muscle', label: '💪 Tăng cơ bắp', desc: 'Muốn body săn chắc, vạm vỡ' },
            { value: 'fat_loss', label: '🔥 Giảm mỡ thừa', desc: 'Muốn thon gọn, lộ múi bụng' },
            { value: 'sport', label: '⚽ Bổ trợ thể thao', desc: 'Đá bóng, cầu lông, chạy bộ...' },
            { value: 'health', label: '❤️ Sống khỏe / Hết đau mỏi', desc: 'Dân văn phòng, muốn vận động' },
        ]
    },
    {
        id: 3,
        question: "Bạn có thể tập bao nhiêu buổi/tuần?",
        options: [
            { value: 'low', label: '2 - 3 buổi', desc: 'Tôi khá bận rộn' },
            { value: 'high', label: '4 - 6 buổi', desc: 'Tôi có nhiều thời gian' },
        ]
    }
];

const TrainingWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Xử lý khi chọn đáp án
    const handleSelect = (value: string) => {
        const currentAnswers = { ...answers, [step]: value };
        setAnswers(currentAnswers);

        if (step < questions.length - 1) {
            // Chuyển câu tiếp theo
            setStep(step + 1);
        } else {
            // Hết câu hỏi -> Phân tích kết quả
            analyzeResult(currentAnswers);
        }
    };

    // LOGIC "AI" PHÂN TÍCH (Mapping đáp án sang ID Giáo án trong Database)
    const analyzeResult = (finalAnswers: any) => {
        setIsAnalyzing(true);
        
        // Giả lập thời gian tính toán cho "ngầu"
        setTimeout(() => {
            const exp = finalAnswers[0];  // beginner / inter / adv
            const goal = finalAnswers[1]; // muscle / fat / sport / health
            const freq = finalAnswers[2]; // low / high

            let recommendation = {
                type: 'plan', // hoặc 'sport'
                title: '',
                desc: '',
                link: ''
            };

            // --- LOGIC QUYẾT ĐỊNH ---
            
            // 1. Nếu chọn Thể thao -> Đẩy sang trang Sports
            if (goal === 'sport') {
                recommendation = {
                    type: 'sport',
                    title: 'Tập Luyện Bổ Trợ Thể Thao',
                    desc: 'Dựa trên mục tiêu của bạn, các giáo án Gym thông thường sẽ không tối ưu bằng các bài tập chuyên biệt cho từng môn.',
                    link: '/training/sports'
                };
            }
            // 2. Nếu chọn Giảm mỡ hoặc Sống khỏe (Beginner) -> Giáo án 4 (Cardio & Core)
            else if (goal === 'fat_loss' || (goal === 'health' && exp === 'beginner')) {
                recommendation = {
                    type: 'plan',
                    title: 'Giáo án: Cardio & Core Đốt Mỡ',
                    desc: 'Lộ trình tập trung vào tiêu hao năng lượng và làm săn chắc vùng bụng. Phù hợp để bắt đầu hành trình giảm cân.',
                    link: '/training/plans/4' // ID 4 trong DB của bạn
                };
            }
            // 3. Nếu là Advanced -> Giáo án 3 (PPL)
            else if (exp === 'advanced') {
                recommendation = {
                    type: 'plan',
                    title: 'Giáo án: Push / Pull / Legs Pro',
                    desc: 'Cường độ cao, 6 buổi/tuần. Đây là giáo án tối ưu nhất để xây dựng hình thể của một vận động viên.',
                    link: '/training/plans/3' // ID 3
                };
            }
            // 4. Nếu là Intermediate (hoặc Beginner muốn Tăng cơ) & Tập nhiều -> Giáo án 2 (Upper/Lower)
            else if (freq === 'high' || exp === 'intermediate') {
                recommendation = {
                    type: 'plan',
                    title: 'Giáo án: Upper / Lower Split',
                    desc: 'Chia lịch tập thân trên/dưới giúp tối ưu hóa khả năng hồi phục và tăng cơ bắp hiệu quả.',
                    link: '/training/plans/2' // ID 2
                };
            }
            // 5. Mặc định còn lại (Beginner ít thời gian) -> Giáo án 1 (Full Body)
            else {
                recommendation = {
                    type: 'plan',
                    title: 'Giáo án: Full Body Foundation',
                    desc: 'Xây dựng nền tảng sức mạnh toàn thân. Mỗi buổi tập đều tác động vào tất cả nhóm cơ chính.',
                    link: '/training/plans/1' // ID 1
                };
            }

            setIsAnalyzing(false);
            setResult(recommendation);
        }, 2000); // Đợi 2s cho hồi hộp
    };

    // --- MÀN HÌNH CHỜ (LOADING) ---
    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-teal-600 flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-6"></div>
                <h2 className="text-2xl font-bold animate-pulse">VietLife AI đang phân tích...</h2>
                <p className="text-teal-200 mt-2">Đang tìm lộ trình phù hợp nhất với cơ thể bạn</p>
            </div>
        );
    }

    // --- MÀN HÌNH KẾT QUẢ ---
    if (result) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-teal-500 animate-fade-in-up text-center">
                    <div className="bg-teal-600 p-8 text-white">
                        <div className="text-5xl mb-4">🎉</div>
                        <h1 className="text-3xl font-extrabold mb-2">Tìm thấy rồi!</h1>
                        <p className="opacity-90">Đây là lộ trình dành riêng cho bạn</p>
                    </div>
                    
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-teal-700 mb-3">{result.title}</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {result.desc}
                        </p>

                        <div className="space-y-4">
                            <Link 
                                to={result.link}
                                className="block w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1"
                            >
                                BẮT ĐẦU NGAY →
                            </Link>
                            
                            <button 
                                onClick={() => { setResult(null); setStep(0); }}
                                className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                            >
                                Làm lại bài trắc nghiệm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- MÀN HÌNH CÂU HỎI (WIZARD) ---
    const currentQ = questions[step];
    const progress = ((step) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-teal-500 transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="text-right text-xs text-gray-400 mt-2 font-bold">
                        BƯỚC {step + 1} / {questions.length}
                    </div>
                </div>

                {/* Question Card */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 transition-all">
                        {currentQ.question}
                    </h1>
                    <p className="text-gray-500">Hãy chọn đáp án đúng nhất với bạn</p>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {currentQ.options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            className="group bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-teal-500 hover:shadow-xl transition-all duration-200 text-left flex items-center justify-between"
                        >
                            <div>
                                <span className="block text-lg font-bold text-gray-800 group-hover:text-teal-700">
                                    {opt.label}
                                </span>
                                <span className="text-sm text-gray-500 group-hover:text-teal-600">
                                    {opt.desc}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-teal-100 flex items-center justify-center text-gray-400 group-hover:text-teal-600">
                                ➔
                            </div>
                        </button>
                    ))}
                </div>

                {/* Back Button */}
                {step > 0 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="mt-8 text-gray-400 hover:text-gray-600 font-medium flex items-center justify-center w-full"
                    >
                        ← Quay lại câu trước
                    </button>
                )}
            </div>
        </div>
    );
};

export default TrainingWizard;