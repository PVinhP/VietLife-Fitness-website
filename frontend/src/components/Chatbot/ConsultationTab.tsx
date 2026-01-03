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

interface RequestInfo {
  id: number;
  title: string;
  status: string;
}

const API_BASE_URL = 'http://localhost:8080/api/consultant';

const ConsultationTab: React.FC<{ userId: number, token: string | null | undefined, role?: string }> = ({ userId, token, role = 'user' }) => {
  const [view, setView] = useState<'list' | 'create' | 'chat'>('list');
  const [requests, setRequests] = useState<RequestInfo[]>([]);
  
  // State cho màn hình chat
  const [activeRequest, setActiveRequest] = useState<RequestInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // State cho form tạo mới
  const [formData, setFormData] = useState({ title: '', question: '', image_url: '' });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (userId && view === 'list') fetchRequests();
  }, [userId, view]);

  // --- API CALLS ---
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}?userId=${userId}&role=${role}`);
      if (res.ok) setRequests(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchDetail = async (reqId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${reqId}`);
      if (res.ok) {
        const data = await res.json();
        // data trả về { info: ..., messages: [] }
        setMessages(data.messages);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId })
      });
      setFormData({ title: '', question: '', image_url: '' });
      setView('list');
    } catch (err) { alert("Lỗi gửi yêu cầu"); }
  };

  const handleReply = async () => {
    if (!newMessage.trim() || !activeRequest) return;
    try {
      await fetch(`${API_BASE_URL}/${activeRequest.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: newMessage, role })
      });
      setNewMessage('');
      fetchDetail(activeRequest.id); // Reload tin nhắn
    } catch (err) { alert("Lỗi gửi tin nhắn"); }
  };

  const openChat = (req: RequestInfo) => {
    setActiveRequest(req);
    fetchDetail(req.id);
    setView('chat');
  };

  // --- RENDER ---
  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm border-b z-10">
        {view === 'chat' && activeRequest ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800">
              ←
            </button>
            <div>
              <h3 className="font-bold text-gray-800 line-clamp-1">{activeRequest.title}</h3>
              <span className="text-xs text-green-600 flex items-center gap-1">
                ● {activeRequest.status === 'answered' ? 'Đã có trả lời' : 'Đang trao đổi'}
              </span>
            </div>
          </div>
        ) : (
          <h3 className="font-bold text-gray-700">Tư vấn sức khoẻ</h3>
        )}
        
        {view === 'list' && (
          <button onClick={() => setView('create')} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
            + Đặt câu hỏi
          </button>
        )}
      </div>

      {/* VIEW 1: LIST */}
      {view === 'list' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {requests.map(req => (
            <div key={req.id} onClick={() => openChat(req)} className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:bg-gray-50 transition">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-gray-800">{req.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  req.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{req.status}</span>
              </div>
              <p className="text-xs text-gray-500">Nhấn để xem chi tiết cuộc trò chuyện...</p>
            </div>
          ))}
          {requests.length === 0 && <p className="text-center text-gray-400 mt-10">Chưa có yêu cầu nào.</p>}
        </div>
      )}

      {/* VIEW 2: CHAT INTERFACE */}
      {view === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
            {messages.map((msg) => {
              const isMe = msg.user_id === userId; // Kiểm tra xem tin nhắn có phải của mình không
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {/* Avatar đối phương */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 overflow-hidden">
                       <img src={msg.avatar || 'https://via.placeholder.com/32'} alt="avt" className="w-full h-full object-cover"/>
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border'
                  }`}>
                    {msg.image_url && (
                      <img src={msg.image_url} alt="attachment" className="mb-2 rounded max-h-40 object-cover" />
                    )}
                    <p>{msg.message}</p>
                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
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
             {/* Nút upload ảnh giả lập (sau này bạn làm logic upload thật) */}
            <button className="p-2 text-gray-400 hover:text-blue-600">📷</button> 
            
            <textarea 
              className="flex-1 bg-gray-100 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-10 max-h-24 text-black"
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
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              ➤
            </button>
          </div>
        </>
      )}

      {/* VIEW 3: CREATE FORM (Giữ nguyên logic cũ nhưng style lại chút) */}
      {view === 'create' && (
        <div className="p-4">
          <h2 className="font-bold text-lg mb-4 text-gray-700">Tạo chủ đề mới</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input 
              className="w-full border p-3 rounded-lg focus:ring-2 ring-blue-500 outline-none text-black" 
              placeholder="Tiêu đề (Vd: Tư vấn lịch tập gym...)"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
            <textarea 
              className="w-full border p-3 rounded-lg h-32 focus:ring-2 ring-blue-500 outline-none text-black" 
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
            <div className="flex gap-2">
               <button type="button" onClick={() => setView('list')} className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg font-bold">Hủy</button>
               <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold">Gửi ngay</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ConsultationTab;