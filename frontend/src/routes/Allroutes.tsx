import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Signin from '../pages/Signin'
import Signup from '../pages/Signup'
import Home from '../pages/Home'
import Blogs from '../pages/Blogs'
import Nutriton from '../pages/Nutrition'
import ExerciseInputForm from '../pages/ExerciseInputForm'
import Exercise from '../pages/Exercise'
import Plan from '../pages/Plan'
import Yoga from '../components/Yoga'
import PrivateRoute from './PrivateRoute'
import UserPage from '../pages/UserPage'
import Addworkout from '../components/Addworkout'
import CardioGuide from '../pages/Cardio'     /* Thêm mới */
import Chatbotapi from '../components/Chatbot'
import BlogDetail from '../components/BlogDetail' 
import LessonDetail from '../components/LessonDetail'

function Allroutes() {
  return (
    <Routes>
      <Route path="https://vietlife-fitness-website-owpj.onrender.com/signin" element={<Signin />} />
      <Route path="https://vietlife-fitness-website-owpj.onrender.com/signup" element={<Signup />} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/' element={<Home />} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/yoga' element={<Yoga />} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/blogs' element={<Blogs />} />
      <Route path="https://vietlife-fitness-website-owpj.onrender.com/blog/:id" element={<BlogDetail />} /> {/* Thêm tuyến đường mới cho chi tiết blog */}
      <Route path="https://vietlife-fitness-website-owpj.onrender.com/nutrition" element={<Nutriton />} />
      <Route path="https://vietlife-fitness-website-owpj.onrender.com/lesson/:id" element={<LessonDetail />} /> {/* Thêm tuyến đường mới cho chi tiết bài học */}
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/customexercise' element={<ExerciseInputForm />} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/exercise' element={<PrivateRoute><Exercise /></PrivateRoute>} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/goals' element={<PrivateRoute><UserPage/></PrivateRoute>} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/addworkout' element={<PrivateRoute><Addworkout/></PrivateRoute>} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/expert' element={<Chatbotapi/>} />
      <Route path='https://vietlife-fitness-website-owpj.onrender.com/plan' element={<PrivateRoute><Plan /></PrivateRoute>} />
      <Route path="https://vietlife-fitness-website-owpj.onrender.com/cardio" element={<PrivateRoute><CardioGuide /></PrivateRoute>} /> {/* Thêm tuyến đường mới */}
    </Routes>
  )
}

export default Allroutes