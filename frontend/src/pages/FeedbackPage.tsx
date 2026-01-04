import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import VinhDepTrai from "../images/VinhDepTrai.jpg";
const FeedbackPage: React.FC = () => {
  // 1. State quản lý dữ liệu form
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    topic: 'Góp ý tính năng',
    content: ''
  });

  // 2. Hàm xử lý khi bấm Gửi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn load lại trang

    // Validate dữ liệu
    if (!form.full_name || !form.content || !form.email) {
      return alert("Vui lòng nhập tên, email và nội dung!");
    }

    setIsLoading(true);

    // --- CẤU HÌNH EMAILJS (Thay mã của bạn vào đây) ---
    const serviceID = 'service_nl23n1o';   // Ví dụ: service_xyz...
    const templateID = 'template_ude749a'; // Ví dụ: template_abc... (Contact Us)
    const publicKey = '8BoYmIdO9Z4S3BrcU';   // Ví dụ: Wz8_...

    // Dữ liệu gửi đi (Phải khớp với biến {{...}} trong Template ảnh bạn gửi)
    const templateParams = {
      full_name: form.full_name, // Khớp với {{full_name}}
      email: form.email,         // Khớp với {{email}}
      topic: form.topic,         // Khớp với {{topic}}
      content: form.content,     // Khớp với {{content}}
      // Mẹo: Gửi thêm biến 'name' phòng trường hợp bạn quên sửa 'From Name' trong dashboard
      name: form.full_name       
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        alert("Đã gửi góp ý thành công! Cảm ơn bạn.");
        // Reset form về rỗng
        setForm({ full_name: '', email: '', topic: 'Góp ý tính năng', content: '' });
      })
      .catch((err) => {
        console.error('FAILED...', err);
        alert("Gửi thất bại. Vui lòng kiểm tra lại kết nối.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Container chính */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Phần Header trang trí */}
        <div className="h-40 bg-gradient-to-r from-teal-500 to-emerald-600 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute bottom-4 left-8 text-white">
            <h1 className="text-3xl font-bold drop-shadow-md">Liên hệ & Góp ý</h1>
            <p className="text-teal-100 text-sm mt-1">Chúng tôi luôn lắng nghe để hoàn thiện hơn mỗi ngày</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          
          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
          <div className="md:w-1/3 bg-gray-50 p-8 text-center border-r border-gray-100">
            <div className="-mt-20 mb-6 relative inline-block">
              <img 
                src={VinhDepTrai} 
                alt="Developer Avatar" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
              />
              <span className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 border-2 border-white rounded-full"></span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">Phạm Phú Vinh</h2>
            <p className="text-teal-600 font-medium mb-6">Founder & Fullstack Developer</p>

            {/* Thông tin liên hệ */}
            <div className="space-y-4 text-left bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 text-gray-600">
                <span className="bg-teal-50 p-2 rounded-full text-teal-600">📧</span>
                <span className="text-sm">vinhpham753951@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="bg-blue-50 p-2 rounded-full text-blue-600">📞</span>
                <span className="text-sm">0987 228 178</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="bg-purple-50 p-2 rounded-full text-purple-600">📍</span>
                <span className="text-sm">TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>

            {/* Mạng xã hội */}
            <div className="mt-8 flex justify-center gap-4">
              <a 
                href="https://www.facebook.com/pham.phu.vinh.220432/" 
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md font-medium text-sm flex items-center"
              >
                Facebook
              </a>
              <a 
                href="https://zalo.me/0987228178" 
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition shadow-md font-medium text-sm flex items-center"
              >
                Zalo
              </a>
              <a 
                href="https://github.com/PVinhP" 
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-900 transition shadow-md font-medium text-sm flex items-center"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* CỘT PHẢI: FORM GỬI PHẢN HỒI (Đã gắn logic) */}
          <div className="md:w-2/3 p-8 md:p-12">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-teal-500">✍️</span> Gửi ý kiến cho tôi
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-black" 
                    placeholder="Nhập tên của bạn"
                    value={form.full_name}
                    onChange={e => setForm({...form, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-black" 
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-black">Chủ đề</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-black"
                  value={form.topic}
                  onChange={e => setForm({...form, topic: e.target.value})}
                >
                  <option>Góp ý tính năng</option>
                  <option>Báo lỗi hệ thống</option>
                  <option>Liên hệ hợp tác</option>
                  <option>Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea 
                  rows={5} 
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition resize-none text-black" 
                  placeholder="Chia sẻ ý kiến của bạn..."
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition transform active:scale-95 ${
                  isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {isLoading ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;