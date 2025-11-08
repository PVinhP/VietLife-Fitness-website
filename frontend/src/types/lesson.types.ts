// frontend/src/types/lesson.types.ts

export interface Lesson {
  id: number;
  tieu_de: string;
  hinh_anh: string;
  tom_tat: string;
  noi_dung: string;
  loai: 'coban' | 'tapluyen';
  ngay_tao: string;
  
  // Metadata mới
  thoi_gian_doc: number; // phút
  do_kho: 'de' | 'trung-binh' | 'kho';
  luot_xem: number;
  luot_thich: number;
  tac_gia: string;
  trang_thai: 'active' | 'draft' | 'archived';
  thu_tu: number;
  
  // Tags (từ JOIN query)
  tags?: string; // "Protein,Carb,Vitamin"
}

export interface LessonTag {
  id: number;
  ten_tag: string;
  mau_sac: string;
}

export interface UserLessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  ngay_hoan_thanh?: string;
  progress_percent: number;
  bookmark: boolean;
  ghi_chu?: string;
}

export type SortOption = 'newest' | 'oldest' | 'popular' | 'liked';

export interface LessonFilters {
  searchTerm: string;
  selectedCategory: 'coban' | 'tapluyen' | '';
  selectedTags: number[];
  sortBy: SortOption;
  difficulty: 'de' | 'trung-binh' | 'kho' | '';
}