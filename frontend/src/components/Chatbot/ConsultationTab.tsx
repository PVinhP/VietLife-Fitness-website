import React, { useState, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu cho TypeScript
interface ConsultationRequest {
  id: number;
  title: string;
  question: string;
  response?: string;
  status: 'pending' | 'answered' | 'rejected';
  created_at: string;
}

interface Props {
  userId: number | null;
  token: string | null;
}

const API_BASE_URL = 'http://localhost:8080/api/consultant';

const ConsultationTab: React.FC<Props> = ({ userId, token }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State form
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    image_url: ''
  });

  // Load danh sách yêu cầu
  useEffect(() => {
    if (userId) fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Nếu có token thì gửi header, không thì gửi query param (tuỳ backend bạn xử lý)
      const res = await fetch(`${API_BASE_URL}?userId=${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return alert("Bạn cần đăng nhập!");

    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...formData, userId })
      });
      
      if (res.ok) {
        alert("Gửi thành công!");
        setFormData({ title: '', question: '', image_url: '' });
        setView('list');
        fetchRequests();
      }
    } catch (err) {
      alert("Lỗi khi gửi yêu cầu");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      
      {/* Header Điều hướng */}
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700">
          {view === 'list' ? 'Lịch sử tư vấn' : 'Tạo yêu cầu mới'}
        </h3>
        <button 
          onClick={() => setView(view === 'list' ? 'create' : 'list')}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {view === 'list' ? '+ Gửi câu hỏi' : '← Quay lại'}
        </button>
      </div>

      {/* VIEW 1: DANH SÁCH */}
      {view === 'list' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && <div className="text-center text-gray-500 mt-4">Đang tải...</div>}
          
          {!isLoading && requests.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-4xl mb-2">📬</p>
              <p>Chưa có câu hỏi nào.</p>
              <p className="text-sm">Hãy gửi yêu cầu để HLV hỗ trợ bạn!</p>
            </div>
          )}

          {requests.map((req) => (
            <div key={req.id} className={`p-3 rounded-lg border ${req.status === 'answered' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-gray-800 line-clamp-1">{req.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  req.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {req.status === 'answered' ? 'Đã trả lời' : 'Đang chờ'}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-2 line-clamp-3">{req.question}</p>
              
              {req.status === 'answered' && req.response && (
                <div className="mt-2 pt-2 border-t border-green-200 text-xs bg-white/50 p-2 rounded">
                  <span className="font-bold text-green-800">👨‍🏫 HLV:</span> {req.response}
                </div>
              )}
              
              <div className="text-[10px] text-gray-400 mt-2 text-right">
                {new Date(req.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: FORM TẠO MỚI */}
      {view === 'create' && (
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tiêu đề</label>
              <input 
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="Vd: Đau lưng khi Squat..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung câu hỏi</label>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-md text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-black"
                placeholder="Mô tả chi tiết vấn đề của bạn..."
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Link ảnh (Google Drive/Imgur)</label>
              <input 
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black "
                placeholder="https://..."
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors mt-2"
            >
              Gửi yêu cầu tư vấn
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ConsultationTab;