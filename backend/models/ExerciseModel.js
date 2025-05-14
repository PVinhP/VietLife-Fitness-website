const { pool } = require('../db');

class ExerciseModel {
  // Lấy tất cả bài tập
  static async getAllExercises() {
    try {
      const [rows] = await pool.query('SELECT * FROM exercises');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy bài tập theo nhóm cơ
  static async getExercisesByMuscleGroup(muscleGroup) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM exercises WHERE muscle_group = ?',
        [muscleGroup]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy bài tập theo ID
  static async getExerciseById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM exercises WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Thêm bài tập mới
  static async createExercise(exerciseData) {
    try {
      const { exercise_name, video_urls, description, muscle_group, equipment_required, steps } = exerciseData;
      
      const [result] = await pool.query(
        `INSERT INTO exercises 
         (exercise_name, video_urls, description, muscle_group, equipment_required, steps) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [exercise_name, video_urls, description, muscle_group, equipment_required, steps]
      );
      
      return { id: result.insertId, ...exerciseData };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật bài tập
  static async updateExercise(id, exerciseData) {
    try {
      const { exercise_name, video_urls, description, muscle_group, equipment_required, steps } = exerciseData;
      
      await pool.query(
        `UPDATE exercises SET 
         exercise_name = ?, 
         video_urls = ?, 
         description = ?, 
         muscle_group = ?, 
         equipment_required = ?, 
         steps = ? 
         WHERE id = ?`,
        [exercise_name, video_urls, description, muscle_group, equipment_required, steps, id]
      );
      
      return { id, ...exerciseData };
    } catch (error) {
      throw error;
    }
  }

  // Xóa bài tập
  static async deleteExercise(id) {
    try {
      await pool.query('DELETE FROM exercises WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      throw error;
    }
  }

  // Import dữ liệu từ API
  static async importFromAPI(exercises) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      for (const exercise of exercises) {
        // Chuyển đổi dữ liệu từ định dạng API sang định dạng bảng của chúng ta
        await connection.query(
          `INSERT INTO exercises 
           (exercise_name, description, muscle_group, equipment_required, steps) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            exercise.name,                       // exercise_name
            exercise.instructions,               // description 
            exercise.muscle,                     // muscle_group
            exercise.equipment,                  // equipment_required
            JSON.stringify(exercise.instructions.split('. ')) // steps
          ]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ExerciseModel;