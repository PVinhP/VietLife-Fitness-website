import React, { useState, useEffect } from 'react'
import bot from "../images/chatbot.png"

import { useNavigate } from 'react-router-dom';

interface Blog {
  id: number;
  tieu_de: string;
  hinh_anh: string;
  tom_tat: string;
  noi_dung: string;
  danh_muc: string;
  ngay_tao: string;
}

const Blogs = () => {
    const navigate = useNavigate()
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    const [searchTerm, setSearchTerm] = useState<string>('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [categories, setCategories] = useState<string[]>([])

useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('http://localhost:8080/blogs')
                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu blog')
                }
                const data = await response.json()
                setBlogs(data)
                setFilteredBlogs(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
            } finally {
                setLoading(false)
            }
        }

        fetchBlogs()
    }, [])

useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8080/blogs/categories/all')
                if (response.ok) {
                    const data = await response.json()
                    setCategories(data)
                }
            } catch (err) {
                console.error('Không thể tải danh mục:', err)
            }
        }

        fetchCategories()
    }, [])

useEffect(() => {
    let filtered = blogs
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(blog => 
                blog.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.tom_tat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.noi_dung.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
    if (selectedCategory !== '') {
            filtered = filtered.filter(blog => blog.danh_muc === selectedCategory)
        }
    setFilteredBlogs(filtered)
    }, [searchTerm, selectedCategory, blogs])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getImageUrl = (hinh_anh: string) => {
        if (hinh_anh && hinh_anh.trim() !== '') {
            return hinh_anh.startsWith('http') ? hinh_anh : `http://localhost:8080/uploads/${hinh_anh}`
        }
        const defaultImages = [
            "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=600",
            "https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=600",
            "https://images.pexels.com/photos/6605299/pexels-photo-6605299.jpeg?auto=compress&cs=tinysrgb&w=600",
            "https://images.pexels.com/photos/5645090/pexels-photo-5645090.jpeg?auto=compress&cs=tinysrgb&w=600"
        ]
        return defaultImages[Math.floor(Math.random() * defaultImages.length)]
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
    }

    const handleBlogClick = (blogId: number) => {
        navigate(`/blog/${blogId}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
                <div className="text-xl text-gray-700">Đang tải...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
                <div className="text-xl text-red-500">Lỗi: {error}</div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
            <div className="w-4/5 m-auto bg-white shadow-2xl rounded-2xl p-6">
                {/* Search and Filter Section */}
                <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                            <input
                                type="text"
                                placeholder="Tìm kiếm blog theo tiêu đề, nội dung..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 focus:border-teal-400 focus:outline-none"
                            />
                        </div>
                    <div className="w-full md:w-auto">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full md:w-48 px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 focus:border-teal-400 focus:outline-none"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    {(searchTerm || selectedCategory) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                    <div className="mt-4 text-gray-600 text-sm">
                        {filteredBlogs.length === 0 && blogs.length > 0 ? (
                            <span>Không tìm thấy blog phù hợp với từ khóa tìm kiếm</span>
                        ) : (
                            <span>
                                Hiển thị {filteredBlogs.length} / {blogs.length} blog
                                {searchTerm && ` cho "${searchTerm}"`}
                                {selectedCategory && ` trong danh mục "${selectedCategory}"`}
                            </span>
                        )}
                    </div>
                </div>

                {/* No Results */}
                {filteredBlogs.length === 0 && blogs.length > 0 && (
                    <div className="flex justify-center items-center h-32">
                        <div className="text-center">
                            <div className="text-xl text-gray-700 mb-4">😔 Không tìm thấy blog nào</div>
                            <p className="text-gray-600 mb-4">
                                Thử thay đổi từ khóa tìm kiếm hoặc danh mục
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                            >
                                Xem tất cả blog
                            </button>
                        </div>
                    </div>
                )}

                {/* No Blogs at all */}
                {blogs.length === 0 && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-xl text-gray-700">Chưa có blog nào</div>
                    </div>
                )}

                {/* Blog Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <div 
                            key={blog.id} 
                            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200"
                            onClick={() => handleBlogClick(blog.id)}
                        >
                            <div className="aspect-video overflow-hidden">
                                <img 
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                                    src={getImageUrl(blog.hinh_anh)} 
                                    alt={blog.tieu_de}
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    }}
                                />
                        </div>
                            <div className="p-6">
                                {blog.danh_muc && (
                                    <div className="mb-3">
                                        <span 
                                            className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedCategory(blog.danh_muc)
                                            }}
                                        >
                                            {blog.danh_muc}
                                        </span>
                                    </div>
                                )}
                                <h2 className="font-bold text-xl mb-3 line-clamp-2 text-gray-800 hover:text-teal-500 transition-colors">
                                    {blog.tieu_de}
                                </h2>
                                <div className="mb-3 text-gray-600 text-sm">
                                    {formatDate(blog.ngay_tao)}
                                </div>
                                <div className="text-gray-600 text-sm line-clamp-3 mb-4">
                                    {blog.tom_tat || blog.noi_dung.substring(0, 150) + '...'}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-teal-500 text-sm font-medium">
                                        Đọc thêm →
                                    </span>
                                    <div className="w-8 h-1 bg-teal-500 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                
            </div>
        </div>
    )
}

export default Blogs