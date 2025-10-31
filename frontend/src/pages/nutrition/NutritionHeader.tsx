// frontend/src/components/nutrition/NutritionHeader.tsx

import React from 'react'
// Đảm bảo đường dẫn này chính xác từ vị trí file mới
import Img5 from "../../Assests/Img5.jpg" 

function NutritionHeader() {
    return (
        <div className="bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-center">
                    
                    {/* --- Phần Nội dung (Trái) --- */}
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:w-1/2 lg:max-w-2xl lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <p className="text-base font-semibold leading-7 text-teal-600">VietLife</p>
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Dinh dưỡng</span>{' '}
                                    <span className="block text-teal-600 xl:inline">Vì sức khỏe</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Một chế độ ăn cân đối cung cấp năng lượng, các chất dinh dưỡng cần thiết cho sự phát triển và phục hồi, giúp bạn khỏe mạnh và phòng ngừa bệnh tật.
                                </p>
                            </div>
                        </main>
                    </div>

                    {/* --- Phần Hình ảnh (Phải) --- */}
                    <div className="lg:w-1/2">
                        <img 
                            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:h-auto lg:w-full" 
                            src={Img5} 
                            alt="Dinh dưỡng" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NutritionHeader;