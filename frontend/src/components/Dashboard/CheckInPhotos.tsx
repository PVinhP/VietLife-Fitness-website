// src/pages/profile/tabs/widgets/CheckInPhotos.tsx

import React from 'react';

// Dữ liệu mẫu (sau này bạn sẽ thay bằng props hoặc state)
const mockPhotos = [
  { id: 1, url: '', alt: 'Ảnh 1' },
  { id: 2, url: '', alt: 'Ảnh 2' },
  { id: 3, url: '', alt: 'Ảnh 3' },
];

export const CheckInPhotos = () => {
  const handleAddPhotoClick = () => {
    // Mở modal hoặc trình chọn file
    alert('Mở trình chọn file ảnh...');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Ảnh Check-in</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        
        {/* Lặp qua các ảnh thật */}
        {mockPhotos.map(photo => (
          <div 
            key={photo.id}
            className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs"
            // Nếu có url, bạn có thể dùng: style={{ backgroundImage: `url(${photo.url})`, backgroundSize: 'cover' }}
          >
            {photo.alt}
          </div>
        ))}

        {/* Nút Tải ảnh */}
        <button 
          onClick={handleAddPhotoClick}
          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          title="Tải lên ảnh mới"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>
    </div>
  );
};