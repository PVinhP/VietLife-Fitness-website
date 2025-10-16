// backend/controllers/profileController.js

const HealthProfile = require('../models/HealthProfile');

// Controller để tạo health profile
const createHealthProfile = async (req, res) => {
  // Lấy user id từ middleware xác thực
  const userId = req.user.id;
  // Lấy dữ liệu từ body của request
  const {
    age,
    gender,
    weight_kg,
    height_cm,
    activity_level,
    medical_history,
    dietary_preferences,
    sleep_quality_rating
  } = req.body;

  // --- Validation cơ bản ---
  if (!age || !gender || !weight_kg || !height_cm || !activity_level) {
    return res.status(400).json({ msg: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
  }
  
  // Kiểm tra xem người dùng đã có profile chưa
  try {
    const existingProfile = await HealthProfile.findByUserId(userId);
    if (existingProfile) {
      // Bạn có thể chọn cập nhật thay vì báo lỗi
      return res.status(409).json({ msg: 'Hồ sơ sức khỏe của bạn đã tồn tại.' });
    }
  
    // Tạo object dữ liệu mới
    const newProfileData = {
      user_id: userId,
      age: parseInt(age, 10),
      gender,
      weight_kg: parseFloat(weight_kg),
      height_cm: parseFloat(height_cm),
      activity_level,
      medical_history,
      dietary_preferences,
      sleep_quality_rating: parseInt(sleep_quality_rating, 10)
    };
  
    // Gọi model để tạo profile trong DB
    const createdProfile = await HealthProfile.create(newProfileData);
  
    // Trả về thành công
    res.status(201).json({ 
      msg: 'Hồ sơ đã được tạo thành công!',
      profile: createdProfile 
    });

  } catch (error) {
    console.error('Lỗi khi tạo hồ sơ:', error);
    res.status(500).json({ msg: 'Lỗi máy chủ nội bộ. Không thể tạo hồ sơ.' });
  }
};

module.exports = {
  createHealthProfile,
};
// backend