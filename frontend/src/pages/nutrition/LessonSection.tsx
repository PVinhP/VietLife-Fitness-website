// frontend/src/components/nutrition/LessonSection.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateLesson from '../../components/pt/CreateLesson';
import EditLesson from '../../components/pt/EditLesson';

interface Lesson {
  id: number;
  tieu_de: string;
  hinh_anh: string;
  tom_tat: string;
  noi_dung: string;
  loai: 'coban' | 'tapluyen';
  ngay_tao: string;
  thoi_gian_doc: number;
  do_kho: 'de' | 'trung-binh' | 'kho';
  luot_xem: number;
  luot_thich: number;
  tac_gia: string;
  tags?: string;
}

interface LessonTag {
  id: number;
  ten_tag: string;
  mau_sac: string;
}

type SortOption = 'newest' | 'popular' | 'liked';

const LessonSection = React.forwardRef<HTMLDivElement>((props, ref) => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  console.log("User role in LessonSection:", userRole);
  // States
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  // Filters
  const [activeLessonCategory, setActiveLessonCategory] = useState<'coban' | 'tapluyen' | ''>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'de' | 'trung-binh' | 'kho' | ''>('');
  const [availableTags, setAvailableTags] = useState<LessonTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:8080/lesson', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Không thể tải bài học');
        
        const data = await response.json();
        const lessonsData = Array.isArray(data) ? data : (data?.data || []);
        setLessons(lessonsData);
        setFilteredLessons(lessonsData);
      } catch (err) {
        console.error('Lỗi khi tải bài học:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        setLessons([]);
        setFilteredLessons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Fetch tags (nếu backend đã implement)
  useEffect(() => {
    fetch('http://localhost:8080/lesson/tags')
      .then(res => res.json())
      .then(tags => setAvailableTags(tags))
      .catch(err => console.error('Không thể tải tags:', err));
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...lessons];

    // Filter by category
    if (activeLessonCategory) {
      filtered = filtered.filter(l => l.loai === activeLessonCategory);
    }

    // Filter by search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.tieu_de.toLowerCase().includes(term) ||
        l.tom_tat.toLowerCase().includes(term) ||
        l.tac_gia.toLowerCase().includes(term)
      );
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(l => l.do_kho === selectedDifficulty);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(l => {
        if (!l.tags) return false;
        const lessonTags = l.tags.split(',');
        return selectedTags.some(tag => lessonTags.includes(tag));
      });
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.luot_xem - a.luot_xem);
    } else if (sortBy === 'liked') {
      filtered.sort((a, b) => b.luot_thich - a.luot_thich);
    }

    setFilteredLessons(filtered);
  }, [lessons, activeLessonCategory, searchTerm, sortBy, selectedDifficulty, selectedTags]);

  // Helpers
  const getDifficultyInfo = (doKho: string) => {
    const map = {
      'de': { label: 'Dễ', color: 'bg-green-100 text-green-700', icon: '🟢' },
      'trung-binh': { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
      'kho': { label: 'Khó', color: 'bg-red-100 text-red-700', icon: '🔴' }
    };
    return map[doKho as keyof typeof map] || map['trung-binh'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (hinh_anh: string) => {
    if (hinh_anh && hinh_anh.trim()) {
      return hinh_anh.startsWith('http') ? hinh_anh : `http://localhost:8080/uploads/${hinh_anh}`;
    }
    const defaults = [
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1673830/pexels-photo-1673830.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/2377045/pexels-photo-2377045.jpeg?auto=compress&cs=tinysrgb&w=600"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveLessonCategory('');
    setSelectedDifficulty('');
    setSelectedTags([]);
    setSortBy('newest');
  };


  const handleEditClick = (e: React.MouseEvent, lesson: Lesson) => {
    e.stopPropagation(); // Chặn không cho mở chi tiết bài học
    setEditingLesson(lesson); // Lưu bài cần sửa -> Modal sẽ tự hiện ra
  };


  const handleLessonClick = (lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const renderLessonCard = (lesson: Lesson) => {
    const difficultyInfo = getDifficultyInfo(lesson.do_kho);
    const lessonTags = lesson.tags ? lesson.tags.split(',') : [];

    return (
      <div
        key={lesson.id}
        // Thêm class 'group' vào đây để kích hoạt hiệu ứng hover
        className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-gray-100" 
        onClick={() => handleLessonClick(lesson.id)}
      >
        {/* Image Container */}
        {/* Thêm class 'relative' vào đây để nút Sửa nằm gọn trong ảnh */}
        <div className="aspect-video overflow-hidden bg-gray-100 relative"> 
          <img
            src={getImageUrl(lesson.hinh_anh)}
            alt={lesson.tieu_de}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600";
            }}
          />

          {/* Nút Sửa (Chỉ hiện cho PT/Admin) */}
          {(userRole === 'admin' || userRole === 'pt') && (
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => handleEditClick(e, lesson)}
                className="bg-white hover:bg-yellow-100 text-yellow-600 p-2 rounded-full shadow-lg transition-all transform hover:scale-110"
                title="Sửa bài học này"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
        </div>


        {/* Content */}
        <div className="p-5">
          {/* Category & Difficulty */}
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              lesson.loai === 'coban' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {lesson.loai === 'coban' ? '📚 Cơ bản' : '💪 Tập luyện'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyInfo.color}`}>
              {difficultyInfo.icon} {difficultyInfo.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-teal-600 transition-colors">
            {lesson.tieu_de}
          </h3>

          {/* Summary */}
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
            {lesson.tom_tat}
          </p>

          {/* Tags */}
          {lessonTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {lessonTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag);
                  }}
                >
                  #{tag}
                </span>
              ))}
              {lessonTags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  +{lessonTags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <span title="Thời gian đọc">⏱️ {lesson.thoi_gian_doc}p</span>
              <span title="Lượt xem">👁️ {lesson.luot_xem}</span>
              <span title="Lượt thích">❤️ {lesson.luot_thich}</span>
            </div>
            <span className="text-teal-600 font-semibold hover:text-teal-700">
              Đọc →
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div ref={ref} className="py-16 bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Hệ thống bài học dinh dưỡng
          </h2>
          <p className="text-xl text-gray-600">
            Từ cơ bản đến nâng cao - Xây dựng nền tảng kiến thức vững chắc
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          
          

          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm bài học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Tất cả độ khó</option>
              <option value="de">🟢 Dễ</option>
              <option value="trung-binh">🟡 Trung bình</option>
              <option value="kho">🔴 Khó</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="newest">📅 Mới nhất</option>
              <option value="popular">🔥 Phổ biến</option>
              <option value="liked">❤️ Được thích</option>
            </select>

            {(searchTerm || selectedDifficulty || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                ✕ Xóa
              </button>
            )}
          {/* NÚT MỞ MODAL */}
          {(userRole === 'admin' || userRole === 'pt') && (
            <button
              onClick={() => setIsCreateModalOpen(true)} // <-- SỬA DÒNG NÀY (Không navigate nữa)
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              ➕ Thêm bài
            </button>
          )}

        </div> {/* Kết thúc thẻ div flex-row */}

        {/* --- CHÈN MODAL VÀO ĐÂY --- */}
        {isCreateModalOpen && (
          <CreateLesson 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={() => {
               // Khi thêm xong thì load lại danh sách bài học ngay lập tức
               // Bạn copy logic của hàm fetchLessons() vào đây hoặc tách fetchLessons ra ngoài để gọi lại
               window.location.reload(); // Cách lười nhất: Reload trang để thấy bài mới
            }}
          />
        )}
       
        {editingLesson && (
          <EditLesson 
            lessonData={editingLesson} // Truyền dữ liệu bài cần sửa vào
            onClose={() => setEditingLesson(null)} // Đóng thì set về null
            onSuccess={() => {
               setEditingLesson(null);
               window.location.reload(); // Reload để thấy thay đổi
            }}
          />
        )}

          {/* Category Tabs */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setActiveLessonCategory('')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeLessonCategory === '' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📖 Tất cả
              </button>
              <button
                onClick={() => setActiveLessonCategory('coban')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeLessonCategory === 'coban' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📚 Cơ bản
              </button>
              <button
                onClick={() => setActiveLessonCategory('tapluyen')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeLessonCategory === 'tapluyen' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                💪 Tập luyện
              </button>
            </div>
          </div>

          {/* Filter Counter */}
          <div className="text-sm text-gray-600 text-center">
            Hiển thị <span className="font-semibold text-teal-600">{filteredLessons.length}</span> / {lessons.length} bài học
            {searchTerm && ` cho "${searchTerm}"`}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Đang tải bài học...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">😞</div>
            <h3 className="text-xl font-bold text-red-700 mb-2">Có lỗi xảy ra</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredLessons.length === 0 && lessons.length > 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài học</h3>
            <p className="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Xem tất cả bài học
            </button>
          </div>
        )}

        {/* No Lessons at all */}
        {!isLoading && lessons.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có bài học</h3>
            <p className="text-gray-600">Nội dung đang được cập nhật...</p>
          </div>
        )}

        {/* Lessons Grid */}
        {!isLoading && !error && filteredLessons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map(renderLessonCard)}
          </div>
        )}
      </div>
    </div>
  );
});

LessonSection.displayName = 'LessonSection';

export default LessonSection;