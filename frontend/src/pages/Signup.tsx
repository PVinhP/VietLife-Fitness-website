import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

interface SignupForm {
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    birth_date: string;
    gender: string;
    height_cm: string;
    weight_kg: string;
}

interface SignupResponse {
    msg: string;
    token?: string;
    user?: {
        id: number;
        email: string;
        full_name: string | null;
        phone: string | null;
        gender: 'nam' | 'nu' | 'khac' | null;
        birth_date: string | null;
        height_cm: number | null;
        weight_kg: number | null;
        created_at: string;
        updated_at: string;
    };
}

const Signup: React.FC = () => {
    const navigate = useNavigate();

    const [formdata, setFormdata] = useState<SignupForm>({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        birth_date: "",
        gender: "",
        height_cm: "",
        weight_kg: ""
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormdata({ ...formdata, [name]: value });
    };

    const showToastMessage = (message: string) => {
        toast.success(message, {
            position: toast.POSITION.TOP_CENTER
        });
    };

    const showToastErrorMessage = (message: string) => {
        toast.error(message, {
            position: toast.POSITION.TOP_CENTER
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

        if (formdata.password.length < 6) {
            showToastErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }

        if (formdata.password !== formdata.confirmPassword) {
            showToastErrorMessage("Mật khẩu xác nhận không khớp");
            return false;
        }

        if (formdata.height_cm && (parseFloat(formdata.height_cm) < 50 || parseFloat(formdata.height_cm) > 300)) {
            showToastErrorMessage("Chiều cao không hợp lệ (50-300 cm)");
            return false;
        }

        if (formdata.weight_kg && (parseFloat(formdata.weight_kg) < 20 || parseFloat(formdata.weight_kg) > 300)) {
            showToastErrorMessage("Cân nặng không hợp lệ (20-300 kg)");
            return false;
        }

        if (formdata.gender && !['nam', 'nu', 'khac'].includes(formdata.gender)) {
            showToastErrorMessage("Giới tính không hợp lệ");
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
            // Chuẩn bị data để gửi theo đúng format của backend
            const submitData = {
                email: formdata.email.trim().toLowerCase(),
                password: formdata.password,
                full_name: formdata.full_name.trim() || null,
                phone: null, // Backend expects phone field
                gender: formdata.gender || null,
                birth_date: formdata.birth_date || null,
                height_cm: formdata.height_cm ? parseFloat(formdata.height_cm) : null,
                weight_kg: formdata.weight_kg ? parseFloat(formdata.weight_kg) : null
            };

            // Log data để debug
            console.log("Sending data:", submitData);

            const response = await axios.post<SignupResponse>(
                `https://backend-rjhh.onrender.com/user/register`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            console.log("Response:", response.data);
            showToastMessage(response.data.msg || "Đăng ký thành công!");

            // Lưu token nếu có
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            // Chuyển hướng về trang đăng nhập sau 1.5 giây
            setTimeout(() => {
                navigate("/signin");
            }, 1500);

        } catch (error: any) {
            console.error("Chi tiết lỗi đăng ký:", error);
            console.error("Error response:", error.response);
            console.error("Error message:", error.message);
            console.error("Error code:", error.code);

            // Xử lý các trường hợp lỗi cụ thể
            if (error.response) {
                // Server responded with error status
                const errorMsg = error.response.data?.msg;
                console.log("Server error message:", errorMsg);
                
                if (errorMsg === "Email đã được sử dụng") {
                    showToastErrorMessage("Email đã được sử dụng. Vui lòng chọn email khác.");
                } else if (errorMsg === "Email và mật khẩu là bắt buộc") {
                    showToastErrorMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
                } else if (errorMsg === "Lỗi server khi đăng ký") {
                    showToastErrorMessage("Lỗi server. Vui lòng thử lại sau.");
                } else if (error.response.status === 400) {
                    showToastErrorMessage(errorMsg || "Thông tin đăng ký không hợp lệ.");
                } else if (error.response.status === 500) {
                    showToastErrorMessage("Lỗi server. Vui lòng thử lại sau.");
                } else {
                    showToastErrorMessage(errorMsg || `Lỗi ${error.response.status}: ${error.response.statusText}`);
                }
            } else if (error.request) {
                // Request was made but no response received
                console.log("No response received:", error.request);
                if (error.code === 'ECONNABORTED') {
                    showToastErrorMessage("Request timeout. Vui lòng thử lại.");
                } else {
                    showToastErrorMessage("Không thể kết nối đến server. Kiểm tra kết nối mạng.");
                }
            } else if (error.code === 'ERR_NETWORK') {
                showToastErrorMessage("Lỗi kết nối mạng. Vui lòng kiểm tra server có đang chạy không.");
            } else {
                // Something else happened
                console.log("Other error:", error.message);
                showToastErrorMessage(`Lỗi không xác định: ${error.message}`);
            }
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
                                className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
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
                                className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                                name="email"
                                value={formdata.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Password */}
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
                                    className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
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
                                    className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Birth Date and Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Ngày sinh</label>
                                <input
                                    type="date"
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                                    name="birth_date"
                                    value={formdata.birth_date}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Giới tính</label>
                                <select
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                                    name="gender"
                                    value={formdata.gender}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="nam">Nam</option>
                                    <option value="nu">Nữ</option>
                                    <option value="khac">Khác</option>
                                </select>
                            </div>
                        </div>

                        {/* Height and Weight */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Chiều cao (cm)</label>
                                <input
                                    type="number"
                                    placeholder="Nhập chiều cao"
                                    className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                                    name="height_cm"
                                    value={formdata.height_cm}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    min="50"
                                    max="300"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">Cân nặng (kg)</label>
                                <input
                                    type="number"
                                    placeholder="Nhập cân nặng"
                                    className="w-full p-4 border border-gray-300 rounded-lg placeholder:font-light placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                                    name="weight_kg"
                                    value={formdata.weight_kg}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    min="20"
                                    max="300"
                                />
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center space-x-3">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                className="w-5 h-5 text-teal-400 border-gray-300 rounded focus:ring-teal-400 focus:ring-2" 
                                required 
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                Tôi đồng ý với <span className="text-teal-500 cursor-pointer hover:underline">Điều khoản và Điều kiện</span>
                            </label>
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
                                    Đang tạo tài khoản...
                                </div>
                            ) : "Tạo tài khoản"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm font-medium">hoặc</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Google Signup */}
                    <button
                        className="w-full bg-white border-2 border-gray-200 text-gray-700 p-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        <img 
                            src="https://cdn.monday.com/images/logo_google_v2.svg" 
                            alt="Google logo" 
                            className="w-5 h-5 inline mr-3" 
                        />
                        Đăng ký với Google
                    </button>

                    {/* Sign In Link */}
                    <div className="text-center mt-8 text-gray-600">
                        Đã có tài khoản?{" "}
                        <Link to="/signin">
                            <span className="font-semibold text-teal-500 hover:text-teal-600 transition-colors duration-200">
                                Đăng nhập tại đây
                            </span>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-r-2xl flex items-end justify-center">
                        <div className="text-center text-white p-8 mb-12">
                            <h2 className="text-3xl font-bold mb-4">Bắt đầu hành trình thể hình</h2>
                            <p className="text-lg opacity-90 leading-relaxed">
                                "Đừng từ bỏ ước mơ của bạn,<br />
                                Thành công là chặng đường, Không phải đích đến."<br />
                                <span className="font-semibold text-teal-300">Hãy là VietLife!!</span>
                            </p>
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
        </div>
    );
};

export default Signup;