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

    // Kiểm tra xem có phải đang hiển thị nhóm cơ ngực hoặc bụng không
    const isMuscleGroupSelected = (muscleType: string) => {
        return selectedMuscleGroup.toLowerCase().includes(muscleType.toLowerCase());
    };

    // Hiển thị quy tắc tập ngực nếu đang chọn nhóm cơ ngực
    const renderChestRules = () => {
        if (!isMuscleGroupSelected('ngực')) return null;

        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP NGỰC TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO BẠN**
                </h2>
                <h3 className="text-2xl font-bold mb-4 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện cơ ngực **
                </h3>
                <p className="mb-4 text-white">
                    Tập luyện phát triển cơ bắp là một quá trình dài đòi hỏi nỗ lực và sự kiên trì, không hề có đốt cháy giai đoạn để đạt được kết quả sớm hơn. Rất nhiều bạn mới tập rất mong muốn cơ ngực phát triển ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. VietLife có mức tạ tham khảo theo trình độ đối với mỗi bài tập, các bạn tham khảo trước khi tập nhé</li>
                </ul>
            </div>
        );
    };
    
    // Hiển thị quy tắc tập bụng nếu đang chọn nhóm cơ bụng
    const renderAbsRules = () => {
        if (!isMuscleGroupSelected('bụng')) return null;

        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP BỤNG TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
                </h2>
                
                <h3 className="text-xl font-semibold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện bụng dành cho phái mạnh**
                </h3>
                <p className="mb-4 text-white">
                    Bụng là bộ phận rất quan trọng đối với nam giới, tuy nhiên các bài tập bụng sẽ luôn có những tác động đến các nhóm cơ khác trên cơ thể như lưng và cơ liên sườn. Do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến bụng để tránh chấn thương ngoài ý muốn, vừa anh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn bụng phát triển to đẹp ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng các khớp eo và lưng trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập bụng, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };
    const renderCalfRules = () => {
        if (!isMuscleGroupSelected('bắp chân')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP BẮP CHÂN TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
                </h2>
                <p className="mb-4 text-white">
                    "Bài tập bắp chân", "Làm sao để bắp chân to ra" có lẽ luôn là các cụm từ được anh em tìm kiếm nhiều nhất. Đã là nam giới thì ai cũng muốn được sở hữu bắp chân săn chắc, to khỏe và cơ bắp. Chính vì thế, hãy cùng VietLife tham khảo và tập theo các bài tập bắp chân tốt nhất tại phòng gym ngay dưới đây. Đặc biệt, bạn nhất định không thể bỏ qua các quy tắc quan trọng để gia tăng hiệu quả và giảm chấn thương khi luyện tập nhé.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện bắp chân dành cho phái mạnh**
                </h3>
                <p className="mb-4 text-white">
                    Bắp chân là nhóm cơ rất quan trọng đối với nam giới, do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến bắp chân để tránh chấn thương ngoài ý muốn. Điều này giúp giảm ảnh hưởng đến hoạt động hằng ngày và tăng hiệu quả tập luyện. Rất nhiều người mới bắt đầu đã mong muốn bắp chân phát triển to đẹp ngay sau 1-2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng eo, hông và cổ chân trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập bắp chân, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };
    // Hiển thị quy tắc tập cơ liên sườn
    const renderIntercostalRules = () => {
        if (!isMuscleGroupSelected('liên sườn')) return null;

        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện cơ liên sườn dành cho bạn**
                </h2>
                <p className="mb-4 text-white">
                    Cơ liên sườn là nhóm cơ rất quan trọng đối với nam giới, tuy nhiên các bài tập cơ liên sườn sẽ luôn có những tác động đến các nhóm cơ bụng. Do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến cơ liên sườn để tránh chấn thương ngoài ý muốn, vừa anh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn cơ liên sườn phát triển to đẹp ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng eo, hông và lưng trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập cơ liên sườn, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };
    const renderForearmRule = () => {
        if (!isMuscleGroupSelected('Tay trước')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP TAY TRƯỚC TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO BẠN**
                </h2>
                <p className="mb-4 text-white">
                    Tay trước là nhóm cơ rất quan trọng đối với nam giới và các bài tập tay trước sẽ luôn có những tác động đến nhóm cơ cẳng tay. Vì thế, các bạn không nên thử sức với các bài tập tay trước quá phức tạp, quá nặng khi mới bắt đầu để tránh chấn thương nhé.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện tay trước**
                </h3>
                <p className="mb-4 text-white">
                    Tay trước là nhóm cơ rất quan trọng trong đời sống hằng ngày, do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến tay trước để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn tay trước phát triển to đẹp ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm khớp tay, cổ tay, cẳng tay và vai trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập tay trước, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };
    const renderTricepsRules = () => {
        if (!isMuscleGroupSelected('tay sau')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP TAY SAU TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
                </h2>
                <p className="mb-4 text-white">
                    Khi bước chân vào con đường tập gym, chắc hẳn bạn nam nào cũng muốn mình sở hữu 1 đôi tay săn chắc, to khỏe, vạm vỡ và cuồn cuộn cơ bắp để có thể tự tin diện mọi trang phục với mọi thiết kế. Hiểu được điều đấy, VietLife đã tổng hợp các bài tập tay sau tốt nhất tại phòng gym dành cho nam giới và cả những quy tắc quan trọng khi tập tay sau để tăng hiệu quả bài tập, giảm nguy cơ chấn thương. Cùng VietLife theo dõi tiếp bài viết nhé.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện tay sau dành cho phái mạnh**
                </h3>
                <p className="mb-4 text-white">
                    Tay sau là nhóm cơ rất quan trọng đối với nam giới và các bài tập tay sau sẽ luôn có những tác động đến đầu ngắn, đầu dài,... Do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến tay sau để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn tay sau phát triển to đẹp ngay sau 1-2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm khớp tay, cổ tay, cẳng tay, vai và cổ trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập tay sau, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };

    const renderForearmRules = () => {
        if (!isMuscleGroupSelected('cẳng tay')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
            <h2 className="text-2xl font-bold mb-4 text-teal-400">
                **Quy tắc quan trọng khi tập luyện cẳng tay dành cho bạn**
            </h2>
            <p className="mb-4 text-white">
                Cẳng tay là nhóm cơ rất quan trọng đối với nam giới và các bài tập cẳng tay sẽ luôn có những tác động đến các nhóm cơ tay trước, sau. Do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến cẳng tay để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn cẳng tay phát triển to đẹp ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-white">
                <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm khớp tay, cổ tay, cẳng tay và vai trong vòng 5 phút.</li>
                <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập cẳng tay, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
            </ul>
            </div>
        );
        };

    const renderLowerBackRules = () => {
        if (!isMuscleGroupSelected('lưng dưới')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP LƯNG DƯỚI TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
                </h2>
                <p className="mb-4 text-white">
                    Lưng dưới săn chắc, cơ bắp không chỉ giúp bạn có được một chiếc body tuyệt đẹp, mà khi tăng cường luyện tập lưng dưới còn giúp bạn cải thiện sức khỏe vùng cột sống, giảm chấn thương khi luyện tập các nhóm cơ khác trên cơ thể. Vì thế hãy cùng VietLife đọc tiếp bài viết dưới đây để tham khảo thêm các bài tập lưng dưới tốt nhất dành cho nam tại phòng tập gym. Đặc biệt, bạn đừng bỏ qua các quy tắc quan trọng khi tập luyện mà VietLife nêu ra dưới đây để đảm bảo an toàn và gia tăng hiệu quả bài tập nhé.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi luyện tập lưng dưới dành cho phái mạnh**
                </h3>
                <p className="mb-4 text-white">
                    Lưng dưới là bộ phận rất quan trọng đối với nam giới, tuy nhiên các bài tập lưng dưới sẽ luôn có những tác động đến các nhóm cơ khác trên cơ thể như đùi, bụng, mông,... Do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến lưng dưới để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn lưng dưới phát triển to đẹp ngay sau 1-2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng eo, lưng trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập lưng dưới, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };
    const renderHamstringRules = () => {
        if (!isMuscleGroupSelected('đùi sau')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP ĐÙI SAU TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
                </h2>
                <p className="mb-4 text-white">
                    Đùi sau là nhóm cơ rất quan trọng đối với phái mạnh và luôn là nhóm cơ được ưu tiên khi nam giới bắt đầu tập thể hình. Khi sở hữu cơ đùi sau săn chắc, phái mạnh sẽ rất tự tin, thoải mái diện mọi loại trang phục, mọi chất liệu và mọi thiết kế. Hiểu được sự quan tâm ấy của nam giới, VietLife đã tổng hợp toàn bộ các bài tập đùi sau tốt nhất dành cho nam giới tại phòng gym trong bài viết này. Tuy nhiên, để việc tập luyện đùi sau đạt hiệu quả tốt nhất, bạn vẫn nên đọc qua một vài quy tắc quan trọng dưới đây để đảm bảo an toàn và tăng hiệu quả khi tập nhé.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện đùi sau cho phái mạnh**
                </h3>
                <p className="mb-4 text-white">
                    Đùi sau là một bộ phận rất quan trọng trong đời sống hằng ngày, do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến đùi sau để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn có đùi sau phát triển to đẹp ngay sau 1-2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng các khớp gối, cổ chân trong 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đùi sau là nhóm cơ quan trọng mà đối với các bạn mới bắt đầu, chỉ cần tập đúng form, mức tạ vừa phải là có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };
    const renderMidBackRules = () => {
        if (!isMuscleGroupSelected('lưng giữa')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP LƯNG GIỮA TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
                </h2>
                <p className="mb-4 text-white">
                    Nếu bạn thật sự nghiêm túc luyện tập thể hình và mong muốn sở hữu một body đẹp toàn diện, thì bạn không nên bỏ qua các bài tập lưng giữa tốt nhất tại phòng gym dành cho nam mà VietLife đã tổng hợp. Đặc biệt đừng nên bỏ qua các quy tắc quan trọng giúp hiệu quả bài tập tăng lên và giảm tối đa chấn thương mà VietLife đã nêu ra dưới đây nhé.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi luyện tập lưng giữa dành cho phái mạnh**
                </h3>
                <p className="mb-4 text-white">
                    Lưng giữa là bộ phận rất quan trọng đối với nam giới, tuy nhiên các bài tập lưng giữa sẽ luôn có những tác động đến các nhóm cơ khác trên cơ thể như xô và lưng dưới. Do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến lưng giữa để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn lưng giữa phát triển to đẹp ngay sau 1-2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng các khớp lưng và eo trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập lưng giữa, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
    };
    const renderBackRules = () => {
        if (!isMuscleGroupSelected('lưng xô')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
            <h2 className="text-2xl font-bold mb-4 text-teal-400">
                **CÁC BÀI TẬP LƯNG XÔ TỐT NHẤT TẠI PHÒNG GYM DÀNH BẠN**
            </h2>
            <p className="mb-4 text-white">
                Cơ lưng là nhóm cơ thể hiện sự mạnh mẽ của phái mạnh, bất cứ người đàn ông nào cũng mong muốn sử hữu một bộ lưng rộng và to, là điểm tựa vững chắc cho bất cứ ai. Sở hữu bộ lưng to luôn khiến thân trên nhìn rộng, dày và mạnh mẽ hơn. Lưng được cấu tạo từ 2 phần cơ chính là lưng xô, giúp cải thiện độ rộng của lưng, và lưng giữa, giúp cải thiện độ dày của lưng. Ở bài viết này chúng ta sẽ tập trung chủ yếu vào lưng xô, tất cả đều là các bài tập rất cơ bản, các bạn chỉ cần thực hiện đúng form tập, mức tạ vừa sức thì đảm bảo sau 2-3 tháng độ rộng của lưng sẽ thay đổi đáng kể.
            </p>
            
            <h3 className="text-xl font-bold mb-3 text-teal-400">
                **Quy tắc quan trọng khi tập luyện cơ lưng cho bạn**
            </h3>
            <p className="mb-4 text-white">
                Cơ lưng là nhóm cơ rất khó cảm nhận, nhiều bạn tập các bài lưng nhưng không chú ý form tập nên vào cơ rất ít mà đa số thấy mỏi bắp tay, làm như vậy sẽ khiến cơ lưng chậm phát triển. Rất nhiều bạn mới tập rất mong muốn cơ lưng to dày lên sau vài tuần tập luyện và khi không đạt được kết quả các bạn thường dễ nản và bỏ cuộc. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
            </p>
            
            <ul className="list-disc ml-6 space-y-2 text-white">
                <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Các bài kéo cần dùng rất nhiều sức của bắp tay và cổ tay, cần làm nóng kỹ để cơ và dây chằng không bị shock do tập luyện nặng quá sớm.</li>
                <li>Kích thích cơ lưng trước khi tập set chính, tập các bài lưng cơ bản với mức tạ nhẹ, chú ý cánh tay ép hơi sát với cơ thể để kích thích được phần cơ xô, làm vậy sẽ giúp cơ lưng dễ cảm nhận hơn khi vào set tập chính</li>
                <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, có 1 mẹo nhỏ là cũng không nên tập quá nhẹ sẽ không hiệu quả. VietLife có mức tạ tham khảo theo trình độ đối với mỗi bài tập, các bạn tham khảo trước khi tập nhé</li>
            </ul>
            </div>
        );
        };
        const renderGluteRules = () => {
        if (!isMuscleGroupSelected('mông')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">
                    **CÁC BÀI TẬP MÔNG TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
                </h2>
                <p className="mb-4 text-white">
                    Có một điều hiển nhiên là nam giới khi sở hữu một vòng 3 săn chắc, căng tròn sẽ trông có sức hút hơn đối với các bạn nam không có điều đấy. Cơ mông săn chắc sẽ giúp phái mạnh trở nên tự tin hơn khi diện bất kỳ loại trang phục nào, đồng thời còn gây được sự chú ý đến phái yếu. Vì thế, VietLife đã tổng hợp các bài tập mông tốt nhất tại phòng gym dành cho nam giới để các anh em có thể tham khảo và luyện tập theo.
                </p>
                
                <h3 className="text-xl font-bold mb-3 text-teal-400">
                    **Quy tắc quan trọng khi tập luyện mông dành cho phái mạnh**
                </h3>
                <p className="mb-4 text-white">
                    Mông là bộ phận rất quan trọng đối với nam giới, tuy nhiên các bài tập mông sẽ luôn có những tác động đến các nhóm cơ khác trên cơ thể như đùi trước, đùi sau và lưng dưới. Do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến mông để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn mông phát triển to đẹp ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                </p>
                
                <ul className="list-disc ml-6 space-y-2 text-white">
                    <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng các khớp gối, cổ chân, hông và lưng trong vòng 5 phút.</li>
                    <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu tập mông, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                </ul>
            </div>
        );
        };
        const renderThighRules = () => {
        if (!isMuscleGroupSelected('đùi trước')) return null;
        
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
            <h2 className="text-2xl font-bold mb-4 text-teal-400">
                **CÁC BÀI TẬP ĐÙI TRƯỚC TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO NAM**
            </h2>
            <p className="mb-4 text-white">
                Đùi trước là một nhóm cơ rất quan trọng ở phần thân dưới của đàn ông, một cơ đùi săn chắc chắc chắn sẽ giúp bạn tự tin hơn gấp 10 khi mặc các loại quần tây, jeans, đùi hoặc quần jogger. Vì khi sở hữu một cơ đùi săn chắc, trông bạn sẽ trở nên nam tính và thu hút ánh nhìn của người đối diện hơn. Hiểu được điều đấy, VietLife đã cho ra top các bài tập đùi vừa chi tiết, cụ thể, vừa đơn giản, dễ thực hiện theo tại phòng gym dành cho các bạn nam đây. Tuy nhiên, bạn hãy lưu ý rằng, cơ đùi là nhóm cơ rất quan trọng trong cuộc sống hằng ngày, nó phụ thuộc rất nhiều ở các hoạt động thường ngày như đi, đứng, ... của cơ thể. Vì thế, các bạn không nên thử sức với các bài tập đùi trước quá phức tạp, quá nặng khi mới bắt đầu để tránh chấn thương nhé.
            </p>
            
            <h3 className="text-xl font-bold mb-3 text-teal-400">
                **Quy tắc quan trọng khi tập luyện đùi trước cho phái mạnh**
            </h3>
            <p className="mb-4 text-white">
                Đùi trước là cơ đùi rất quan trọng trong đời sống hằng ngày, do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến đùi trước (Squat, các bài tập sử dụng dụng cụ hỗ trợ) để tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn đùi trước phát triển to đẹp ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
            </p>
            
            <ul className="list-disc ml-6 space-y-2 text-white">
                <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu, xoay nhẹ và làm nóng cổ chân, khớp gối trong 5 phút.</li>
                <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Đối với những người mới bắt đầu, không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là có thể đạt được hiệu quả tốt nhé.</li>
            </ul>
            </div>
        );
        };
        const renderShoulderRules = () => {
            if (!isMuscleGroupSelected('vai')) return null;
            
            return (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                    <h2 className="text-2xl font-bold mb-4 text-teal-400">
                        **CÁC BÀI TẬP VAI TỐT NHẤT TẠI PHÒNG GYM DÀNH CHO BẠN**
                    </h2>
                    <p className="mb-4 text-white">
                        Cơ vai là nhóm cơ đem lại sự nam tính cho bất kỳ người đàn ông nào, với bộ vai to rộng, bề ngang của thân trên sẽ nhìn rất rộng và mạnh mẽ. Bộ vai rộng sẽ giúp anh em luôn tự tin khi mặc bất kỳ trang phục nào như áo sơ mi, áo thun, Oversize, ba lỗ,... Hiểu được lợi ích to lớn của bộ vai rộng, VietLife đã tổng hợp top các bài tập hiệu quả nhất tại phòng gym để độ bộ vai đẹp nhé. Khớp vai là nhóm khớp cực kỳ quan trọng trong công việc và đời sống hằng ngày, nên các bạn nên tránh các bài tập vai quá phức tạp hoặc tập quá nặng để tránh nguy cơ chấn thương nhé. Các bạn chỉ cần tập đúng form, đúng mức tạ thì chỉ cần vài tháng sẽ thấy cơ vai thay đổi rõ rệt nhé.
                    </p>
                    
                    <h3 className="text-xl font-bold mb-3 text-teal-400">
                        **Quy tắc quan trọng khi tập luyện cơ vai cho phái mạnh**
                    </h3>
                    <p className="mb-4 text-white">
                        Khớp vai là khớp rất quan trọng trong đời sống hằng ngày, do đó chúng ta cần cực kỳ cẩn thận khi tập luyện các bài tập liên quan đến khớp vai (Đẩy ngực, đẩy vai), tránh chấn thương ngoài ý muốn, vừa ảnh hưởng đến hoạt động hằng ngày và hiệu quả tập luyện nhé. Rất nhiều người mới bắt đầu đã mong muốn có cơ vai phát triển to đẹp ngay sau 1 2 tuần tập luyện và hậu quả chấn thương rất cao. VietLife đưa ra bộ quy tắc cơ bản trong buổi tập dưới đây, mong các bạn sẽ đọc và làm theo để đạt hiệu quả tốt nhất nhé:
                    </p>
                    
                    <ul className="list-disc ml-6 space-y-2 text-white">
                        <li>Khởi động thật kỹ trước khi bắt đầu set tập chính. Đây là lý do lớn nhất khiến nhiều bạn mới tập gặp chấn thương, vậy nên chú ý khởi động khoảng 15 phút thật kỹ các khớp, cardio nhẹ 5 phút để tăng cường lưu thông máu. Xoay nhẹ và làm nóng các khớp vai, cánh tay, cổ tay 5 phút.</li>
                        <li>Sử dụng mức tạ vừa sức, tránh tập quá nặng dẫn đến chấn thương ngoài ý muốn, cũng không nên tập quá nhẹ sẽ không hiệu quả. Cơ vai là nhóm cơ không yêu cầu phải tập quá nặng, các bạn chỉ cần tập đúng form, mức tạ vừa phải là vẫn có thể đạt được hiệu quả tốt nhé.</li>
                    </ul>
                </div>
            );
        };
        const renderBeginnerGymGuide = () => {
            if (!isMuscleGroupSelected('Tất cả')) return null;
            
            return (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                    <h2 className="text-2xl font-bold mb-4 text-teal-400">
                        **CÁCH TẬP LUYỆN, CHẾ ĐỘ DINH DƯỠNG VÀ LỊCH TẬP DÀNH CHO NGƯỜI MỚI TẬP GYM**
                    </h2>
                    <p className="mb-4 text-white">
                        Tập gym là một phương pháp rất tốt để cải thiện thể lực và giữ gìn dáng vóc. Hơn nữa, tập gym còn giúp giảm bớt stress và ngăn chặn được quá trình lão hóa sớm. Tuy nhiên, tập gym không phải là điều dễ dàng nếu không có kế hoạch cụ thể, việc đạt được mục tiêu sẽ trở nên khó khăn. Hãy tham khảo bài viết này để lập ra chế độ tập luyện và dinh dưỡng phù hợp cho riêng mình nhé.
                    </p>
                    
                    <h3 className="text-xl font-bold mb-3 text-teal-400">
                        **Người mới tập cần chuẩn bị những gì**
                    </h3>
                    <p className="mb-4 text-white">
                        Dưới đây là 4 quy tắc tập gym chuẩn chỉnh dành cho người mới bắt đầu, giúp bạn dễ dàng đạt được mục tiêu của mình nhanh hơn.
                    </p>

                    <h4 className="text-lg font-semibold mb-2 text-teal-400">
                        1. Đề ra lịch trình tập gym hợp lý
                    </h4>
                    <p className="mb-4 text-white">
                        Nhiều người mới tập nghĩ rằng tập gym 7 ngày/tuần sẽ mang lại hiệu quả cao hơn, nhưng thực tế, tập quá nhiều có thể gây kiệt sức hoặc chán nản. Việc không có lịch tập rõ ràng, lặp lại các bài tập giống nhau mỗi ngày sẽ không hiệu quả và dễ gây chán. Hãy tạo lịch trình tập luyện cố định, tối thiểu 3-5 buổi/tuần, để cơ thể dễ thích nghi và theo kịp tiến độ. VietLife cung cấp các lịch tập cụ thể tùy theo nhu cầu, thời gian và trình độ, bạn có thể tham khảo thêm nhé.
                    </p>

                    <h4 className="text-lg font-semibold mb-2 text-teal-400">
                        2. Lựa chọn đồ tập phù hợp, thoải mái
                    </h4>
                    <p className="mb-4 text-white">
                        Chọn trang phục thoải mái, dễ vận động để việc tập gym trở nên tiện lợi hơn. Chuẩn bị áo thun thấm hút mồ hôi, áo bra thoáng khí, quần tập bó vừa phải. Chất liệu polyester, spandex hoặc cotton pha polyester là lựa chọn hợp lý. Hãy vệ sinh quần áo cẩn thận sau khi tập để tránh mùi hôi.
                    </p>

                    <h4 className="text-lg font-semibold mb-2 text-teal-400">
                        3. Đảm bảo nạp đủ dinh dưỡng trước, trong và sau buổi tập
                    </h4>
                    <p className="mb-4 text-white">
                        Tập gym tiêu tốn nhiều năng lượng, do đó cần nạp đủ dinh dưỡng để duy trì hiệu quả tập luyện:
                        <ul className="list-disc ml-6 space-y-2 text-white">
                            <li><strong>Trước tập (1-2 tiếng):</strong> Ăn nhẹ với thực phẩm hấp thụ nhanh như 1 trái chuối để có năng lượng mà không gây mệt mỏi. Tránh ăn quá no hoặc đồ khó tiêu như cơm, bánh mì.</li>
                            <li><strong>Trong khi tập:</strong> Uống ít nhất 1 lít nước/60 phút tập để tránh mất nước, chuột rút hoặc mệt mỏi.</li>
                            <li><strong>Sau tập:</strong> Nạp đủ protein, tinh bột, chất xơ (rau củ) và vitamin. Tránh nhịn ăn sau tập vì sẽ khiến cơ thể kiệt sức, dễ nản và bỏ cuộc. Protein đặc biệt quan trọng để phát triển cơ bắp và tăng hiệu quả cho các buổi tập sau.</li>
                        </ul>
                    </p>

                    <h4 className="text-lg font-semibold mb-2 text-teal-400">
                        4. Luôn khởi động nhẹ trước khi vào bài tập
                    </h4>
                    <p className="mb-4 text-white">
                        Khởi động kỹ trong 15 phút với các động tác xoay khớp tay, chân, nâng gối và 5-10 phút cardio nhẹ (đạp xe, đi bộ) để tăng lưu thông máu và làm nóng cơ thể. Bước này giúp tránh chấn thương và tăng hiệu quả tập luyện.
                    </p>

                    <h3 className="text-xl font-bold mb-3 text-teal-400">
                        **Lịch tập luyện chi tiết dành cho người mới**
                    </h3>
                    <p className="mb-4 text-white">
                        Không có lịch tập cố định phù hợp cho tất cả mọi người vì bài tập phụ thuộc vào thể trạng từng người. Tuy nhiên, bạn có thể tham khảo lịch tập gym 5 ngày/tuần dưới đây từ VietLife, kết hợp cardio nhẹ 15-30 phút sau mỗi buổi để đốt calo và giảm mỡ hiệu quả:
                    </p>
                    <ul className="list-disc ml-6 space-y-2 text-white">
                        <li><strong>Thứ 2:</strong> 💪 Tập thân trên (ngực, vai, tay) + 15’ cardio</li>
                        <li><strong>Thứ 3:</strong> 🏃 Cardio chính + Core (bụng/lưng dưới)</li>
                        <li><strong>Thứ 4:</strong> 🦵 Chân + Mông</li>
                        <li><strong>Thứ 5:</strong> 🧘 Nghỉ / đi bộ nhẹ / yoga phục hồi</li>
                        <li><strong>Thứ 6:</strong> 💪 Thân trên (lưng + xô + tay sau) + core</li>
                        <li><strong>Thứ 7:</strong> 🏃 Cardio đốt mỡ + bài full-body nhẹ</li>
                        <li><strong>Chủ nhật:</strong> 🧘 Nghỉ / kéo giãn / đi bộ</li>
                    </ul>

                    <h3 className="text-xl font-bold mb-3 text-teal-400">
                        **Kết luận**
                    </h3>
                    <p className="mb-4 text-white">
                        Chỉ cần dành 45-60 phút mỗi ngày để tập gym, bạn sẽ sớm sở hữu thân hình đáng mơ ước và sức khỏe cải thiện rõ rệt. Hãy kiên trì và tuân thủ lịch tập, chế độ dinh dưỡng để đạt được kết quả tốt nhất nhé!
                    </p>
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
                    <h1 className="text-4xl font-bold mb-4 text-center mt-5">Các Bài Tập Sức Mạnh</h1>
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

                    {/* Hiển thị quy tắc tập ngực hoặc bụng tùy vào nhóm cơ đã chọn */}
                    {renderChestRules()}
                    {renderAbsRules()}
                    {renderBackRules()}
                    {renderForearmRule()} {/* Tay trước */}
                    {renderForearmRules()}  {/* cẳng tay */}
                    {renderGluteRules()}  {/* mông */}
                    {renderShoulderRules()}  {/* vai */}
                    {renderCalfRules()}  {/* bắp chân*/}
                    {renderBeginnerGymGuide()}
                    {renderTricepsRules()}  {/* tay sau*/}
                    {renderThighRules()}
                    {renderLowerBackRules()} 
                    {renderMidBackRules()}
                    {renderHamstringRules()}
                    {renderIntercostalRules()}
                    {renderExercisesList()}
                </>
            )}
        </div>
    );
}

export default Exercise;