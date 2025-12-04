const { GoogleGenerativeAI } = require("@google/generative-ai");

// ⚠️ QUAN TRỌNG: Thay thế dòng dưới bằng API Key bạn vừa lấy được
const API_KEY = "AIzaSyDsxxv2MifAFucY6HLab6wDsV4v2UtPBmM"; 

const genAI = new GoogleGenerativeAI(API_KEY);

async function runTest() {
  try {
    // Khởi tạo model. Bạn có thể dùng "gemini-1.5-flash" (nhanh, rẻ) hoặc "gemini-1.5-pro" (thông minh hơn)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = " say hello";

    console.log("Đang gửi yêu cầu...");

    // Gửi prompt và nhận kết quả
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("--- KẾT QUẢ TỪ GEMINI ---");
    console.log(text);
    
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error.message);
  }
}

runTest();