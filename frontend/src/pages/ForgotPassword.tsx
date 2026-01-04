import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
https://vietlife-fitness-website-host.onrender.com/
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "https://vietlife-fitness-website-host.onrender.com";

  // Step 1: Nhập email, Step 2: Nhập OTP & Đổi mật khẩu
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // BƯỚC 1: GỬI YÊU CẦU OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Email không hợp lệ");

    setIsLoading(true);
    try {
      // Gọi API gửi OTP
      const res = await axios.post(`${API_URL}/user/forgot-password`, { email });
      toast.success(res.data.msg);
      setStep(2); // Chuyển sang màn hình nhập OTP
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Lỗi gửi yêu cầu");
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 2: XÁC NHẬN & ĐỔI MẬT KHẨU
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Mật khẩu phải từ 6 ký tự");
    if (newPassword !== confirmPassword) return toast.error("Mật khẩu xác nhận không khớp");

    setIsLoading(true);
    try {
      // Gọi API xác nhận (Lưu ý: Gửi kèm cả email để backend biết của ai)
      const res = await axios.post(`${API_URL}/user/verify-forgot-password`, {
        email: email, 
        otp: otp,
        password: newPassword
      });
      
      toast.success(res.data.msg);
      
      // Thành công -> Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => navigate("/signin"), 2000);

    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Lỗi đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 text-black">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 max-w-4xl w-full">
        
        {/* Left Side: Form */}
        <div className="flex flex-col justify-center p-8 md:p-12 flex-1">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}
            </h1>
            <p className="font-light text-gray-600">
              {step === 1 
                ? "Nhập email để nhận mã xác nhận" 
                : `Mã OTP đã được gửi tới ${email}`}
            </p>
          </div>

          {step === 1 ? (
            // FORM BƯỚC 1
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Email đã đăng ký</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white p-4 rounded-lg font-semibold hover:scale-[1.02] transition-transform"
              >
                {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </button>
            </form>
          ) : (
            // FORM BƯỚC 2
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Mã OTP (6 số)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none tracking-widest text-center text-lg"
                  placeholder="######"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white p-4 rounded-lg font-semibold hover:scale-[1.02] transition-transform"
              >
                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-sm text-teal-500 hover:underline"
                >
                  Gửi lại mã?
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <Link to="/signin" className="text-gray-600 hover:text-teal-600 font-medium">
              &larr; Quay lại đăng nhập
            </Link>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="relative hidden md:block flex-1">
          <img
            src="https://images.pexels.com/photos/4498221/pexels-photo-4498221.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Background"
            className="w-full h-full rounded-r-2xl object-cover"
          />
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ForgotPassword;