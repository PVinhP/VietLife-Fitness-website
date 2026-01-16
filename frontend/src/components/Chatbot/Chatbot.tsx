import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ConsultationTab from './ConsultationTab'; // Import Component vừa tạo

const API_CHAT_URL = 'https://vietlife-fitness-website-host.onrender.com/api/chat'; 

// Kiểu dữ liệu Message
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'expert'>('chat'); // State quản lý Tab
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- SỬA LỖI TẠI ĐÂY ---
  // Lấy User Info & Token
const getUserData = () => {
    const userStr = localStorage.getItem('user'); 
    const tokenStr = localStorage.getItem('token');
    
    const user = userStr ? JSON.parse(userStr) : null;
    
    return { 
        id: user?.id || null, 
        token: tokenStr || undefined,
        role: user?.role || 'user' // <--- THÊM DÒNG NÀY: Lấy role (admin/user/pt)
    };
};

  const { id: userId, token, role } = getUserData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat') scrollToBottom();
  }, [messages, isTyping, isOpen, activeTab]);

  // Load lịch sử chat AI
  useEffect(() => {
    if (isOpen && activeTab === 'chat' && userId) {
      loadChatHistory();
    }
  }, [isOpen, activeTab]);

  const loadChatHistory = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_CHAT_URL}/history/${userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const history = await response.json();
        const formattedHistory = history.map((item: any) => ({
          id: item.id,
          text: item.message,
          sender: item.sender
        }));
        setMessages(formattedHistory);
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử chat", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Check login
    if (!userId) {
        setMessages(prev => [...prev, { id: Date.now(), text: "⚠️ Bạn cần đăng nhập để chat.", sender: 'bot' }]);
        return;
    }

    const text = inputText;
    setInputText("");
    setMessages(prev => [...prev, { id: Date.now(), text: text, sender: 'user' }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_CHAT_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId, message: text })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: 'bot' }]);
      } else if (response.status === 429) {
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: `🚦 Hệ thống quá tải. Vui lòng đợi ${data.retryAfter || 30}s.`, 
            sender: 'bot' 
        }]);
      } else {
        throw new Error(data.msg || "Lỗi server");
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "❌ Có lỗi xảy ra.", sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Nút mở Widget */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-2xl z-[1000]"
        >
          💬
        </button>
      )}

      {/* Container Chatbot */}
      {isOpen && (
        <div className="fixed bottom-[90px] right-5 w-[400px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-[1000] border border-gray-200 font-sans">
          
          {/* Header Xanh Dương */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-4 px-4 pb-0 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg flex items-center gap-2">
                🤖 Trợ lý Sức khỏe
              </span>
              <button onClick={() => setIsOpen(false)} className="hover:text-gray-200 text-xl">✖</button>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                  activeTab === 'chat' 
                    ? 'bg-white text-blue-700' 
                    : 'bg-blue-800/30 text-blue-100 hover:bg-blue-800/50'
                }`}
              >
                Chat AI
              </button>
              <button 
                onClick={() => setActiveTab('expert')}
                className={`flex-1 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                  activeTab === 'expert' 
                    ? 'bg-white text-blue-700' 
                    : 'bg-blue-800/30 text-blue-100 hover:bg-blue-800/50'
                }`}
              >
                Hỏi Chuyên Gia
              </button>
            </div>
          </div>

          {/* NỘI DUNG CHÍNH (Thay đổi theo Tab) */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            
            {/* --- TAB 1: CHAT AI --- */}
            {activeTab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                  {messages.length === 0 && !isTyping && (
                    <div className="text-center text-gray-400 mt-10 text-sm">
                      Xin chào! Tôi là AI PT.<br/>Tôi có thể giúp gì cho bạn hôm nay?
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm prose prose-sm'
                      }`}>
                        {msg.sender === 'bot' ? (
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        ) : msg.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-400 border border-gray-100 p-3 rounded-2xl rounded-bl-sm text-xs italic shadow-sm">
                        Đang suy nghĩ...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                  <input
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-full outline-none text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Nhập tin nhắn..."
                    disabled={isTyping}
                  />
                  <button 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                      inputText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                  >
                    ➤
                  </button>
                </div>
              </>
            )}

            {/* --- TAB 2: HỎI CHUYÊN GIA --- */}
            {activeTab === 'expert' && (
              /* Dòng này đã hết lỗi vì token giờ là string | undefined */
              <ConsultationTab userId={userId} token={token} role={role}/>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;