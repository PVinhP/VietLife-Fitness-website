import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- CẤU HÌNH API ---
// Hãy đổi cổng 5000 thành cổng thực tế backend của bạn
const API_BASE_URL = 'http://localhost:8080/api/chat'; 

// --- CSS Styles (Giữ nguyên như cũ vì đã đẹp rồi) ---
const styles = {
  widgetButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    zIndex: 1000,
    transition: 'transform 0.2s',
  },
  chatContainer: {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '400px', 
    height: '600px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    border: '1px solid #e0e0e0',
  },
  header: {
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '600',
    fontSize: '16px',
  },
  messagesArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  userMsgRow: {
    justifyContent: 'flex-end',
  },
  botMsgRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    wordWrap: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  userBubble: {
    backgroundColor: '#007bff',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  botBubble: {
    backgroundColor: 'white',
    color: '#2c3e50',
    border: '1px solid #eee',
    borderBottomLeftRadius: '4px',
  },
  markdownContent: {
    '& p': { margin: '0 0 8px 0' },
    '& ul': { paddingLeft: '20px', margin: '8px 0' },
    '& li': { marginBottom: '4px' },
    '& strong': { color: '#0056b3' },
    '& h3': { fontSize: '16px', margin: '12px 0 8px', color: '#333' }
  },
  inputArea: {
    padding: '15px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '10px',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '24px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    color: '#333333',
  },
  sendButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const Chatbotapi = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Lấy UserInfo từ LocalStorage (Giả sử bạn lưu khi login)
  // Nếu chưa có auth, bạn có thể hardcode ID để test: const userId = 1;
  const getUserData = () => {
    const userStr = localStorage.getItem('user'); // Hoặc 'userInfo'
    const token = localStorage.getItem('token'); // Token JWT
    const user = userStr ? JSON.parse(userStr) : null;
    return { 
        id: user?.id || null, 
        token 
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // --- 1. Load Lịch sử chat khi mở box ---
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    const { id, token } = getUserData();
    if (!id) return; // Chưa login thì thôi

    try {
      const response = await fetch(`${API_BASE_URL}/history/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const history = await response.json();
        // Map dữ liệu từ DB (sender: 'user'/'bot') sang format của React
        const formattedHistory = history.map(item => ({
          id: item.id,
          text: item.message,
          sender: item.sender
        }));
        setMessages(formattedHistory);
      }
    } catch (error) {
      console.error("Không tải được lịch sử chat", error);
    }
  };

  // --- 2. Gửi tin nhắn tới Backend ---
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const text = inputText;
    const { id, token } = getUserData();
    
    // Nếu chưa login, cảnh báo
    if (!id) {
        setMessages(prev => [...prev, { 
            id: Date.now(), 
            text: "⚠️ Bạn cần đăng nhập để được tư vấn cá nhân hóa.", 
            sender: 'bot' 
        }]);
        return;
    }

    setInputText(""); // Xóa ô nhập liệu
    setMessages(prev => [...prev, { id: Date.now(), text: text, sender: 'user' }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Gửi token để xác thực
        },
        body: JSON.stringify({
          userId: id, // Backup nếu middleware không lấy được từ token
          message: text
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Thành công
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: data.reply, 
            sender: 'bot' 
        }]);
      } else if (response.status === 429) {
        // Xử lý lỗi Rate Limit (429)
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: "🚦 Hệ thống đang quá tải. Vui lòng đợi " + (data.retryAfter || 30) + " giây rồi hỏi lại nhé!", 
            sender: 'bot' 
        }]);
      } else {
        // Lỗi khác
        throw new Error(data.msg || "Lỗi server");
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "❌ Có lỗi xảy ra: " + error.message, 
        sender: 'bot' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button style={styles.widgetButton} onClick={() => setIsOpen(true)}>💬</button>
      )}

      {isOpen && (
        <div style={styles.chatContainer}>
          <div style={styles.header}>
            <span>Trợ lý Sức khỏe AI</span>
            <span style={{cursor: 'pointer'}} onClick={() => setIsOpen(false)}>✖</span>
          </div>

          <div style={styles.messagesArea}>
            {/* Tin nhắn chào mừng nếu chưa có tin nào */}
            {messages.length === 0 && !isTyping && (
                <div style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>
                    Xin chào! Tôi là AI PT.<br/>Tôi đã sẵn sàng tư vấn dựa trên hồ sơ sức khỏe của bạn.
                </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} style={{
                ...styles.messageRow,
                ...(msg.sender === 'user' ? styles.userMsgRow : styles.botMsgRow)
              }}>
                <div style={{
                  ...styles.messageBubble,
                  ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
                }}>
                  {msg.sender === 'bot' ? (
                    <div style={styles.markdownContent}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                        </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
                <div style={styles.botMsgRow}>
                    <div style={{...styles.messageBubble, ...styles.botBubble, fontStyle: 'italic', color: '#888'}}>
                        Đang phân tích dữ liệu sức khỏe của bạn...
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Hỏi về thực đơn, bài tập..."
              disabled={isTyping} // Chặn nhập khi đang chờ
            />
            <button 
                style={{...styles.sendButton, opacity: isTyping ? 0.5 : 1}} 
                onClick={handleSendMessage}
                disabled={isTyping}
            >
                ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbotapi;