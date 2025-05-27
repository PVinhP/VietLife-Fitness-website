import React, { useEffect, useState } from 'react'
//import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
//import Footer from '../components/Footer'

//import bot from "../images/chatbot.png"
//import { useNavigate } from 'react-router-dom'

function Home() {
const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="bg-gray-100">
      <Banner />
      {/* Main content với fade-in animation */}
      <div className={`flex flex-col md:flex-row sm:flex-row w-4/5 m-auto gap-5 transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Card 1 - Tập luyện hiệu quả */}
        <div className="group hover:scale-105 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
          <div className="overflow-hidden rounded-lg">
            <img 
              src="https://cdn-images.cure.fit/www-curefit-com/image/upload/c_fill,w_404,q_auto:eco,dpr_2,f_auto,fl_progressive//image/test/introducting-cult-pass/icp_cb.png" 
              alt="Tập luyện hiệu quả" 
              className="transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className='text-gray-800 lg:text-left md:text-center sm:text-center p-4 bg-white rounded-b-lg shadow-md'>
            <h1 className='text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600'>
              Tập luyện hiệu quả
            </h1>
            <ul className="space-y-2">
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-blue-500 cursor-pointer">
                • Lắng nghe cơ thể
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-blue-500 cursor-pointer">
                • Khởi động kĩ trước khi tập
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-blue-500 cursor-pointer">
                • Giãn cơ sau khi tập
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-blue-500 cursor-pointer">
                • Bổ sung đầy đủ nước và điện giải
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2 - Kiên trì và nhất quán */}
        <div className="group hover:scale-105 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
          <div className="overflow-hidden rounded-lg">
            <img 
              src="https://cdn-images.cure.fit/www-curefit-com/image/upload/c_fill,w_404,q_auto:eco,dpr_2,f_auto,fl_progressive//image/test/introducting-cult-pass/icp_cg.png" 
              alt="Kiên trì và nhất quán" 
              className="transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className='text-gray-800 lg:text-left md:text-center sm:text-center p-4 bg-white rounded-b-lg shadow-md'>
            <h1 className='text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600'>
              Kiên trì và nhất quán với mục tiêu
            </h1>
            <ul className="space-y-2">
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-green-500 cursor-pointer">
                • Đặt mục tiêu rõ ràng và cụ thể
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-green-500 cursor-pointer">
                • Tập luyện vừa sức và chú ý kỹ thuật để tránh chấn thương
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-green-500 cursor-pointer">
                • Không cần tập quá nhiều, chỉ cần đúng và đều.
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-green-500 cursor-pointer">
                • Linh hoạt trong tập luyện
              </li>
            </ul>
          </div>
        </div>

        {/* Card 3 - Kết nối và học hỏi */}
        <div className="group hover:scale-105 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
          <div className="overflow-hidden rounded-lg">
            <img 
              src="https://cdn-images.cure.fit/www-curefit-com/image/upload/c_fill,w_404,q_auto:eco,dpr_2,f_auto,fl_progressive//image/test/introducting-cult-pass/icp_cl.png" 
              alt="Kết nối và học hỏi" 
              className="transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className='text-gray-800 lg:text-left md:text-center sm:text-center p-4 bg-white rounded-b-lg shadow-md'>
            <h1 className='text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600'>
              Kết nối và học hỏi
            </h1>
            <ul className="space-y-2">
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-purple-500 cursor-pointer">
                • Xem nhiều video tập luyện, học hỏi từ các huấn luyện viên
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-purple-500 cursor-pointer">
                • Tập luyện là hành trình, không phải cuộc đua
              </li>
              <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-purple-500 cursor-pointer">
                • Xây dựng các mối quan hệ chất lượng
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nutrition section với staggered animation */}
      <div className='text-gray-800 text-center m-5'>
        <div>
          <h1 className='font-bold text-2xl m-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500'>
            Chế độ dinh dưỡng đi kèm
          </h1>
        </div>
        <p className='m-4 text-lg opacity-90 hover:opacity-100 transition-opacity duration-300'>
          Không nên chỉ đếm calo mà còn phải chú trọng đến dinh dưỡng tổng thể.
        </p>
        
        <div className='flex flex-col md:flex-row sm:flex-row' style={{ justifyContent: "space-around" }}>
          {/* Nutrition Card 1 */}
          <div className='lg:w-1/2 text-left mt-5 md:w-full sm:w-full group hover:scale-105 transition-all duration-500 transform hover:-translate-y-2'>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                className='w-2/3 block m-auto transition-transform duration-700 group-hover:scale-110 hover:brightness-110' 
                src="https://images.pexels.com/photos/5967852/pexels-photo-5967852.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Ăn uống lành mạnh" 
              />
            </div>
            <div className="bg-white p-4 rounded-b-lg shadow-md">
              <p className='m-5 font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'>
                Ăn uống phù hợp mục tiêu & Chọn những thực phẩm lành mạnh
              </p>
              <ul className="space-y-2">
                <li className="transform transition-all duration-300 hover

:translate-x-2 hover:text-orange-500 cursor-pointer">
                  Giảm mỡ → Thâm hụt calo
                </li>
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-orange-500 cursor-pointer">
                  Tăng cơ → Ăn dư calo nhẹ + đủ protein
                </li>
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-orange-500 cursor-pointer">
                  Giữ vóc dáng → Ăn duy trì calo
                </li>
              </ul>
            </div>
          </div>
          {/* Nutrition Card 2 */}
          <div className='lg:w-1/2 text-left mt-5 md:w-full sm:w-full group hover:scale-105 transition-all duration-500 transform hover:-translate-y-2'>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                className='w-2/3 block m-auto transition-transform duration-700 group-hover:scale-110 hover:brightness-110' 
                src="https://images.pexels.com/photos/4050990/pexels-photo-4050990.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Đảm bảo đủ dinh dưỡng" 
              />
            </div>
            <div className="bg-white p-4 rounded-b-lg shadow-md">
              <p className='m-5 font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500'>
                Đảm bảo đủ 3 nhóm chất chính & ưu tiên Protein
              </p>
              <ul className="space-y-2">
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-green-500 cursor-pointer">
                  Carbohydrate: Năng lượng khi tập. Ưu tiên thực phẩm GI,GL thấp
                </li>
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-green-500 cursor-pointer">
                  Protein: Phục hồi và xây dựng cơ bắp
                </li>
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-green-500 cursor-pointer">
                  Chất béo: Nguyên liệu cho Hormone, Giúp hấp thu vitamin, cần thiết cho não bộ và thần kinh
                </li>
              </ul>
            </div>
          </div>
          {/* Nutrition Card 3 */}
          <div className='lg:w-1/2 text-left mt-5 md:w-full sm:w-full group hover:scale-105 transition-all duration-500 transform hover:-translate-y-2'>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                className='w-2/3 block m-auto transition-transform duration-700 group-hover:scale-110 hover:brightness-110' 
                src="https://images.pexels.com/photos/4374580/pexels-photo-4374580.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Ăn đúng thời điểm" 
              />
            </div>
            <div className="bg-white p-4 rounded-b-lg shadow-md">
              <p className='m-5 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500'>
                Ăn đúng thời điểm – đặc biệt là trước và sau tập
              </p>
              <ul className="space-y-2">
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-purple-500 cursor-pointer">
                  Trước khi tập (1–2 giờ): Nạp năng lượng, tăng hiệu quả tập luyện
                </li>
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-purple-500 cursor-pointer">
                  Sau khi tập (30 phút): Phục hồi cơ bắp, hạn chế mất cơ, bù glycogen
                </li>
                <li className="transform transition-all duration-300 hover:translate-x-2 hover:text-purple-500 cursor-pointer">
                  Thời điểm khác: Ăn theo nhu cầu cá nhân, không cần quá khắt khe
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Device sync section với floating animation */}
      <div className="relative bg-white">
        <div className="relative z-10">
          <h1 className='text-2xl m-4 text-gray-900 font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600'>
            Kết nối với ứng dụng Strava
          </h1>
          <div className='w-full m-auto group'>
            <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer">
              <img 
                className='w-10/12 m-auto transition-all duration-1000 transform group-hover:scale-105 hover:drop-shadow-2xl hover:animate-pulse' 
                src="https://cdn1.cronometer.com/webflow/cronometer-devices-3-p-1080.png" 
                alt="Kết nối Strava" 
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home