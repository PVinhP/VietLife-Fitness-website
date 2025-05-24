import React, { useState, useEffect } from 'react'
import bot from "../images/chatbot.png"
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown';

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
    const [expandedBlogs, setExpandedBlogs] = useState<Set<number>>(new Set())
    
    // Search states
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [categories, setCategories] = useState<string[]>([])

    // Fetch blogs from API
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

    // Fetch categories
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

    // Filter blogs based on search term and category
    useEffect(() => {
        let filtered = blogs

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(blog => 
                blog.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.tom_tat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.noi_dung.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filter by category
        if (selectedCategory !== '') {
            filtered = filtered.filter(blog => blog.danh_muc === selectedCategory)
        }

        setFilteredBlogs(filtered)
    }, [searchTerm, selectedCategory, blogs])

    const toggleReadMore = (blogId: number) => {
        const newExpandedBlogs = new Set(expandedBlogs)
        if (expandedBlogs.has(blogId)) {
            newExpandedBlogs.delete(blogId)
        } else {
            newExpandedBlogs.add(blogId)
        }
        setExpandedBlogs(newExpandedBlogs)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const truncateText = (text: string, maxLength: number = 200) => {
        if (text.length <= maxLength) return text
        return text.substr(0, maxLength)
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

    if (loading) {
        return (
            <div className="text-white w-4/5 m-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl">Đang tải...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-white w-4/5 m-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-red-500">Lỗi: {error}</div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className='text-white w-4/5 m-auto'>
                {/* Search and Filter Section */}
                <div className="mb-8 p-6 bg-gray-800 rounded-lg">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search Input */}
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                placeholder="Tìm kiếm blog theo tiêu đề, nội dung..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        
                        {/* Category Filter */}
                        <div className="w-full md:w-auto">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full md:w-48 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Clear Filters Button */}
                        {(searchTerm || selectedCategory) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                    
                    {/* Results Info */}
                    <div className="mt-4 text-gray-400 text-sm">
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
                            <div className="text-xl mb-4">😔 Không tìm thấy blog nào</div>
                            <p className="text-gray-400 mb-4">
                                Thử thay đổi từ khóa tìm kiếm hoặc danh mục
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Xem tất cả blog
                            </button>
                        </div>
                    </div>
                )}

                {/* No Blogs at all */}
                {blogs.length === 0 && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-xl">Chưa có blog nào</div>
                    </div>
                )}

                {/* Blog List */}
                {filteredBlogs.map((blog, index) => (
                    <div key={blog.id} className={`flex ${index % 2 === 1 ? 'flex-col-reverse md:flex-row-reverse' : 'flex-col md:flex-row'} m-5 pb-5 border-b-2 border-gray-300`}>
                        <div className='md:w-2/5'>
                            <img 
                                className='rounded-lg w-full h-64 object-cover' 
                                src={getImageUrl(blog.hinh_anh)} 
                                alt={blog.tieu_de}
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=600"
                                }}
                            />
                        </div>
                        <div className={`md:w-3/5 ${index % 2 === 1 ? 'md:pr-10' : 'md:pl-10'}`}>
                            <h1 className='font-bold text-3xl mb-5'>{blog.tieu_de}</h1>
                            
                            {blog.danh_muc && (
                                <div className="mb-3">
                                    <span 
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm cursor-pointer hover:bg-blue-600 transition-colors"
                                        onClick={() => setSelectedCategory(blog.danh_muc)}
                                    >
                                        {blog.danh_muc}
                                    </span>
                                </div>
                            )}
                            
                            <div className="mb-3 text-gray-400 text-sm">
                                {formatDate(blog.ngay_tao)}
                            </div>

                            <div className="mb-4text-gray-300 mb-2 italic">
                                {blog.tom_tat && (
                                    <ReactMarkdown >
                                        {blog.tom_tat}
                                    </ReactMarkdown>
                                    )}
                                    
                                    <ReactMarkdown>
                                    {expandedBlogs.has(blog.id) 
                                        ? blog.noi_dung 
                                        : `${truncateText(blog.noi_dung || blog.tom_tat || '')}...`}
                                    </ReactMarkdown>
                            </div>
                            
                            <button 
                                onClick={() => toggleReadMore(blog.id)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                {expandedBlogs.has(blog.id) ? 'Thu gọn' : 'Đọc thêm...'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div onClick={() => navigate("/expert")}>
                <img 
                    style={{ 
                        float: 'right', 
                        width: "87px", 
                        fontSize: "70px", 
                        marginRight: "-18%", 
                        position: "fixed", 
                        top: "70%", 
                        left: "93.3%",
                        cursor: "pointer"
                    }} 
                    src={bot}  
                    alt="chatbot" 
                />
            </div>
        </div>
   )
}

export default Blogs