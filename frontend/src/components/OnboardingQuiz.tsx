import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ để chuyển trang

interface Question {
  id: number;
  title: string;
  options: string[];
}

const questions: Question[] = [
  { id: 1, title: "Giới tính của bạn là gì?", options: ["Nam", "Nữ", "Khác"] },
  { id: 2, title: "Mục tiêu tập luyện của bạn là gì?", options: ["Giảm cân", "Tăng cơ", "Giữ dáng", "Cải thiện sức khỏe"] },
  { id: 3, title: "Bạn tập bao nhiêu buổi mỗi tuần?", options: ["1-2 buổi", "3-4 buổi", "5-6 buổi", "Hằng ngày"] },
  { id: 4, title: "Bạn có bao nhiêu thời gian mỗi buổi tập?", options: ["<30 phút", "30-45 phút", "45-60 phút", ">1 giờ"] },
  { id: 5, title: "Mức kinh nghiệm của bạn với tập luyện là gì?", options: ["Mới bắt đầu", "Trung bình", "Nâng cao"] },
];

const OnboardingQuiz: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const navigate = useNavigate();

  const currentQuestion = questions[step];
  const totalSteps = questions.length;

  // ✅ Khi vào trang, kiểm tra xem quiz đã hoàn thành chưa
  useEffect(() => {
    const completed = localStorage.getItem("quizCompleted");
    if (completed === "true") {
      navigate("/"); // hoặc bất kỳ trang nào bạn muốn chuyển tới
    }
  }, [navigate]);

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    localStorage.setItem("quizCompleted", "true");
    localStorage.setItem("quizAnswers", JSON.stringify(answers)); // lưu luôn kết quả
    navigate("/"); // ✅ chuyển sang trang kế tiếp
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598971639058-5e1b7a0a6a1a?auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-20"></div>

      <div className="relative z-10 w-full max-w-lg p-6 md:p-10 bg-gray-900/70 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-700">
        {/* Progress */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
          <motion.div
            className="bg-green-500 h-2"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-sm text-gray-400 text-center mb-2">
          Câu hỏi {step + 1}/{totalSteps}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">
              {currentQuestion.title}
            </h2>

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full py-3 rounded-xl border text-lg transition-all duration-200 ${
                    answers[currentQuestion.id] === opt
                      ? "bg-green-600 border-green-600"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`px-4 py-2 rounded-xl border border-gray-600 hover:bg-gray-700 transition ${
              step === 0 ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            Quay lại
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className={`px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition font-medium ${
                !answers[currentQuestion.id]
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Tiếp tục
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!answers[currentQuestion.id]}
              className={`px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition font-medium ${
                !answers[currentQuestion.id]
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;
