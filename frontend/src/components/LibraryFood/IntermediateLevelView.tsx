import React from 'react';
import { ChevronRight } from 'lucide-react';

// Đặt trong: frontend/src/pages/nutrition/foodClassification/IntermediateLevelView.tsx

const INTERMEDIATE_GROUPS = [
  {
    parentId: 1,
    parentName: 'Nhóm Tinh Bột',
    icon: '🍞',
    items: [
      { name: 'Ngũ cốc nguyên hạt (Whole grains)', desc: 'Yến mạch, quinoa, gạo lứt', healthy: true },
      { name: 'Ngũ cốc tinh chế (Refined grains)', desc: 'Bánh mì trắng, bún, phở', healthy: false },
      { name: 'Củ giàu tinh bột (Starchy vegetables)', desc: 'Khoai lang, khoai tây', healthy: true },
    ]
  },
  {
    parentId: 2,
    parentName: 'Nhóm Đạm (Protein)',
    icon: '🥩',
    items: [
      { name: 'Thịt đỏ (Red meat)', desc: 'Bò, heo, dê', healthy: 'moderate' },
      { name: 'Thịt trắng (Poultry)', desc: 'Gà, vịt', healthy: true },
      { name: 'Cá & Hải sản', desc: 'Cá hồi, tôm', healthy: true },
      { name: 'Đạm thực vật', desc: 'Đậu phụ, hạt đậu', healthy: true },
      { name: 'Trứng', desc: 'Gà, vịt', healthy: true },
    ]
  },
  {
    parentId: 3,
    parentName: 'Nhóm Chất Béo',
    icon: '🥑',
    items: [
      { name: 'Chất béo tốt (Healthy fats)', desc: 'Olive, bơ, hạt', healthy: true },
      { name: 'Chất béo xấu (Unhealthy fats)', desc: 'Mỡ động vật, đồ chiên', healthy: false },
    ]
  },
  {
    parentId: 4,
    parentName: 'Nhóm Rau',
    icon: '🥦',
    items: [
      { name: 'Rau lá xanh đậm', desc: 'Cải xoăn, rau bina, cải ngọt', healthy: true },
      { name: 'Rau họ thập tự', desc: 'Súp lơ, bông cải xanh', healthy: true },
      { name: 'Rau củ màu', desc: 'Cà rót, ớt chuông, cà chua', healthy: true },
    ]
  },
  {
    parentId: 5,
    parentName: 'Nhóm Trái Cây',
    icon: '🍎',
    items: [
      { name: 'Trái cây tươi', desc: 'Táo, chuối, cam, dâu', healthy: true },
      { name: 'Quả mọng (Berries)', desc: 'Dâu tây, việt quất - giàu chất chống oxi hóa', healthy: true },
      { name: 'Trái cây sấy/đóng hộp', desc: 'Nên hạn chế do đường cao', healthy: 'moderate' },
    ]
  },
  {
    parentId: 6,
    parentName: 'Nhóm Sữa',
    icon: '🥛',
    items: [
      { name: 'Sữa tươi & sữa chua', desc: 'Nguồn canxi tốt', healthy: true },
      { name: 'Phô mai', desc: 'Ăn vừa phải', healthy: 'moderate' },
      { name: 'Sữa thực vật', desc: 'Sữa hạnh nhân, đậu nành', healthy: true },
    ]
  },
];

function IntermediateLevelView() {
  return (
    <div className="animate-fade-in">
      {/* Grid layout cho các nhóm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {INTERMEDIATE_GROUPS.map((group, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl border-2 border-gray-200 shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Header của nhóm */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{group.icon}</span>
                <h3 className="font-bold text-gray-800 text-lg">{group.parentName}</h3>
              </div>
              <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-semibold">
                {group.items.length} loại
              </span>
            </div>

            {/* Danh sách các mục con */}
            <div className="divide-y divide-gray-100">
              {group.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="px-6 py-4 hover:bg-teal-50 transition-colors duration-200 flex items-start justify-between group cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 group-hover:text-teal-700 flex items-center gap-2 mb-1">
                      {item.name}
                      {/* Chỉ thị màu sắc sức khỏe */}
                      {item.healthy === true && (
                        <span 
                          className="w-2.5 h-2.5 rounded-full bg-emerald-500" 
                          title="Khuyên dùng"
                        />
                      )}
                      {item.healthy === false && (
                        <span 
                          className="w-2.5 h-2.5 rounded-full bg-red-500" 
                          title="Hạn chế"
                        />
                      )}
                      {item.healthy === 'moderate' && (
                        <span 
                          className="w-2.5 h-2.5 rounded-full bg-yellow-500" 
                          title="Ăn vừa phải"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <ChevronRight 
                    size={18} 
                    className="text-gray-300 group-hover:text-teal-500 transition-colors shrink-0 mt-1" 
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hướng dẫn chỉ số màu */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          🎨 Ý nghĩa chỉ số màu
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="font-semibold text-emerald-800 text-sm">Khuyên dùng</div>
              <div className="text-xs text-emerald-600">Ưu tiên trong chế độ ăn</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="w-4 h-4 rounded-full bg-yellow-500 shrink-0" />
            <div>
              <div className="font-semibold text-yellow-800 text-sm">Vừa phải</div>
              <div className="text-xs text-yellow-600">Có thể ăn nhưng kiểm soát lượng</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="w-4 h-4 rounded-full bg-red-500 shrink-0" />
            <div>
              <div className="font-semibold text-red-800 text-sm">Hạn chế</div>
              <div className="text-xs text-red-600">Nên tránh hoặc giảm thiểu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gợi ý thực tế */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-teal-200">
        <h5 className="font-bold text-teal-800 mb-3">💪 Gợi ý cho người tập gym</h5>
        <ul className="space-y-2 text-teal-700 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-teal-500 mt-0.5">✓</span>
            <span>Ưu tiên <strong>ngũ cốc nguyên hạt</strong> thay vì tinh chế để giữ năng lượng ổn định</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500 mt-0.5">✓</span>
            <span>Chọn <strong>thịt trắng, cá và đạm thực vật</strong> để giảm mỡ, tăng cơ hiệu quả</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500 mt-0.5">✓</span>
            <span>Sử dụng <strong>chất béo tốt</strong> (dầu ô liu, bơ, hạt) thay vì mỡ động vật</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default IntermediateLevelView;