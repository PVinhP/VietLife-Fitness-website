//import React, { useState } from 'react'

import bot from "../images/chatbot.png"
import { useNavigate } from 'react-router-dom'

const Blogs = () => {
    const navigate = useNavigate()
    // const [next, setNext] = useState<boolean>(false);
    function myFunction(): void {
        const dots: HTMLElement | null = document.getElementById("dots");
        const moreText: HTMLElement | null = document.getElementById("more");
        const btnText: HTMLElement | null = document.getElementById("myBtn");

        if (dots && moreText && btnText) {
            if (dots.style.display === "none") {
                dots.style.display = "inline";
                btnText.innerHTML = "Đọc thêm";
                moreText.style.display = "none";
            } else {
                dots.style.display = "none";
                btnText.innerHTML = "Thu gọn";
                moreText.style.display = "inline";
            }
        }
    }

    return (
        <div>
            <div className='text-white w-4/5 m-auto'>
                {/* 1st blog */}
                <div className='flex flex-col md:flex-row m-5 pb-5 border-b-2 border-gray-300'>
                    <div className='md:w-2/5'>
                        <img className='rounded-lg' src="https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
                    </div>
                    <div className='md:w-3/5 md:pl-10'>
                        <h1 className='font-bold text-3xl mb-5'>Bắt đầu theo dõi chính xác số đo cơ thể để thấy rõ tiến trình của bạn</h1>
                        <p>Ăn một bữa sáng tốt là một trong những yếu tố nền tảng cho việc giảm cân lâu dài. Điều này chủ yếu là vì việc ăn thức ăn một hoặc hai giờ sau khi thức dậy giúp duy trì sức khỏe đường ruột và trao đổi chất tốt.<span id="dots">...</span><span id="more">Quá trình trao đổi chất đóng vai trò quan trọng trong việc giảm cân bền vững. Vì vậy, đảm bảo rằng nó hoạt động trơn tru là một trong những cách đơn giản nhưng hiệu quả nhất để giảm cân không mong muốn theo thời gian. Hơn nữa, bữa ăn phù hợp sẽ giúp bạn no lâu hơn trong suốt cả ngày và khuyến khích bạn hạn chế ăn vặt không cần thiết.</span></p>
                        <button onClick={myFunction} id="myBtn">Đọc thêm</button>
                    </div>
                </div>

                {/* 2nd blog */}
                <div className='flex flex-col-reverse md:flex-row m-5 pb-5 border-b-2 border-gray-300'>
                    <div className='md:w-3/5 md:pr-10'>
                        <h1 className='font-bold text-3xl mb-5'>Giảm cân có thể cải thiện sức khỏe tinh thần của bạn như thế nào</h1>
                        <p>Khi nói đến việc theo dõi số đo cơ thể, cân nặng không phải là công cụ duy nhất để theo dõi tiến trình giảm cân hoặc thể hình của bạn. Theo dõi số đo cơ thể là một chiến lược đơn giản và khá tạo động lực, cho phép bạn ghi nhận khi bạn giảm mỡ hoặc tăng cơ.</p>
                        <button>Đọc thêm...</button>
                    </div>
                    <div className='md:w-2/5'>
                        <img className='rounded-lg' src="https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
                    </div>
                </div>

                {/* 3rd blog */}
                <div className='flex flex-col md:flex-row m-5 pb-5 border-b-2 border-gray-300'>
                    <div className='md:w-2/5'>
                        <img className='rounded-lg' src="https://images.pexels.com/photos/6605299/pexels-photo-6605299.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
                    </div>
                    <div className='md:w-3/5 md:pl-10'>
                        <h1 className='font-bold text-3xl mb-5'>Làm thế nào để có một bữa tối quay lành mạnh</h1>
                        <p>Không có gì tuyệt hơn một bữa thịt quay vào Chủ nhật phải không? Cả gia đình quây quần, ngồi cùng nhau, trò chuyện, thưởng thức một bữa ăn tự nấu. Nhưng làm sao bạn vẫn có thể thưởng thức bữa ăn khi đang đếm lượng calo và cố gắng ăn uống lành mạnh. Rốt cuộc, một đĩa đầy thịt, khoai tây nướng, rau củ và có thể là nhân thịt nhồi hoặc bánh pudding Yorkshire có thể tăng lên khi bạn đang đếm calo. Bạn có biết rằng một bữa thịt quay đầy đủ với tất cả các món phụ có thể cộng lại lên tới 850 calo không? Thậm chí có thể nhiều hơn nếu bạn hào phóng với khẩu phần ăn của mình. Và đó là chưa kể đến món tráng miệng!</p>
                        <button>Đọc thêm...</button>
                    </div>
                </div>

                {/* 4th blog */}
                <div className='flex flex-col-reverse md:flex-row m-5 pb-5 border-b-2 border-gray-300'>
                    <div className='md:w-3/5 md:pr-10'>
                        <h1 className='font-bold text-3xl mb-5'>8 Món ăn sáng ngon để hỗ trợ hành trình giảm cân của bạn</h1>
                        <p>Trứng là một thực phẩm ăn sáng cổ điển dễ chế biến theo nhiều cách sáng tạo để có bữa sáng vừa ngon vừa cân đối về dinh dưỡng. Giàu sắt, vitamin, carotenoid, chất béo lành mạnh và protein, trứng là một kho tàng dinh dưỡng tuyệt vời, tạo nền tảng tốt cho bữa sáng hàng ngày. Luộc hoặc xào là những cách chế biến trứng lành mạnh nhất (trái ngược với chiên, phương pháp thêm dầu không cần thiết vào món ăn). Đặt chúng lên một lát bánh mì nguyên cám, bên trong một chiếc bánh wrap ăn sáng, hoặc đơn giản là ăn riêng cho một bữa ăn nhẹ giàu protein.</p>
                        <button>Đọc thêm...</button>
                    </div>
                    <div className='md:w-2/5'>
                        <img className='rounded-lg' src="https://images.pexels.com/photos/5645090/pexels-photo-5645090.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
                    </div>
                </div>
            </div>

            <div onClick={() => navigate("/expert")}>
                <img style={{ float: 'right', width: "87px", fontSize: "70px", marginRight: "-18%", position: "fixed", top: "70%", left: "93.3%" }} src={bot}  alt="ảnh minh họa" />
            </div>
        </div>
    )

}

export default Blogs