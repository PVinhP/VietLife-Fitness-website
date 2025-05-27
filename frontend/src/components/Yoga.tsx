import React, { useEffect } from 'react'
// import Pan1 from "../images/Pan1.mp4"
// import Pan2 from "../images/pan2.mp4"
import Pan3 from "../images/pan3.mp4"
import Pan4 from "../images/pan4.mp4"

import * as Aos from "aos";  
import "aos/dist/aos.css";

const Yoga = () => {

    useEffect(()=>{ 
        Aos.init({duration:1000})
    },[])

    return (
        <div className="bg-white min-h-screen pt-16">
{/* Phần 1: Video và lời nhắn "Đừng viện lý do" */}
<div className="flex flex-col lg:flex-row items-center justify-between mx-4 lg:mx-10 lg:my-20">
    <video className="w-full lg:w-1/3 lg:mr-8"  controls data-aos="fade-right">
        <source src={'https://res.cloudinary.com/dj3rolvmw/video/upload/v1748330121/Le_Van_Cong_wuq13v.mp4'} />
    </video>
    <div className="w-full lg:w-2/3 lg:text-left text-center mt-8 lg:mt-0 text-gray-800" data-aos="fade-left">
        <h2 className="text-3xl lg:text-5xl font-bold mb-8 lg:mb-12 text-left text-gray-800">Đừng viện cớ</h2>
        <p className="text-lg lg:text-2xl mb-8 lg:pr-16">Trên video là lực sĩ Lê Văn Công - Sinh ra với đôi chân teo tóp do di chứng sốt xuất huyết bẩm sinh, anh không chỉ vượt qua nghịch cảnh mà còn trở thành biểu tượng của nghị lực và khát vọng. Từ tấm HCV lịch sử tại Paralympic Rio 2016, HCB tại Tokyo 2020 đến HCĐ tại Paris 2024, Lê Văn Công là vận động viên Việt Nam đầu tiên giành huy chương ở cả ba kỳ Paralympic liên tiếp. Anh cũng đang nắm giữ kỷ lục thế giới với mức tạ 183,5kg ở hạng cân 49kg nam. Hành trình của anh là minh chứng rằng, giới hạn chỉ tồn tại khi ta cho phép nó tồn tại.</p>
        <a className="text-blue-600 underline hover:text-blue-800 transition duration-200" href="https://kenh14.vn/le-van-cong-khi-y-thuc-duoc-minh-thieu-doi-chan-thi-doi-tay-toi-da-manh-me-lam-roi-20161210064742538.chn">Tìm hiểu thêm </a>
    </div>
</div>

{/* Phần 2: Căng cơ là bắt buộc */}
<div className="flex flex-wrap justify-around my-10 mx-4 lg:mx-auto">
  <div className="w-full md:w-1/2 lg:w-5/12 text-gray-800" data-aos="fade-right">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-5 md:mt-0 mb-8 md:mb-10 lg:mb-12 text-left">Yoga</h2>
    <p className="text-lg md:text-xl lg:text-2xl mb-6 lg:mb-10 leading-8 lg:leading-9">Các bài tập Yoga thường xuyên giúp tăng độ linh hoạt của cơ và khớp. Điều này giúp cơ có thể co giãn hiệu quả hơn, từ đó cải thiện tư thế, khả năng vận động và sự thoải mái khi di chuyển. Tăng độ linh hoạt cũng giúp giảm nguy cơ căng cơ và chấn thương khi vận động.</p>
    <p className="text-lg md:text-xl lg:text-2xl leading-8 lg:leading-9">Yoga giúp ngăn ngừa chấn thương bằng cách tăng độ đàn hồi và dẻo dai cho cơ và gân. Khi cơ linh hoạt hơn, khả năng bị kéo căng hay rách trong những chuyển động đột ngột hoặc hoạt động nặng sẽ giảm đi. Việc đưa các bài tập căng cơ vào thói quen luyện tập có thể giúp duy trì sự cân bằng cơ bắp, cải thiện sự ổn định của khớp và giảm nguy cơ chấn thương.</p>
  </div>
  <div className="w-full md:w-1/2 lg:w-5/12 flex flex-wrap justify-around items-center" data-aos="fade-left">
    <video className="w-full" controls >
      <source src={'https://res.cloudinary.com/dj3rolvmw/video/upload/v1748328666/yoga_me_va_be_cxffha.mp4'} />
    </video>
  </div>
</div>

{/* Phần 3: Thiền định */}
<div className="flex flex-col md:flex-row justify-around items-center md:items-stretch px-4 md:px-12 lg:px-24 py-12 md:py-24">
  <video className="w-full md:w-1/3 lg:w-1/4 mr-20" controls  data-aos="fade-right">
    <source src={Pan3} />
  </video>
  <div className="w-full md:w-2/3 lg:w-3/4 md:text-left text-center text-gray-800 my-8 md:my-0" data-aos="fade-left">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8 md:mb-12 md:text-left">Tầm quan trọng của thiền định</h2>
    <p className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 md:mb-12">
      Thiền là một phương pháp được thực hành suốt nhiều thế kỷ và ngày càng trở nên quan trọng trong thế giới hiện đại. Nó giúp rèn luyện tâm trí tập trung và chuyển hướng suy nghĩ, từ đó mang lại sự minh mẫn, ổn định cảm xúc và bình an nội tâm.
    </p>
    <p className="text-lg md:text-xl lg:text-2xl leading-relaxed">
      Một trong những lợi ích lớn nhất của thiền là ảnh hưởng tích cực đến sức khỏe tinh thần. Việc thực hành thường xuyên giúp giảm các triệu chứng trầm cảm và lo âu, cải thiện tâm trạng và nâng cao sự an lành về mặt cảm xúc. Khi quan sát suy nghĩ và cảm xúc mà không phán xét, con người phát triển sự hiểu biết sâu sắc hơn về nội tâm và có thể phản ứng với các tình huống khó khăn một cách bình tĩnh hơn.
    </p>
  </div>
</div>

{/* Phần 4: Sức mạnh thể chất */}
<div className="flex flex-wrap justify-around my-10 mx-4 lg:mx-auto">
  <div className="w-full md:w-1/2 lg:w-5/12 text-gray-800" data-aos="fade-right">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-5 md:mt-0 mb-8 md:mb-10 lg:mb-12 text-left">Sức mạnh</h2>
    <p className="text-lg md:text-xl lg:text-2xl mb-6 lg:mb-10 leading-8 lg:leading-9">
      Sức mạnh rất cần thiết để thực hiện các hoạt động hằng ngày một cách dễ dàng và hiệu quả. Từ việc nâng đồ, xách hàng, leo cầu thang cho đến giữ thăng bằng – có đủ sức mạnh giúp chúng ta đáp ứng nhu cầu vận động thường nhật và duy trì sự tự lập.
    </p>
    <p className="text-lg md:text-xl lg:text-2xl leading-8 lg:leading-9">
      Tập luyện sức mạnh còn mang lại nhiều lợi ích về mặt tâm lý. Nó có thể tăng sự tự tin, cải thiện hình ảnh bản thân và nâng cao lòng tự trọng. Tập thể dục đều đặn giúp cơ thể tiết ra endorphin – hormone "hạnh phúc" – hỗ trợ cải thiện tâm trạng và giảm các triệu chứng lo âu, trầm cảm.
    </p>
  </div>
  <div className="w-full md:w-1/2 lg:w-5/12" data-aos="fade-left">
    <video controls  className="w-full">
      <source src={Pan4} />
    </video>
  </div>
</div>

{/* Tiêu đề: Các video hữu ích */}
<h1 style={{margin:"5%" ,fontSize: "3rem", fontWeight:"800",color:"#374151" }}>Các video hữu ích</h1>

{/* Video YouTube */}
<div className="grid grid-cols-2 gap-4 m-5">
  <iframe data-aos="fade-right" className="w-full h-80" src="https://www.youtube.com/embed/DlKKS94866A" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ></iframe>

  <iframe data-aos="fade-left" className="w-full h-80" src="https://www.youtube.com/embed/TE9chndRGcY" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ></iframe>

  <iframe data-aos="fade-right" className="w-full h-80" src="https://www.youtube.com/embed/UBY1HbmClKc" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ></iframe>

  <iframe data-aos="fade-left" className="w-full h-80" src="https://www.youtube.com/embed/CrRQalmcQec" title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ></iframe>
</div>

        </div>
    )
}

export default Yoga
