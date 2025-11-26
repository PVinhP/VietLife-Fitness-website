import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom"; 
import ExerciseCard from "../components/ExerciseCard"; 

interface Exercises {
    id: number;
    exercise_name: string;
    video_urls: string;
    thumbnail_url: string; 
    description: string;
    muscle_group: string;
    equipment_required: string;
    steps: string;
    difficulty?: string;
}

interface Guide {
    title: string;
    content: string;
}

function Exercise() {
    // --- State Management ---
    const [exercises, setExercises] = useState<Exercises[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercises[]>([]);
    
    // State cho bộ lọc
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("Tất cả");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Tất cả");
    const [searchQuery, setSearchQuery] = useState<string>("");
    
    // Dữ liệu danh sách lọc
    const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
    const difficulties = ["Tất cả", "Beginner", "Intermediate", "Advanced"];

    // State chi tiết & Hướng dẫn
    const [selectedExercise, setSelectedExercise] = useState<Exercises | null>(null);
    const [guide, setGuide] = useState<Guide | null>(null);
    const [isLoadingGuide, setIsLoadingGuide] = useState(false);
    
    // --- MỚI: State để quản lý việc mở rộng/thu gọn hướng dẫn ---
    const [isGuideExpanded, setIsGuideExpanded] = useState(false); 

    const navigate = useNavigate();
    const location = useLocation(); 
    const token = localStorage.getItem("token");

    // --- useEffect: Tải dữ liệu ban đầu ---
    useEffect(() => {
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
    }, [token]); 


    // --- useEffect: Tự động mở bài tập nếu được chuyển từ trang Thể thao ---
    useEffect(() => {
        if (location.state && location.state.selectedExerciseId && exercises.length > 0) {
            const targetId = location.state.selectedExerciseId;
            const foundExercise = exercises.find(ex => ex.id === targetId);
            
            if (foundExercise) {
                setSelectedExercise(foundExercise);
                window.scrollTo(0, 0); 
            }
        }
    }, [location.state, exercises]); 


    // --- useEffect: Logic Lọc Đa Điều Kiện ---
    useEffect(() => {
        let tempExercises = [...exercises];

        if (selectedMuscleGroup !== "Tất cả") {
            tempExercises = tempExercises.filter(exercise => 
                exercise.muscle_group.toLowerCase().includes(selectedMuscleGroup.toLowerCase())
            );
        }

        if (selectedDifficulty !== "Tất cả") {
            tempExercises = tempExercises.filter(exercise => 
                (exercise.difficulty || '').toLowerCase() === selectedDifficulty.toLowerCase()
            );
        }

        if (searchQuery.trim() !== "") {
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            tempExercises = tempExercises.filter(exercise =>
                exercise.exercise_name.toLowerCase().includes(lowerCaseQuery)
            );
        }

        setFilteredExercises(tempExercises);

    }, [exercises, selectedMuscleGroup, selectedDifficulty, searchQuery]); 

    // Helper functions
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

    const parseSteps = (stepsString: string): string[] => {
        if (!stepsString) return [];
        return stepsString.split('\\n');
    };
    
    // Handlers
    const handleMuscleChange = async (muscleGroup: string) => {
        setSelectedMuscleGroup(muscleGroup);
        setGuide(null); 
        setIsLoadingGuide(true);
        setIsGuideExpanded(false); // Reset trạng thái mở rộng khi đổi nhóm cơ
        try {
            const encodedGroup = encodeURIComponent(muscleGroup);
            const res = await axios.get(`http://localhost:8080/api/guides/${encodedGroup}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuide(res.data); 
        } catch (error) {
            setGuide(null); 
        } finally {
            setIsLoadingGuide(false);
        }
    };

    const handleResetFilter = () => {
        setSelectedMuscleGroup("Tất cả");
        setSelectedDifficulty("Tất cả");
        setSearchQuery("");
        handleMuscleChange("Tất cả");
    };

    const viewExerciseDetails = (exercise: Exercises) => {
        setSelectedExercise(exercise);
        window.scrollTo(0, 0); 
    };

    // Hàm quay lại thông minh (Hỗ trợ cả Sport và Plan)
    const backToList = () => {
        // Kiểm tra xem người dùng đến từ Sport hay Plan
        if (location.state && (location.state.fromSport || location.state.fromPlan)) {
            // Nếu đến từ 1 trong 2 trang đó -> Quay lại lịch sử trình duyệt
            navigate(-1); 
        } else {
            // Nếu không (vào trực tiếp thư viện) -> Chỉ tắt popup chi tiết
            setSelectedExercise(null);
            window.scrollTo(0, 0);
            
            // Xóa state để tránh lỗi khi F5
            window.history.replaceState({}, document.title);
        }
    };
    // --- Render Components ---

    const renderExerciseDetails = () => {
        if (!selectedExercise) return null;
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-teal-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4">
                    <h1 className="text-3xl font-bold text-teal-700">{selectedExercise.exercise_name}</h1>
                    <span className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${
                        selectedExercise.difficulty === 'Advanced' ? 'bg-red-100 text-red-600' :
                        selectedExercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                    }`}>
                        {selectedExercise.difficulty || 'Beginner'}
                    </span>
                </div>
                {selectedExercise.video_urls && (
                    <div className="mb-8 rounded-xl overflow-hidden shadow-lg bg-black">
                        <video className="w-full aspect-video" controls autoPlay>
                            <source src={selectedExercise.video_urls} type="video/mp4" />
                            Trình duyệt của bạn không hỗ trợ video.
                        </video>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                        <h2 className="text-lg font-semibold text-teal-800 mb-2 flex items-center">💪 Nhóm cơ tác động</h2>
                        <p className="text-gray-700 font-medium">{selectedExercise.muscle_group}</p>
                    </div>
                    <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                        <h2 className="text-lg font-semibold text-teal-800 mb-2 flex items-center">🏋️ Dụng cụ</h2>
                        <p className="text-gray-700 font-medium">{selectedExercise.equipment_required}</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Mô tả bài tập</h2>
                        <p className="text-gray-600 leading-relaxed">{selectedExercise.description}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Hướng dẫn thực hiện</h2>
                        <ol className="list-decimal ml-5 space-y-3 text-gray-700">
                            {parseSteps(selectedExercise.steps).map((step, index) => (
                                <li key={index} className="pl-2">{step}</li>
                            ))}
                        </ol>
                    </div>
                </div>
                <div className="flex justify-center mt-10">
                    <button onClick={backToList} className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                        ← Quay lại 
                    </button>
                </div>
            </div>
        );
    };

    // --- CẬP NHẬT: renderGuide với tính năng Xem thêm ---
    const renderGuide = () => {
        if (isLoadingGuide) return <div className="text-center py-4 text-gray-400 text-sm animate-pulse">Đang tải mẹo tập luyện...</div>;
        if (!guide) return null; 

        return (
            <div className="bg-white rounded-xl border border-teal-100 shadow-sm mb-8 overflow-hidden transition-all duration-500">
                {/* Header Guide */}
                <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <h2 className="text-lg font-bold text-teal-800 uppercase tracking-wide">
                        {guide.title.replace(/\*\*/g, '')} {/* Xóa dấu ** */}
                    </h2>
                </div>

                {/* Content Guide */}
                <div className="relative">
                    <div 
                        className={`px-6 py-5 text-gray-600 leading-relaxed transition-all duration-500 ease-in-out ${
                            isGuideExpanded ? 'max-h-[2000px]' : 'max-h-[10px]'
                        } overflow-hidden`}
                    >
                        <div 
                            className="prose prose-teal max-w-none prose-headings:font-bold prose-headings:text-teal-700 prose-p:mb-2 prose-ul:list-disc prose-li:ml-4" 
                            dangerouslySetInnerHTML={{ __html: guide.content }} 
                        />
                    </div>

                    {/* Gradient che mờ */}
                    {!isGuideExpanded && (
                        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                    )}
                </div>

                {/* Nút Toggle */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-center">
                    <button 
                        onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                        className="text-sm font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-2 transition-colors focus:outline-none"
                    >
                        {isGuideExpanded ? (
                            <>Thu gọn hướng dẫn <span className="rotate-180 transform transition-transform">▼</span></>
                        ) : (
                            <>Đọc chi tiết hướng dẫn <span className="transition-transform">▼</span></>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const renderExercisesList = () => {
        if (filteredExercises.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                    {filteredExercises.map((exercise) => (
                        <ExerciseCard 
                            key={exercise.id} 
                            exercise={exercise} 
                            onClick={() => viewExerciseDetails(exercise)}
                        />
                    ))}
                </div>
            );
        } else {
             return (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="text-6xl mb-4">🤔</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy bài tập nào</h3>
                    <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                    <button onClick={handleResetFilter} className="px-6 py-2 bg-white border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium">
                        Xóa bộ lọc & Tìm lại
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="bg-teal-600 text-white py-12 px-4 mb-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Thư Viện Bài Tập</h1>
                    <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto">
                        Tra cứu hàng trăm bài tập Gym & Thể thao chuẩn khoa học. Lọc theo nhóm cơ và trình độ để tìm bài tập phù hợp nhất với bạn.
                    </p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {selectedExercise ? (
                    <div className="animate-fade-in" onClick={backToList}>
                        {renderExerciseDetails()}
                    </div>
                ) : (
                    <div className="animate-fade-in"> 
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-10 backdrop-blur-md bg-white/90">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                <div className="relative w-full md:w-1/3 group">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-teal-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </span>
                                    <input type="text" placeholder="Tìm bài tập (ví dụ: Squat)..." className="w-full py-2.5 pl-10 pr-4 bg-gray-50 border-transparent focus:bg-white border focus:border-teal-500 rounded-lg focus:ring-2 focus:ring-teal-200 transition-all outline-none text-black" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                                <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                                    <select value={selectedMuscleGroup} onChange={(e) => handleMuscleChange(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:border-teal-500 cursor-pointer transition-all shadow-sm">
                                        {muscleGroups.map((group, index) => (<option key={index} value={group}>{group}</option>))}
                                    </select>
                                    <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:border-teal-500 cursor-pointer transition-all shadow-sm">
                                        {difficulties.map((diff, index) => (<option key={index} value={diff}>{diff === "Tất cả" ? "Mọi trình độ" : diff}</option>))}
                                    </select>
                                    {(selectedMuscleGroup !== "Tất cả" || selectedDifficulty !== "Tất cả" || searchQuery) && (
                                        <button onClick={handleResetFilter} className="px-4 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1">✕ Xóa lọc</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {renderGuide()}
                        {renderExercisesList()}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Exercise;