import React, { useEffect, useState } from 'react'
//import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
//import Footer from '../components/Footer'

import home1 from "../images/anhhome1.jpg"
import home2 from "../images/anhhome2.jpg"
import home3 from "../images/anhhome4.jpg"
import anlanhmanh from "../images/anhlanhmanh.jpg"
import anduchat from "../images/anhduchat.png"
import andungthoidiem from "../images/andungthoidiem.jpg"
//import axios from 'axios'
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
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 w-4/5 m-auto transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        
        {/* Card 1 - Tập luyện hiệu quả */}
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full">
          <div className="h-64 overflow-hidden relative">
            <img 
              src={home1} 
              alt="Tập luyện hiệu quả" 
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            />
            {/* Lớp phủ mờ nhẹ để ảnh trông sâu hơn */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
          </div>
          <div className='p-6 flex-1 flex flex-col'>
            <h1 className='text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600'>
              Tập luyện hiệu quả
            </h1>
            <ul className="space-y-3 text-gray-600 text-sm flex-1">
              <li className="flex items-start gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                <span>•</span> Lắng nghe cơ thể
              </li>
              <li className="flex items-start gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                <span>•</span> Khởi động kĩ trước khi tập
              </li>
              <li className="flex items-start gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                <span>•</span> Giãn cơ sau khi tập
              </li>
              <li className="flex items-start gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                <span>•</span> Bổ sung đầy đủ nước và điện giải
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2 - Kiên trì và nhất quán */}
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full">
          <div className="h-64 overflow-hidden relative">
            <img 
              src={home2}
              alt="Kiên trì và nhất quán" 
              className="w-full h-full object-cover object-[60%_35%] transition-transform duration-700 group-hover:scale-110"
            />
             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
          </div>
          <div className='p-6 flex-1 flex flex-col'>
            <h1 className='text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600'>
              Kiên trì & Nhất quán
            </h1>
            <ul className="space-y-3 text-gray-600 text-sm flex-1">
              <li className="flex items-start gap-2 hover:text-green-500 transition-colors cursor-pointer">
                <span>•</span> Đặt mục tiêu rõ ràng, cụ thể
              </li>
              <li className="flex items-start gap-2 hover:text-green-500 transition-colors cursor-pointer">
                <span>•</span> Tập vừa sức, chuẩn kỹ thuật
              </li>
              <li className="flex items-start gap-2 hover:text-green-500 transition-colors cursor-pointer">
                <span>•</span> Không cần nhiều, chỉ cần đều
              </li>
              <li className="flex items-start gap-2 hover:text-green-500 transition-colors cursor-pointer">
                <span>•</span> Linh hoạt trong tập luyện
              </li>
            </ul>
          </div>
        </div>

        {/* Card 3 - Kết nối và học hỏi */}
        <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full">
          <div className="h-64 overflow-hidden relative">
            <img 
              src={home3} 
              alt="Kết nối và học hỏi" 
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            />
             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
          </div>
          <div className='p-6 flex-1 flex flex-col'>
            <h1 className='text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600'>
              Kết nối và học hỏi
            </h1>
            <ul className="space-y-3 text-gray-600 text-sm flex-1">
              <li className="flex items-start gap-2 hover:text-purple-500 transition-colors cursor-pointer">
                <span>•</span> Học hỏi từ các HLV chuyên nghiệp
              </li>
              <li className="flex items-start gap-2 hover:text-purple-500 transition-colors cursor-pointer">
                <span>•</span> Tập luyện là hành trình dài
              </li>
              <li className="flex items-start gap-2 hover:text-purple-500 transition-colors cursor-pointer">
                <span>•</span> Xây dựng mối quan hệ chất lượng
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Nutrition section với staggered animation */}
      <div className='py-16'> {/* Thêm padding dọc cho thoáng */}
        <div className="text-center mb-12">
          <h1 className='font-black text-3xl md:text-4xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500'>
            Chế độ dinh dưỡng đi kèm
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300'>
            Không nên chỉ đếm calo mà còn phải chú trọng đến dinh dưỡng tổng thể.
          </p>
        </div>
        
        {/* Grid Layout thay cho Flex cũ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-4/5 m-auto">
          
          {/* Nutrition Card 1 - Ăn uống lành mạnh */}
          <div className='group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full border border-gray-100'>
            <div className="h-64 overflow-hidden relative">
              <img 
                className='w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110' 
                src={anlanhmanh}
                alt="Ăn uống lành mạnh" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-md">
                Healthy Eating
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className='font-bold text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'>
                Ăn uống phù hợp mục tiêu
              </h3>
              <ul className="space-y-3 text-gray-600 text-sm flex-1">
                <li className="flex items-start gap-2 hover:text-orange-500 transition-colors cursor-pointer">
                  <span className="text-orange-500">🥗</span> Giảm mỡ → Thâm hụt calo
                </li>
                <li className="flex items-start gap-2 hover:text-orange-500 transition-colors cursor-pointer">
                  <span className="text-orange-500">💪</span> Tăng cơ → Dư calo nhẹ + Protein
                </li>
                <li className="flex items-start gap-2 hover:text-orange-500 transition-colors cursor-pointer">
                  <span className="text-orange-500">⚖️</span> Giữ dáng → Calo duy trì
                </li>
              </ul>
            </div>
          </div>

          {/* Nutrition Card 2 - Đủ chất */}
          <div className='group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full border border-gray-100'>
            <div className="h-64 overflow-hidden relative">
              <img 
                className='w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110' 
                src={anduchat}
                alt="Đảm bảo đủ dinh dưỡng" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-md">
                Macro-nutrients
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className='font-bold text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500'>
                Đảm bảo đủ 3 nhóm chất
              </h3>
              <ul className="space-y-3 text-gray-600 text-sm flex-1">
                <li className="flex items-start gap-2 hover:text-green-500 transition-colors cursor-pointer">
                  <span className="text-green-500">🍞</span> Carb: Năng lượng tập luyện
                </li>
                <li className="flex items-start gap-2 hover:text-green-500 transition-colors cursor-pointer">
                  <span className="text-green-500">🥩</span> Protein: Xây dựng cơ bắp
                </li>
                <li className="flex items-start gap-2 hover:text-green-500 transition-colors cursor-pointer">
                  <span className="text-green-500">🥑</span> Fat: Tốt cho não & hormone
                </li>
              </ul>
            </div>
          </div>

          {/* Nutrition Card 3 - Đúng thời điểm */}
          <div className='group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full border border-gray-100'>
            <div className="h-64 overflow-hidden relative">
              <img 
                className='w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110' 
                src={andungthoidiem} 
                alt="Ăn đúng thời điểm" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              <div className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-md">
                Timing
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className='font-bold text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500'>
                Ăn đúng thời điểm
              </h3>
              <ul className="space-y-3 text-gray-600 text-sm flex-1">
                <li className="flex items-start gap-2 hover:text-purple-500 transition-colors cursor-pointer">
                  <span className="text-purple-500">⚡</span> Trước tập (1-2h): Nạp năng lượng
                </li>
                <li className="flex items-start gap-2 hover:text-purple-500 transition-colors cursor-pointer">
                  <span className="text-purple-500">🔋</span> Sau tập (30p): Phục hồi cơ
                </li>
                <li className="flex items-start gap-2 hover:text-purple-500 transition-colors cursor-pointer">
                  <span className="text-purple-500">🍽️</span> Bữa khác: Ăn theo nhu cầu
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