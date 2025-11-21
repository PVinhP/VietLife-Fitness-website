// src/types/nutrition.ts

export type FoodGroup = {
  id: number;
  name: string;
  icon: string;
  color_class: string;
  hover?: string;
};

export type FoodItem = {
  id: number;
  name: string;
  calories: number;
  protein_g: number;
  fats_g: number;
  carbs_g: number;
  fiber_g: number;
  description?: string;
};