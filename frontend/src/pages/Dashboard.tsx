import React from 'react';
// Bạn có thể import thư viện biểu đồ ở đây, ví dụ: 'recharts' hoặc 'chart.js'
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Dữ liệu mẫu cho biểu đồ
const weightData = [
  { name: 'Tuần 1', kg: 85 },
  { name: 'Tuần 2', kg: 84.5 },
  { name: 'Tuần 3', kg: 84 },
  { name: 'Tuần 4', kg: 83 },
];

const Dashboard = () => {
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Chào mừng trở lại, Đình Lực!
      </h1>

      {/* Container layout chính: 1 cột trên di động, 2 cột trên desktop */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Cột chính (bên trái) */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* 1. Widget "Hôm nay" */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Thứ Ba, ngày 11/11</h2>
            
            {/* Phần Luyện tập */}
            <div>
              <p className="text-gray-500">Buổi tập hôm nay:</p>
              <h3 className="text-2xl font-bold text-indigo-600 my-1">Ngực & Tay sau</h3>
              <p className="text-gray-600 mb-4">~45 phút | 5 bài tập</p>
              <button className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-colors">
                Bắt đầu buổi tập
              </button>
            </div>
            
            {/* Phần Dinh dưỡng (Ví dụ) */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Mục tiêu Calo</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: '60%' }} // 1500 / 2500 kcal
                ></div>
              </div>
              <p className="text-right text-sm text-gray-600 mt-1">1500 / 2500 kcal</p>
            </div>
          </div>

          {/* 2. Biểu đồ "Theo dõi Tiến trình" */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Tiến trình của bạn</h2>
              {/* Tabs lọc (placeholder) */}
              <div className="flex gap-2">
                <button className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-1">Cân nặng</button>
                <button className="text-sm font-medium text-gray-400 hover:text-gray-600 pb-1">Vòng eo</button>
                <button className="text-sm font-medium text-gray-400 hover:text-gray-600 pb-1">Vòng ngực</button>
              </div>
            </div>
            
            {/* Khu vực biểu đồ (Placeholder) */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">[Khu vực dành cho Biểu đồ đường (Line Chart)]</p>
              {/* Đây là nơi bạn đặt component biểu đồ, ví dụ:
              <LineChart width={500} height={250} data={weightData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#f5f5f5" />
                <Line type="monotone" dataKey="kg" stroke="#8884d8" />
              </LineChart>
              */}
            </div>
          </div>

          {/* 3. Nhật ký hình ảnh (Placeholder) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Ảnh Check-in</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {/* Ảnh mẫu */}
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">Ảnh 1</div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">Ảnh 2</div>
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">Ảnh 3</div>
              {/* Nút Tải ảnh */}
              <button className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-400">
                <span className="text-2xl">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cột phụ (bên phải) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">

          {/* 1. Widget "Ghi nhanh" */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Ghi nhanh</h2>
            <div className="flex flex-col gap-3">
              <button className="w-full bg-blue-100 text-blue-700 font-semibold py-3 rounded-lg hover:bg-blue-200">
                📝 Nhập cân nặng
              </button>
              <button className="w-full bg-green-100 text-green-700 font-semibold py-3 rounded-lg hover:bg-green-200">
                🍎 Nhập bữa ăn
              </button>
              <button className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200">
                💪 Hoàn thành tập (thủ công)
              </button>
            </div>
          </div>

          {/* 2. Widget "Thành tích & PRs" */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">🏆 Thành tích</h2>
            {/* Huy hiệu (placeholder) */}
            <div className="flex gap-3 mb-4">
              <span className="text-3xl p-2 bg-yellow-100 rounded-full">🔥</span>
              <span className="text-3xl p-2 bg-blue-100 rounded-full">🥇</span>
              <span className="text-3xl p-2 bg-green-100 rounded-full">💯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 Kỷ lục cá nhân (PRs)</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Đẩy ngực: <span className="font-semibold">80kg</span></li>
              <li>Squat: <span className="font-semibold">100kg</span></li>
              <li>Chạy 5km: <span className="font-semibold">25:00</span></li>
            </ul>
          </div>
          
          {/* 3. Widget "Mục tiêu" */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Mục tiêu của tôi</h2>
            <p className="text-gray-500 text-sm">Mục tiêu chính: <span className="font-semibold text-gray-700">Giảm cân</span></p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-3">
              <div 
                className="bg-indigo-500 h-2.5 rounded-full" 
                style={{ width: '50%' }} // (90 - 85) / (90 - 80)
              ></div>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Bắt đầu: 90kg</span>
              <span>Mục tiêu: 80kg</span>
            </div>
            <p className="text-center text-2xl font-bold text-indigo-600 mt-3">Còn 5kg nữa!</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default  Dashboard;