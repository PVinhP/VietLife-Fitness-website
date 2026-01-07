// frontend/src/pages/UserProgressPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressService, { LessonProgress, ProgressStats } from '../services/ProgressService';


type FilterType = '' | 'completed' | 'in-progress' | 'bookmarked';

function UserProgressPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [filter, setFilter] = useState<FilterType>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [filter, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [progressData, statsData] = await Promise.all([
        ProgressService.getAllProgress(filter || undefined),
        ProgressService.getStats()
      ]);
      
      setLessons(progressData);
      setStats(statsData);
    } catch (err) {
      console.error('Lỗi tải tiến độ:', err);
      setError('Không thể tải tiến độ học tập');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa tiến độ này?')) return;

    try {
      await ProgressService.deleteProgress(lessonId);
      fetchData();
      alert('✓ Đã xóa tiến độ!');
    } catch (err) {
      console.error('Lỗi xóa:', err);
      alert('Không thể xóa tiến độ!');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa hoàn thành';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (hinh_anh?: string) => {
    if (hinh_anh?.trim()) {
      return hinh_anh.startsWith('http') ? hinh_anh : `https://vietlife-fitness-website-host.onrender.com/uploads/${hinh_anh}`;
    }
    return "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600";
  };

  const filteredLessons = lessons.filter(lesson => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return lesson.tieu_de?.toLowerCase().includes(term) ||
           lesson.tom_tat?.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Đang tải tiến độ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 Tiến độ học tập của bạn
          </h1>
          <p className="text-xl text-gray-600">
            Theo dõi và quản lý quá trình học tập
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tổng bài học</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_lessons}</p>
                </div>
                <div className="text-4xl">📖</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Đã hoàn thành</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed_count}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Đang học</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.in_progress_count}</p>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Đã lưu</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.bookmarked_count}</p>
                </div>
                <div className="text-4xl">⭐</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm bài học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === '' 
                    ? 'bg-teal-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📚 Tất cả
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'completed' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✅ Hoàn thành
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'in-progress' 
                    ? 'bg-yellow-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Đang học
              </button>
              <button
                onClick={() => setFilter('bookmarked')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'bookmarked' 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⭐ Đã lưu
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-4 text-center">
            Hiển thị <span className="font-semibold text-teal-600">{filteredLessons.length}</span> bài học
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-8">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Lessons List */}
        {filteredLessons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy bài học' : 'Chưa có tiến độ nào'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu học các bài học để theo dõi tiến độ'}
            </p>
            <button
              onClick={() => navigate('/nutrition')}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Khám phá bài học
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Image */}
                <div 
                  className="aspect-video overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                >
                  <img
                    src={getImageUrl(lesson.hinh_anh)}
                    alt={lesson.tieu_de}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Tiến độ: {lesson.progress_percent}%
                      </span>
                      {lesson.bookmark && (
                        <span className="text-yellow-500" title="Đã lưu">⭐</span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          lesson.completed 
                            ? 'bg-green-500' 
                            : lesson.progress_percent > 0 
                              ? 'bg-yellow-500' 
                              : 'bg-gray-300'
                        }`}
                        style={{ width: `${lesson.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-teal-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                  >
                    {lesson.tieu_de}
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                    {lesson.tom_tat}
                  </p>

                  {/* Tags */}
                  {lesson.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lesson.tags.split(',').slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status & Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                    <span className={`px-2 py-1 rounded-full font-semibold ${
                      lesson.completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {lesson.completed ? '✅ Hoàn thành' : '📝 Đang học'}
                    </span>
                    <span title="Ngày hoàn thành">
                      {formatDate(lesson.ngay_hoan_thanh)}
                    </span>
                  </div>

                  {/* Notes Preview */}
                  {lesson.ghi_chu && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-700 line-clamp-2">
                        <span className="font-semibold">📝 Ghi chú:</span> {lesson.ghi_chu}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                      className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      {lesson.completed ? 'Xem lại' : 'Tiếp tục học'}
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.lesson_id)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors text-sm"
                      title="Xóa tiến độ"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProgressPage;