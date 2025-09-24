import React, { useState } from 'react';
import { FaComment, FaTimes } from 'react-icons/fa';

const Chatbotapi = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: 'Xin chào! Tôi là chatbot sức khỏe. Hãy cung cấp thông tin để tôi cá nhân hóa tư vấn nhé!',
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    weight: '',
    height: '',
    goal: '',
    preferences: '',
    allergies: '',
  });

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isBot: false }]);
      // Giả lập phản hồi bot
      setMessages((prev) => [
        ...prev,
        { text: 'Cảm ơn! Tôi đang xử lý yêu cầu của bạn...', isBot: true },
      ]);
      setInput('');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Thông tin người dùng:', userInfo);
    setMessages((prev) => [
      ...prev,
      {
        text: 'Thông tin của bạn đã được lưu! Tôi sẽ cá nhân hóa tư vấn dựa trên dữ liệu này.',
        isBot: true,
      },
    ]);
    setShowForm(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bong bóng nổi */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition"
        >
          <FaComment size={24} />
        </button>
      )}

      {/* Cửa sổ chatbot */}
      {isOpen && (
        <div className="bg-white w-80 h-[500px] rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chatbot Sức Khỏe</h3>
            <button onClick={() => setIsOpen(false)}>
              <FaTimes size={20} />
            </button>
          </div>

          {/* Nội dung trò chuyện */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.isBot ? 'text-left' : 'text-right'}`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    msg.isBot
                      ? 'bg-gray-200 text-black' // Bot: nền xám, chữ đen
                      : 'bg-blue-600 text-white' // User: nền xanh, chữ trắng
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Form thu thập thông tin */}
          {showForm && (
            <div className="p-4 bg-gray-100">
              <form onSubmit={handleFormSubmit}>
                <input
                  type="number"
                  placeholder="Cân nặng (kg)"
                  value={userInfo.weight}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, weight: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <input
                  type="number"
                  placeholder="Chiều cao (cm)"
                  value={userInfo.height}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, height: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                />
                <select
                  value={userInfo.goal}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, goal: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded text-black"
                  required
                >
                  <option value="">Chọn mục tiêu</option>
                  <option value="Giảm cân">Giảm cân</option>
                  <option value="Tăng cơ">Tăng cơ</option>
                  <option value="Duy trì sức khỏe">Duy trì sức khỏe</option>
                </select>
                <input
                  type="text"
                  placeholder="Sở thích ăn uống"
                  value={userInfo.preferences}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, preferences: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded text-black"
                />
                <input
                  type="text"
                  placeholder="Dị ứng (nếu có)"
                  value={userInfo.allergies}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, allergies: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded text-black"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  Gửi thông tin
                </button>
              </form>
            </div>
          )}

          {/* Ô nhập tin nhắn */}
          {!showForm && (
            <div className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 p-2 border rounded-l text-black" // nhập chữ đen
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white p-2 rounded-r hover:bg-blue-700"
                >
                  Gửi
                </button>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Cung cấp thông tin cá nhân
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbotapi;
