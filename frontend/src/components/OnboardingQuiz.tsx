import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Dumbbell } from "lucide-react";

interface Question {
  id: number;
  title: string;
  subtitle?: string;
  options: Array<{
    value: string;
    icon?: string;
    description?: string;
  }>;
  type?: "single" | "grid" | "input" | "slider";
  inputType?: "number" | "text";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

const questions: Question[] = [
  {
    id: 1,
    title: "Giới tính của bạn là gì?",
    subtitle: "Chúng tôi sẽ tùy chỉnh chương trình phù hợp với bạn",
    options: [
      { value: "Nam", icon: "👨" },
      { value: "Nữ", icon: "👩" },
      { value: "Khác", icon: "🙂" },
    ],
  },
  {
    id: 2,
    title: "Bạn bao nhiêu tuổi?",
    subtitle: "Tuổi giúp chúng tôi điều chỉnh cường độ tập luyện phù hợp",
    type: "input",
    inputType: "number",
    unit: "tuổi",
    options: [],
  },
  {
    id: 3,
    title: "Chiều cao của bạn?",
    subtitle: "Thông tin này giúp tính chỉ số BMI và đánh giá thể trạng",
    type: "slider",
    inputType: "number",
    unit: "cm",
    min: 100,
    max: 250,
    step: 1,
    options: [],
  },
  {
    id: 4,
    title: "Cân nặng hiện tại của bạn?",
    subtitle: "Để theo dõi tiến trình và đề xuất dinh dưỡng phù hợp",
    type: "slider",
    inputType: "number",
    unit: "kg",
    min: 30,
    max: 200,
    step: 0.5,
    options: [],
  },
  {
    id: 5,
    title: "Cân nặng mục tiêu của bạn?",
    subtitle: "Chúng tôi sẽ giúp bạn đạt được mục tiêu một cách an toàn",
    type: "slider",
    inputType: "number",
    unit: "kg",
    min: 30,
    max: 200,
    step: 0.5,
    options: [],
  },
  {
    id: 6,
    title: "Vóc dáng cơ thể của bạn?",
    subtitle: "Giúp chúng tôi hiểu kiểu cơ thể để tối ưu chương trình",
    options: [
      { value: "Gầy (Ectomorph)", icon: "🏃", description: "Khó tăng cân" },
      { value: "Cân đối (Mesomorph)", icon: "💪", description: "Dễ tăng cơ" },
      { value: "Mập (Endomorph)", icon: "🧍", description: "Dễ tăng cân" },
      { value: "Không chắc", icon: "🤔", description: "Chưa xác định" },
    ],
    type: "grid",
  },
  {
    id: 7,
    title: "Mục tiêu tập luyện chính của bạn?",
    subtitle: "Chọn mục tiêu quan trọng nhất với bạn",
    options: [
      { value: "Giảm cân", icon: "🎯", description: "Đốt mỡ hiệu quả" },
      { value: "Tăng cơ", icon: "💪", description: "Xây dựng cơ bắp" },
      { value: "Giữ dáng", icon: "⚖️", description: "Duy trì vóc dáng" },
      { value: "Tăng sức bền", icon: "🏃‍♂️", description: "Cải thiện thể lực" },
      { value: "Linh hoạt", icon: "🧘", description: "Yoga & stretching" },
      { value: "Sức khỏe tổng thể", icon: "❤️", description: "Nâng cao sức khỏe" },
    ],
    type: "grid",
  },
  {
    id: 8,
    title: "Khu vực cơ thể bạn muốn tập trung?",
    subtitle: "Có thể chọn nhiều khu vực (chọn 1 để tiếp tục)",
    options: [
      { value: "Bụng", icon: "🔥", description: "Six pack" },
      { value: "Ngực", icon: "💪", description: "Ngực rắn chắc" },
      { value: "Vai & Lưng", icon: "🦾", description: "Upper body" },
      { value: "Tay", icon: "💪", description: "Cơ tay săn chắc" },
      { value: "Mông & Đùi", icon: "🍑", description: "Lower body" },
      { value: "Toàn thân", icon: "🔥", description: "Cân đối toàn thân" },
    ],
    type: "grid",
  },
  {
    id: 9,
    title: "Mức độ hoạt động hiện tại?",
    subtitle: "Mức độ vận động hằng ngày của bạn như thế nào?",
    options: [
      { value: "Ít vận động", icon: "🪑", description: "Ngồi nhiều, ít di chuyển" },
      { value: "Nhẹ nhàng", icon: "🚶", description: "Đi bộ, vận động nhẹ" },
      { value: "Trung bình", icon: "🚴", description: "Tập 3-4 lần/tuần" },
      { value: "Tích cực", icon: "🏃", description: "Tập 5-6 lần/tuần" },
      { value: "Rất tích cực", icon: "🏋️", description: "Vận động viên" },
    ],
  },
  {
    id: 10,
    title: "Kinh nghiệm tập luyện?",
    subtitle: "Để chúng tôi điều chỉnh độ khó phù hợp",
    options: [
      { value: "Mới bắt đầu", icon: "🌱", description: "Chưa từng tập" },
      { value: "Sơ cấp", icon: "📈", description: "Tập dưới 6 tháng" },
      { value: "Trung cấp", icon: "🔥", description: "Tập 6-12 tháng" },
      { value: "Nâng cao", icon: "⚡", description: "Hơn 1 năm" },
      { value: "Chuyên nghiệp", icon: "🏆", description: "Nhiều năm kinh nghiệm" },
    ],
  },
  {
    id: 11,
    title: "Bạn tập ở đâu?",
    subtitle: "Chúng tôi sẽ đề xuất bài tập phù hợp với điều kiện",
    options: [
      { value: "Tại nhà", icon: "🏠", description: "Không cần dụng cụ" },
      { value: "Nhà + Dụng cụ cơ bản", icon: "🎯", description: "Tạ, dây kháng lực" },
      { value: "Phòng gym", icon: "🏋️", description: "Đầy đủ thiết bị" },
      { value: "Ngoài trời", icon: "🌳", description: "Công viên, sân chơi" },
    ],
  },
  {
    id: 12,
    title: "Thời gian tập mỗi buổi?",
    subtitle: "Chúng tôi sẽ thiết kế bài tập phù hợp với lịch trình",
    options: [
      { value: "15-20 phút", icon: "⚡", description: "Ngắn gọn, hiệu quả" },
      { value: "20-30 phút", icon: "⏱️", description: "Vừa phải" },
      { value: "30-45 phút", icon: "🕐", description: "Đầy đủ" },
      { value: "45-60 phút", icon: "⏰", description: "Chuyên sâu" },
      { value: ">1 giờ", icon: "💪", description: "Tập chuyên nghiệp" },
    ],
  },
  {
    id: 13,
    title: "Số buổi tập mỗi tuần?",
    subtitle: "Điều này giúp chúng tôi đánh giá mức độ cam kết",
    options: [
      { value: "1-2 buổi", icon: "📅", description: "Mới bắt đầu" },
      { value: "3-4 buổi", icon: "📆", description: "Đều đặn" },
      { value: "5-6 buổi", icon: "🔥", description: "Tích cực" },
      { value: "Hằng ngày", icon: "💯", description: "Cam kết cao" },
    ],
  },
  {
    id: 14,
    title: "Thời điểm tập luyện yêu thích?",
    subtitle: "Để gửi thông báo nhắc nhở đúng lúc",
    options: [
      { value: "Sáng sớm (5-8h)", icon: "🌅", description: "Khởi động ngày mới" },
      { value: "Buổi sáng (8-12h)", icon: "☀️", description: "Sau bữa sáng" },
      { value: "Buổi trưa (12-15h)", icon: "🌤️", description: "Giờ nghỉ trưa" },
      { value: "Chiều tối (15-19h)", icon: "🌆", description: "Sau giờ làm" },
      { value: "Tối muộn (19-23h)", icon: "🌙", description: "Trước khi ngủ" },
    ],
  },
  {
    id: 15,
    title: "Bạn có vấn đề sức khỏe nào không?",
    subtitle: "Để đảm bảo an toàn khi tập luyện",
    options: [
      { value: "Không có", icon: "✅", description: "Sức khỏe tốt" },
      { value: "Đau lưng/Cột sống", icon: "🦴", description: "Cần bài tập phù hợp" },
      { value: "Đau khớp", icon: "🦵", description: "Tránh tác động mạnh" },
      { value: "Tim mạch", icon: "❤️", description: "Cần giám sát" },
      { value: "Khác", icon: "🏥", description: "Vấn đề khác" },
    ],
  },
  {
    id: 16,
    title: "Thói quen ăn uống hiện tại?",
    subtitle: "Dinh dưỡng đóng 70% vai trò trong thành công",
    options: [
      { value: "Ăn thoải mái", icon: "🍔", description: "Chưa kiểm soát" },
      { value: "Ăn lành mạnh", icon: "🥗", description: "Chú ý dinh dưỡng" },
      { value: "Theo chế độ", icon: "📋", description: "Có kế hoạch cụ thể" },
      { value: "Chay/Thuần chay", icon: "🥬", description: "Không ăn thịt" },
    ],
  },
  {
    id: 17,
    title: "Động lực chính của bạn?",
    subtitle: "Điều gì thúc đẩy bạn muốn thay đổi?",
    options: [
      { value: "Tự tin hơn", icon: "✨", description: "Yêu bản thân" },
      { value: "Sức khỏe", icon: "❤️", description: "Sống lâu hơn" },
      { value: "Ngoại hình", icon: "💪", description: "Đẹp hơn" },
      { value: "Thể thao", icon: "🏃", description: "Hiệu suất cao hơn" },
      { value: "Y tế", icon: "🏥", description: "Theo chỉ định bác sĩ" },
    ],
  },
];

const OnboardingQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [inputValue, setInputValue] = useState(""); // Snapped value
  const [displayValue, setDisplayValue] = useState(""); // Unsnapped for typing
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[step];
  const totalSteps = questions.length;
  const progress = ((step + 1) / totalSteps) * 100;

  useEffect(() => {
    const completed = window.localStorage?.getItem("quizCompleted");
    if (completed === "true") {
      setIsCompleted(true);
    }
  }, []);

  useEffect(() => {
    // Load existing answer for input/slider fields
    if ((currentQuestion.type === "input" || currentQuestion.type === "slider") && answers[currentQuestion.id]) {
      const loadedValue = answers[currentQuestion.id];
      setInputValue(loadedValue);
      setDisplayValue(loadedValue);
    } else {
      setInputValue("");
      setDisplayValue("");
    }
  }, [step, currentQuestion.id, currentQuestion.type, answers]);

  const snapToStep = (val: number): string => {
    if (currentQuestion.type !== "slider" || currentQuestion.min === undefined || currentQuestion.max === undefined || currentQuestion.step === undefined) {
      return val.toString();
    }
    let clamped = Math.max(currentQuestion.min, Math.min(currentQuestion.max, val));
    clamped = Math.round(clamped / currentQuestion.step) * currentQuestion.step;
    const fixedDigits = currentQuestion.step === 1 ? 0 : 1;
    return clamped.toFixed(fixedDigits);
  };

  const getSnappedValue = (): string => {
    if (!displayValue.trim()) return "";
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue)) return "";
    return snapToStep(numValue);
  };

  const handleDisplayChange = (value: string) => {
    setDisplayValue(value);
  };

  const handleInputBlur = () => {
    const snapped = getSnappedValue();
    setDisplayValue(snapped);
    setInputValue(snapped);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    const snapped = snapToStep(newVal);
    setInputValue(snapped);
    setDisplayValue(snapped);
  };

  const handleSubmit = () => {
    const finalVal = getSnappedValue();
    if (finalVal.trim()) {
      const newAnswers = { ...answers, [currentQuestion.id]: finalVal };
      setAnswers(newAnswers);
      
      setTimeout(() => {
        if (step < totalSteps - 1) {
          setStep(step + 1);
        }
      }, 200);
    }
  };

  const handleSelect = (option: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);

    // Auto advance after selection
    setTimeout(() => {
      if (step < totalSteps - 1) {
        setStep(step + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    if (window.localStorage) {
      window.localStorage.setItem("quizCompleted", "true");
      window.localStorage.setItem("quizAnswers", JSON.stringify(answers));
    }
    setIsCompleted(true);
  };

  // Calculate real-time BMI for weight question (id 4) using displayValue for preview
  const getRealTimeBMI = () => {
    if (currentQuestion.id !== 4 || !displayValue.trim()) return null;
    const heightCm = parseFloat(answers[3]);
    if (!heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    const weight = parseFloat(displayValue);
    if (!weight || weight <= 0) return null;
    return (weight / (heightM * heightM)).toFixed(1);
  };

  const bmi = getRealTimeBMI();
  const bmiStatus = bmi ? parseFloat(bmi) : 0;
  let bmiMessage = "";
  let bmiColor = "";
  if (bmiStatus < 18.5) {
    bmiMessage = "Thiếu cân - Cần tăng cân lành mạnh";
    bmiColor = "text-yellow-400";
  } else if (bmiStatus < 25) {
    bmiMessage = "Cân nặng lý tưởng - Hãy duy trì!";
    bmiColor = "text-green-400";
  } else if (bmiStatus < 30) {
    bmiMessage = "Thừa cân - Nên giảm cân nhẹ";
    bmiColor = "text-orange-400";
  } else {
    bmiMessage = "Béo phì - Cần chương trình giảm cân";
    bmiColor = "text-red-400";
  }

  const currentSliderValue = parseFloat(inputValue || currentQuestion.min?.toString() || "0");

  if (isCompleted) {
    // Calculate BMI if height and weight are provided
    const height = parseFloat(answers[3]) / 100; // convert cm to m
    const weight = parseFloat(answers[4]);
    const bmiValue = height && weight ? (weight / (height * height)).toFixed(1) : null;
    const bmiStatusFinal = bmiValue ? parseFloat(bmiValue) : 0;
    let bmiMessageFinal = "";
    let bmiColorFinal = "";
    if (bmiStatusFinal < 18.5) {
      bmiMessageFinal = "Thiếu cân - Cần tăng cân lành mạnh";
      bmiColorFinal = "text-yellow-400";
    } else if (bmiStatusFinal < 25) {
      bmiMessageFinal = "Cân nặng lý tưởng - Hãy duy trì!";
      bmiColorFinal = "text-green-400";
    } else if (bmiStatusFinal < 30) {
      bmiMessageFinal = "Thừa cân - Nên giảm cân nhẹ";
      bmiColorFinal = "text-orange-400";
    } else {
      bmiMessageFinal = "Béo phì - Cần chương trình giảm cân";
      bmiColorFinal = "text-red-400";
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hoàn tất! 🎉</h1>
          <p className="text-xl text-green-100 mb-8">
            Cảm ơn bạn đã hoàn thành khảo sát. Chúng tôi đang chuẩn bị chương trình phù hợp nhất cho bạn!
          </p>

          {bmiValue && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <h3 className="text-lg font-semibold mb-2">Chỉ số BMI của bạn</h3>
              <div className={`text-5xl font-bold mb-2 ${bmiColorFinal}`}>{bmiValue}</div>
              <p className={`${bmiColorFinal} font-medium`}>
                {bmiMessageFinal}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm text-white/70">Mục tiêu</div>
              <div className="font-semibold">{answers[7] || "Chưa có"}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm text-white/70">Tần suất</div>
              <div className="font-semibold">{answers[13] || "Chưa có"}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm text-white/70">Kinh nghiệm</div>
              <div className="font-semibold">{answers[10] || "Chưa có"}</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.localStorage) {
                window.localStorage.removeItem("quizCompleted");
              }
              setIsCompleted(false);
              setStep(0);
              setAnswers({});
            }}
            className="px-8 py-3 bg-white text-green-900 rounded-full font-semibold hover:bg-green-50 transition mr-4"
          >
            Làm lại khảo sát
          </button>
          <button
            onClick={() => alert("Chức năng xem chương trình đang được phát triển!")}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition"
          >
            Xem chương trình của tôi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all ${
              step === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-white/20"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-green-400" />
            <span className="font-bold text-lg">FitQuiz</span>
          </div>

          <div className="w-20"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 px-4 md:px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/70">Tiến độ</span>
            <span className="text-sm font-semibold text-green-400">
              {step + 1}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-lg text-white/70">
                    {currentQuestion.subtitle}
                  </p>
                )}
              </div>

              {/* Input Type */}
              {currentQuestion.type === "input" && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center gap-4 mb-6">
                      <input
                        type={currentQuestion.inputType}
                        value={displayValue}
                        onChange={(e) => handleDisplayChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        onBlur={handleInputBlur}
                        placeholder="Nhập..."
                        className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 text-2xl font-semibold text-center focus:outline-none focus:border-green-400 transition"
                        autoFocus
                      />
                      {currentQuestion.unit && (
                        <span className="text-2xl font-semibold text-white/70">
                          {currentQuestion.unit}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={!displayValue.trim()}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                        displayValue.trim()
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          : "bg-white/10 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              )}

              {/* Slider Type */}
              {currentQuestion.type === "slider" && (
                <div className="max-w-md mx-auto">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    {/* Manual Input - Emphasized for height and weight */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-white/80 mb-2">
                        Nhập giá trị (hoặc sử dụng thanh trượt bên dưới)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type={currentQuestion.inputType}
                          value={displayValue}
                          onChange={(e) => handleDisplayChange(e.target.value)}
                          step={currentQuestion.step}
                          min={currentQuestion.min}
                          max={currentQuestion.max}
                          onBlur={handleInputBlur}
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                          placeholder={`Nhập ${currentQuestion.unit || ''}...`}
                          className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 text-2xl font-semibold text-center focus:outline-none focus:border-green-400 transition"
                          autoFocus
                        />
                        {currentQuestion.unit && (
                          <span className="text-2xl font-semibold text-white/70">
                            {currentQuestion.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-white/80 mb-2">
                        Hoặc kéo thanh trượt
                      </label>
                      <input
                        type="range"
                        min={currentQuestion.min}
                        max={currentQuestion.max}
                        step={currentQuestion.step}
                        value={currentSliderValue}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${((currentSliderValue - currentQuestion.min!) / (currentQuestion.max! - currentQuestion.min!) * 100)}%, #e5e7eb ${((currentSliderValue - currentQuestion.min!) / (currentQuestion.max! - currentQuestion.min!) * 100)}%, #e5e7eb 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs text-white/50 mt-2">
                        <span>{currentQuestion.min}{currentQuestion.unit ? ` ${currentQuestion.unit}` : ''}</span>
                        <span>{currentQuestion.max}{currentQuestion.unit ? ` ${currentQuestion.unit}` : ''}</span>
                      </div>
                    </div>

                    {/* Real-time BMI for weight question */}
                    {bmi && (
                      <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                        <h4 className="text-sm font-semibold mb-2 text-green-100">Chỉ số BMI (thời gian thực)</h4>
                        <div className="text-3xl font-bold mb-1">{bmi}</div>
                        <p className={`text-sm ${bmiColor}`}>
                          {bmiMessage}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={!displayValue.trim()}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                        displayValue.trim()
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          : "bg-white/10 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              )}

              {/* Options Type */}
              {currentQuestion.type !== "input" && currentQuestion.type !== "slider" && (
                <div
                  className={`
                    ${
                      currentQuestion.type === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                        : "flex flex-col gap-3 max-w-lg mx-auto"
                    }`}
                >
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = answers[currentQuestion.id] === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleSelect(opt.value)}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                          isSelected
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 shadow-lg shadow-green-500/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {opt.icon && (
                            <div className="text-3xl flex-shrink-0">
                              {opt.icon}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-lg mb-1">
                              {opt.value}
                            </div>
                            {opt.description && (
                              <div
                                className={`
                                  text-sm ${
                                    isSelected ? "text-green-50" : "text-white/60"
                                  }`}
                              >
                                {opt.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex-shrink-0"
                            >
                              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-600" />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Finish Button (shown on last question) */}
              {step === totalSteps - 1 && answers[currentQuestion.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={handleFinish}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60"
                  >
                    Xem kết quả của tôi →
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;