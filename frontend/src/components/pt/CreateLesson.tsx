// src/components/pt/CreateLesson.tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';

// Định nghĩa Props để nhận hàm đóng từ cha
interface CreateLessonProps {
  onClose: () => void;      // Hàm để đóng modal
  onSuccess: () => void;    // Hàm để báo cho cha biết là đã thêm xong (để load lại list)
}

function CreateLesson({ onClose, onSuccess }: CreateLessonProps) {
  const [formData, setFormData] = useState({
    tieu_de: '',
    tom_tat: '',
    noi_dung: '',
    hinh_anh: '',
    loai: 'coban',
    do_kho: 'de',
    thoi_gian_doc: 5
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('https://vietlife-fitness-website-host.onrender.com/lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Đã gửi bài thành công!");
        onSuccess(); // Báo cho cha biết để load lại dữ liệu
        onClose();   // Tự đóng modal
      } else {
        toast.error("Gửi thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // LỚP NỀN MỜ (Overlay)
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      
      {/* KHUNG MODAL */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fadeIn">
        
        {/* Nút Đóng (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold transition-colors"
        >
          &times;
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-teal-700 flex items-center gap-2">
            📝 Soạn Bài Học Mới
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Hàng 1: Tiêu đề & Thời gian đọc */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-bold mb-2">Tiêu đề bài học</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
                  value={formData.tieu_de}
                  onChange={e => setFormData({...formData, tieu_de: e.target.value})}
                  required
                  placeholder="Ví dụ: Cách tính Calo giảm cân..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Phút đọc</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 p-3 rounded-lg"
                  value={formData.thoi_gian_doc}
                  onChange={e => setFormData({...formData, thoi_gian_doc: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Hàng 2: Tóm tắt */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">Tóm tắt ngắn</label>
              <textarea 
                className="w-full border border-gray-300 p-3 rounded-lg h-20 focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.tom_tat}
                onChange={e => setFormData({...formData, tom_tat: e.target.value})}
                required
              />
            </div>

            {/* Hàng 3: Loại, Độ khó, Link ảnh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block font-bold mb-2">Loại bài</label>
                  <select 
                    className="w-full border p-3 rounded-lg"
                    value={formData.loai}
                    onChange={e => setFormData({...formData, loai: e.target.value})}
                  >
                    <option value="coban">📚 Cơ bản</option>
                    <option value="tapluyen">💪 Tập luyện</option>
                  </select>
               </div>
               <div>
                  <label className="block font-bold mb-2">Độ khó</label>
                  <select 
                    className="w-full border p-3 rounded-lg"
                    value={formData.do_kho}
                    onChange={e => setFormData({...formData, do_kho: e.target.value as any})}
                  >
                    <option value="de">🟢 Dễ</option>
                    <option value="trung-binh">🟡 Trung bình</option>
                    <option value="kho">🔴 Khó</option>
                  </select>
               </div>
               <div>
                 <label className="block font-bold mb-2">Link Ảnh (URL)</label>
                 <input 
                    type="text"
                    className="w-full border p-3 rounded-lg"
                    placeholder="https://..."
                    value={formData.hinh_anh}
                    onChange={e => setFormData({...formData, hinh_anh: e.target.value})}
                 />
               </div>
            </div>

            {/* Nội dung Markdown */}
            <div>
              <div className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded">
                <label className="font-bold text-gray-700">Nội dung chi tiết</label>
                <button 
                  type="button" 
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-teal-600 font-bold hover:underline"
                >
                  {previewMode ? '✏️ Quay lại soạn thảo' : '👁️ Xem trước giao diện'}
                </button>
              </div>
              
              {previewMode ? (
                <div className="prose max-w-none border p-4 rounded-lg bg-gray-50 min-h-[300px] max-h-[400px] overflow-y-auto">
                  <ReactMarkdown>{formData.noi_dung}</ReactMarkdown>
                </div>
              ) : (
                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-lg h-80 font-mono focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="# Tiêu đề lớn&#10;&#10;Nội dung bài viết..."
                  value={formData.noi_dung}
                  onChange={e => setFormData({...formData, noi_dung: e.target.value})}
                  required
                />
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
              >
                {isSubmitting ? 'Đang gửi...' : '🚀 Đăng bài ngay'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateLesson;