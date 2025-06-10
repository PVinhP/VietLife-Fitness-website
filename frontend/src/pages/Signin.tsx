import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface SigninForm {
  email: string;
  password: string;
}

const Signin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formdata, setFormdata] = useState<SigninForm>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://vietlife-fitness-website-owpj.onrender.com/";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
  };

  const showToastMessage = (message: string) => {
    toast.success(message, {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  const showToastErrorMessage = (message: string) => {
    toast.error(message, {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  const validateForm = (): boolean => {
    if (!formdata.email.trim()) {
      showToastErrorMessage("Vui lòng nhập email");
      return false;
    }

    if (!formdata.email.includes("@")) {
      showToastErrorMessage("Email không hợp lệ");
      return false;
    }

    if (!formdata.password.trim()) {
      showToastErrorMessage("Vui lòng nhập mật khẩu");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/user/login`, {
        email: formdata.email.trim().toLowerCase(),
        password: formdata.password
      });
      
      const { msg, token, user } = response.data;

      // Store token and user details
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("auth", JSON.stringify(true));
      
      if (rememberMe) {
        localStorage.setItem("remember", "true");
      }

      showToastMessage(msg || "Đăng nhập thành công!");
      
      setTimeout(() => {
        navigate(location.state?.from || "/", { replace: true });
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      
      if (error.response?.data?.msg) {
        showToastErrorMessage(error.response.data.msg);
      } else if (error.response?.status === 401) {
        showToastErrorMessage("Email hoặc mật khẩu không đúng");
      } else if (error.response?.status === 404) {
        showToastErrorMessage("Tài khoản không tồn tại");
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        showToastErrorMessage("Lỗi kết nối server. Vui lòng thử lại sau.");
      } else {
        showToastErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-black bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 max-w-4xl w-full">
        {/* Left side */}
        <div className="flex flex-col justify-center p-8 md:p-12 text-gray-800 flex-1">
          <div className="text-center mb-10">
            <h1 className="mb-3 text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Chào mừng trở lại
            </h1>
            <p className="font-light text-gray-600 text-lg">
              Chào mừng bạn quay trở lại! Vui lòng đăng nhập
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                name="email"
                id="email"
                value={formdata.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-3 text-sm font-semibold text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                name="password"
                id="password"
                value={formdata.password}
                onChange={handleInputChange}
                className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex justify-between items-center py-2">
              
              <Link 
                to="/forgot-password" 
                className="text-sm font-semibold text-teal-500 hover:text-teal-600 transition-colors duration-200"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white p-4 rounded-lg font-semibold hover:from-teal-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </div>
              ) : "Đăng nhập"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">hoặc</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign in */}
          <button
            className="w-full bg-white border-2 border-gray-200 text-gray-700 p-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            <img
              src="https://cdn.monday.com/images/logo_google_v2.svg"
              alt="Google logo"
              className="w-5 h-5 inline mr-3"
            />
            Đăng nhập với Google
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-8 text-gray-600">
            Chưa có tài khoản?{" "}
            <Link to="/signup">
              <span className="font-semibold text-teal-500 hover:text-teal-600 transition-colors duration-200">
                Đăng ký miễn phí
              </span>
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="relative hidden md:block flex-1">
          <img
            src="https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Fitness background"
            className="w-full h-full rounded-r-2xl object-cover"
          />
          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-r-2xl flex items-end justify-center">
            <div className="text-center text-white p-8 mb-12">
              <h2 className="text-3xl font-bold mb-4">Tiếp tục hành trình</h2>
              <p className="text-lg opacity-90 leading-relaxed">
                "Đừng từ bỏ ước mơ của bạn,<br />
                nếu không ước mơ sẽ từ bỏ bạn."<br />
                <span className="font-semibold text-teal-300">Hãy là VietLife!!</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Signin;