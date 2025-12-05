import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import manhKhanhImg from '../images/manhkhanh.png';
import trungBinhImg from '../images/trungbinh.png';
import tichMoImg from '../images/tichmo.png';
import thonGonImg from '../images/thongon.png'; 
import sanChacImg from '../images/sanchac.png';
import coBapImg from '../images/cobap.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

interface IFormData {
  body_type: string;
  goal_body: string;
  priority_areas: string[];
  pushup_count: string;
  workout_location: 'gym' | 'home';
  home_equipment: string[];
  other_sports: string[];
  secondary_goals: string[];
  past_obstacle: string;
  diet_preference: string[];
  allergies: string;
  limitations: string[];
  sleep_hours: string;
  daily_activity_level: string;
  agree_safety: boolean;
}

interface VisualCardProps {
  name: keyof IFormData;
  value: string;
  text: string;
  isSelected: boolean;
  icon?: string;
}

interface CheckboxOptionProps {
  name: 'priority_areas' | 'home_equipment' | 'other_sports' | 'secondary_goals' | 'diet_preference' | 'limitations';
  value: string;
  text: string;
}

interface RadioOptionProps {
  name: keyof IFormData;
  value: string;
  text: string;
  isChecked: boolean;
}

const Plan: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state && location.state.isEditing;
  const [formData, setFormData] = useState<IFormData>({
    body_type: '',
    goal_body: '',
    priority_areas: [],
    pushup_count: '',
    workout_location: 'gym',
    home_equipment: [],
    other_sports: [],
    secondary_goals: [],
    past_obstacle: '',
    diet_preference: [],
    allergies: '',
    limitations: [],
    sleep_hours: '6-8',
    daily_activity_level: 'low',
    agree_safety: false,
  });
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const res = await axios.get('http://localhost:8080/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const profile = res.data.health_profile;

        // LOGIC MỚI:
        // 1. Nếu đã làm onboarding VÀ KHÔNG PHẢI đang edit -> Chuyển hướng (Logic cũ)
        if (profile?.has_onboarding === 1 && !isEditing) {
          toast.info("Bạn đã có lộ trình");
          navigate('/training/ai-plan'); 
          return;
        }

        // 2. Nếu đang Edit HOẶC đã có dữ liệu cũ -> Điền vào Form
        if (profile?.training_preferences) {
            // Merge dữ liệu cũ vào formData
            // Lưu ý: Cần đảm bảo cấu trúc dữ liệu khớp nhau
            setFormData(prev => ({
                ...prev,
                ...profile.training_preferences
            }));
            
            // Nếu đang edit, có thể hiển thị thông báo nhỏ
            if (isEditing) {
                toast.success("Đã tải lại thông tin cũ của bạn.");
            }
        }

        // Tắt loading để hiện form
        setIsLoading(false);

      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái:", error);
        setIsLoading(false); 
      }
    };

    checkOnboardingStatus();
  }, [navigate, isEditing]); // Thêm isEditing vào dependency

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const key = name as keyof IFormData;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;

      if (['priority_areas', 'home_equipment', 'other_sports', 'secondary_goals', 'diet_preference', 'limitations'].includes(name)) {
        setFormData((prev) => {
          const list = prev[key as 'priority_areas' | 'home_equipment' | 'other_sports' | 'secondary_goals' | 'diet_preference' | 'limitations'];
          
          return {
            ...prev,
            [key]: checked
              ? [...list, value]
              : list.filter((item: string) => item !== value),
          };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          agree_safety: checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleCardSelect = (name: keyof IFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!formData.agree_safety) {
      toast.warn("Bạn phải đồng ý với cam kết an toàn để tiếp tục.");
      return;
    }
    
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
        toast.error("Vui lòng đăng nhập để lưu lộ trình!");
        navigate('/signin');
        return;
    }
    
    try {
      // 1. Gọi API lưu dữ liệu vào Database
      await axios.put('http://localhost:8080/api/profile/preferences', formData, {
          headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Đã lưu hồ sơ thành công! Đang chuyển hướng...");

      // 2. Chuyển hướng sang trang Dashboard AI (Để bắt đầu tạo lộ trình)
      setTimeout(() => {
          navigate('/training/ai-plan'); 
      }, 1500);

    } catch (error) {
      console.error('Lỗi khi gửi thông tin:', error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };
  const progress = (step / 10) * 100;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-slate-50 to-white text-gray-900 p-8">
        <div className="mb-8">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-300 border-t-teal-500"></div>
        </div>
        {/* Sửa text loading một chút cho phù hợp ngữ cảnh check data */}
        <h3 className="text-2xl font-semibold text-teal-600 mb-8">Đang kiểm tra dữ liệu...</h3>
      </div>
    );
  }

  // Tìm đoạn VisualCard cũ và thay thế bằng đoạn này:

  const VisualCard: React.FC<VisualCardProps> = ({ name, value, text, isSelected, icon }) => (
    <button
      type="button"
      onClick={() => handleCardSelect(name, value)}
      className={`group relative rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
        isSelected 
          ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/50 text-white' 
          : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-teal-400'
      }`}
    >
      <div className={`w-full aspect-square rounded-lg mb-3 flex items-center justify-center overflow-hidden transition-all ${
        isSelected ? 'bg-teal-400/20' : 'bg-gray-100 group-hover:bg-gray-200'
      }`}>
        {/* Logic mới: Nếu có icon (ảnh) thì hiện ảnh, nếu không thì hiện emoji mặc định */}
        {icon ? (
          <img 
            src={icon} 
            alt={text} 
            className="w-full h-full object-contain p-2 mix-blend-multiply" 
          />
        ) : (
          <span className="text-4xl">
             {/* Giữ lại random emoji cho các card khác không có ảnh */}
             {['💪', '⚖️', '🍔'][Math.random() * 3 | 0]}
          </span>
        )}
      </div>
      <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>{text}</span>
    </button>
  );

  const CheckboxOption: React.FC<CheckboxOptionProps> = ({ name, value, text }) => (
    <label className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition-all group">
      <input
        type="checkbox"
        name={name}
        value={value}
        onChange={handleChange}
        checked={formData[name].includes(value)}
        className="w-5 h-5 rounded bg-white border-gray-300 text-teal-500 cursor-pointer accent-teal-500"
      />
      <span className="ml-3 text-base font-medium group-hover:text-teal-600 transition-colors text-gray-700">{text}</span>
    </label>
  );

  const RadioOption: React.FC<RadioOptionProps> = ({ name, value, text, isChecked }) => (
    <label className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition-all group">
      <input
        type="radio"
        name={name}
        value={value}
        onChange={handleChange}
        checked={isChecked}
        className="w-5 h-5 bg-white border-gray-300 text-teal-500 cursor-pointer"
      />
      <span className="ml-3 text-base font-medium group-hover:text-teal-600 transition-colors text-gray-700">{text}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white text-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header với Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={prevStep}
              className={`p-2 rounded-lg transition-all ${step === 1 ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-teal-50 hover:text-teal-600 text-gray-400'}`}
              disabled={step === 1}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-semibold text-teal-600 min-w-fit">{step}/10</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 md:p-10 mb-8">
          
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-center mb-2">Hình dáng hiện tại</h2>
              <p className="text-center text-gray-400 mb-8">của bạn giống nhất với hình nào?</p>
              <div className="grid grid-cols-3 gap-4">
                <VisualCard 
                  name="body_type" 
                  value="ectomorph" 
                  text="Mảnh khảnh" 
                  isSelected={formData.body_type === 'ectomorph'} 
                  icon={manhKhanhImg} // Thêm dòng này
                />
                <VisualCard 
                  name="body_type" 
                  value="mesomorph" 
                  text="Trung bình" 
                  isSelected={formData.body_type === 'mesomorph'} 
                  icon={trungBinhImg} // Thêm dòng này
                />
                <VisualCard 
                  name="body_type" 
                  value="endomorph" 
                  text="Tích mỡ" 
                  isSelected={formData.body_type === 'endomorph'} 
                  icon={tichMoImg} // Thêm dòng này
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-center mb-2">Mục tiêu của bạn</h2>
              <p className="text-center text-gray-400 mb-8">là gì?</p>
              <div className="grid grid-cols-3 gap-4">
                <VisualCard 
                  name="goal_body" 
                  value="lean" 
                  text="Thon gọn" 
                  isSelected={formData.goal_body === 'lean'} 
                  icon={thonGonImg} // Thêm icon
                />
                <VisualCard 
                  name="goal_body" 
                  value="toned" 
                  text="Săn chắc" 
                  isSelected={formData.goal_body === 'toned'} 
                  icon={sanChacImg} // Thêm icon
                />
                <VisualCard 
                  name="goal_body" 
                  value="muscular" 
                  text="Cơ bắp" 
                  isSelected={formData.goal_body === 'muscular'} 
                  icon={coBapImg} // Thêm icon
                />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-center mb-8">Khu vực ưu tiên</h2>
              <p className="text-center text-gray-400 mb-8">Bạn muốn tập trung cải thiện vùng nào nhất?</p>
              <div className="grid grid-cols-2 gap-4">
                <CheckboxOption name="priority_areas" value="chest" text="Ngực" />
                <CheckboxOption name="priority_areas" value="arms" text="Cánh tay" />
                <CheckboxOption name="priority_areas" value="abs" text="Bụng" />
                <CheckboxOption name="priority_areas" value="legs" text="Chân & Mông" />
                <CheckboxOption name="priority_areas" value="full_body" text="Toàn thân" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-center mb-8">Năng lực hiện tại</h2>
              <p className="text-center text-gray-400 mb-8">Bạn thực hiện được bao nhiêu cái chống đẩy (liên tục)?</p>
              <div className="space-y-3">
                <RadioOption name="pushup_count" value="under_10" text="Dưới 10 cái" isChecked={formData.pushup_count === 'under_10'} />
                <RadioOption name="pushup_count" value="10_20" text="10 - 20 cái" isChecked={formData.pushup_count === '10_20'} />
                <RadioOption name="pushup_count" value="21_30" text="21 - 30 cái" isChecked={formData.pushup_count === '21_30'} />
                <RadioOption name="pushup_count" value="over_30" text="Trên 30 cái" isChecked={formData.pushup_count === 'over_30'} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fadeIn space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-center mb-8">Kế hoạch luyện tập</h2>
                <label className="text-xl font-semibold mb-4 block">Bạn sẽ tập ở đâu?</label>
                <div className="grid grid-cols-2 gap-4">
                  <RadioOption name="workout_location" value="gym" text="Tại Gym" isChecked={formData.workout_location === 'gym'} />
                  <RadioOption name="workout_location" value="home" text="Tại Nhà" isChecked={formData.workout_location === 'home'} />
                </div>
              </div>

              {formData.workout_location === 'home' && (
                <div className="p-6 border border-dashed border-teal-500/50 bg-teal-50 rounded-lg">
                  <label className="text-xl font-semibold mb-4 block">Bạn có dụng cụ nào?</label>
                  <div className="space-y-3">
                    <CheckboxOption name="home_equipment" value="none" text="Không có gì (Bodyweight)" />
                    <CheckboxOption name="home_equipment" value="dumbbell" text="Tạ đơn" />
                    <CheckboxOption name="home_equipment" value="band" text="Dây kháng lực" />
                    <CheckboxOption name="home_equipment" value="pullup_bar" text="Xà đơn" />
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-xl font-semibold mb-4 block">Bạn có thích các môn thể thao nào khác?</label>
                <div className="space-y-3">
                  <CheckboxOption name="other_sports" value="running" text="Chạy bộ / Đi bộ" />
                  <CheckboxOption name="other_sports" value="cycling" text="Đạp xe" />
                  <CheckboxOption name="other_sports" value="yoga" text="Yoga / Giãn cơ" />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-center mb-2">Mục tiêu phụ</h2>
              <p className="text-center text-gray-400 mb-8">Ngoài mục tiêu chính, bạn muốn cải thiện thêm điều gì? (Chọn tối đa 3)</p>
              <div className="grid grid-cols-2 gap-4">
                <CheckboxOption name="secondary_goals" value="improve_sleep" text="Cải thiện giấc ngủ" />
                <CheckboxOption name="secondary_goals" value="reduce_stress" text="Giảm căng thẳng" />
                <CheckboxOption name="secondary_goals" value="increase_energy" text="Tăng năng lượng" />
                <CheckboxOption name="secondary_goals" value="build_habit" text="Hình thành thói quen" />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-center mb-8">Hiểu rõ thách thức</h2>
              <p className="text-center text-gray-400 mb-8">Trở ngại lớn nhất của bạn trước đây là gì?</p>
              <div className="space-y-3">
                <RadioOption name="past_obstacle" value="no_motivation" text="Thiếu động lực" isChecked={formData.past_obstacle === 'no_motivation'} />
                <RadioOption name="past_obstacle" value="no_plan" text="Không có kế hoạch rõ ràng" isChecked={formData.past_obstacle === 'no_plan'} />
                <RadioOption name="past_obstacle" value="too_hard" text="Kế hoạch quá vất vả" isChecked={formData.past_obstacle === 'too_hard'} />
                <RadioOption name="past_obstacle" value="no_time" text="Không có thời gian" isChecked={formData.past_obstacle === 'no_time'} />
                <RadioOption name="past_obstacle" value="never_trained" text="Chưa từng tập" isChecked={formData.past_obstacle === 'never_trained'} />
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="animate-fadeIn space-y-8">
              <h2 className="text-4xl font-bold text-center mb-8">Dinh dưỡng & Hạn chế</h2>
              <div>
                <label className="text-xl font-semibold mb-4 block">Chế độ ăn kiêng?</label>
                <CheckboxOption name="diet_preference" value="none" text="Không" />
                <CheckboxOption name="diet_preference" value="vegetarian" text="Ăn chay" />
                <CheckboxOption name="diet_preference" value="keto" text="Keto" />
              </div>
              
              <div>
                <label className="text-xl font-semibold mb-4 block">Hạn chế vận động?</label>
                <CheckboxOption name="limitations" value="none" text="Không" />
                <CheckboxOption name="limitations" value="low_back_pain" text="Đau lưng dưới" />
                <CheckboxOption name="limitations" value="knee_pain" text="Đau đầu gối" />
              </div>

              <div>
                <label htmlFor="allergies" className="text-xl font-semibold mb-3 block">Thực phẩm không thích hoặc dị ứng?</label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Vd: Dị ứng đậu phộng, không ăn cà..."
                  className="w-full p-4  border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                ></textarea>
              </div>
            </div>
          )}
          
          {step === 9 && (
            <div className="animate-fadeIn space-y-8">
              <h2 className="text-4xl font-bold text-center mb-8">Thói quen hàng ngày</h2>
              <div>
                <label htmlFor="sleep_hours" className="text-xl font-semibold mb-3 block">Bạn thường ngủ bao nhiêu tiếng?</label>
                <select
                  id="sleep_hours"
                  name="sleep_hours"
                  value={formData.sleep_hours}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="under_6">Dưới 6 tiếng</option>
                  <option value="6-8">6 - 8 tiếng</option>
                  <option value="over_8">Trên 8 tiếng</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="daily_activity_level" className="text-xl font-semibold mb-3 block">Mức độ vận động (ngoài lúc tập)?</label>
                <select
                  id="daily_activity_level"
                  name="daily_activity_level"
                  value={formData.daily_activity_level}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="low">Thấp (Ngồi văn phòng)</option>
                  <option value="medium">Vừa (Đi lại, làm việc nhà)</option>
                  <option value="high">Cao (Lao động chân tay)</option>
                </select>
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-center mb-8">Cam kết an toàn</h2>
              <div className="p-6 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 space-y-3 mb-8">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-teal-600" />
                  <div>
                    <p className="font-semibold mb-2">Sức khỏe của bạn là trên hết</p>
                    <p className="text-sm">Nếu bạn có bất kỳ tình trạng nào sau đây: Bệnh tim, vấn đề cột sống, huyết áp cao... Vui lòng tham khảo ý kiến bác sĩ trước khi bắt đầu.</p>
                  </div>
                </div>
              </div>
              <label className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-teal-50/50 cursor-pointer transition-all group">
                <input
                  type="checkbox"
                  name="agree_safety"
                  checked={formData.agree_safety}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-white border-gray-300 text-teal-500 cursor-pointer accent-teal-500"
                />
                <span className="ml-3 text-base font-semibold group-hover:text-teal-600 transition-colors text-gray-700">Tôi đã hiểu và đồng ý</span>
              </label>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-4">
          {step < 10 && (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                  (step === 1 && !formData.body_type) ||
                  (step === 2 && !formData.goal_body) ||
                  (step === 4 && !formData.pushup_count) ||
                  (step === 7 && !formData.past_obstacle)
              }
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:shadow-lg hover:shadow-teal-500/50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              Tiếp tục
            </button>
          )}

          {step === 10 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.agree_safety}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:shadow-lg hover:shadow-teal-500/50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              Hoàn tất & Xây dựng Lộ trình!
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.21, 1.02, 0.32, 1);
        }
      `}</style>
    </div>
  );
};

export default Plan;