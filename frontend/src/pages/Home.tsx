import React from 'react'
//import Navbar from '../components/Navbar'
import Banner from '../components/Banner'
//import Footer from '../components/Footer'

import bot from "../images/chatbot.png"
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div>
      <Banner />
      {/* lg:w-1/2 mt-5 md:w-full sm:w-full */}
      <div className='flex flex-col md:flex-row sm:flex-row w-4/5 m-auto gap-5'>
        <div>
          <img src="https://cdn-images.cure.fit/www-curefit-com/image/upload/c_fill,w_404,q_auto:eco,dpr_2,f_auto,fl_progressive//image/test/introducting-cult-pass/icp_cb.png" alt="" />
          <div className='text-white lg:text-left md:text-center sm:text-center'>
            <h1 className='text-xl font-bold '>Truy cập không giới hạn</h1>

            <li>Các lớp nhóm tại trung tâm</li>
            <li>Tất cả phòng gym ELITE & PRO</li>
            <li>Tập luyện trực tuyến tại nhà</li>

          </div>
        </div>
        <div className='text-white'>
          <img src="https://cdn-images.cure.fit/www-curefit-com/image/upload/c_fill,w_404,q_auto:eco,dpr_2,f_auto,fl_progressive//image/test/introducting-cult-pass/icp_cg.png" alt="" />
          <div className='text-white lg:text-left md:text-center sm:text-center'>
            <h1 className='text-xl font-bold'>Truy cập không giới hạn</h1>

            <li>Tất cả phòng gym PRO</li>
            <li>2 buổi/tháng tại phòng gym ELITE & các lớp nhóm</li>
            <li>Tập luyện trực tuyến tại nhà</li>

          </div>
        </div>
        <div className='text-white'>
          <div  >
            <img src="https://cdn-images.cure.fit/www-curefit-com/image/upload/c_fill,w_404,q_auto:eco,dpr_2,f_auto,fl_progressive//image/test/introducting-cult-pass/icp_cl.png" alt="" />
            {/* <h2 className='sticky'>FitZone Pro</h2> */}
          </div>
          <div className='text-white lg:text-left md:text-center sm:text-center'>
            <h1 className='text-xl font-bold'>Truy cập không giới hạn</h1>

            <li>Tập luyện tại nhà</li>
            <li>Bài tập cùng người nổi tiếng</li>
            <li>Bài tập theo mục tiêu & các buổi thiền</li>

          </div>
        </div>

      </div>
      <div className='text-white text-center m-5'>
        <h1 className='font-bold text-2xl m-4'>Khám phá dinh dưỡng của bạn</h1>
        <p className='m-4'>Cronometer khuyến khích bạn không chỉ đếm calo mà còn chú trọng đến dinh dưỡng tổng thể.</p>
        <div className='flex flex-col md:flex-row sm:flex-row' style={{ justifyContent: "space-around" }}>
          <div className='lg:w-1/2 mt-5 md:w-full sm:w-full'>
            <img className='w-2/3 block m-auto' src="https://images.pexels.com/photos/5967852/pexels-photo-5967852.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
            <p className='m-5 font-bold'>Thiết bị tập luyện & thực phẩm lành mạnh</p>
          </div>
          <div className='lg:w-1/2 mt-5 md:w-full sm:w-full'>
            <img className='w-2/3 block m-auto' src="https://images.pexels.com/photos/4050990/pexels-photo-4050990.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
            <p className='m-5 font-bold'>Đạt được mục tiêu ăn kiêng & tập luyện của bạn</p>
          </div>
          <div className='lg:w-1/2 mt-5 md:w-full sm:w-full'>
            <img className='w-2/3 block m-auto' src="https://images.pexels.com/photos/4374580/pexels-photo-4374580.jpeg?auto=compress&cs=tinysrgb&w=600" alt="" />
            <p className='m-5 font-bold'>Sức khỏe là tài sản thực sự, không phải vàng bạc</p>
          </div>
          <div >

          </div>
        </div>
      </div>
      <div>
        <h1 className='text-2xl m-4 text-white font-bold text-center'>Đồng bộ với ứng dụng & thiết bị</h1>
        <div className='w-full m-auto'>
          <img className='w-10/12 m-auto' src="https://cdn1.cronometer.com/webflow/cronometer-devices-3-p-1080.png" alt="" />
        </div>
      </div>
      {/* review */}
      <div className='w-10/12  m-auto mt-10'>
        <h1 className='text-2xl text-white text-center font-bold'>Đánh giá của khách hàng</h1>
        {/* 1st review */}
        <div className='flex m-10 '>
          <div className='mr-10' >
            <img className='rounded-full ' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqVXp-Uzjucv7jeesIrr5a-aRhYDRxmvN5M4oWU-wEkw&usqp=CAU&ec=48600112" alt="" />
          </div>
          <div>
            <h1 className='text-white font-bold text-2xl'>Raj Roy</h1>

            <div className="flex items-center m-2">
              {/* Các ngôi sao giữ nguyên */}
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>First star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Second star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Third star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Fourth star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Fifth star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <p className='pl-2 text-white'>22/05/2023 11:05</p>
            </div>
            <h1 className='text-white'>Tôi là thành viên thường xuyên của VietLife từ tháng 12/2022, tham gia nhiều lớp học. Chương trình boot camp quảng cáo giảm cân rất hấp dẫn, tôi đã có những trao đổi tích cực với trưởng nhóm boot camp trước khi tham gia. Những quảng cáo bắt mắt và phản hồi tích cực khiến tôi nghĩ mình có thể giảm được vài cân.</h1>
          </div>
        </div>
        {/* 2nd review */}
        <div className='flex m-10 '>
          <div className='mr-10'>
            <img className='rounded-full' src="https://www.shutterstock.com/image-vector/vector-circle-avatar-icon-man-260nw-391090273.jpg" alt="" />
          </div>
          <div>
            <h1 className='text-white font-bold text-2xl'>Pulkit12</h1>
            <div className="flex items-center m-2">
              {/* Các ngôi sao giữ nguyên */}
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>First star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Second star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Fifth star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Fifth star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Fifth star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <p className='pl-2 text-white'>12/03/2023 17:02</p>
            </div>
            <h1 className='text-white'>VietLife transform là ví dụ điển hình cho sự thiếu trung thực. Sản phẩm tệ, không có giá trị gì thêm. Điểm duy nhất tốt là đội ngũ bán hàng, nhưng họ lại quá thiếu trung thực.</h1>
          </div>
        </div>
        {/* 3rd review */}
        <div className='flex  m-10'>
          <div className='mr-10'  >
            <img className='rounded-full' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_tszMw5iX_JtnX0UfKSftyIfMck3nsAOMBDQII6AXzQ&usqp=CAU&ec=48600112" alt="" />
          </div>
          <div>
            <h1 className='text-white font-bold text-2xl'>akshita0609</h1>
            <div className="flex items-center m-2">
              {/* Các ngôi sao giữ nguyên */}
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>First star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Second star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Third star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Fifth star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <svg aria-hidden="true" className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Fifth star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <p className='pl-2 text-white'>17/02/2023 18:47</p>
            </div>
            <h1 className='text-white'>Tôi đã sử dụng VietLife vài tháng và nhìn chung tôi hài lòng với ứng dụng. Các bài tập vừa sức, đa dạng từ yoga, HIIT đến tập sức mạnh.</h1>
          </div>
        </div>
      </div>
      <div onClick={() => navigate("/expert")}>
        <img style={{ float: 'right', width: "87px", fontSize: "70px", marginRight: "-18%", position: "fixed", top: "70%", left: "93.3%" }} src={bot} alt="ảnh minh họa"/>
      </div>

    </div>
  )
}

export default Home