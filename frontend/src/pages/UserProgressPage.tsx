import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface khớp với dữ liệu từ API /my-progress
interface MyLesson {
  lesson_id: number;
  tieu_de: string;
  hinh_anh: string;
  tom_tat: string;
  loai: string;
  progress_percent: number;
  completed: boolean;
  bookmark: boolean;
  ngay_hoan_thanh: string | null;
}

type FilterType = 'all' | 'completed' | 'in-progress' | 'bookmarked';

function UserProgressPage() {
  const navigate = useNavigate();
  
  // State
  const [lessons, setLessons] = useState<MyLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch dữ liệu khi vào trang
  useEffect(() => {
    fetchMyProgress();
  }, []);

  const fetchMyProgress = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login');
        return;
    }

    try {
      const response = await fetch('http://localhost:8080/lesson/my-progress', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải dữ liệu');
      
      const data = await response.json();
      setLessons(data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải tiến độ học tập');
    } finally {
      setLoading(false);
    }
  };

  // 2. Tính toán Stats (Thống kê) trực tiếp từ danh sách lessons
  // Dùng useMemo để không phải tính lại mỗi khi render
  const stats = useMemo(() => {
    return {
        total: lessons.length,
        completed: lessons.filter(l => l.completed).length,
        inProgress: lessons.filter(l => !l.completed && l.progress_percent > 0).length,
        bookmarked: lessons.filter(l => l.bookmark).length
    };
  }, [lessons]);

  // 3. Lọc bài học theo Tab và Search
  const filteredLessons = lessons.filter(lesson => {
    // Lọc theo search
    const matchSearch = lesson.tieu_de.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    // Lọc theo tab
    if (filter === 'all') return true;
    if (filter === 'completed') return lesson.completed;
    if (filter === 'in-progress') return !lesson.completed && lesson.progress_percent > 0;
    if (filter === 'bookmarked') return lesson.bookmark;
    return true;
  });

  // Helper hiển thị ảnh
  const getImageUrl = (img?: string) => {
    if (img?.startsWith('http')) return img;
    return img ? `http://localhost:8080/uploads/${img}` : "https://via.placeholder.com/400x200?text=No+Image";
  };

  // Helper format ngày
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            📚 Quản lý học tập
          </h1>
          <p className="text-gray-600">Theo dõi tiến độ và các bài học đã lưu của bạn</p>
        </div>

        {/* Stats Cards - Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
             <div className="text-gray-500 text-xs font-bold uppercase tracking-wide">Tổng bài học</div>
             <div className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500">
             <div className="text-gray-500 text-xs font-bold uppercase tracking-wide">Đã hoàn thành</div>
             <div className="text-3xl font-bold text-gray-800 mt-1">{stats.completed}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-yellow-500">
             <div className="text-gray-500 text-xs font-bold uppercase tracking-wide">Đang học</div>
             <div className="text-3xl font-bold text-gray-800 mt-1">{stats.inProgress}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-500">
             <div className="text-gray-500 text-xs font-bold uppercase tracking-wide">Đã lưu</div>
             <div className="text-3xl font-bold text-gray-800 mt-1">{stats.bookmarked}</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-10">
           {/* Các nút lọc */}
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {[
                { key: 'all', label: 'Tất cả', icon: '📋' },
                { key: 'in-progress', label: 'Đang học', icon: '⏳' },
                { key: 'completed', label: 'Hoàn thành', icon: '✅' },
                { key: 'bookmarked', label: 'Đã lưu', icon: '❤️' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as FilterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    filter === tab.key 
                      ? 'bg-teal-500 text-white shadow-md transform scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
           </div>

           {/* Ô tìm kiếm */}
           <div className="relative w-full md:w-64">
             <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
             <input 
                type="text" 
                placeholder="Tìm bài học..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* Error Notification */}
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">{error}</div>}

        {/* Lesson List */}
        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((item) => (
              <div key={item.lesson_id} className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100">
                
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                   <img 
                      src={getImageUrl(item.hinh_anh)} 
                      alt={item.tieu_de}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                   />
                   {/* Badges trên ảnh */}
                   <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {item.completed && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded shadow">✔ Xong</span>}
                      {item.bookmark && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow">❤️ Đã lưu</span>}
                   </div>
                   {/* Overlay nút Play */}
                   <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={() => navigate(`/lesson/${item.lesson_id}`)}
                        className="bg-white text-teal-600 rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                   </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                   <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors cursor-pointer" onClick={() => navigate(`/lesson/${item.lesson_id}`)}>
                     {item.tieu_de}
                   </h3>
                   
                   <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                     {item.tom_tat}
                   </p>

                   {/* Progress Bar */}
                   <div className="mb-3">
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                        <span>Tiến độ</span>
                        <span>{item.progress_percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                           className={`h-2 rounded-full ${item.completed ? 'bg-green-500' : 'bg-teal-500'}`} 
                           style={{ width: `${item.progress_percent}%` }}
                        ></div>
                      </div>
                   </div>

                   {/* Footer */}
                   <div className="flex items-center justify-between pt-4 border-t text-xs text-gray-500">
                      <span>{item.ngay_hoan_thanh ? `Xong ngày: ${formatDate(item.ngay_hoan_thanh)}` : 'Đang học'}</span>
                      <button 
                        onClick={() => navigate(`/lesson/${item.lesson_id}`)}
                        className="text-teal-600 font-bold hover:underline"
                      >
                        {item.completed ? 'Xem lại' : 'Tiếp tục'} →
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
             <div className="text-6xl mb-4 text-gray-300">📭</div>
             <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài học nào</h3>
             <p className="text-gray-500 mb-6">Bạn chưa có bài học nào trong danh mục này.</p>
             <button onClick={() => navigate('/lessons')} className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors shadow">
                Khám phá bài học mới
             </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default UserProgressPage;