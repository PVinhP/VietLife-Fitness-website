import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

// ... (Các interface Exercises và Guide giữ nguyên) ...

interface Exercises {
    id: number;
    exercise_name: string;
    video_urls: string;
    thumbnail_url: string; 
    description: string;
    muscle_group: string;
    equipment_required: string;
    steps: string;
}

interface Guide {
    title: string;
    content: string;
}

function Exercise() {
    // ... (Các state giữ nguyên) ...
    const [exercises, setExercises] = useState<Exercises[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercises[]>([]);
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("Tất cả");
    const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<Exercises | null>(null);
    const [guide, setGuide] = useState<Guide | null>(null);
    const [isLoadingGuide, setIsLoadingGuide] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // ... (useEffect tải dữ liệu ban đầu không đổi) ...
    useEffect(() => {
        const token = localStorage.getItem("token"); 

        const fetchInitialData = async () => {
            setIsLoadingGuide(true); 
            try {
                const exerciseRes = await axios.get("http://localhost:8080/exercise", {
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                });
                
                const exerciseData = exerciseRes.data;
                setExercises(exerciseData);
                const uniqueMuscleGroups = extractUniqueMuscleGroups(exerciseData);
                setMuscleGroups(["Tất cả", ...uniqueMuscleGroups]);

                const guideRes = await axios.get(`http://localhost:8080/api/guides/Tất cả`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGuide(guideRes.data);

            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status !== 404) {
                     console.error("Lỗi khi tải dữ liệu ban đầu:", err);
                }
            } finally {
                setIsLoadingGuide(false); 
            }
        };

        fetchInitialData();
    }, []); 

    // ... (useEffect lọc dữ liệu không đổi) ...
    useEffect(() => {
        let tempExercises = [...exercises];

        if (selectedMuscleGroup !== "Tất cả") {
            tempExercises = tempExercises.filter(exercise => 
                exercise.muscle_group.toLowerCase().includes(selectedMuscleGroup.toLowerCase())
            );
        }

        if (searchQuery.trim() !== "") {
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            tempExercises = tempExercises.filter(exercise =>
                exercise.exercise_name.toLowerCase().includes(lowerCaseQuery)
            );
        }

        setFilteredExercises(tempExercises);

    }, [exercises, selectedMuscleGroup, searchQuery]); 

    // ... (Hàm extractUniqueMuscleGroups không đổi) ...
    const extractUniqueMuscleGroups = (exerciseData: Exercises[]): string[] => {
        const allMuscleGroups: string[] = [];
        const uniqueGroupsSet = new Set<string>();
        
        exerciseData.forEach(exercise => {
            if (exercise.muscle_group) {
                const groups = exercise.muscle_group.split(',').map(group => group.trim());
                groups.forEach(group => {
                    if (group && group.toLowerCase() !== 'tất cả' && !uniqueGroupsSet.has(group)) {
                        uniqueGroupsSet.add(group);
                        allMuscleGroups.push(group);
                    }
                });
            }
        });
        
        return allMuscleGroups.sort();
    };

    // ... (Hàm parseSteps không đổi) ...
    const parseSteps = (stepsString: string): string[] => {
        if (!stepsString) return [];
        return stepsString.split('\\n');
    };
    
    // ... (Hàm handleFilterChange không đổi) ...
    const handleFilterChange = async (muscleGroup: string) => {
        setSelectedMuscleGroup(muscleGroup);
        setSelectedExercise(null);
        setGuide(null); 
        setIsLoadingGuide(true);
        
        try {
            const res = await axios.get(`http://localhost:8080/api/guides/${muscleGroup}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuide(res.data); 
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status !== 404) {
                 console.error("Lỗi khi tải hướng dẫn:", error);
            }
            setGuide(null); 
        } finally {
            setIsLoadingGuide(false);
        }
    };

    // ... (Hàm viewExerciseDetails, backToList không đổi) ...
    const viewExerciseDetails = (exercise: Exercises) => {
        setSelectedExercise(exercise);
        window.scrollTo(0, 0); 
    };

    const backToList = () => {
        setSelectedExercise(null);
        window.scrollTo(0, 0);
    };

    // ... (Hàm renderExerciseDetails không đổi) ...
    const renderExerciseDetails = () => {
        if (!selectedExercise) return null;

        return (
            <div 
                className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-teal-300"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-teal-600">{selectedExercise.exercise_name}</h1>
                    
                </div>
                {/* ... (Nội dung chi tiết giữ nguyên) ... */}
                {selectedExercise.video_urls && (
                    <div className="my-6">
                        <video className="w-full rounded-lg shadow-md" controls autoPlay>
                            <source src={selectedExercise.video_urls} type="video/mp4" />
                            Trình duyệt của bạn không hỗ trợ video.
                        </video>
                    </div>
                )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg border border-teal-300">
                        <h2 className="text-xl font-semibold text-teal-600 mb-2">Nhóm cơ</h2>
                        <p className="text-gray-900">{selectedExercise.muscle_group}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg border border-teal-300">
                        <h2 className="text-xl font-semibold text-teal-600 mb-2">Dụng cụ cần thiết</h2>
                        <p className="text-gray-900">{selectedExercise.equipment_required}</p>
                    </div>
            </div>
                <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-teal-300">
                    <h2 className="text-xl font-semibold text-teal-600 mb-2">Mô tả</h2>
                    <p className="text-gray-900">{selectedExercise.description}</p>
            </div>
                <div className="bg-gray-100 p-4 rounded-lg border border-teal-300">
                    <h2 className="text-xl font-semibold text-teal-600 mb-4">Các bước thực hiện</h2>
                    <ol className="list-decimal ml-6 space-y-2 text-gray-900">
                        {parseSteps(selectedExercise.steps).map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
                <div className="flex justify-end mt-8">
                    <button 
                        onClick={backToList}
                        className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg border border-teal-700 transition-colors"
                    >
                        ← Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    };

    // ... (Hàm renderGuide không đổi) ...
    const renderGuide = () => {
        if (isLoadingGuide) {
            return (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500 min-h-[100px]">
                    <p className="text-gray-600">Đang tải hướng dẫn...</p>
                </div>
            );
        }
        if (!guide) return null; 
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-l-4 border-teal-500">
                <h2 className="text-2xl font-bold mb-4 text-teal-600">
                    {guide.title}
                </h2>
                <div 
                    className="prose max-w-none text-gray-900" 
                    dangerouslySetInnerHTML={{ __html: guide.content }} 
                />
            </div>
        );
    };

    // ... (Hàm renderExercisesList không đổi) ...
    const renderExercisesList = () => {
        if (filteredExercises.length !== 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExercises.map((exercise) => (
                        <div 
                            key={exercise.id} 
                            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-teal-300 group"
                            onClick={() => viewExerciseDetails(exercise)}
                        >
                            {/* ... (Nội dung card giữ nguyên) ... */}
                            <div className="aspect-video overflow-hidden relative">
                                {exercise.thumbnail_url ? (
                                    <img 
                                        src={exercise.thumbnail_url} 
                                        alt={exercise.exercise_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">Không có ảnh</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="p-6">
                                <h2 className="font-bold text-xl mb-3 text-gray-800 hover:text-teal-500 transition-colors line-clamp-2">{exercise.exercise_name}</h2>
                                <div className="mb-3">
                                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm" onClick={(e) => { e.stopPropagation(); handleFilterChange(exercise.muscle_group); }}>
                                        {exercise.muscle_group}
                                    </span>
                                </div>
                                <div className="mb-2 text-gray-600 text-sm">
                                    <span className="font-medium text-teal-600">Dụng cụ cần thiết: </span>
                                    <span>{exercise.equipment_required}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-teal-500 text-sm font-medium">Xem chi tiết →</span>
                                    <div className="w-8 h-1 bg-teal-500 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
             return (
                <div className="flex justify-center items-center h-32">
                    <div className="text-center">
                        {/* ... (Nội dung "Không tìm thấy" giữ nguyên) ... */}
                        {exercises.length > 0 ? (
                            <>
                                <div className="text-xl text-gray-700 mb-4">😔 Không tìm thấy bài tập nào</div>
                                <p className="text-gray-600 mb-4">
                                    {searchQuery.trim() !== "" ? "Thử bỏ từ khóa tìm kiếm" : "Thử chọn nhóm cơ khác"}
                                </p>
                                <button 
                                    onClick={() => {
                                        setSearchQuery("");
                                        handleFilterChange("Tất cả");
                                    }} 
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg border border-teal-700 transition-colors"
                                >
                                    Xem tất cả bài tập
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-xl text-gray-700 mb-4">Chưa có bài tập nào</div>
                                <button 
                                    onClick={() => navigate("/customexercise")} 
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg border border-teal-700 transition-colors"
                                >
                                    Thêm Bài Tập
                                </button>
                            </>
                        )}
                    </div>
                </div>
            );
        }
    };

    // --- (ĐÃ CẬP NHẬT) Hàm render chính ---
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 px-4 py-12">
            <div className="w-full max-w-7xl m-auto bg-white shadow-2xl rounded-2xl p-6">
                
                {selectedExercise ? (
                    // Chế độ xem chi tiết
                    <div 
                        className="flex justify-center pt-4 animate-fade-in" 
                        onClick={backToList} 
                    >
                        {renderExerciseDetails()}
                    </div>
                ) : (
                    // Chế độ xem danh sách
                    <div className="animate-fade-in"> 
                        <h1 className="text-4xl font-bold mb-4 text-center mt-5 text-teal-600">Các Bài Tập Sức Mạnh</h1>
                        <p className="text-gray-600 mb-8 mx-4 md:mx-20 text-xl text-center">
                            Danh sách bài tập này bao gồm nhiều bài tập nhằm vào các nhóm cơ khác nhau. Nhấn vào một bài tập để xem thông tin chi tiết và các bước thực hiện.
                        </p>

                        {/* --- (ĐÃ CẬP NHẬT) Khu vực Tìm kiếm và Lọc --- */}
                        {/* - Sắp xếp: flex-col (mobile) và md:flex-row (desktop)
                            - md:justify-between: Đẩy 2 item ra 2 phía
                            - md:items-center: Căn giữa theo chiều dọc
                        */}
                        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6 px-6">
                            
                            {/* 1. Thanh tìm kiếm (Bên trái) */}
                            <div className="relative w-full md:w-1/2 lg:w-2/3">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên bài tập..."
                                    className="w-full py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        
                            {/* 2. Dropdown Lọc (Bên phải) */}
                            {exercises.length > 0 && (
                                <div className="flex justify-start md:justify-end items-center gap-3 w-full md:w-auto md:min-w-[280px]">
                                    
                                    {/* Icon Lọc */}
                                    <svg className="w-5 h-5 text-gray-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                                    </svg>
                                    
                                    {/* Label (ẩn trên mobile để tiết kiệm không gian) */}
                                    <label htmlFor="muscle-group-filter" className="text-gray-700 font-medium whitespace-nowrap hidden sm:block">
                                        Lọc theo nhóm cơ:
                                    </label>

                                    {/* Dropdown Select */}
                                    <select
                                        id="muscle-group-filter"
                                        value={selectedMuscleGroup}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        className="appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5 pr-10 cursor-pointer transition-all"
                                        style={{ 
                                            backgroundPosition: 'right 0.75rem center', 
                                            backgroundSize: '0.85em auto', 
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                            backgroundRepeat: 'no-repeat' 
                                        }}
                                    >
                                        {muscleGroups.map((group, index) => (
                                            <option key={index} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Dòng "Hiển thị" đã bị XÓA */}
                        </div>

                        {/* Đường kẻ ngang phân tách */}
                        <hr className="mb-8 border-gray-100" />

                        {renderGuide()}
                        
                        {renderExercisesList()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Exercise;