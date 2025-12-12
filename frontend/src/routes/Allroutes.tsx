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
import ToolsList from '../pages/trainning/ToolsList';
import OneRepMax from '../pages/trainning/tools/OneRepMax';
import HeartRateZones from '../pages/trainning/tools/HeartRateZones';
import IntervalTimer from '../pages/trainning/tools/IntervalTimer';
import TrainingWizard from '../pages/trainning/TrainingWizard';
import PaceCalculator from '../pages/trainning/tools/PaceCalculator';
import WilksCalculator from '../pages/trainning/tools/WilksScore';
import PlateCalculator from '../pages/trainning/tools/PlateCalculator';
import WorkoutHistory from '../components/Profile/WorkoutHistory';
import AIPlanDashboard from '../pages/trainning/AIPlanDashboard';
import ForgotPassword from '../pages/ForgotPassword';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManager from '../pages/admin/UserManager';
import FoodManager from '../pages/admin/FoodManager';
import RecipeManager from '../pages/admin/RecipeManager';
import LessonManager from '../pages/admin/LessonManager';
import ExerciseManager from '../pages/admin/ExerciseManager';

function Allroutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingQuiz />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/yoga" element={<Yoga />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/nutrition" element={<Nutriton />} />
      <Route path="/nutrition/tools" element={<NutritionTools />} />
      <Route path="/nutrition/recipes" element={<RecipeSection />} />
      <Route path="/lessons" element={<LessonSection />} />
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
      <Route path="/training/tools" element={<ToolsList />} />
      <Route path="/training/tools/1rm" element={<OneRepMax />} />  
      <Route path="/training/tools/heartratezones" element={<HeartRateZones />} />
      <Route path="/training/tools/timer" element={<IntervalTimer />} />
      <Route path="/training/start" element={<TrainingWizard />} />
      <Route path="/training/tools/pace" element={<PaceCalculator />} />
      <Route path="/training/tools/plate-calculator" element={<PlateCalculator />} />
      <Route path="/training/tools/wilks" element={<WilksCalculator />} />
      <Route path="/training/history" element={<WorkoutHistory />} />
      
      <Route path="/training/ai-plan" element={<AIPlanDashboard />} />
      <Route path="/goals" element={<PrivateRoute><UserPage /></PrivateRoute>} />
      <Route path="/addworkout" element={<PrivateRoute><Addworkout /></PrivateRoute>} />
      <Route path="/plan" element={<PrivateRoute><Plan /></PrivateRoute>} />
      <Route path="/profile/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/cardio" element={<PrivateRoute><CardioGuide /></PrivateRoute>} />
      <Route path="/profile/learning" element={<PrivateRoute><UserProgressPage /></PrivateRoute>} />
      <Route path="/profile/settings" element={<PrivateRoute><Setting /></PrivateRoute>} />
      <Route path="/profile/nutrition" element={<PrivateRoute><NutritionDiary /></PrivateRoute>} />
      <Route element={<AdminLayout />}>
        
        {/* AdminLayout sẽ bao bọc các trang con bên trong */}
        <Route path="/admin" >
          
          {/* Mặc định vào /admin sẽ hiện Dashboard */}
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Các trang quản lý chi tiết */}
          <Route path="users" element={<UserManager />} />
          
          <Route path="foods" element={<FoodManager />} /> 
              
          <Route path="recipes" element={<RecipeManager />} /> 
            
          <Route path="lessons" element={<LessonManager />} />  
          
          <Route path="exercises" element={<ExerciseManager />} />
          {/*
          <Route path="sports" element={<SportManager />} />    
          <Route path="plans" element={<PlanManager />} />      */}
          
        </Route>
      </Route>

    </Routes>
    
  );
}

export default Allroutes; 