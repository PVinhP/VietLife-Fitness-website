import { useRef, useState } from "react";
import axios from "axios";

const init = {
  role: "system",
  content: "I am Fitness Expert from VietLife, here to help with nutrition and exercise advice. Ask me about food nutrition or workouts!"
};

const Chatbotapi = () => {
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);
  const [input, setInput] = useState("");
  const [bot, setBot] = useState([init]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = { role: "user", content: input };
    const newData = [...bot, message];
    setBot(newData);
    setInput("");
    setIsLoading(true);

    try {
      // Kiểm tra nếu input chứa từ khóa về thực phẩm
      const foodQuery = input.toLowerCase().trim();
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/foods/search`,
        {
          params: {
            query: foodQuery,
            api_key: process.env.REACT_APP_USDA_API_KEY || "DEMO_KEY",
            pageSize: 1,
          },
        }
      );

      const foodData = response.data.foods[0];
      let botResponse;

      if (foodData) {
        const nutrients = foodData.foodNutrients
          .filter(n => ["Energy", "Protein", "Total lipid (fat)", "Carbohydrate, by difference"].includes(n.nutrientName))
          .map(n => `${n.nutrientName}: ${n.value} ${n.unitName.toLowerCase()}`)
          .join(", ");
        botResponse = `Nutrition info for ${foodData.description}: ${nutrients || "No detailed nutrition data available."}`;
      } else {
        botResponse = "Sorry, I couldn't find nutrition info for that. Try asking about a specific food like 'apple' or 'chicken', or ask about workouts!";
      }

      const updatedChatHistory = [
        ...newData,
        { role: "assistant", content: botResponse },
      ];

      setBot(updatedChatHistory);
      inputRef.current.focus();
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Error fetching USDA data:", error);
      setBot([
        ...newData,
        { role: "assistant", content: "Xin lỗi, có lỗi khi tìm dữ liệu. Vui lòng thử lại!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleChatbox}
        className="fixed bottom-5 right-5 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-green-600 z-50"
      >
        💬
      </button>

      {/* Chatbox */}
      <div
        className={`fixed bottom-16 right-5 w-80 bg-white rounded-lg shadow-xl flex flex-col transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Header */}
        <div className="bg-green-500 text-white p-3 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold">VietLife Fitness Expert</h3>
          <button onClick={toggleChatbox} className="text-white">
            ✕
          </button>
        </div>

        {/* Chat Body */}
        <div
          ref={chatBodyRef}
          className="flex-1 p-4 h-96 overflow-y-auto bg-gray-100"
        >
          {bot.map((message, index) => (
            <div
              key={index}
              className={`mb-3 flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                  message.role === "user"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="text-base">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
          <div className="flex items-center">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về dinh dưỡng hoặc bài tập..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none h-12"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="ml-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbotapi;