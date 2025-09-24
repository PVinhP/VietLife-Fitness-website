import React, { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Img5 from "../Assests/Img5.jpg"
import useDebounce from "../hook/useDebounce"
import NutritientsIntake from './NutritientsIntake'
import bot from "../images/chatbot.png"
import { useNavigate } from 'react-router-dom'

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

interface Lesson {
    id: number;
    tieu_de: string;
    hinh_anh: string;
    tom_tat: string;
    noi_dung: string;
    loai: string;
    ngay_tao: string;
}

function Nutrition() {
    const navigate = useNavigate()
    const location = useLocation()
    const lessonsRef = useRef<HTMLDivElement>(null)
    const [Query, setQuery] = useState("");
    const [list, setList] = useState<searchList[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("coban");
    const searchResults = useDebounce(Query, 1000)

    // Scroll to lessons section if coming from lesson detail
    useEffect(() => {
        if (location.state?.scrollToLessons && lessonsRef.current) {
            lessonsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    // Fetch lessons from API
    useEffect(() => {
        fetch(`http://localhost:8080/lesson`, {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            }
        })
        .then((res) => res.json())
        .then((res) => {
            if (Array.isArray(res)) {
                setLessons(res);
            } else if (res && res.data && Array.isArray(res.data)) {
                setLessons(res.data);
            } else {
                setLessons([]);
            }
        })
        .catch((error) => {
            console.error("Lỗi khi tải bài học:", error);
            setLessons([]);
        });
    }, []);

    // Search nutrition
    useEffect(() => {
        if (!searchResults.trim()) {
            setList([]);
            return;
        }

        fetch(`http://localhost:8080/nutrition/search?name=${searchResults}`, {
            method: "GET",
            headers: {
                "Content-type": "application/json"
            }
        })
        .then((res) => res.json())
        .then((res) => {
            if (Array.isArray(res)) {
                setList(res);
            } else if (res && res.data && Array.isArray(res.data)) {
                setList(res.data);
            } else {
                setList([]);
            }
        })
        .catch((error) => {
            console.error("Lỗi khi tìm kiếm:", error);
            setList([]);
        });
    }, [searchResults]);

    // Filter lessons by category
    const filteredLessons = lessons.filter(lesson => lesson.loai === activeCategory);

    // Navigate to lesson detail
    const handleLessonClick = (lessonId: number) => {
        navigate(`/lesson/${lessonId}`);
    };

    const renderLessonCard = (lesson: Lesson) => (
        <div 
            key={lesson.id} 
            className="bg-white rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-md"
            onClick={() => handleLessonClick(lesson.id)}
        >
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">
                            {lesson.loai === 'coban' ? '📚' : '💪'}
                        </span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-teal-500 transition-colors">
                        {lesson.tieu_de}
                    </h3>
                    <p className="text-gray-600 text-sm leading-6 mb-3">
                        {lesson.tom_tat}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            {lesson.loai === 'coban' ? 'Cơ bản' : 'Tập luyện'}
                        </span>
                        <span className="text-teal-500 text-sm hover:text-teal-600">
                            Đọc thêm →
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header Section */}
            <div className="overflow-hidden px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
                    <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <div className="lg:pr-4">
                            <div className="lg:max-w-lg">
                                <p className="text-base font-semibold leading-7 text-teal-500">VietLife</p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Dinh dưỡng</h1>
                                <p className="mt-6 text-gray-600 text-xl leading-8">
                                    Một chế độ ăn cân đối cung cấp đầy đủ năng lượng cần thiết để duy trì hoạt động cả ngày, 
                                    các chất dinh dưỡng cần thiết cho sự phát triển và phục hồi, giúp bạn khỏe mạnh và phòng ngừa bệnh tật.
                                </p>
                                
                                {/* Search Bar */}
                                <div className="mt-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Tìm kiếm giá trị dinh dưỡng</h2>
                                    <input 
                                        className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                                        type="text" 
                                        placeholder='Nhập tên thực phẩm (VD: thịt gà, cơm, trứng...)'
                                        value={Query}
                                        onChange={(e) => setQuery(e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
                        <img className="w-[48rem] max-w-none rounded-xl bg-white shadow-xl ring-1 ring-gray-300 sm:w-[57rem]" src={Img5} alt="Dinh dưỡng" />
                    </div>
                </div>

                {/* Search Results */}
                {Query.trim() && (
                    <div className="max-w-7xl mx-auto px-8 mt-8">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            {list.length > 0 ? (
                                <>
                                    <p className="text-base font-semibold leading-7 text-teal-500 mb-4">
                                        📊 Giá trị dinh dưỡng (tính cho 100g thực phẩm)
                                    </p>
                                    {list.map((item, i) => (
                                        <div key={i} className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{item.food_name}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-center">
                                                    <div className="text-white font-bold text-lg">Calo</div>
                                                    <div className="text-white text-2xl">{item.calories}</div>
                                                </div>
                                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-center">
                                                    <div className="text-white font-bold text-lg">Protein</div>
                                                    <div className="text-white text-2xl">{item.protein_g}g</div>
                                                </div>
                                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-center">
                                                    <div className="text-white font-bold text-lg">Carbs</div>
                                                    <div className="text-white text-2xl">{item.carbs_g}g</div>
                                                </div>
                                                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-center">
                                                    <div className="text-white font-bold text-lg">Chất béo</div>
                                                    <div className="text-white text-2xl">{item.fats_g}g</div>
                                                </div>
                                                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-lg text-center">
                                                    <div className="text-white font-bold text-lg">Chất xơ</div>
                                                    <div className="text-white text-2xl">{item.fiber_g}g</div>
                                                </div>
                                                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 rounded-lg text-center">
                                                    <div className="text-white font-bold text-lg">Nước</div>
                                                    <div className="text-white text-2xl">{item.water_g}g</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                                    <p className="text-gray-600 mb-4">
                                        Không tìm thấy thông tin dinh dưỡng cho "{Query}"
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto shadow-sm">
                                        <p className="text-teal-500 font-semibold mb-2">💡 Gợi ý tìm kiếm:</p>
                                        <ul className="text-gray-600 text-sm space-y-1">
                                            <li>• Thử tên đơn giản hơn (VD: "gà" thay vì "gà rán")</li>
                                            <li>• Kiểm tra chính tả</li>
                                            <li>• Thử từ khóa tiếng Việt hoặc tiếng Anh</li>
                                            <li>• VD: thịt gà, cơm, trứng, bánh mì, sữa...</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Lesson Categories */}
                <div ref={lessonsRef} className="max-w-7xl mx-auto px-8 mt-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">📚 Hệ thống bài học dinh dưỡng</h2>
                        <p className="text-xl text-gray-600">Từ cơ bản đến nâng cao - Xây dựng nền tảng kiến thức vững chắc</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg p-2 shadow-md">
                            <button
                                onClick={() => setActiveCategory("coban")}
                                className={`px-6 py-3 mr-2 rounded-lg font-semibold transition-all ${
                                    activeCategory === "coban" 
                                        ? "bg-teal-500 text-white" 
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                📖 Kiến thức cơ bản
                            </button>
                            <button
                                onClick={() => setActiveCategory("tapluyen")}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    activeCategory === "tapluyen" 
                                        ? "bg-teal-500 text-white" 
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                💪 Dinh dưỡng & Tập luyện
                            </button>
                        </div>
                    </div>

                    {/* Lessons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredLessons.length > 0 ? (
                            filteredLessons.map(renderLessonCard)
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="text-6xl mb-4">📖</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có bài học</h3>
                                <p className="text-gray-600">
                                    Bài học cho danh mục này đang được cập nhật
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Tips Section */}
                <div className="max-w-7xl mx-auto px-8 mt-16">
                    <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg p-8 shadow-lg">
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">💡 Lời khuyên nhanh</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/90 rounded-lg p-4 text-center shadow-sm">
                                <div className="text-4xl mb-2">🥗</div>
                                <h3 className="font-bold text-gray-900 mb-2">Ăn đa dạng</h3>
                                <p className="text-gray-600 text-sm">Kết hợp nhiều màu sắc trong bữa ăn</p>
                            </div>
                            <div className="bg-white/90 rounded-lg p-4 text-center shadow-sm">
                                <div className="text-4xl mb-2">💧</div>
                                <h3 className="font-bold text-gray-900 mb-2">Uống đủ nước</h3>
                                <p className="text-gray-600 text-sm">2-3 lít/ngày tùy hoạt động</p>
                            </div>
                            <div className="bg-white/90 rounded-lg p-4 text-center shadow-sm">
                                <div className="text-4xl mb-2">⏰</div>
                                <h3 className="font-bold text-gray-900 mb-2">Ăn đúng giờ</h3>
                                <p className="text-gray-600 text-sm">Duy trì nhịp sinh học ổn định</p>
                            </div>
                            <div className="bg-white/90 rounded-lg p-4 text-center shadow-sm">
                                <div className="text-4xl mb-2">🏃‍♂️</div>
                                <h3 className="font-bold text-gray-900 mb-2">Kết hợp vận động</h3>
                                <p className="text-gray-600 text-sm">Dinh dưỡng + tập luyện = hiệu quả</p>
                            </div>
                        </div>
                    </div>
                </div>

                <NutritientsIntake />
            </div>

            {/* Chat Bot 
            <div onClick={() => navigate("/expert")} className='bg-white cursor-pointer'>
                <img 
                    style={{ 
                        float: 'right', 
                        width: "87px", 
                        fontSize: "70px", 
                        marginRight: "-18%", 
                        position: "fixed", 
                        top: "70%", 
                        left: "93.3%" 
                    }} 
                    src={bot} 
                    alt="Chatbot hỗ trợ" 
                />
            </div>
            */}
        </div>
    )
}

export default Nutrition