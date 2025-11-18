import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ProgressService from '../services/ProgressService'; // ✅ THÊM DÒNG NÀY

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

function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedLessons, setRelatedLessons] = useState<Lesson[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  // 👉 Có thể dùng để disable nút khi đang lưu (nếu muốn)
  const [savingProgress, setSavingProgress] = useState(false);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ✅ Helper lưu tiến độ học
  const saveProgress = async (lessonId: number, payload: any) => {
    try {
      setSavingProgress(true);
      // ⚠️ Đổi tên hàm này cho khớp với ProgressService của bạn nếu khác
      // Ví dụ: ProgressService.saveProgress(lessonId, payload);
      await (ProgressService as any).updateProgress(lessonId, payload);
    } catch (err) {
      console.error('Lỗi lưu tiến độ:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Fetch lesson
  useEffect(() => {
    if (!id) {
      setError('ID bài học không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        const response = await fetch(`http://localhost:8080/lesson/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Không tìm thấy bài học');

        const data = await response.json();
        if (data && data.id) {
          setLesson(data);
          setLocalLikes(data.luot_thich || 0);
          
          // Track view count (tăng luot_xem global)
          fetch(`http://localhost:8080/lesson/${id}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }).catch(console.error);

          // ✅ Lưu lịch sử: user đã mở / đang học bài này
          // Tùy ý bạn set progress_percent bao nhiêu, ở đây tạm set 1%
          saveProgress(data.id, {
            progress_percent: data.thoi_gian_doc ? 1 : 0,
            in_progress: true
          });

          // Fetch related lessons
          fetchRelatedLessons(data.loai, data.id);
        } else {
          setError('Không tìm thấy bài học');
        }
      } catch (err) {
        console.error('Lỗi khi tải bài học:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const fetchRelatedLessons = async (loai: string, currentId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/lesson`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Lỗi khi tải bài học liên quan');

      const data = await response.json();
      const allLessons = Array.isArray(data) ? data : (data?.data || []);
      const filtered = allLessons
        .filter((l: Lesson) => l.loai === loai && l.id !== currentId)
        .slice(0, 3);
      
      setRelatedLessons(filtered);
    } catch (err) {
      console.error('Lỗi khi tải bài học liên quan:', err);
      setRelatedLessons([]);
    }
  };

  const handleLike = async () => {
    if (!lesson || isLiked) return;

    try {
      const response = await fetch(`http://localhost:8080/lesson/${lesson.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setIsLiked(true);
        setLocalLikes(prev => prev + 1);
        
        // ✅ Khi thích bài -> lưu vào lịch sử như 1 bài "đã lưu / bookmarked"
        saveProgress(lesson.id, {
          bookmark: true
        });

        // Animation effect
        const button = document.getElementById('like-button');
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => button.classList.remove('animate-pulse'), 600);
        }
      }
    } catch (err) {
      console.error('Lỗi khi thích bài học:', err);
      alert('Không thể thích bài học. Vui lòng thử lại!');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: lesson?.tieu_de,
        text: lesson?.tom_tat,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('✓ Đã sao chép link bài học!');
      });
    }
  };

  // ✅ Optional: nút "Hoàn thành bài học"
  const handleComplete = async () => {
    if (!lesson) return;

    try {
      await saveProgress(lesson.id, {
        completed: true,
        progress_percent: 100,
        ngay_hoan_thanh: new Date().toISOString()
      });
      alert('🎉 Bạn đã hoàn thành bài học!');
    } catch (err) {
      console.error('Lỗi đánh dấu hoàn thành:', err);
      alert('Không thể lưu trạng thái hoàn thành!');
    }
  };

  const handleBackToList = () => {
    navigate('/nutrition', { state: { scrollToLessons: true } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyInfo = (doKho: string) => {
    const map = {
      'de': { label: 'Dễ', color: 'bg-green-500', icon: '🟢' },
      'trung-binh': { label: 'Trung bình', color: 'bg-yellow-500', icon: '🟡' },
      'kho': { label: 'Khó', color: 'bg-red-500', icon: '🔴' }
    };
    return map[doKho as keyof typeof map] || map['trung-binh'];
  };

  const getCategoryInfo = (loai: string) => {
    return loai === 'coban'
      ? { name: 'Kiến thức cơ bản', icon: '📚', color: 'bg-blue-500' }
      : { name: 'Dinh dưỡng & Tập luyện', icon: '💪', color: 'bg-purple-500' };
  };

  const getImageUrl = (hinh_anh: string) => {
    if (hinh_anh && hinh_anh.trim()) {
      return hinh_anh.startsWith('http') ? hinh_anh : `http://localhost:8080/uploads/${hinh_anh}`;
    }
    return "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200";
  };

  // Loading
  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !lesson) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || 'Không tìm thấy bài học'}
          </h2>
          <button
            onClick={handleBackToList}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Quay lại danh sách bài học
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(lesson.loai);
  const difficultyInfo = getDifficultyInfo(lesson.do_kho);
  const lessonTags = lesson.tags ? lesson.tags.split(',') : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Back button */}
          <button
            onClick={handleBackToList}
            className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách bài học
          </button>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white ${categoryInfo.color}`}>
              <span className="mr-2">{categoryInfo.icon}</span>
              {categoryInfo.name}
            </span>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white ${difficultyInfo.color}`}>
              <span className="mr-2">{difficultyInfo.icon}</span>
              {difficultyInfo.label}
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⏱️ {lesson.thoi_gian_doc} phút đọc
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {lesson.tieu_de}
          </h1>

          {/* Summary */}
          <p className="text-xl text-white text-opacity-90 leading-8 mb-6 max-w-4xl">
            {lesson.tom_tat}
          </p>

          {/* Author & Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-white text-opacity-80">
            <span>✍️ {lesson.tac_gia}</span>
            <span>📅 {formatDate(lesson.ngay_tao)}</span>
            <span>👁️ {lesson.luot_xem} lượt xem</span>
            <span>❤️ {localLikes} lượt thích</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Article */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              
              {/* Featured Image */}
              {lesson.hinh_anh && (
                <img
                  src={getImageUrl(lesson.hinh_anh)}
                  alt={lesson.tieu_de}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200";
                  }}
                />
              )}

              {/* Tags */}
              {lessonTags.length > 0 && (
                <div className="px-8 pt-8 flex flex-wrap gap-2">
                  {lessonTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8 pb-2 border-b-2 border-teal-500">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">{children}</h3>,
                      p: ({ children }) => <p className="text-gray-700 mb-4 leading-7">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2 ml-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      strong: ({ children }) => <strong className="text-teal-600 font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-teal-500">{children}</em>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-teal-500 pl-4 py-2 my-4 bg-teal-50 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">
                          {children}
                        </code>
                      )
                    }}
                  >
                    {lesson.noi_dung}
                  </ReactMarkdown>
                </div>
              </div>
            </article>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3 justify-between items-center">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Danh sách bài học
              </button>

              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={handleComplete}
                  disabled={savingProgress}
                  className={`px-6 py-3 rounded-lg text-white font-semibold transition-all ${
                    savingProgress
                      ? 'bg-green-300 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  title="Đánh dấu hoàn thành bài học"
                >
                  ✔ Hoàn thành bài học
                </button>

                <button
                  id="like-button"
                  onClick={handleLike}
                  disabled={isLiked}
                  className={`p-3 rounded-lg transition-all ${
                    isLiked
                      ? 'bg-red-500 text-white cursor-not-allowed'
                      : 'bg-white hover:bg-red-50 text-red-500 border-2 border-red-500'
                  }`}
                  title={isLiked ? 'Đã thích' : 'Thích bài học'}
                >
                  <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 bg-white hover:bg-green-50 text-green-600 border-2 border-green-600 rounded-lg transition-all"
                  title="Chia sẻ bài học"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            
            {/* Related Lessons */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-teal-500 mr-2">🔗</span>
                Bài học liên quan
              </h2>
              
              {relatedLessons.length > 0 ? (
                <div className="space-y-4">
                  {relatedLessons.map((related) => (
                    <div
                      key={related.id}
                      className="group bg-gray-50 hover:bg-teal-50 p-4 rounded-lg transition-all cursor-pointer border border-gray-200 hover:border-teal-300"
                      onClick={() => navigate(`/lesson/${related.id}`)}
                    >
                      {related.hinh_anh && (
                        <img
                          src={getImageUrl(related.hinh_anh)}
                          alt={related.tieu_de}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600";
                          }}
                        />
                      )}
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-2">
                        {related.tieu_de}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {related.tom_tat}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>⏱️ {related.thoi_gian_doc}p</span>
                        <span>👁️ {related.luot_xem}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Chưa có bài học liên quan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonDetail;
