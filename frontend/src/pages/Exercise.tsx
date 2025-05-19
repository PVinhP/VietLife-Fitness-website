import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

// Interface cập nhật để phù hợp với cấu trúc dữ liệu thực tế
interface Exercises {
    id: number;
    exercise_name: string;
    video_urls: string;
    description: string;
    muscle_group: string;
    equipment_required: string;
    steps: string;
}

function Exercise() {
    const [exercises, setExercises] = useState<Exercises[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercises[]>([]);
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("Tất cả");
    const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<Exercises | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        // Thay đổi URL API nếu cần thiết
        axios.get("http://localhost:8080/exercise", {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                setExercises(res.data);
                setFilteredExercises(res.data);
                
                // Lấy danh sách nhóm cơ duy nhất từ dữ liệu bài tập
                const uniqueMuscleGroups = extractUniqueMuscleGroups(res.data);
                setMuscleGroups(["Tất cả", ...uniqueMuscleGroups]);
            })
            .catch((err) => {
                console.error("Lỗi khi tải dữ liệu bài tập:", err);
            });
    }, [token]);

    // Hàm để trích xuất danh sách nhóm cơ duy nhất - sửa lỗi Set iteration
    const extractUniqueMuscleGroups = (exerciseData: Exercises[]): string[] => {
        const allMuscleGroups: string[] = [];
        const uniqueGroupsSet = new Set<string>();
        
        exerciseData.forEach(exercise => {
            if (exercise.muscle_group) {
                // Tách các nhóm cơ dựa trên dấu phẩy và loại bỏ khoảng trắng
                const groups = exercise.muscle_group.split(',').map(group => group.trim());
                groups.forEach(group => {
                    if (group && !uniqueGroupsSet.has(group)) {
                        uniqueGroupsSet.add(group);
                        allMuscleGroups.push(group);
                    }
                });
            }
        });
        
        return allMuscleGroups;
    };

    // Hàm để tách các bước thành mảng từ chuỗi
    const parseSteps = (stepsString: string): string[] => {
        if (!stepsString) return [];
        // Tách các bước dựa trên ký tự xuống dòng '\n'
        return stepsString.split('\\n');
    };

    // Hàm xử lý lọc bài tập khi chọn nhóm cơ
    const handleFilterChange = (muscleGroup: string) => {
        setSelectedMuscleGroup(muscleGroup);
        setSelectedExercise(null); // Quay lại danh sách khi thay đổi bộ lọc
        
        if (muscleGroup === "Tất cả") {
            setFilteredExercises(exercises);
        } else {
            const filtered = exercises.filter(exercise => 
                exercise.muscle_group.toLowerCase().includes(muscleGroup.toLowerCase())
            );
            setFilteredExercises(filtered);
        }
    };

    // Mở chế độ xem chi tiết bài tập
    const viewExerciseDetails = (exercise: Exercises) => {
        setSelectedExercise(exercise);
    };

    // Quay lại danh sách bài tập
    const backToList = () => {
        setSelectedExercise(null);
    };

    // Hiển thị chi tiết một bài tập
    const renderExerciseDetails = () => {
        if (!selectedExercise) return null;

        return (
            <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-teal-400">{selectedExercise.exercise_name}</h1>
                    <button 
                        onClick={backToList}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Quay lại danh sách
                    </button>
                </div>

                {selectedExercise.video_urls && (
                    <div className="my-6">
                        <video 
                            className="w-full rounded-lg shadow-md" 
                            controls
                        >
                            <source src={selectedExercise.video_urls} type="video/mp4" />
                            Trình duyệt của bạn không hỗ trợ video.
                        </video>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-teal-400 mb-2">Nhóm cơ</h2>
                        <p>{selectedExercise.muscle_group}</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-teal-400 mb-2">Dụng cụ cần thiết</h2>
                        <p>{selectedExercise.equipment_required}</p>
                    </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold text-teal-400 mb-2">Mô tả</h2>
                    <p>{selectedExercise.description}</p>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold text-teal-400 mb-4">Các bước thực hiện</h2>
                    <ol className="list-decimal ml-6 space-y-2">
                        {parseSteps(selectedExercise.steps).map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            </div>
        );
    };

    // Kiểm tra xem có phải đang hiển thị nhóm cơ ngực không
    const isChestMuscleGroupSelected = () => {
        return selectedMuscleGroup.toLowerCase().includes('ngực');
    };

    // Hiển thị quy tắc tập ngực nếu đang chọn nhóm cơ ngực
    const renderChestRules = () => {
        if (!isChestMuscleGroupSelected()) return null;

        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện cơ ngực cho phái mạnh**
                </h2>
                <p className="mb-4 text-white">
                    Tập luyện phát triển cơ bắp là một quá trình dài đòi hỏi nỗ lực và sự kiên trì, không hề có đốt cháy giai đoạn để đạt được kết quả sớm hơn. Rất nhiều bạn mới tập rất mong muốn cơ ngực phát triển ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. Gymlab đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Gymlab có mức tạ tham khảo theo trình độ đối với mỗi bài tập, các bạn tham khảo trước khi tập nhé</li>
                </ul>
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **Kiến thức cơ bản bạn cần nắm**
                </h2>
                <ol className="list-decimal ml-6 space-y-2 text-white">
                    <li><strong>Nhóm cơ chính tham gia vào chuyển động đẩy: Ngực - Tay Sau.</strong> Khi thực hiện động tác đẩy ngực, tay sau cũng góp phần tham gia vào chuyển động, nhưng đối với người mới tập, mục tiêu ban đầu là làm quen và hiểu các chuyển động của từng nhóm cơ, nên các bạn có thể tập trung vào 1 nhóm cơ ngực thôi nhé</li>
                    <li><strong>Cơ ngực bao gồm:</strong> Ngực trên (đẩy chéo lên) - Ngực giữa (đẩy ngang) - Ngực dưới (đẩy chéo xuống) - Bài tập bổ sung (Ép ngực)</li>
                </ol>
                <p className="mt-4 text-white"><strong>Note:</strong></p>
                <ol className="list-decimal ml-6 space-y-2 text-white">
                    <li>Cơ ngực là 1 thể thống nhất, mình chia ra ngực trên - ngực giữa - ngực dưới để các bạn mới dễ hiểu bản chất nhé.</li>
                    <li>Mỗi bài tập mình đưa ra 2-3 biến thể, các bạn chỉ lựa chọn 1 biến thể phù hợp với trình độ để tập thôi nhé.</li>
                </ol>
            </div>
        );
    };

    // Hiển thị danh sách bài tập
    const renderExercisesList = () => {
        if (filteredExercises.length !== 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 gap-y-10 mt-10">
                    {filteredExercises.map((exercise) => (
                        <div 
                            key={exercise.id} 
                            className="p-4 border border-gray-300 rounded text-white"
                        >
                            <div className="flex flex-col">
                                <h2 className="text-lg font-bold mb-2 text-teal-400">{exercise.exercise_name}</h2>

                                {exercise.video_urls && (
                                    <div className="mb-4">
                                        <video 
                                            className="mb-2 w-full" 
                                            controls
                                        >
                                            <source src={exercise.video_urls} type="video/mp4" />
                                            Trình duyệt của bạn không hỗ trợ video.
                                        </video>
                                    </div>
                                )}

                                <div className="mb-2">
                                    <span className="font-medium text-teal-400">Nhóm cơ: </span>
                                    <span>{exercise.muscle_group}</span>
                                </div>

                                <div className="mb-2">
                                    <span className="font-medium text-teal-400">Dụng cụ cần thiết: </span>
                                    <span>{exercise.equipment_required}</span>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={() => viewExerciseDetails(exercise)}
                                        className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-center flex-col gap-4">
                    {exercises.length > 0 ? (
                        <h1 className="mt-4 text-2xl font-bold text-teal-400 text-center">Không tìm thấy bài tập cho nhóm cơ đã chọn.</h1>
                    ) : (
                        <h1 className="mt-4 text-2xl font-bold text-teal-400 text-center">Chưa có bài tập nào. Hãy thêm bài tập để bắt đầu!</h1>
                    )}
                    <button 
                        onClick={() => navigate("/customexercise")} 
                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Thêm Bài Tập
                    </button>
                </div>
            );
        }
    };

    return (
        <div className='text-white mr-5 ml-5 m-auto mb-40'>
            {selectedExercise ? (
                // Hiển thị chi tiết bài tập nếu đã chọn một bài tập
                renderExerciseDetails()
            ) : (
                // Hiển thị danh sách bài tập nếu chưa chọn bài tập nào
                <>
                    <h1 className="text-4xl font-bold mb-4 text-center mt-5">Các Bài Tập Thể Dục</h1>
                    <p className="text-gray-600 mb-4 mx-20 text-white text-xl">
                        Danh sách bài tập này bao gồm nhiều bài tập nhằm vào các nhóm cơ khác nhau. Nhấn vào một bài tập để xem thông tin chi tiết và các bước thực hiện.
                    </p>

                    {/* Phần lọc theo nhóm cơ */}
                    {exercises.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mt-8 mb-8">
                            {muscleGroups.map((group, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFilterChange(group)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                                        selectedMuscleGroup === group
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Hiển thị quy tắc tập ngực nếu đang chọn nhóm cơ ngực */}
                    {renderChestRules()}

                    {renderExercisesList()}
                </>
            )}
        </div>
    );
}

export default Exercise;