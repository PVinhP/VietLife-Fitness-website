// File: frontend/src/types/nutrition.ts

export interface FoodItem {
  id: number;
  name: string;
  image_url?: string;
  description?: string;
  
  // Các chỉ số dinh dưỡng
  calories: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
  fiber_g?: number;
  water_g?: number; // Tùy chọn nếu database có

  // --- THÊM DÒNG NÀY ---
  tags?: string[]; // Mảng các tag (VD: ["High-protein", "EatClean"])
  // --------------------
}

export interface FoodGroup {
  id: number;
  name: string;
  icon?: string;
  color_class?: string;
  hover?: string;
  // Các trường bổ sung nếu có
  description?: string;
  items?: any[]; // Cho nhóm Level 2
}