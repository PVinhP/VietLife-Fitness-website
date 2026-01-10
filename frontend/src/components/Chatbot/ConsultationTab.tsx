// src/components/Chatbot/ConsultationTab.tsx
import React, { useState, useEffect, useRef } from 'react';

// Interfaces
interface Message {
  id: number;
  user_id: number;
  full_name: string;
  avatar: string;
  message: string;
  image_url?: string;
  created_at: string;
}

// SỬA: Thêm full_name và created_at để hiển thị đúng
interface RequestInfo {
  id: number;
  title: string;
  status: string;
  full_name?: string; // Tên người dùng (Backend trả về)
  created_at?: string;
}

const API_BASE_URL = 'https://vietlife-fitness-website-host.onrender.com/api/consultant';

const ConsultationTab: React.FC<{ userId: number, token: string | null | undefined, role?: string }> = ({ userId, token, role = 'user' }) => {
  const [view, setView] = useState<'list' | 'create' | 'chat'>('list');
  const [requests, setRequests] = useState<RequestInfo[]>([]);
  
  // State chat
  const [activeRequest, setActiveRequest] = useState<RequestInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Form tạo mới
  const [formData, setFormData] = useState({ title: '', question: '', image_url: '' });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, view]);

  // Load danh sách
  useEffect(() => {
    if (userId && view === 'list') fetchRequests();
  }, [userId, view, role]);

  // --- API CALLS ---
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}?userId=${userId}&role=${role}`, {
         headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) setRequests(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchDetail = async (reqId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${reqId}`, {
         headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ...formData, userId })
      });
      setFormData({ title: '', question: '', image_url: '' });
      setView('list');
      fetchRequests(); // Reload lại danh sách
    } catch (err) { alert("Lỗi gửi yêu cầu"); }
  };

  const handleReply = async () => {
    if (!newMessage.trim() || !activeRequest) return;
    try {
      await fetch(`${API_BASE_URL}/${activeRequest.id}/reply`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId, message: newMessage, role })
      });
      setNewMessage('');
      fetchDetail(activeRequest.id);
    } catch (err) { alert("Lỗi gửi tin nhắn"); }
  };

  const openChat = (req: RequestInfo) => {
    setActiveRequest(req);
    fetchDetail(req.id);
    setView('chat');
  };

  // --- RENDER ---
  return (
    <div className="h-full flex flex-col bg-gray-50 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm border-b z-10 min-h-[60px]">
        {view === 'chat' && activeRequest ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800 p-1">
              ←
            </button>
            <div>
               {/* SỬA: Hiển thị tên user trên Header khi chat (nếu là Admin) */}
               {role !== 'user' && (
                  <div className="text-[10px] text-blue-600 font-bold uppercase">
                      User: {activeRequest.full_name || 'Người dùng'}
                  </div>
              )}
              <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{activeRequest.title}</h3>
            </div>
          </div>
        ) : (
          <h3 className="font-bold text-gray-700">
             {role === 'user' ? 'Tư vấn sức khoẻ' : 'Danh sách yêu cầu'}
          </h3>
        )}
        
        {/* Chỉ hiện nút tạo nếu role là 'user' */}
        {view === 'list' && role === 'user' && (
          <button onClick={() => setView('create')} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium shadow-sm">
            + Đặt câu hỏi
          </button>
        )}
      </div>

      {/* VIEW 1: LIST */}
      {view === 'list' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {requests.map(req => (
            <div key={req.id} onClick={() => openChat(req)} className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:bg-blue-50 transition border-gray-200">
              
              {/* SỬA: NẾU LÀ ADMIN THÌ HIỆN TÊN USER */}
              {role !== 'user' && (
                 <div className="text-xs text-blue-600 font-bold mb-1 flex items-center gap-1">
                   👤 {req.full_name || 'Người dùng ẩn danh'}
                 </div>
              )}

              <div className="flex justify-between mb-1 items-start">
                <span className="font-bold text-gray-800 text-sm line-clamp-2 flex-1 mr-2">{req.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                  req.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {req.status === 'pending' ? 'Chờ' : 'Đã xong'}
                </span>
              </div>
              
              <div className="flex justify-between mt-2">
                  <p className="text-[10px] text-gray-400 italic">
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'}
                  </p>
                  <p className="text-[10px] text-blue-500">Xem chi tiết →</p>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
              <div className="text-center mt-10 text-gray-400 text-sm">
                  <p>📭 Chưa có yêu cầu nào.</p>
              </div>
          )}
        </div>
      )}

      {/* VIEW 2: CHAT INTERFACE */}
      {view === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
            {messages.map((msg) => {
              const isMe = msg.user_id === userId; 
              // Xác định tin nhắn của Admin/PT để đổi màu tên
              const isExpert = msg.full_name?.toLowerCase().includes('admin') || msg.full_name?.toLowerCase().includes('pt'); // (Logic tạm thời, tốt nhất nên check role từ BE trả về trong message)

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 overflow-hidden border border-gray-300">
                       <img src={msg.avatar || 'https://via.placeholder.com/32'} alt="avt" className="w-full h-full object-cover"/>
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm relative ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}>
                    {/* Tên người gửi trong chat */}
                    {!isMe && (
                        <div className="text-[10px] font-bold text-gray-500 mb-1">
                            {msg.full_name || 'User'}
                        </div>
                    )}

                    {msg.image_url && (
                      <img src={msg.image_url} alt="attachment" className="mb-2 rounded max-h-40 object-cover bg-gray-100" />
                    )}
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t flex gap-2 items-end">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition">📷</button> 
            
            <textarea 
              className="flex-1 bg-gray-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-10 max-h-24 text-black"
              placeholder="Nhập tin nhắn..."
              rows={1}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <button 
              onClick={handleReply}
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors shadow-sm"
            >
              ➤
            </button>
          </div>
        </>
      )}

      {/* VIEW 3: CREATE FORM */}
      {view === 'create' && (
        <div className="p-4 bg-white h-full">
          <h2 className="font-bold text-lg mb-4 text-gray-700">Tạo chủ đề mới</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input 
              className="w-full border p-3 rounded-lg focus:ring-2 ring-blue-500 outline-none text-black transition" 
              placeholder="Tiêu đề (Vd: Tư vấn lịch tập gym...)"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
            <textarea 
              className="w-full border p-3 rounded-lg h-32 focus:ring-2 ring-blue-500 outline-none text-black transition resize-none" 
              placeholder="Mô tả vấn đề của bạn..."
              value={formData.question}
              onChange={e => setFormData({...formData, question: e.target.value})}
              required
            />
            <input 
              className="w-full border p-3 rounded-lg text-sm text-black" 
              placeholder="Link ảnh (nếu có)..."
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
            <div className="flex gap-2 pt-2">
               <button type="button" onClick={() => setView('list')} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-200 transition">Hủy</button>
               <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">Gửi ngay</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ConsultationTab;