import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SignupForm {
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface SignupResponse {
    msg: string;
    token?: string;
    user?: {
        id: number;
        email: string;
        full_name: string | null;
    };
}

const Signup: React.FC = () => {
    const navigate = useNavigate();

    const [formdata, setFormdata] = useState<SignupForm>({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL || "https://vietlife-fitness-website-host.onrender.com";

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormdata({ ...formdata, [name]: value });
    };

    const showToastMessage = (message: string) => {
        toast.success(message, { position: toast.POSITION.TOP_CENTER });
    };

    const showToastErrorMessage = (message: string) => {
        toast.error(message, { position: toast.POSITION.TOP_CENTER });
    };

    const validateForm = (): boolean => {
        if (!formdata.email.trim() || !formdata.email.includes("@")) {
            showToastErrorMessage("Email không hợp lệ");
            return false;
        }
        if (formdata.password.length < 6) {
            showToastErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }
        if (formdata.password !== formdata.confirmPassword) {
            showToastErrorMessage("Mật khẩu xác nhận không khớp");
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
            const submitData = {
                email: formdata.email.trim().toLowerCase(),
                password: formdata.password,
                full_name: formdata.full_name.trim() || null,
            };

            const response = await axios.post<SignupResponse>(
                `${API_URL}/user/register`,
                submitData
            );

            showToastMessage(response.data.msg || "Đăng ký thành công!");

            // Lưu token vào localStorage để trang onboarding có thể sử dụng
            if (response.data.token && response.data.user) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('auth', 'true');
                localStorage.setItem("user", JSON.stringify(response.data.user));
                // Sử dụng full_name từ response hoặc từ form data
                localStorage.setItem('VietLifeuser', response.data.user.full_name || formdata.full_name);
    }

            // CHUYỂN HƯỚNG ĐẾN TRANG ONBOARDING
            setTimeout(() => {
                navigate("/onboarding");
            }, 1500);

        } catch (error: any) {
            const errorMsg = error.response?.data?.msg || "Đã có lỗi xảy ra. Vui lòng thử lại.";
            showToastErrorMessage(errorMsg);
            console.error("Lỗi đăng ký:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen text-black bg-gradient-to-br from-teal-50 to-blue-50">
            <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 max-w-5xl w-full">
                {/* Left side */}
                <div className="flex flex-col justify-center p-8 md:p-12 text-gray-800 flex-1">
                    <div className="text-center mb-8">
                        <h1 className="mb-3 text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                            Chào mừng đến với VietLife
                        </h1>
                        <p className="font-light text-gray-600 text-lg">
                            Tạo tài khoản để bắt đầu hành trình của bạn
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                placeholder="Nhập họ và tên của bạn"
                                className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light focus:outline-none focus:ring-2 focus:ring-teal-400"
                                name="full_name"
                                value={formdata.full_name}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Nhập địa chỉ email của bạn"
                                className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light focus:outline-none focus:ring-2 focus:ring-teal-400"
                                name="email"
                                value={formdata.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    name="password"
                                    value={formdata.password}
                                    onChange={handleInputChange}
                                    className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    name="confirmPassword"
                                    value={formdata.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="terms" className="w-5 h-5 text-teal-400 border-gray-300 rounded focus:ring-teal-400" required />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                Tôi đồng ý với <span className="text-teal-500 cursor-pointer hover:underline">Điều khoản và Điều kiện</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white p-4 rounded-lg font-semibold hover:from-teal-500 hover:to-teal-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                        </button>
                    </form>

                     {/* Divider */}
                     <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm font-medium">hoặc</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                    
                    {/* Google Signup */}
                    <button
                        className="w-full bg-white border-2 border-gray-200 text-gray-700 p-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
                        disabled={isLoading}
                    >
                        <img src="https://cdn.monday.com/images/logo_google_v2.svg" alt="Google logo" className="w-5 h-5 inline mr-3" />
                        Đăng ký với Google
                    </button>

                    {/* Sign In Link */}
                    <div className="text-center mt-6 text-gray-600">
                        Đã có tài khoản?{" "}
                        <Link to="/signin" className="font-semibold text-teal-500 hover:text-teal-600">
                            Đăng nhập tại đây
                        </Link>
                    </div>
                </div>

                {/* Right side */}
                <div className="relative hidden md:block flex-1">
                    <img
                        src="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600"
                        alt="Fitness background"
                        className="w-full h-full rounded-r-2xl object-cover"
                    />
                </div>

                <ToastContainer autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
            </div>
        </div>
    );
};

export default Signup;