import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Lesson {
  id: number;
  tieu_de: string;
  hinh_anh: string;
  tom_tat: string;
  noi_dung: string;
  loai: string;
  ngay_tao?: string;
}

function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedLessons, setRelatedLessons] = useState<Lesson[]>([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!id) {
      setError('ID bài học không hợp lệ');
      setLoading(false);
      return;
    }

    fetch(`https://backend-rjhh.onrender.com/lesson/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Không tìm thấy bài học');
        return res.json();
      })
      .then((res) => {
        if (res && res.id) {
          setLesson(res);
          fetchRelatedLessons(res.loai, res.id);
        } else {
          setError('Không tìm thấy bài học');
        }
      })
      .catch((error) => {
        console.error('Lỗi khi tải bài học:', error);
        setError(error.message || 'Có lỗi xảy ra khi tải bài học');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const fetchRelatedLessons = (loai: string, currentId: number) => {
    fetch(`https://backend-rjhh.onrender.com/lesson/type/${loai}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Lỗi khi tải bài học liên quan');
        return res.json();
      })
      .then((res) => {
        if (Array.isArray(res)) {
          const filtered = res.filter((lesson) => lesson.id !== currentId).slice(0, 3);
          setRelatedLessons(filtered);
        } else {
          setRelatedLessons([]);
        }
      })
      .catch((error) => {
        console.error('Lỗi khi tải bài học liên quan:', error);
        setRelatedLessons([]);
      });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Không có ngày';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryInfo = (loai: string) => {
    switch (loai) {
      case 'coban':
        return { name: 'Kiến thức cơ bản', icon: '📚', color: 'bg-blue-500' };
      case 'tapluyen':
        return { name: 'Dinh dưỡng & Tập luyện', icon: '💪', color: 'bg-green-500' };
      default:
        return { name: 'Khác', icon: '📖', color: 'bg-gray-500' };
    }
  };

  const handleLike = () => {
    alert('Đã thích bài học!');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Đã sao chép link bài học!');
    });
  };

  const handleBackToList = () => {
    navigate('/nutrition', { state: { scrollToLessons: true } });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-300 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy bài học'}</h2>
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

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-white to-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center text-teal-700 hover:text-teal-500 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách bài học
          </button>

          <div className="flex items-center mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${categoryInfo.color} mr-4`}>
              <span className="mr-1">{categoryInfo.icon}</span>
              {categoryInfo.name}
            </span>
            <span className="text-gray-600 text-sm">{formatDate(lesson.ngay_tao)}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{lesson.tieu_de}</h1>

          <p className="text-xl text-gray-700 leading-8 max-w-4xl">{lesson.tom_tat}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg p-8 shadow-xl">
              {lesson.hinh_anh && (
                <img src={lesson.hinh_anh} alt={lesson.tieu_de} className="w-full h-64 object-cover rounded-lg mb-6" />
              )}
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 mb-6">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-700 mb-4 leading-7">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="text-teal-600 font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-teal-500">{children}</em>,
                  }}
                >
                  {lesson.noi_dung}
                </ReactMarkdown>
              </div>
            </article>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Danh sách bài học
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={handleLike}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="Thích bài học"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  title="Chia sẻ bài học"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bài học liên quan</h2>
              {relatedLessons.length > 0 ? (
                <div className="space-y-4">
                  {relatedLessons.map((related) => (
                    <div
                      key={related.id}
                      className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={() => navigate(`/lesson/${related.id}`)}
                    >
                      {related.hinh_anh && (
                        <img src={related.hinh_anh} alt={related.tieu_de} className="w-full h-32 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{related.tieu_de}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{related.tom_tat}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Không có bài học liên quan.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonDetail;