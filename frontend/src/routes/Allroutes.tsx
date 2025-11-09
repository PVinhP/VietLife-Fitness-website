import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Signin from '../pages/Signin';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import Blogs from '../pages/Blogs';
import Nutriton from '../pages/Nutrition';
import ExerciseInputForm from '../pages/ExerciseInputForm';
import Exercise from '../pages/Exercise';
import Plan from '../pages/Plan';
import Yoga from '../components/Yoga';
import PrivateRoute from './PrivateRoute';
import UserPage from '../pages/UserPage';
import Addworkout from '../components/Addworkout';
import CardioGuide from '../pages/Cardio';
import BlogDetail from '../components/BlogDetail';
import LessonDetail from '../components/LessonDetail';
import OnboardingQuiz from '../pages/OnboardingPage';
import Profile from '../pages/ProfilePage';
import UserProgressPage from '../pages/UserProgressPage';
//  Các trang con ( vừa di chuyển và sửa code)
import NutritionTools from '../pages/nutrition/NutritionTools'; 
import RecipeSection from '../pages/nutrition/RecipeSection'; 
import LessonSection from '../pages/nutrition/LessonSection'; 
import ExploreSection from '../pages/nutrition/ExploreSection';
function Allroutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingQuiz />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Home />} />
      <Route path="/yoga" element={<Yoga />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/nutrition" element={<Nutriton />} />
      <Route path="/nutrition/tools" element={<NutritionTools />} />
      <Route path="/nutrition/recipes" element={<RecipeSection />} />
      <Route path="/nutrition/lessons" element={<LessonSection />} />
      <Route path="/nutrition/explore" element={<ExploreSection />} />
      <Route path="/lesson/:id" element={<LessonDetail />} />
      <Route path="/customexercise" element={<ExerciseInputForm />} />
      <Route path="/exercise" element={<PrivateRoute><Exercise /></PrivateRoute>} />
      <Route path="/goals" element={<PrivateRoute><UserPage /></PrivateRoute>} />
      <Route path="/addworkout" element={<PrivateRoute><Addworkout /></PrivateRoute>} />
      <Route path="/plan" element={<PrivateRoute><Plan /></PrivateRoute>} />
      <Route path="/cardio" element={<PrivateRoute><CardioGuide /></PrivateRoute>} />
      <Route path="/progress" element={<PrivateRoute><UserProgressPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    </Routes>
  );
}

export default Allroutes; 