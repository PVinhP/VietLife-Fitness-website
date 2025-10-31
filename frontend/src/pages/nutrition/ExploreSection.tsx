// frontend/src/components/nutrition/ExploreSection.tsx

import React, { useState } from 'react'
import { FaLeaf, FaCapsules, FaChevronRight } from 'react-icons/fa'

interface Article {
    id: number;
    title: string;
    category: 'diet' | 'supplement';
}

function ExploreSection() {
    // State riêng cho component này
    const [dietArticles, setDietArticles] = useState<Article[]>([
        { id: 1, title: "Tìm hiểu về chế độ ăn Keto", category: 'diet' },
        { id: 2, title: "Eat Clean: Ăn sạch là gì?", category: 'diet' },
        { id: 3, title: "Nhịn ăn gián đoạn (IF 16/8)", category: 'diet' },
    ]);
    const [supplementArticles, setSupplementArticles] = useState<Article[]>([
        { id: 1, title: "Whey Protein: Mọi điều cần biết", category: 'supplement' },
        { id: 2, title: "Creatine: Tăng sức mạnh hiệu quả", category: 'supplement' },
        { id: 3, title: "Omega-3: Lợi ích cho sức khỏe", category: 'supplement' },
    ]);

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Khám phá Chuyên sâu</h2>
                    <p className="text-xl text-gray-600">Tìm hiểu các chủ đề nâng cao về dinh dưỡng.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                            <FaLeaf className="text-green-500 mr-3" /> Các Chế độ Ăn
                        </h3>
                        <div className="space-y-4">
                            {dietArticles.map(article => (
                                <a key={article.id} href="#" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                    <span className="text-lg font-medium text-gray-800">{article.title}</span>
                                    <FaChevronRight className="text-gray-400" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
                        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                            <FaCapsules className="text-blue-500 mr-3" /> Thực phẩm Bổ sung
                        </h3>
                        <div className="space-y-4">
                            {supplementArticles.map(article => (
                                <a key={article.id} href="#" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                    <span className="text-lg font-medium text-gray-800">{article.title}</span>
                                    <FaChevronRight className="text-gray-400" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExploreSection;