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
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/' element={<Home />} />
      <Route path='/yoga' element={<Yoga />} />
      <Route path='/blogs' element={<Blogs />} />
      <Route path="/blog/:id" element={<BlogDetail />} /> {/* Thêm tuyến đường mới cho chi tiết blog */}
      <Route path="/nutrition" element={<Nutriton />} />
      <Route path="/lesson/:id" element={<LessonDetail />} /> {/* Thêm tuyến đường mới cho chi tiết bài học */}
      <Route path='/customexercise' element={<ExerciseInputForm />} />
      <Route path='/exercise' element={<PrivateRoute><Exercise /></PrivateRoute>} />
      <Route path='/goals' element={<PrivateRoute><UserPage/></PrivateRoute>} />
      <Route path='/addworkout' element={<PrivateRoute><Addworkout/></PrivateRoute>} />
      <Route path='/expert' element={<Chatbotapi/>} />
      <Route path='/plan' element={<PrivateRoute><Plan /></PrivateRoute>} />
      <Route path="/cardio" element={<PrivateRoute><CardioGuide /></PrivateRoute>} /> {/* Thêm tuyến đường mới */}
    </Routes>
  )
}

export default Allroutes