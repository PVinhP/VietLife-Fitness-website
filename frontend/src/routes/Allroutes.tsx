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
import Dashboard from '../pages/Dashboard';
import Yoga from '../components/Yoga';
import PrivateRoute from './PrivateRoute';
import UserPage from '../pages/UserPage';
import Addworkout from '../components/Addworkout';
import CardioGuide from '../pages/Cardio';
import BlogDetail from '../components/BlogDetail';
import LessonDetail from '../components/LessonDetail';
import OnboardingQuiz from '../pages/OnboardingPage';
import Setting from '../pages/SettingPage';
import UserProgressPage from '../pages/UserProgressPage';
import NutritionMealPlanner from '../pages/NutritionMeal'; 
import NutritionDiary from '../components/NutritionDiary';
import LibraryFood from '../pages/nutrition/LibraryFood';
//  Các trang con ( vừa di chuyển và sửa code)
import NutritionTools from '../pages/nutrition/NutritionTools'; 
import RecipeSection from '../pages/nutrition/RecipeSection'; 
import LessonSection from '../pages/nutrition/LessonSection'; 
import ExploreSection from '../pages/nutrition/ExploreSection';
import SportsList from '../pages/trainning/SportsList'
import SportDetail from '../pages/trainning/SportDetail';
import PlanList from '../pages/trainning/PlanList';
import PlanDetail from '../pages/trainning/PlanDetail';
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
      <Route path="/nutrition/meal-planner" element={<NutritionMealPlanner />} />
      <Route path="/nutrition/library-food" element={<LibraryFood />} />
      <Route path="/lesson/:id" element={<LessonDetail />} />
      <Route path="/customexercise" element={<ExerciseInputForm />} />
      <Route path="/exercise" element={<PrivateRoute><Exercise /></PrivateRoute>} />
      <Route path="/training/sports" element={<SportsList/>} />
      <Route path="/training/sports/:slug" element={<SportDetail/>} />
      <Route path="/training/plans" element={<PlanList/>} />
      <Route path="/training/plans/:id" element={<PlanDetail/>} />
      <Route path="/goals" element={<PrivateRoute><UserPage /></PrivateRoute>} />
      <Route path="/addworkout" element={<PrivateRoute><Addworkout /></PrivateRoute>} />
      <Route path="/plan" element={<PrivateRoute><Plan /></PrivateRoute>} />
      <Route path="/profile/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/cardio" element={<PrivateRoute><CardioGuide /></PrivateRoute>} />
      <Route path="/profile/learning" element={<PrivateRoute><UserProgressPage /></PrivateRoute>} />
      <Route path="/profile/settings" element={<PrivateRoute><Setting /></PrivateRoute>} />
      <Route path="/profile/nutrition" element={<PrivateRoute><NutritionDiary /></PrivateRoute>} />
    </Routes>
  );
}

export default Allroutes; 