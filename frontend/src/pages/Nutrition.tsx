import React, { useEffect, useState } from 'react'
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
    title: string;
    content: string;
    examples: string[];
}

function Nutriton() {
    const navigate = useNavigate()
    const [Query, setQuery] = useState("");
    const [list, setList] = useState<searchList[]>([]);
    const [activeLesson, setActiveLesson] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("basic");
    const searchResults = useDebounce(Query, 1000)

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
            // Kiểm tra nếu res là array và có dữ liệu
            if (Array.isArray(res)) {
                setList(res);
            } else if (res && res.data && Array.isArray(res.data)) {
                // Trường hợp API trả về {data: [...]}
                setList(res.data);
            } else {
                // Không có kết quả hoặc format không đúng
                setList([]);
            }
        })
        .catch((error) => {
            console.error("Lỗi khi tìm kiếm:", error);
            setList([]); // Reset danh sách khi có lỗi
        });
    }, [searchResults]);
    const basicLessons: Lesson[] = [
        {
            id: 1,
            title: "Giới thiệu về dinh dưỡng",
            content: " Dinh dưỡng là một phần quan trọng của sức khỏe và sự phát triển. Dinh dưỡng tốt hơn có liên quan đến sức khỏe của trẻ sơ sinh, trẻ em và bà mẹ được cải thiện, hệ thống miễn dịch mạnh hơn, thai kỳ và sinh nở an toàn hơn, nguy cơ mắc các bệnh không lây nhiễm thấp hơn (như bệnh tiểu đường và bệnh tim mạch) và tuổi thọ cao hơn. Trẻ em khỏe mạnh học tốt hơn. Những người có chế độ dinh dưỡng đầy đủ sẽ làm việc hiệu quả hơn và có thể tạo ra cơ hội để dần dần phá vỡ chu kỳ đói nghèo. Suy dinh dưỡng, dưới mọi hình thức, đều gây ra những mối đe dọa đáng kể đối với sức khỏe con người. Ngày nay, thế giới phải đối mặt với gánh nặng kép của tình trạng suy dinh dưỡng bao gồm cả suy dinh dưỡng và thừa cân, đặc biệt là ở các nước có thu nhập thấp và trung bình. Có nhiều dạng suy dinh dưỡng, bao gồm suy dinh dưỡng (suy dinh dưỡng hoặc còi cọc), thiếu vitamin hoặc khoáng chất, thừa cân, béo phì và các bệnh không lây nhiễm liên quan đến chế độ ăn uống.Dinh dưỡng đóng vai trò quan trọng trong việc duy trì sức khỏe và hoạt động của cơ thể. BMR (Basal Metabolic Rate) là lượng năng lượng cơ thể cần để duy trì các chức năng cơ bản khi nghỉ ngơi. TDEE (Total Daily Energy Expenditure) là tổng năng lượng bạn tiêu thụ trong một ngày, bao gồm BMRn hoạt động thể chất và tiêu hóa thức ăn.",
            examples: [
                "BMR nam: 88.362 + (13.397 × cân nặng kg) + (4.799 × chiều cao cm) - (5.677 × tuổi)",
                "BMR nữ: 447.593 + (9.247 × cân nặng kg) + (3.098 × chiều cao cm) - (4.330 × tuổi)",
                "TDEE = BMR × hệ số hoạt động (1.2-1.9)"
            ]
        },
        {
            id: 2,
            title: "Các nhóm chất dinh dưỡng",
            content: "Cơ thể cần 6 nhóm chất dinh dưỡng chính: Carbohydrate (4 kcal/g), Protein (4 kcal/g), Chất béo (9 kcal/g), Vitamin, Khoáng chất và Nước. Mỗi nhóm có vai trò riêng biệt và không thể thay thế cho nhau.",
            examples: [
                "Carb: Gạo, bánh mì, khoai lang, yến mạch",
                "Protein: Thịt, cá, trứng, đậu phụ, sữa",
                "Chất béo: Dầu ô liu, bơ, hạt điều, cá hồi",
                "Vitamin: Rau xanh, trái cây đa dạng màu sắc"
            ]
        },
        {
            id: 3,
            title: "Ăn uống lành mạnh",
            content: "Chế độ ăn cân bằng cần đảm bảo tỷ lệ thích hợp giữa các nhóm chất dinh dưỡng. Ăn đúng giờ giúp duy trì nhịp sinh học tự nhiên. Hạn chế thực phẩm siêu chế biến (chứa nhiều đường, muối, chất bảo quản).",
            examples: [
                "Tỷ lệ đĩa ăn: 1/2 rau củ, 1/4 tinh bột, 1/4 protein",
                "3 bữa chính + 2 bữa phụ trong ngày",
                "Tránh: Mì gói, đồ uống có gas, thức ăn nhanh"
            ]
        },
        {
            id: 4,
            title: "Đọc nhãn thực phẩm",
            content: "Nhãn dinh dưỡng cung cấp thông tin về năng lượng, chất dinh dưỡng và thành phần. Cần chú ý đến khẩu phần, % giá trị dinh dưỡng khuyến nghị và danh sách thành phần (sắp xếp theo thứ tự từ nhiều đến ít).",
            examples: [
                "Kiểm tra khẩu phần tiêu chuẩn (thường là 100g)",
                "Chọn sản phẩm có ít đường, muối, chất béo trans",
                "Ưu tiên thành phần tự nhiên, ít phụ gia"
            ]
        },
        {
            id: 5,
            title: "Xây dựng khẩu phần phù hợp người Việt",
            content: "Khẩu phần ăn cần phù hợp với văn hóa ẩm thực, khí hậu nhiệt đới và sở thích của người Việt. Tận dụng nguyên liệu địa phương, tươi ngon và phong phú.",
            examples: [
                "Bữa sáng: Phở gà + rau thơm, hoặc Cháo thịt + pickles",
                "Bữa trưa: Cơm + thịt/cá + rau xanh + canh",
                "Bữa tối: Bún/miến + protein + rau nhiều màu sắc",
                "Đồ uống: Nước lọc, trà xanh, nước dừa tươi"
            ]
        }
    ];

    const workoutNutritionLessons: Lesson[] = [
        {
            id: 6,
            title: "Ăn uống trước - trong - sau khi tập",
            content: "Thời điểm ăn uống ảnh hưởng lớn đến hiệu quả tập luyện. Trước tập cần năng lượng, trong khi tập cần bù nước, sau tập cần protein và carb để phục hồi.",
            examples: [
                "Trước tập (1-2h): Yến mạch + chuối, bánh mì + mật ong",
                "Trong tập: Nước lọc, đồ uống điện giải nếu tập >1h",
                "Sau tập (30-60p): Sữa chocolate, thịt gà + cơm"
            ]
        },
        {
            id: 7,
            title: "Chế độ ăn theo mục tiêu",
            content: "Mỗi mục tiêu tập luyện cần chiến lược dinh dưỡng khác nhau. \t Tăng cơ cần thặng dư calo, giảm mỡ cần thâm hụt calo, giữ dáng cần cân bằng.",
            examples: [
                "Tăng cơ: +300-500 kcal/ngày, protein 1.6-2.2g/kg",
                "Giảm mỡ: -300-500 kcal/ngày, protein 2-2.5g/kg",
                "Giữ dáng: Cân bằng calo vào/ra, protein 1.2-1.6g/kg"
            ]
        },
        {
            id: 8,
            title: "Thực đơn mẫu theo mục tiêu",
            content: "Thực đơn cụ thể giúp áp dụng lý thuyết vào thực tế, phù hợp với khẩu vị và điều kiện của người Việt.",
            examples: [
                "Tăng cơ (70kg): 2800 kcal, 140g protein, 350g carb, 100g fat",
                "Giảm mỡ (60kg): 1800 kcal, 120g protein, 180g carb, 70g fat",
                "Phân bổ: 25% sáng, 35% trưa, 30% tối, 10% snack"
            ]
        },
        {
            id: 9,
            title: "Thực phẩm bổ sung (Supplements)",
            content: "TPBS không thay thế được thức ăn tự nhiên nhưng có thể hỗ trợ khi chế độ ăn chưa đủ hoặc có nhu cầu đặc biệt.",
            examples: [
                "Whey Protein: 20-30g sau tập, khi thiếu protein từ thức ăn",
                "Creatine: 3-5g/ngày, tăng sức mạnh và sức bền",
                "BCAA: 10-15g trong/sau tập dài, giảm mệt mỏi cơ",
                "Multivitamin: 1 viên/ngày khi chế độ ăn không đa dạng"
            ]
        }
    ];

    const renderLesson = (lesson: Lesson) => (
        <div key={lesson.id} className="mb-8 bg-gray-800 rounded-lg p-6">
            <button
                onClick={() => setActiveLesson(activeLesson === lesson.id ? null : lesson.id)}
                className="w-full text-left flex justify-between items-center"
            >
                <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                <span className="text-teal-300 text-2xl">
                    {activeLesson === lesson.id ? '−' : '+'}
                </span>
            </button>
            {activeLesson === lesson.id && (
                <div className="mt-4">
                    <p className="text-white text-base leading-7 mb-4">{lesson.content}</p>
                    <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-teal-300 font-semibold mb-2">Ví dụ thực tế:</h4>
                        <ul className="space-y-2">
                            {lesson.examples.map((example, index) => (
                                <li key={index} className="text-gray-300 flex items-start">
                                    <span className="text-teal-300 mr-2">•</span>
                                    {example}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Header Section */}
            <div className="overflow-hidden px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
                    <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <div className="lg:pr-4">
                            <div className="lg:max-w-lg">
                                <p className="text-base font-semibold leading-7 text-teal-300">VietLife</p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Dinh dưỡng</h1>
                                <p className="mt-6 text-white text-xl leading-8">
                                    Một chế độ ăn cân đối cung cấp đầy đủ năng lượng cần thiết để duy trì hoạt động cả ngày, 
                                    các chất dinh dưỡng cần thiết cho sự phát triển và phục hồi, giúp bạn khỏe mạnh và phòng ngừa bệnh tật.
                                </p>
                                
                                {/* Search Bar - Moved to top */}
                                <div className="mt-8">
                                    <h2 className="text-2xl font-bold text-white mb-4">🔍 Tìm kiếm giá trị dinh dưỡng</h2>
                                    <input 
                                        className="w-full p-3 border border-gray-600 bg-gray-800 text-white rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-teal-300 focus:border-transparent" 
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
                        <img className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" src={Img5} alt="" />
                    </div>
                </div>

                {/* Search Results */}
                {Query.trim() && (
                    <div className="max-w-7xl mx-auto px-8 mt-8">
                        <div className="bg-gray-800 rounded-lg p-6">
                            {list.length > 0 ? (
                                <>
                                    <p className="text-base font-semibold leading-7 text-teal-300 mb-4">
                                        📊 Giá trị dinh dưỡng (tính cho 100g thực phẩm)
                                    </p>
                                    {list.map((item, i) => (
                                        <div key={i} className="mb-6">
                                            <h3 className="text-2xl font-bold text-white mb-4 text-center">{item.food_name}</h3>
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
                                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-center">
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
                                    <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy kết quả</h3>
                                    <p className="text-gray-300 mb-4">
                                        Không tìm thấy thông tin dinh dưỡng cho "{Query}"
                                    </p>
                                    <div className="bg-gray-700 rounded-lg p-4 max-w-md mx-auto">
                                        <p className="text-teal-300 font-semibold mb-2">💡 Gợi ý tìm kiếm:</p>
                                        <ul className="text-gray-300 text-sm space-y-1">
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
                <div className="max-w-7xl mx-auto px-8 mt-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">📚 Hệ thống bài học dinh dưỡng</h2>
                        <p className="text-xl text-gray-300">Từ cơ bản đến nâng cao - Xây dựng nền tảng kiến thức vững chắc</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-800 rounded-lg p-2">
                            <button
                                onClick={() => setActiveCategory("basic")}
                                className={`px-6 py-3 mr-2 rounded-lg font-semibold transition-all ${
                                    activeCategory === "basic" 
                                        ? "bg-teal-500 text-white" 
                                        : "text-gray-300 hover:text-white"
                                }`}
                            >
                                📖 Kiến thức cơ bản
                            </button>
                            <button
                                onClick={() => setActiveCategory("workout")}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    activeCategory === "workout" 
                                        ? "bg-teal-500 text-white" 
                                        : "text-gray-300 hover:text-white"
                                }`}
                            >
                                💪 Dinh dưỡng & Tập luyện
                            </button>
                        </div>
                    </div>

                    {/* Lessons Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            {activeCategory === "basic" && basicLessons.slice(0, 3).map(renderLesson)}
                            {activeCategory === "workout" && workoutNutritionLessons.slice(0, 2).map(renderLesson)}
                        </div>
                        <div>
                            {activeCategory === "basic" && basicLessons.slice(3).map(renderLesson)}
                            {activeCategory === "workout" && workoutNutritionLessons.slice(2).map(renderLesson)}
                        </div>
                    </div>
                </div>

                {/* Quick Tips Section */}
                <div className="max-w-7xl mx-auto px-8 mt-16">
                    <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg p-8">
                        <h2 className="text-3xl font-bold text-white mb-6 text-center">💡 Lời khuyên nhanh</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="text-4xl mb-2">🥗</div>
                                <h3 className="font-bold text-white mb-2">Ăn đa dạng</h3>
                                <p className="text-gray-200 text-sm">Kết hợp nhiều màu sắc trong bữa ăn</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="text-4xl mb-2">💧</div>
                                <h3 className="font-bold text-white mb-2">Uống đủ nước</h3>
                                <p className="text-gray-200 text-sm">2-3 lít/ngày tùy hoạt động</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="text-4xl mb-2">⏰</div>
                                <h3 className="font-bold text-white mb-2">Ăn đúng giờ</h3>
                                <p className="text-gray-200 text-sm">Duy trì nhịp sinh học ổn định</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="text-4xl mb-2">🏃‍♂️</div>
                                <h3 className="font-bold text-white mb-2">Kết hợp vận động</h3>
                                <p className="text-gray-200 text-sm">Dinh dưỡng + tập luyện = hiệu quả</p>
                            </div>
                        </div>
                    </div>
                </div>

                <NutritientsIntake />
            </div>

            {/* Chat Bot */}
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
                    alt="" 
                />
            </div>
        </div>
    )
}

export default Nutriton