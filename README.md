# HCMUTE
# Hệ thống VietLife Website quản lý sức khỏe toàn diện theo hướng cá nhân hóa (tích hợp AI)
# VIETLIFE FITNESS - Personalized Health Management System 🏋️‍♂️🥗

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-ReactJS-61DAFB?logo=react&logoColor=black)
![Node](https://img.shields.io/badge/Backend-NodeJS-339933?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
![AI](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?logo=google&logoColor=white)

> **Graduation Thesis (Khóa luận tốt nghiệp)**
> **Student:** Pham Phu Vinh
> **Supervisor:** Dr. Mai Anh Tho

## 📖 Introduction (Giới thiệu)

**VietLife Fitness** là hệ thống website hỗ trợ sức khoẻ toàn diện theo hướng cá nhân hoá. Dự án không chỉ giúp người dùng theo dõi chỉ số cơ thể (BMI, TDEE, BMR) mà còn ứng dụng **Generative AI (Google Gemini)** để tự động xây dựng lộ trình tập luyện và thực đơn dinh dưỡng riêng biệt cho từng cá nhân.

🔗 **Live Demo:** [https://viet-life-fitness-website-4qu7.vercel.app/](https://viet-life-fitness-website-4qu7.vercel.app/)

## ✨ Key Features (Tính năng nổi bật)

* 🤖 **AI Smart Chatbot:** Trợ lý ảo thông minh tích hợp **Google Gemini API** & **Prompt Engineering**, hỗ trợ tư vấn sức khỏe và giải đáp thắc mắc 24/7.
* 🎯 **Personalization Engine:** Tự động tính toán chỉ số y học vận động (BMI, TDEE) và dựa vào mục tiêu, thông tin sức khỏe đầu vào. Sau đó **AI** sẽ phân tích và tạo **lộ trình tập luyện và gợi ý dinh dưỡng** phù hợp.
* 📊 **Statistics & AI Analysis:** Tự động **thống kê** dữ liệu người dùng, kết hợp **AI** để phân tích, đánh giá hiệu quả dinh dưỡng & tập luyện, từ đó đưa ra lời khuyên cải thiện cụ thể.
* 🔐 **Secure System:** Hệ thống xác thực bảo mật với **JWT**, phân quyền User/Admin.
* 📱 **Responsive Design:** Giao diện tối ưu trải nghiệm người dùng trên cả Desktop và Mobile.

## 🛠 Tech Stack (Công nghệ sử dụng)

| Category | Technologies |
|----------|--------------|
| **Frontend** | ReactJS, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js, RESTful API |
| **Database** | MySQL (Relational Database Design) |
| **AI Integration** | Google Gemini API (Generative AI) |
| **Services** | Cloudinary (Media Management), Nodemailer (SMTP Email) |
| **DevOps/Tools** | Git, GitHub, Postman, Vercel/Render, AWS |

## 🚀 Installation & Setup (Cài đặt & Chạy dự án)

### 1. Clone the repository
```bash
git clone [https://github.com/PVinhP/VietLife-Fitness-website.git](https://github.com/PVinhP/VietLife-Fitness-website.git)
cd VietLife-Fitness-website
```
### 2. Setup Backend
```bash
cd backend
npm install
# Tạo file .env và điền các thông tin:
# PORT=...
# DB_HOST=...
# GEMINI_API_KEY=...
# CLOUDINARY_NAME=...
node index.js
```
### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

## 📸 Screenshots (Hình ảnh minh họa)
### Trang chủ
<img width="1920" height="1022" alt="image" src="https://github.com/user-attachments/assets/73acc95f-50bf-4526-98f2-9e2c661c9876" />

<img width="1918" height="1031" alt="image" src="https://github.com/user-attachments/assets/d81b3e4f-798c-48f2-be69-cf72febfecb3" />

<img width="1920" height="880" alt="image" src="https://github.com/user-attachments/assets/14398c19-636b-4b3d-aa46-661c80c90604" />

### Kiến thức

<img width="1920" height="1033" alt="image" src="https://github.com/user-attachments/assets/c0ba09d9-a4d9-4ac4-8578-31a095b25899" />
<img width="1920" height="880" alt="image" src="https://github.com/user-attachments/assets/bd76ee61-3e5d-4c09-a45f-f10b660b7f1a" />

### Dinh Dưỡng
Công cụ dinh dưỡng

<img width="1920" height="885" alt="image" src="https://github.com/user-attachments/assets/18527882-3c0b-4cf9-ae5e-d745f7ca10cb" />

Thư viện công thức nấu ăn

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/560ec56d-b58b-4fcb-bbc5-d000e82054c0" />
<img width="1920" height="888" alt="image" src="https://github.com/user-attachments/assets/f1217f9b-7363-426c-a900-7cee2064d78d" />

Nhật ký ăn uống

<img width="1920" height="1015" alt="image" src="https://github.com/user-attachments/assets/a3fc60ee-63d4-4c7a-9057-0a5b9ec0bcac" />

Thư Viện Thực Phẩm

<img width="1920" height="1036" alt="image" src="https://github.com/user-attachments/assets/e2034d0c-2a7d-4794-b147-f74630d35aae" />

### Tập luyện 

Bắt đầu ngay
<img width="1920" height="1033" alt="image" src="https://github.com/user-attachments/assets/fe4a6a1b-44b8-43ea-a9a9-81fb036accf1" />
Thư viện bài tập
<img width="1920" height="1035" alt="image" src="https://github.com/user-attachments/assets/2c723c70-28fb-4a24-af10-7b32b7415875" />
Tập luyện bổ trợ thể thao
<img width="1920" height="1038" alt="image" src="https://github.com/user-attachments/assets/26a82807-90b4-4ae4-9404-16363655a675" />
Tập theo giáo án 
<img width="1920" height="998" alt="image" src="https://github.com/user-attachments/assets/cdaa43d5-aba1-4497-b87c-9369be33cbd9" />
<img width="1920" height="1033" alt="image" src="https://github.com/user-attachments/assets/c957b60c-14d3-491c-9212-567c2989565a" />
Công cụ tập luyện
<img width="1916" height="1020" alt="image" src="https://github.com/user-attachments/assets/6a086255-0f31-47f7-917a-f3b656cb6031" />

### lộ Trình Cá nhân hóa 

Onboarding
<img width="1920" height="1031" alt="image" src="https://github.com/user-attachments/assets/5a11cf25-d64a-40de-9f51-c9992226f02a" />
Lộ trình tập luyện
<img width="1920" height="1034" alt="image" src="https://github.com/user-attachments/assets/2cec3778-db95-45f2-a8a4-2c4ad48cf465" />
<img width="1914" height="790" alt="image" src="https://github.com/user-attachments/assets/3905ca18-d348-4a41-9272-3a05b1253897" />
Gợi ý thực đơn
<img width="1920" height="879" alt="image" src="https://github.com/user-attachments/assets/126c1243-de74-4343-b858-f0838149a009" />

### Phần cá Nhân

Trang Tổng quan 
<img width="1920" height="881" alt="image" src="https://github.com/user-attachments/assets/3099756e-cb84-4d53-99b9-eb95ba83b4bd" />
Nhật ký ăn uống
<img width="1920" height="971" alt="image" src="https://github.com/user-attachments/assets/f2bdea02-c661-4967-8b2a-482aaaa8f5f2" />
Lịch sử tập luyện
<img width="1913" height="979" alt="image" src="https://github.com/user-attachments/assets/5b108ab6-86d0-4d05-a143-fd335b77eb90" />
Tiến trình học tập
<img width="1920" height="798" alt="image" src="https://github.com/user-attachments/assets/f4b71ecd-6ec8-4d10-b2dd-b4fdb01e3d2f" />
Thống Kê Năng lượng
<img width="1920" height="1031" alt="image" src="https://github.com/user-attachments/assets/3e6d2363-e5ce-4f26-b4b0-439c1adfe023" />

<img width="1920" height="800" alt="image" src="https://github.com/user-attachments/assets/e0f2a52c-c3ba-4ecc-a24c-572b37f40cd4" />
Hồ sơ và cài đặt
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/dd04670f-387d-4e76-a767-d6072468d39f" />
Phản hồi
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/867b95df-b476-4139-b6d0-fafb16705b5a" />
Trợ lý sức khỏe AI 
<img width="1910" height="993" alt="image" src="https://github.com/user-attachments/assets/99dd86b8-026a-41fa-ae3f-eb4df59fa57e" />
Trang ADmin
<img width="1920" height="1039" alt="image" src="https://github.com/user-attachments/assets/20b6d7b9-70a6-4de0-8225-30cf41aa36c4" />



## 🤝 Contact (Liên hệ)
- Author: Phạm Phú Vinh.
- Email: Vinhpham753951@gmail.com
- SDT: 0987228178

