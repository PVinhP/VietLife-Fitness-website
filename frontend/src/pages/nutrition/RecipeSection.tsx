// frontend/src/components/nutrition/RecipeSection.tsx

import React, { useState, useEffect } from 'react'

interface Recipe {
    id: number;
    title: string;
    summary: string;
    imageUrl: string; 
    calories: number;
}

function RecipeSection() {
    // Component này tự quản lý state
    const [recipes, setRecipes] = useState<Recipe[]>([
        { id: 1, title: "Ức gà nướng chanh", summary: "Một công thức giàu protein, ít béo.", imageUrl: "https://via.placeholder.com/300x200?text=Uc+Ga", calories: 350 },
        { id: 2, title: "Salad cá hồi áp chảo", summary: "Giàu Omega-3 và chất béo tốt.", imageUrl: "https://via.placeholder.com/300x200?text=Salad+Ca+Hoi", calories: 420 },
        { id: 3, title: "Cháo yến mạch hoa quả", summary: "Bữa sáng hoàn hảo giàu chất xơ.", imageUrl: "https://via.placeholder.com/300x200?text=Chao+Yen+Mach", calories: 280 },
    ]);

    // Sau này bạn có thể fetch API riêng tại đây
    // useEffect(() => {
    //     fetch('http://localhost:8080/recipes')
    //         .then(res => res.json())
    //         .then(data => setRecipes(data));
    // }, []);

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">📝 Công thức & Kế hoạch Ăn uống</h2>
                    <p className="text-xl text-gray-600">Gợi ý từ chuyên gia giúp bạn ăn ngon, sống khỏe.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recipes.map(recipe => (
                        <div key={recipe.id} className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all hover:-translate-y-2 hover:shadow-xl border border-gray-100">
                            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                                <p className="text-gray-600 mb-4">{recipe.summary}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-teal-600">{recipe.calories} Calo</span>
                                    <span className="text-teal-500 font-semibold hover:text-teal-600">
                                        Xem chi tiết →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RecipeSection;