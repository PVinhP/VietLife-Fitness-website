import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// --- 1. ĐỊNH NGHĨA DỮ LIỆU GIẢ (MOCK DATA) ---
// Đây là dữ liệu giả lập được lấy từ Database (kết hợp bảng Photos + Body Logs)
const MOCK_HISTORY = [
  { 
    id: 1, 
    date: '2025-10-01', 
    label: 'Bắt đầu (Tuần 1)',
    weight: 75.5, 
    waist: 88.0, 
    chest: 94.0,
    photos: {
      front: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop', // Ảnh minh họa
      side: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=300&auto=format&fit=crop',
      back: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=300&auto=format&fit=crop'
    }
  },
  { 
    id: 2, 
    date: '2025-11-01', 
    label: 'Sau 1 tháng (Tuần 4)',
    weight: 73.2, 
    waist: 86.0, 
    chest: 95.0,
    photos: {
      front: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=300&auto=format&fit=crop',
      side: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop',
      back: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=300&auto=format&fit=crop'
    }
  },
  { 
    id: 3, 
    date: '2025-12-01', 
    label: 'Hiện tại (Tuần 8)',
    weight: 70.5, 
    waist: 82.5, 
    chest: 96.5,
    photos: {
      front: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=300&auto=format&fit=crop',
      side: 'https://images.unsplash.com/photo-1605296867304-6f2b46281fff?q=80&w=300&auto=format&fit=crop',
      back: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop'
    }
  }
];

export const CheckInPhotos: React.FC = () => {
  // --- STATE QUẢN LÝ TAB ---
  const [activeTab, setActiveTab] = useState<'upload' | 'compare'>('upload');

  // --- STATE CHO PHẦN SO SÁNH ---
  const [angle, setAngle] = useState<'front' | 'side' | 'back'>('front');
  // Mặc định chọn 2 mốc xa nhất để so sánh
  const [dateLeft, setDateLeft] = useState<number>(MOCK_HISTORY[0].id);
  const [dateRight, setDateRight] = useState<number>(MOCK_HISTORY[MOCK_HISTORY.length - 1].id);

  // --- STATE CHO PHẦN UPLOAD (GIỮ NGUYÊN CODE CŨ) ---
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<{front: File | null; side: File | null; back: File | null;}>({ front: null, side: null, back: null });
  const [previews, setPreviews] = useState<{front: string | null; side: string | null; back: string | null;}>({ front: null, side: null, back: null });

  // --- LOGIC XỬ LÝ UPLOAD (GIỮ NGUYÊN) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'side' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleUpload = async () => {
    if (!files.front && !files.side && !files.back) {
      toast.warning("⚠️ Chọn ít nhất 1 ảnh!", { position: "top-center" });
      return;
    }
    setIsUploading(true);
    setTimeout(() => { // Giả lập gọi API
        setIsUploading(false);
        toast.success("📸 Check-in thành công!", { position: "top-center" });
        setFiles({ front: null, side: null, back: null });
        setPreviews({ front: null, side: null, back: null });
        setActiveTab('compare'); // Upload xong tự chuyển sang tab so sánh
    }, 1500);
  };

  // --- HELPER: TÌM DATA THEO ID ---
  const getRecord = (id: number) => MOCK_HISTORY.find(r => r.id === Number(id));
  const leftRecord = getRecord(dateLeft);
  const rightRecord = getRecord(dateRight);

  // --- HELPER: TÍNH TOÁN SỰ THAY ĐỔI ---
  const renderDiff = (val1: number, val2: number, unit: string, inverse = false) => {
    const diff = val2 - val1;
    if (diff === 0) return <span className="text-gray-400 font-medium">-</span>;
    
    // Logic màu: Giảm cân/eo là tốt (Xanh), Tăng là đỏ (Trừ khi inverse=true như Vòng ngực tăng là tốt)
    let isGood = diff < 0; 
    if (inverse) isGood = diff > 0; // Với ngực, tăng mới là tốt

    return (
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit}
      </span>
    );
  };

  // --- RENDER GIAO DIỆN UPLOAD (CODE CŨ GÓI GỌN) ---
  const renderUploadTab = () => (
    <div className="animate-fade-in">
        <div className="grid grid-cols-3 gap-3 mb-6">
            {(['front', 'side', 'back'] as const).map(type => (
                <div key={type} className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase text-center">
                        {type === 'front' ? 'Trước' : type === 'side' ? 'Nghiêng' : 'Sau'}
                    </span>
                    <label className={`group relative w-full aspect-[3/4] rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${previews[type] ? 'border-indigo-500 bg-gray-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, type)} />
                        {previews[type] ? (
                            <img src={previews[type]!} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                        )}
                    </label>
                </div>
            ))}
        </div>
        <button onClick={handleUpload} disabled={isUploading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2">
            {isUploading ? 'Đang tải lên...' : 'Lưu ảnh hôm nay'}
        </button>
    </div>
  );

  // --- RENDER GIAO DIỆN SO SÁNH (MỚI) ---
  const renderCompareTab = () => {
    if (!leftRecord || !rightRecord) return null;

    return (
        <div className="animate-fade-in">
            {/* 1. THANH ĐIỀU KHIỂN */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {/* Chọn Góc chụp */}
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Góc hiển thị</label>
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                        {(['front', 'side', 'back'] as const).map(a => (
                            <button 
                                key={a} 
                                onClick={() => setAngle(a)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${angle === a ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                {a === 'front' ? 'Mặt trước' : a === 'side' ? 'Nghiêng' : 'Mặt sau'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chọn Ngày so sánh */}
                <div className="flex-[2] grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ảnh Trái (Trước)</label>
                        <select 
                            value={dateLeft} 
                            onChange={(e) => setDateLeft(Number(e.target.value))}
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                        >
                            {MOCK_HISTORY.map(h => <option key={h.id} value={h.id}>{h.date} - {h.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ảnh Phải (Sau)</label>
                        <select 
                            value={dateRight} 
                            onChange={(e) => setDateRight(Number(e.target.value))}
                            className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                        >
                            {MOCK_HISTORY.map(h => <option key={h.id} value={h.id}>{h.date} - {h.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. KHUNG ẢNH SO SÁNH */}
            <div className="grid grid-cols-2 gap-1 mb-6 relative">
                {/* Ảnh Trái */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-l-xl overflow-hidden group">
                    <img src={leftRecord.photos[angle]} alt="Before" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {leftRecord.date}
                    </div>
                </div>
                
                {/* Ảnh Phải */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-r-xl overflow-hidden group">
                    <img src={rightRecord.photos[angle]} alt="After" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded backdrop-blur-sm shadow-lg">
                        {rightRecord.date}
                    </div>
                </div>

                {/* Badge VS ở giữa */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-xl border border-gray-100 z-10">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">VS</div>
                </div>
            </div>

            {/* 3. BẢNG SO SÁNH SỐ LIỆU (THE MAGIC IS HERE) */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Chỉ số</th>
                            <th className="px-4 py-3 text-right">{leftRecord.date}</th>
                            <th className="px-4 py-3 text-right">{rightRecord.date}</th>
                            <th className="px-4 py-3 text-right">Thay đổi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-800">⚖️ Cân nặng</td>
                            <td className="px-4 py-3 text-right text-gray-600">{leftRecord.weight}kg</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-800">{rightRecord.weight}kg</td>
                            <td className="px-4 py-3 text-right">{renderDiff(leftRecord.weight, rightRecord.weight, 'kg')}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-800">📏 Vòng eo</td>
                            <td className="px-4 py-3 text-right text-gray-600">{leftRecord.waist}cm</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-800">{rightRecord.waist}cm</td>
                            <td className="px-4 py-3 text-right">{renderDiff(leftRecord.waist, rightRecord.waist, 'cm')}</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-800">💪 Vòng ngực</td>
                            <td className="px-4 py-3 text-right text-gray-600">{leftRecord.chest}cm</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-800">{rightRecord.chest}cm</td>
                            <td className="px-4 py-3 text-right">{renderDiff(leftRecord.chest, rightRecord.chest, 'cm', true)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📸 Ảnh Check-in & So sánh
            </h2>
            <p className="text-sm text-gray-500 mt-1">Theo dõi sự thay đổi hình thể trực quan</p>
        </div>
        
        {/* TAB SWITCHER */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <span>⬆️ Upload Mới</span>
            </button>
            <button 
                onClick={() => setActiveTab('compare')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'compare' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <span>⚔️ So sánh</span>
            </button>
        </div>
      </div>

      {activeTab === 'upload' ? renderUploadTab() : renderCompareTab()}
    </div>
  );
};