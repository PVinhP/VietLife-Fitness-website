// frontend/src/pages/Nutrition.tsx

import React, { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Import các component con
import NutritionHeader from "./nutrition/NutritionHeader"
import NutritionTools from "./nutrition/NutritionTools"
import RecipeSection from "./nutrition/RecipeSection" // Đã tái cấu trúc thành Thư viện Công thức
import LessonSection from "./nutrition/LessonSection"
import ExploreSection from "./nutrition/ExploreSection"
import MealPlanSection from "./nutrition/MealPlanSection" // Component Kế hoạch Ăn uống (MỚI)

// Import component bạn đã có
import NutritientsIntake from './NutritientsIntake'

function Nutrition() {
    const location = useLocation()
    const lessonsRef = useRef<HTMLDivElement>(null)

    // Xử lý logic scroll
    useEffect(() => {
        if (location.state?.scrollToLessons && lessonsRef.current) {
            lessonsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    return (
        <div className="bg-white min-h-screen text-gray-900">
            
            {/* === PHẦN 1: HEADER === */}
            <NutritionHeader />

            {/* === PHẦN 2 & 3: CÔNG CỤ === */}
            <NutritionTools />

            {/* === PHẦN MỚI: KẾ HOẠCH ĂN UỐNG (Giải pháp trọn gói) === */}
            <MealPlanSection />

            {/* === PHẦN ĐÃ CẬP NHẬT: THƯ VIỆN CÔNG THỨC (Nền tảng) === */}
            {/* Đây là RecipeSection đã được tái cấu trúc */}
            <RecipeSection />

            {/* === PHẦN BÀI HỌC (Sử dụng ref) === */}
            <LessonSection ref={lessonsRef} />

            {/* === PHẦN KHÁM PHÁ === */}
            <ExploreSection />

            {/* === COMPONENT CÓ SẴN === */}
            <NutritientsIntake />

        </div>
    )
}

export default Nutrition