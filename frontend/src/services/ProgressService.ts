// frontend/src/services/ProgressService.ts

const API_URL = 'http://localhost:8080/api/progress';

// Helper function để lấy token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export interface LessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  progress_percent: number;
  completed: boolean;
  bookmark: boolean;
  ghi_chu: string;
  ngay_hoan_thanh: string | null;
  ngay_tao: string;
  // Thông tin bài học join
  tieu_de?: string;
  hinh_anh?: string;
  tom_tat?: string;
  loai?: string;
  duration?: number;
  tags?: string;
}

export interface ProgressStats {
  total_lessons: number;
  completed_count: number;
  in_progress_count: number;
  bookmarked_count: number;
  avg_progress: number;
}

export interface UpdateProgressData {
  progress_percent?: number;
  completed?: boolean;
  ghi_chu?: string;
}

class ProgressService {
  
  /**
   * 1. Lấy tất cả tiến độ của user (có filter)
   */
  async getAllProgress(filter?: 'completed' | 'in-progress' | 'bookmarked'): Promise<LessonProgress[]> {
    try {
      const url = filter ? `${API_URL}?filter=${filter}` : API_URL;
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Không thể tải tiến độ học tập');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  }

  /**
   * 2. Lấy tiến độ của một bài học cụ thể
   */
  async getLessonProgress(lessonId: number): Promise<{ exists: boolean; progress: LessonProgress | null }> {
    try {
      const response = await fetch(`${API_URL}/${lessonId}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Không thể tải tiến độ bài học');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      throw error;
    }
  }

  /**
   * 3. Cập nhật tiến độ học tập
   */
  async updateProgress(lessonId: number, data: UpdateProgressData): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/${lessonId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật tiến độ');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * 4. Bookmark bài học
   */
  async toggleBookmark(lessonId: number, bookmark: boolean): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/${lessonId}/bookmark`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bookmark })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật bookmark');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  /**
   * 5. Cập nhật ghi chú
   */
  async updateNotes(lessonId: number, ghi_chu: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/${lessonId}/notes`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ ghi_chu })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật ghi chú');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  }

  /**
   * 6. Lấy thống kê tiến độ
   */
  async getStats(): Promise<ProgressStats> {
    try {
      const response = await fetch(`${API_URL}/stats/summary`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Không thể tải thống kê');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * 7. Lấy lịch sử gần đây
   */
  async getRecentProgress(limit: number = 10): Promise<LessonProgress[]> {
    try {
      const response = await fetch(`${API_URL}/recent?limit=${limit}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Không thể tải lịch sử');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent progress:', error);
      throw error;
    }
  }

  /**
   * 8. Xóa tiến độ
   */
  async deleteProgress(lessonId: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/${lessonId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Không thể xóa tiến độ');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting progress:', error);
      throw error;
    }
  }

  /**
   * Helper: Đánh dấu bài học đã hoàn thành
   */
  async markAsCompleted(lessonId: number, ghi_chu: string = ''): Promise<any> {
    return this.updateProgress(lessonId, {
      progress_percent: 100,
      completed: true,
      ghi_chu
    });
  }

  /**
   * Helper: Cập nhật % tiến độ đọc
   */
  async updateReadProgress(lessonId: number, percent: number): Promise<any> {
    return this.updateProgress(lessonId, {
      progress_percent: Math.min(100, Math.max(0, percent)),
      completed: percent >= 100
    });
  }
}

export default new ProgressService();