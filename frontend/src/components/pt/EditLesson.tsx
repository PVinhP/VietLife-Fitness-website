// src/components/pt/EditLesson.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';

// Nhận dữ liệu bài cần sửa từ cha
interface EditLessonProps {
  lessonData: any;          // Dữ liệu bài cũ
  onClose: () => void;      // Hàm đóng
  onSuccess: () => void;    // Hàm báo thành công
}

function EditLesson({ lessonData, onClose, onSuccess }: EditLessonProps) {
  // Khởi tạo form với dữ liệu cũ
  const [formData, setFormData] = useState({
    tieu_de: lessonData.tieu_de,
    tom_tat: lessonData.tom_tat,
    noi_dung: lessonData.noi_dung,
    hinh_anh: lessonData.hinh_anh,
    loai: lessonData.loai,
    do_kho: lessonData.do_kho,
    thoi_gian_doc: lessonData.thoi_gian_doc
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Gọi API PUT để cập nhật
      const response = await fetch(`http://localhost:8080/lesson/${lessonData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Đã cập nhật bài học!");
        onSuccess();
        onClose();
      } else {
        toast.error("Cập nhật thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fadeIn">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold">&times;</button>

        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-yellow-600 flex items-center gap-2">
            ✏️ Chỉnh Sửa Bài Học
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tiêu đề & Thời gian */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold mb-2">Tiêu đề</label>
                <input 
                  type="text" className="w-full border p-3 rounded-lg" 
                  value={formData.tieu_de}
                  onChange={e => setFormData({...formData, tieu_de: e.target.value})}
                />
              </div>
              <div>
                <label className="block font-bold mb-2">Phút đọc</label>
                <input 
                  type="number" className="w-full border p-3 rounded-lg"
                  value={formData.thoi_gian_doc}
                  onChange={e => setFormData({...formData, thoi_gian_doc: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Tóm tắt */}
            <div>
              <label className="block font-bold mb-2">Tóm tắt</label>
              <textarea 
                className="w-full border p-3 rounded-lg h-20"
                value={formData.tom_tat}
                onChange={e => setFormData({...formData, tom_tat: e.target.value})}
              />
            </div>

            {/* Link ảnh */}
            <div>
               <label className="block font-bold mb-2">Link Ảnh</label>
               <input 
                  type="text" className="w-full border p-3 rounded-lg"
                  value={formData.hinh_anh}
                  onChange={e => setFormData({...formData, hinh_anh: e.target.value})}
               />
            </div>

            {/* Nội dung */}
            <div>
              <div className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded">
                <label className="font-bold">Nội dung chi tiết</label>
                <button type="button" onClick={() => setPreviewMode(!previewMode)} className="text-teal-600 font-bold">
                  {previewMode ? 'Sửa' : 'Xem trước'}
                </button>
              </div>
              {previewMode ? (
                <div className="prose max-w-none border p-4 rounded-lg bg-gray-50 min-h-[200px]">
                  <ReactMarkdown>{formData.noi_dung}</ReactMarkdown>
                </div>
              ) : (
                <textarea 
                  className="w-full border p-3 rounded-lg h-64 font-mono"
                  value={formData.noi_dung}
                  onChange={e => setFormData({...formData, noi_dung: e.target.value})}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600">
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditLesson;