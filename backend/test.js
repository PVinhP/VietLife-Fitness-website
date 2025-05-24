const { pool } = require('./config/db'); // Import pool từ file db.js

const getUsers = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM workout.blog');
    console.log(rows);
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
  }
};

getUsers();
