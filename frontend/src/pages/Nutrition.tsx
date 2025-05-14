import React, { useEffect, useState } from 'react'
import Img5 from "../Assests/Img5.jpg"
import useDebounce from "../hook/useDebounce" //trì hoãn thực thi một hàm
import NutritientsIntake from './NutritientsIntake' // vẽ biểu đồ sáng trưa, tối
import bot from "../images/chatbot.png" // AI: chưa xong
import { useNavigate } from 'react-router-dom'
interface searchList {
    id: number;             // ID của thực phẩm
    food_name: string;      // Tên thực phẩm
    calories: number;       // Lượng calo
    water_g: number;        // Hàm lượng nước (g)
    protein_g: number;      // Chất đạm (g)
    fats_g: number;         // Tổng chất béo (g)
    carbs_g: number;        // Tổng carbohydrate (g)
    fiber_g: number;        // Chất xơ (g)
}

function Nutriton() {
    const navigate = useNavigate()
    const [Query, setQuery] = useState("");
    const [list, setList] = useState<searchList[]>([]);
    const searchResults = useDebounce(Query, 1000)
    useEffect(() => {
        if (!searchResults.trim()) {  
            setList([]); // Nếu ô tìm kiếm trống, xóa danh sách  
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
            setList(res);
        })
        .catch((error) => console.error("Lỗi khi tìm kiếm:", error));
    
    }, [searchResults]);
    return (
        <div>
            <div className=" overflow-hidden px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">

                <div className="mx-auto grid max-w-2xl grid-cols-1  gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
                    <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <div className="lg:pr-4">
                            <div className="lg:max-w-lg">
                                <p className="text-base font-semibold leading-7 text-teal-300">VietLife </p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-white">Dinh dưỡng</h1>
                                <p className="mt-6 text-white text-xl leading-8 text-gray-700">Một chế độ ăn cân đối cung cấp đầy đủ: năng lượng cần thiết để duy trì hoạt động cả ngày, các chất dinh dưỡng cần thiết cho sự phát triển và phục hồi, giúp bạn khỏe mạnh và phòng ngừa các bệnh liên quan đến chế độ ăn, như một số loại ung thư.</p>
                            </div>
                        </div>
                    </div>
                    <div className="-ml-12 -mt-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
                        <img className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]" src={Img5} alt="" />
                    </div>
                    <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                        <div className="lg:pr-4">
                            <div className="max-w-xl text-base leading-7 text-gray-700 lg:max-w-lg">
                                <h1 className=" text-white mt-16 text-2xl font-bold mb-4 tracking-tight text-gray-900">Thực phẩm nên bổ sung vào chế độ ăn khi tập gym</h1>
                                <p className=' text-white text-base font-semibold leading-7 '>Có ba nhóm chất dinh dưỡng đa lượng chính đóng vai trò quan trọng trong việc duy trì các chức năng cơ thể và thúc đẩy sự thay đổi về sức mạnh và cấu trúc cơ thể - đó là carbs, protein và chất béo. Điều quan trọng là chúng ta phải tiêu thụ đủ số lượng cả ba nhóm chất dinh dưỡng này để tối ưu hóa quá trình phát triển.</p>
                                <p className='text-base font-semibold leading-7 text-white '>Hãy xem những chất dinh dưỡng thiết yếu mà bạn nên đưa vào chế độ ăn khi tập gym để tăng cơ và giảm cân.</p>

                                <ul className="mt-8 space-y-8 text-gray-600">
                                    <li className="flex gap-x-3">
                                        👉
                                        <span className='text-base font-semibold leading-7 text-white '><strong className="font-semibold text-xl text-gray-900 text-white">Carbohydrate{" "}≫</strong> {" "}Đầu tiên, carbohydrate là nguồn năng lượng chính cho cơ thể và do đó đóng vai trò quan trọng nhất trong việc cung cấp năng lượng cho tập luyện. Có hai loại carbohydrate khác nhau là phức hợp và đơn giản. Tên gọi này cho thấy thời gian tiêu hóa - carbs phức hợp mất nhiều thời gian để tiêu hóa hơn so với carbs đơn giản.
                                            <br />
                                            Hơn nữa, carbohydrate phức hợp cung cấp cho cơ thể năng lượng giải phóng chậm và kéo dài, đồng thời mang lại nhiều lợi ích dinh dưỡng. Trong khi đó, carbohydrate đơn giản cung cấp năng lượng nhanh và ngắn hạn, nhưng có ít giá trị dinh dưỡng.</span>

                                    </li>
                                    <li className="flex gap-x-3 text-white">
                                        👉
                                        <span className='text-base font-semibold leading-7 '><strong className="font-semibold text-xl text-gray-900 text-white">Protein{" "}≫</strong> {" "}

                                            Phần lớn người tập gym đều biết rằng việc tiêu thụ protein rất quan trọng. Lý do protein quan trọng là vì nó đóng vai trò chính trong việc phục hồi và sửa chữa cơ thể. Chế độ ăn khi tập gym cần phải có protein. Trong quá trình tập luyện, cơ thể chịu các áp lực và căng thẳng.
                                            <br />
                                            Điều này gây ra tổn thương cho cơ bắp ở cấp độ vi mô. Vì vậy, để sửa chữa những tổn thương này, cơ thể cần protein. Nếu không có đủ protein, thời gian phục hồi sẽ kéo dài và mệt mỏi mãn tính có thể xuất hiện.
                                            <br />
                                            Protein được tìm thấy nhiều trong các sản phẩm từ động vật như thịt nạc, trứng và các sản phẩm từ sữa. Ngoài ra, protein cũng có thể được tìm thấy với số lượng nhỏ hơn trong các loại thực phẩm như hạt, các loại quả, đậu, đỗ và đậu nành.
                                        </span>
                                    </li>
                                    <li className="flex gap-x-3 text-white">
                                        👉
                                        <span className='text-base font-semibold leading-7 '><strong className="font-semibold text-xl text-white text-gray-900">Chất béo{" "}≫</strong> {" "} Chất béo thường bị hiểu sai là nguyên nhân chính gây tăng mỡ. Tuy nhiên, chất béo không phải là thủ phạm và thực sự đóng vai trò quan trọng trong việc hấp thụ và vận chuyển các chất dinh dưỡng. Ngoài ra, chúng còn có tác động tích cực đến sức khỏe tim mạch và sản xuất hormone.
                                            <br />
                                            Mặc dù chất béo có thể có tác động tích cực đến sức khỏe, nhưng có nhiều loại chất béo khác nhau - một số có lợi ích nhiều hơn các loại khác trong chế độ ăn khi tập gym. Các nghiên cứu gần đây cho thấy chất béo bão hòa không có hại như người ta vẫn tin trước đây, nhưng bạn nên tập trung chủ yếu vào chất béo không bão hòa.
                                            <br />
                                            Ví dụ về thực phẩm giàu chất béo không bão hòa bao gồm bơ, các loại hạt, quả óc chó, bơ đậu phộng, cá (cá hồi, cá ngừ, cá thu), dầu (dầu ô liu, dầu đậu phộng) và các sản phẩm từ đậu nành mà bạn có thể đưa vào chế độ ăn khi tập gym.
                                        </span>
                                    </li>
                                </ul>
                                <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 text-white mb-5">Tìm kiếm giá trị dinh dưỡng</h2>
                                {/* <span className="mb-2 text-md ">Tên của thực phẩm</span> */}
                                <input className="w-1/2 p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500" type="text" placeholder='Nhập tên thực phẩm'

                                    value={Query}
                                    onChange={(e) => setQuery(e.target.value)} />
                                {list && <div className='container'>
                                    {list.map((item, i) => (
                                        <div className='mt-5'>
                                            <p className="text-base font-semibold leading-7 text-teal-300">Tất cả giá trị được tính cho 100g thực phẩm </p>
                                            <h1 className=" text-2xl ml-20 font-bold tracking-tight text-gray-900 text-white">{item.food_name}</h1>
                                            <table className='mt-5'>
                                                <tbody>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-4 py-2 font-bold">Calo</th>
                                                        <td className="px-4 py-2">{item.calories}</td>
                                                    </tr>
                                                    <tr className="text-white">
                                                        <th className="px-4 py-2 font-bold">Carbohydrate</th>
                                                        <td className="px-4 py-2">{item.carbs_g}</td>
                                                    </tr>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-4 py-2 font-bold">Chất béo </th>
                                                        <td className="px-4 py-2">{item.fats_g}</td>
                                                    </tr>
                                                    <tr className="text-white">
                                                        <th className="px-4 py-2 font-bold">Chất xơ</th>
                                                        <td className="px-4 py-2">{item.fiber_g}</td>
                                                    </tr>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-4 py-2 font-bold">Nước</th>
                                                        <td className="px-4 py-2">{item.water_g}</td>
                                                    </tr>
                                                    <tr className="text-white">
                                                        <th className="px-4 py-2 font-bold">Protein</th>
                                                        <td className="px-4 py-2">{item.protein_g}</td>
                                                    </tr>
                                                    
                                                    {/* <tr className="text-white">
                                                        <th className="px-4 py-2 font-bold">Cholesterol</th>
                                                        <td className="px-4 py-2">{item.cholesterol_mg}</td>
                                                    </tr>   
                                                    <tr className="bg-gray-100">
                                                        <th className="px-4 py-2 font-bold">Sodium</th>
                                                        <td className="px-4 py-2">{item.sodium_mg}</td>
                                                    </tr>
                                                    <tr className="text-white">
                                                        <th className="px-4 py-2 font-bold">Potassium</th>
                                                        <td className="px-4 py-2">{item.potassium_mg}</td>
                                                    </tr>   */}
                                                     
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                                }

                                <h2 className=" text-white mt-16 text-2xl font-bold tracking-tight text-gray-900">Thực phẩm nên tránh trong chế độ ăn khi tập gym</h2>
                                <p className="mt-6 text-base font-semibold leading-7 text-white ">Cũng như việc dinh dưỡng đúng cách có thể tối ưu hóa hiệu suất và khả năng thích nghi, dinh dưỡng không đúng cách có thể ảnh hưởng tiêu cực đến tiến trình và sức khỏe. Ba loại thực phẩm sau đây nên được tránh hoặc hạn chế càng nhiều càng tốt.</p>
                                <p className='text-base font-semibold leading-7 text-white'>
                                    Ví dụ, chất béo trans là một loại chất béo trong chế độ ăn uống đã được chứng minh là có tác động xấu đến sức khỏe. Mặc dù chất béo trans tự nhiên có xuất hiện với số lượng nhỏ, nhưng chất béo trans nhân tạo được biết đến là đặc biệt nguy hiểm. Chất béo trans nhân tạo có thể được tìm thấy trong các món bánh nướng, đồ ăn nhanh và nhiều loại đồ ăn vặt.
                                </p>
                            </div>


                        </div>
                    </div>
                </div>
                <NutritientsIntake />
            </div>
            <div onClick={() => navigate("/expert")} className='bg-white'>
                <img style={{ float: 'right', width: "87px", fontSize: "70px", marginRight: "-18%", position: "fixed", top: "70%", left: "93.3%" }} src={bot} alt=""  />
            </div>
        </div>





    )
}

export default Nutriton