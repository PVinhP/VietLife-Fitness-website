import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Định nghĩa interface cho bài tập cardio từ API
interface CardioExercise {
  id: number;
  tieu_de: string;
  hinh_anh: string;
  noi_dung: string;
  danh_muc: string;
  link_nguon: string;
  ngay_tao: string;
}

function CardioGuide() {
  const [exercises, setExercises] = useState<CardioExercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<CardioExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<CardioExercise | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Lấy token từ localStorage hoặc context
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

   // Hàm trích xuất danh mục duy nhất
  const extractUniqueMuscleGroups = (exercises: CardioExercise[]): string[] => {
    const groups = exercises.map(exercise => exercise.danh_muc);
    const uniqueSet = new Set(groups);
    const uniqueArray: string[] = [];
    uniqueSet.forEach(group => {
      if (group && group.trim() !== '') {
        uniqueArray.push(group);
      }
    });
    return uniqueArray;
  };
  // Fetch dữ liệu từ API
  useEffect(() => {
    if (!token) {
      setError("Không tìm thấy token xác thực");
      setLoading(false);
      return;
    }

    axios.get("https://backend-rjhh.onrender.com/cardio", {
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }
    })
    .then((res) => {
      setExercises(res.data);
      setFilteredExercises(res.data);
      const uniqueMuscleGroups = extractUniqueMuscleGroups(res.data);
      setMuscleGroups(["Tất cả", ...uniqueMuscleGroups]);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Lỗi khi tải dữ liệu bài tập:", err);
      setError("Không thể tải dữ liệu bài tập. Vui lòng thử lại sau.");
      setLoading(false);
    });
  }, [token]);

  // Xử lý khi chọn một bài tập cardio
  const handleExerciseSelect = (exercise: CardioExercise) => {
    setSelectedExercise(exercise);
  };

  // Quay lại danh sách bài tập
  const handleBackToList = () => {
    setSelectedExercise(null);
  };

  // Hàm render nội dung markdown thành HTML
  const renderMarkdownContent = (content: string) => {
    // Đơn giản hóa việc render markdown - có thể dùng thư viện như react-markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/### (.*?)<br\/>/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-teal-600">$1</h3>')
      .replace(/## (.*?)<br\/>/g, '<h2 class="text-xl font-semibold mt-4 mb-2 text-teal-600">$1</h2>')
      .replace(/# (.*?)<br\/>/g, '<h1 class="text-2xl font-bold mt-4 mb-2 text-teal-600">$1</h1>');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-lg mb-4">❌ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="w-4/5 m-auto bg-white shadow-2xl rounded-2xl p-6">
        <h1 className="text-4xl font-bold mb-4 text-center text-teal-500">Hướng Dẫn Tập Cardio</h1>
        
        {!selectedExercise ? (
          <>
            <p className="text-gray-800 mb-8 mx-4 md:mx-20 text-xl">
              Cardio (bài tập tim mạch) là một phần quan trọng trong mọi chương trình tập luyện. Các bài tập cardio giúp cải thiện sức khỏe tim mạch, tăng cường sức bền và hỗ trợ quá trình giảm cân. Hãy khám phá các bài tập cardio phổ biến dưới đây để bắt đầu hành trình nâng cao sức khỏe của bạn.
            </p>
            
            {/* Hiển thị thông báo nếu không có dữ liệu */}
            {exercises.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Hiện tại chưa có bài tập cardio nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredExercises.map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg cursor-pointer transition-all"
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    {exercise.hinh_anh ? (
                      <img 
                        src={exercise.hinh_anh} 
                        alt={exercise.tieu_de} 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          // Fallback nếu ảnh không tải được
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback placeholder */}
                    <div className={`w-full h-48 bg-gray-100 flex items-center justify-center ${exercise.hinh_anh ? 'hidden' : ''}`}>
                      <span className="text-4xl text-teal-500">{exercise.tieu_de.charAt(0)}</span>
                    </div>
                    
                    <div className="p-4">
                      <h2 className="text-xl font-bold mb-2 text-teal-500">{exercise.tieu_de}</h2>
                      
                      {/* Hiển thị danh mục nếu có */}
                      {exercise.danh_muc && (
                        <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mb-2">
                          {exercise.danh_muc}
                        </span>
                      )}
                      
                      {/* Hiển thị preview nội dung */}
                      <p className="text-gray-800 line-clamp-3">
                        {exercise.noi_dung.replace(/[#*]/g, '').substring(0, 150)}...
                      </p>
                      
                      <button 
                        className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExerciseSelect(exercise);
                        }}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <button 
              onClick={handleBackToList}
              className="mb-4 flex items-center text-teal-500 hover:text-teal-400"
            >
              <span className="mr-2">←</span> Quay lại danh sách
            </button>
            
            <h2 className="text-3xl font-bold mb-4 text-teal-500">{selectedExercise.tieu_de}</h2>
            
            {/* Hiển thị danh mục */}
            {selectedExercise.danh_muc && (
              <div className="mb-4">
                <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                  Danh mục: {selectedExercise.danh_muc}
                </span>
              </div>
            )}
            
            {/* Hiển thị hình ảnh */}
            {selectedExercise.hinh_anh && (
              <div className="mb-6">
                <img 
                  src={selectedExercise.hinh_anh} 
                  alt={selectedExercise.tieu_de}
                  className="w-full max-h-96 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Hiển thị nội dung markdown */}
            <div className="mb-6">
              <div 
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdownContent(selectedExercise.noi_dung) 
                }}
              />
            </div>
            
            {/* Hiển thị link nguồn nếu có */}
            {selectedExercise.link_nguon && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-teal-500">Nguồn tham khảo</h3>
                <a 
                  href={selectedExercise.link_nguon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 underline"
                >
                  {selectedExercise.link_nguon}
                </a>
              </div>
            )}
            
            {/* Hiển thị ngày tạo */}
            <div className="mb-6 text-sm text-gray-500">
              Ngày tạo: {new Date(selectedExercise.ngay_tao).toLocaleDateString('vi-VN')}
            </div>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleBackToList}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md"
              >
                Quay lại danh sách bài tập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardioGuide;