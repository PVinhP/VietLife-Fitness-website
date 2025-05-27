import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Định nghĩa interface cho bài tập cardio
interface CardioExercise {
  id: number;
  name: string;
  description: string;
  benefits: string[];
  intensityLevels: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  caloriesBurned: string;
  techniques: string[];
  videoUrl?: string;
  imageUrl?: string;
}

function CardioGuide() {
  const [selectedExercise, setSelectedExercise] = useState<CardioExercise | null>(null);
  const navigate = useNavigate();

  // Danh sách các bài tập cardio với thông tin chi tiết
  const cardioExercises: CardioExercise[] = [
    {
      id: 1,
      name: "Chạy bộ",
      description: "Chạy bộ là một trong những bài tập cardio phổ biến và hiệu quả nhất. Nó có thể được thực hiện ở bất kỳ đâu, không yêu cầu thiết bị đặc biệt ngoài giày chạy tốt và có thể được điều chỉnh để phù hợp với mọi mức độ thể lực.",
      benefits: [
        "Cải thiện sức khỏe tim mạch",
        "Đốt cháy calo hiệu quả",
        "Tăng cường sức bền",
        "Giảm stress và cải thiện tâm trạng",
        "Tăng cường sức khỏe xương"
      ],
      intensityLevels: {
        beginner: "Đi bộ nhanh xen kẽ với chạy nhẹ trong 20 phút",
        intermediate: "Chạy liên tục 30 phút với tốc độ vừa phải",
        advanced: "Chạy cường độ cao kết hợp với thay đổi tốc độ trong 45 phút"
      },
      caloriesBurned: "300-600 calo/giờ tùy thuộc vào tốc độ và cân nặng",
      techniques: [
        "Giữ thân trên thẳng đứng, vai thả lỏng",
        "Đặt bàn chân tiếp đất nhẹ nhàng, từ giữa bàn chân đến gót",
        "Hít thở đều đặn, thường là theo nhịp bước chạy",
        "Giữ khuỷu tay cong khoảng 90 độ"
      ],
      videoUrl: "https://res.cloudinary.com/dj3rolvmw/video/upload/v1745056397/chay_bo_example.mp4",
    },
    {
      id: 2,
      name: "Nhảy dây",
      description: "Nhảy dây là bài tập cardio cường độ cao, hiệu quả, có thể thực hiện ở bất kỳ đâu với thiết bị tối thiểu. Đây là một cách tuyệt vời để tăng nhịp tim và cải thiện sự phối hợp.",
      benefits: [
        "Cải thiện sức khỏe tim mạch",
        "Phát triển sự phối hợp và sự cân bằng",
        "Đốt cháy nhiều calo trong thời gian ngắn",
        "Tăng cường sức mạnh cơ bắp, đặc biệt là phần dưới cơ thể",
        "Dễ điều chỉnh cường độ"
      ],
      intensityLevels: {
        beginner: "Nhảy dây cơ bản 1-2 phút, nghỉ 30 giây, lặp lại 5 lần",
        intermediate: "Nhảy liên tục 5 phút, sau đó nghỉ 1 phút, lặp lại 3-5 lần",
        advanced: "Kết hợp nhảy dây với các kỹ thuật khác nhau (nhảy một chân, nhảy cao) trong 10-15 phút liên tục"
      },
      caloriesBurned: "300-450 calo trong 30 phút",
      techniques: [
        "Giữ khuỷu tay gần cơ thể, xoay dây bằng cổ tay",
        "Nhảy vừa đủ cao để dây đi qua dưới chân (khoảng 1-2 cm khỏi mặt đất)",
        "Đáp xuống nhẹ nhàng trên bóng bàn chân, không phải gót chân",
        "Giữ đầu thẳng và vai thả lỏng"
      ],
      videoUrl: "https://res.cloudinary.com/dj3rolvmw/video/upload/v1745056397/nhay_day_example.mp4",
    },
    {
      id: 3,
      name: "Đạp xe",
      description: "Đạp xe là bài tập cardio có tác động thấp nhưng hiệu quả, có thể được thực hiện ngoài trời hoặc trong nhà bằng xe đạp tập. Nó đặc biệt tốt cho người bị đau khớp hoặc cần bài tập ít tác động.",
      benefits: [
        "Tăng cường sức khỏe tim phổi",
        "Phát triển sức mạnh chân và cơ lõi",
        "Bài tập ít tác động, phù hợp cho người bị đau khớp",
        "Cải thiện sức bền",
        "Có thể được sử dụng làm phương tiện di chuyển"
      ],
      intensityLevels: {
        beginner: "Đạp xe 20 phút với tốc độ ổn định, địa hình bằng phẳng",
        intermediate: "Đạp xe 30-45 phút, bao gồm một số đoạn đường dốc",
        advanced: "Đạp xe 60 phút hoặc hơn với cường độ cao, bao gồm nhiều đoạn đường dốc và sprint ngắn"
      },
      caloriesBurned: "400-600 calo/giờ tùy thuộc vào cường độ",
      techniques: [
        "Điều chỉnh chiều cao yên để chân gần như duỗi thẳng khi bàn đạp ở điểm thấp nhất",
        "Giữ lưng thẳng và cúi người về phía trước từ hông",
        "Đạp trong một chuyển động tròn, dùng lực đều trong suốt một vòng đạp",
        "Thay đổi số bánh răng để duy trì tốc độ quay chân đều đặn"
      ],
      videoUrl: "https://res.cloudinary.com/dj3rolvmw/video/upload/v1745056397/dap_xe_example.mp4",
    },
    {
      id: 4,
      name: "Burpees",
      description: "Burpees là bài tập cardio và sức mạnh cường độ cao kết hợp squat, plank, chống đẩy và nhảy thành một động tác liên tục. Đây là một trong những bài tập đốt cháy calo hiệu quả nhất.",
      benefits: [
        "Xây dựng sức mạnh toàn thân",
        "Cải thiện sức bền tim mạch",
        "Tăng cường cơ lõi",
        "Đốt cháy nhiều calo trong thời gian ngắn",
        "Không cần thiết bị"
      ],
      intensityLevels: {
        beginner: "5-10 burpees, nghỉ, lặp lại 3 lần (có thể bỏ qua phần chống đẩy)",
        intermediate: "15-20 burpees liên tiếp, nghỉ 30 giây, lặp lại 3-5 lần",
        advanced: "30+ burpees liên tiếp với tốc độ cao, lặp lại nhiều lần"
      },
      caloriesBurned: "Khoảng 10 calo mỗi phút hoặc 100 calo trong 10 phút burpees liên tục",
      techniques: [
        "Bắt đầu ở tư thế đứng, sau đó ngồi xổm, đặt tay xuống sàn",
        "Nhảy chân về phía sau vào tư thế plank",
        "Thực hiện một chống đẩy (tùy chọn cho người mới bắt đầu)",
        "Nhảy chân về phía trước, trở lại tư thế ngồi xổm",
        "Đứng dậy và nhảy lên, duỗi thẳng cánh tay lên trên đầu"
      ],
      videoUrl: "https://res.cloudinary.com/dj3rolvmw/video/upload/v1745056397/burpees_example.mp4",
    },
    {
      id: 5,
      name: "HIIT (High-Intensity Interval Training)",
      description: "HIIT là phương pháp tập luyện kết hợp các giai đoạn tập luyện cường độ cao với các giai đoạn nghỉ ngơi hoặc tập luyện cường độ thấp. Đây là một cách hiệu quả để đốt cháy calo và cải thiện thể lực trong thời gian ngắn.",
      benefits: [
        "Đốt cháy nhiều calo trong thời gian ngắn",
        "Tiếp tục đốt cháy calo sau khi tập luyện (hiệu ứng sau đốt)",
        "Cải thiện sức khỏe tim mạch",
        "Tăng tốc độ trao đổi chất",
        "Không cần thiết bị đặc biệt"
      ],
      intensityLevels: {
        beginner: "20 giây hoạt động cường độ cao, 40 giây nghỉ ngơi, lặp lại 8 lần (8 phút)",
        intermediate: "30 giây hoạt động cường độ cao, 30 giây nghỉ ngơi, lặp lại 12 lần (12 phút)",
        advanced: "40 giây hoạt động cường độ cao, 20 giây nghỉ ngơi, lặp lại 15 lần (15 phút)"
      },
      caloriesBurned: "300-450 calo trong một buổi tập 30 phút, tùy thuộc vào cường độ",
      techniques: [
        "Chọn các bài tập phù hợp với mức độ thể lực của bạn",
        "Trong giai đoạn cường độ cao, nỗ lực ở mức 85-95% khả năng tối đa",
        "Sử dụng giai đoạn nghỉ ngơi để thực sự phục hồi",
        "Duy trì hình thức tốt ngay cả khi mệt mỏi",
        "Bao gồm khởi động và giãn cơ trước và sau buổi tập"
      ],
      videoUrl: "https://res.cloudinary.com/dj3rolvmw/video/upload/v1745056397/hiit_example.mp4",
    }
  ];

  // Xử lý khi chọn một bài tập cardio
  const handleExerciseSelect = (exercise: CardioExercise) => {
    setSelectedExercise(exercise);
  };

  // Quay lại danh sách bài tập
  const handleBackToList = () => {
    setSelectedExercise(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="w-4/5 m-auto bg-white shadow-2xl rounded-2xl p-6">
        <h1 className="text-4xl font-bold mb-4 text-center text-teal-500">Hướng Dẫn Tập Cardio</h1>
        
        {!selectedExercise ? (
          <>
            <p className="text-gray-800 mb-8 mx-4 md:mx-20 text-xl">
              Cardio (bài tập tim mạch) là một phần quan trọng trong mọi chương trình tập luyện. Các bài tập cardio giúp cải thiện sức khỏe tim mạch, tăng cường sức bền và hỗ trợ quá trình giảm cân. Hãy khám phá các bài tập cardio phổ biến dưới đây để bắt đầu hành trình nâng cao sức khỏe của bạn.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {cardioExercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg cursor-pointer transition-all"
                  onClick={() => handleExerciseSelect(exercise)}
                >
                  {exercise.imageUrl ? (
                    <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl text-teal-500">{exercise.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2 text-teal-500">{exercise.name}</h2>
                    <p className="text-gray-800 line-clamp-3">{exercise.description}</p>
                    <button 
                      className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md w-full"
                      onClick={() => handleExerciseSelect(exercise)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <button 
              onClick={handleBackToList}
              className="mb-4 flex items-center text-teal-500 hover:text-teal-400"
            >
              <span className="mr-2">←</span> Quay lại danh sách
            </button>
            
            <h2 className="text-3xl font-bold mb-4 text-teal-500">{selectedExercise.name}</h2>
            
            {selectedExercise.videoUrl && (
              <div className="mb-6">
                <video className="w-full max-h-96 object-cover rounded-lg" controls>
                  <source src={selectedExercise.videoUrl} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-teal-500">Mô tả</h3>
              <p className="text-gray-800">{selectedExercise.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-teal-500">Lợi ích</h3>
              <ul className="list-disc pl-6 text-gray-800">
                {selectedExercise.benefits.map((benefit, index) => (
                  <li key={index} className="mb-1">{benefit}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-teal-500">Các mức độ cường độ</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded">
                  <span className="font-medium text-teal-500">Người mới bắt đầu: </span>
                  <span className="text-gray-800">{selectedExercise.intensityLevels.beginner}</span>
                </div>
                <div className="p-3 bg-gray-100 rounded">
                  <span className="font-medium text-teal-500">Trung cấp: </span>
                  <span className="text-gray-800">{selectedExercise.intensityLevels.intermediate}</span>
                </div>
                <div className="p-3 bg-gray-100 rounded">
                  <span className="font-medium text-teal-500">Nâng cao: </span>
                  <span className="text-gray-800">{selectedExercise.intensityLevels.advanced}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-teal-500">Calories tiêu thụ</h3>
              <p className="text-gray-800">{selectedExercise.caloriesBurned}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-teal-500">Kỹ thuật thực hiện</h3>
              <ol className="list-decimal pl-6 text-gray-800">
                {selectedExercise.techniques.map((technique, index) => (
                  <li key={index} className="mb-2">{technique}</li>
                ))}
              </ol>
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