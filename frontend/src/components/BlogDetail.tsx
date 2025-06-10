import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import bot from "../images/chatbot.png"

interface Blog {
  id: number;
  tieu_de: string;
  hinh_anh: string;
  tom_tat: string;
  noi_dung: string;
  danh_muc: string;
  ngay_tao: string;
}

const BlogDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [blog, setBlog] = useState<Blog | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([])

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`https://vietlife-fitness-website-owpj.onrender.com//blogs/${id}`)
                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu blog')
                }
                const data = await response.json()
                setBlog(data)
                
                // Fetch related blogs by category
                if (data.danh_muc) {
                    fetchRelatedBlogs(data.danh_muc, data.id)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBlog()
        }
    }, [id])

    const fetchRelatedBlogs = async (category: string, currentBlogId: number) => {
        try {
            const response = await fetch(`https://vietlife-fitness-website-owpj.onrender.com//blogs/category/${encodeURIComponent(category)}`)
            if (response.ok) {
                const data = await response.json()
                // Filter out current blog and limit to 3 related blogs
                const filtered = data.filter((b: Blog) => b.id !== currentBlogId).slice(0, 3)
                setRelatedBlogs(filtered)
            }
        } catch (err) {
            console.error('Không thể tải blog liên quan:', err)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getImageUrl = (hinh_anh: string) => {
        if (hinh_anh && hinh_anh.trim() !== '') {
            return hinh_anh.startsWith('http') ? hinh_anh : `https://vietlife-fitness-website-owpj.onrender.com//uploads/${hinh_anh}`
        }
        return "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=1200"
    }

    const handleRelatedBlogClick = (blogId: number) => {
        navigate(`/blog/${blogId}`)
        window.scrollTo(0, 0) // Scroll to top when navigating to new blog
    }

    if (loading) {
        return (
            <div className="bg-white text-gray-800 min-h-screen flex items-center justify-center pt-16">
                <div className="text-xl">Đang tải...</div>
            </div>
        )
    }

    if (error || !blog) {
        return (
            <div className="bg-white text-gray-800 min-h-screen flex items-center justify-center pt-16">
                <div className="text-center">
                    <div className="text-xl text-red-500 mb-4">
                        {error || 'Không tìm thấy blog'}
                    </div>
                    <button 
                        onClick={() => navigate('/blogs')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Quay lại danh sách blog
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white text-gray-800 min-h-screen pt-16">
            {/* Header with back button */}
            <div className="w-full bg-gray-100 py-4 mb-8">
                <div className="w-4/5 m-auto flex items-center">
                    <button 
                        onClick={() => navigate('/blogs')}
                        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mr-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <nav className="text-gray-600 text-sm">
                        <span 
                            onClick={() => navigate('/blogs')}
                            className="cursor-pointer hover:text-gray-800 transition-colors"
                        >
                            Blog
                        </span>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800 font-medium">{blog.tieu_de}</span>
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="w-4/5 m-auto">
                <article className="max-w-4xl mx-auto">
                    {/* Blog header */}
                    <header className="mb-8">
                        {blog.danh_muc && (
                            <div className="mb-4">
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                                    {blog.danh_muc}
                                </span>
                            </div>
                        )}
                        
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                            {blog.tieu_de}
                        </h1>
                        
                        <div className="flex items-center text-gray-600 text-sm mb-6">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(blog.ngay_tao)}
                        </div>

                        {blog.tom_tat && (
                            <div className="text-xl text-gray-700 italic leading-relaxed mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                                <ReactMarkdown>{blog.tom_tat}</ReactMarkdown>
                            </div>
                        )}
                    </header>

                    {/* Featured image */}
                    <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                        <img 
                            className="w-full h-96 object-cover" 
                            src={getImageUrl(blog.hinh_anh)}
                            alt={blog.tieu_de}
                            onError={(e) => {
                                e.currentTarget.src = "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=1200"
                            }}
                        />
                    </div>

                    {/* Blog content */}
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed text-lg">
                        <ReactMarkdown 
                           
                            components={{
                                h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>,
                                h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{children}</h2>,
                                h3: ({children}) => <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h3>,
                                p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-inside mb-4 text-gray-700">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-gray-700">{children}</ol>,
                                blockquote: ({children}) => (
                                    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4 bg-gray-50 p-4 rounded">
                                        {children}
                                    </blockquote>
                                ),
                                code: ({children}) => (
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm text-blue-600">{children}</code>
                                ),
                                pre: ({children}) => (
                                    <pre className="bg-gray-100 p-4 rounded overflow-x-auto mb-4 border">{children}</pre>
                                )
                            }}
                        >
                            {blog.noi_dung}
                        </ReactMarkdown>
                    </div>
                </article>

                {/* Related blogs */}
                {relatedBlogs.length > 0 && (
                    <section className="mt-16 pt-8 border-t border-gray-300">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Bài viết liên quan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <div 
                                    key={relatedBlog.id}
                                    className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
                                    onClick={() => handleRelatedBlogClick(relatedBlog.id)}
                                >
                                    <img 
                                        className="w-full h-48 object-cover"
                                        src={getImageUrl(relatedBlog.hinh_anh)}
                                        alt={relatedBlog.tieu_de}
                                        onError={(e) => {
                                            e.currentTarget.src = "https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        }}
                                    />
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors text-gray-900">
                                            {relatedBlog.tieu_de}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {relatedBlog.tom_tat || relatedBlog.noi_dung.substring(0, 100) + '...'}
                                        </p>
                                        <div className="mt-3 text-xs text-gray-500">
                                            {formatDate(relatedBlog.ngay_tao)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Navigation */}
                <div className="mt-12 pt-8 border-t border-gray-300 text-center">
                    <button 
                        onClick={() => navigate('/blogs')}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Xem thêm bài viết khác
                    </button>
                </div>
            </div>

            {/* Chatbot */}
            <div onClick={() => navigate("/expert")} className="fixed bottom-8 right-8">
                <img 
                    className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform"
                    src={bot}  
                    alt="chatbot" 
                />
            </div>
        </div>
    )
}

export default BlogDetail