// frontend/src/pages/Nutrition.tsx

import React, { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Import các component con
import NutritionHeader from "./nutrition/NutritionHeader"
import NutritionTools from "./nutrition/NutritionTools"
import RecipeSection from "./nutrition/RecipeSection"
import LessonSection from "./nutrition/LessonSection"
import ExploreSection from "./nutrition/ExploreSection"

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

            {/* === PHẦN 4: CÔNG THỨC === */}
            <RecipeSection />

            {/* === PHẦN 1 (cũ): BÀI HỌC === */}
            {/* Chúng ta truyền `ref` vào component con */}
            <LessonSection ref={lessonsRef} />

            {/* === PHẦN 5 & 6: KHÁM PHÁ === */}
            <ExploreSection />

            {/* === COMPONENT CÓ SẴN === */}
            <NutritientsIntake />

        </div>
    )
}

export default Nutrition