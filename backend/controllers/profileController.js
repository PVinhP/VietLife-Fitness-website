// backend/controllers/profileController.js
const db = require('../config/db'); // Giả sử bạn có file config kết nối DB

/*
 * @controller  getCurrentProfile
 * @desc        Xử lý logic cho route GET /api/profile/me
 */
const getCurrentProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        // SỬA ĐỔI 1: Thêm 'h.goal' (khớp với tên cột DB bạn vừa thêm)
        const sql = `
            SELECT 
                u.email, u.full_name, u.avatar_url,
                h.age, h.gender, h.weight_kg, h.height_cm, 
                h.activity_level, h.medical_history, 
                h.dietary_preferences, h.sleep_quality_rating,
                h.goal  -- Đã sửa để lấy đúng cột 'goal'
            FROM users u
            LEFT JOIN health_profiles h ON u.id = h.user_id
            WHERE u.id = ?;
        `;
        
        const [results] = await db.pool.execute(sql, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        const profileData = results[0];

        // SỬA ĐỔI 2: Thêm 'goal' vào đối tượng health_profile
        const response = {
            full_name: profileData.full_name,
            email: profileData.email,
            avatar_url: profileData.avatar_url,
            health_profile: profileData.age ? { // Kiểm tra xem health_profile có tồn tại không
                age: profileData.age,
                gender: profileData.gender,
                weight_kg: profileData.weight_kg,
                height_cm: profileData.height_cm,
                activity_level: profileData.activity_level,
                medical_history: profileData.medical_history,
                dietary_preferences: profileData.dietary_preferences,
                sleep_quality_rating: profileData.sleep_quality_rating,
                goal: profileData.goal // <--- THÊM VÀO (khớp với DB)
            } : null // Nếu không có health_profile, trả về null
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Lỗi getCurrentProfile:', error.message);
        res.status(500).send('Lỗi máy chủ');
    }
};

/*
 * @controller  createOrUpdateHealthProfile
 * @desc        Xử lý logic cho route POST /api/profile (được gọi từ OnboardingPage)
 */
const createOrUpdateHealthProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // SỬA ĐỔI 3: Chỉ nhận các trường mà OnboardingPage.tsx thực sự gửi
    const {
      age,
      gender,
      weight_kg,
      height_cm,
      activity_level,
      goal 
    } = req.body;

    // SỬA ĐỔI 4: Chỉ validate các trường được gửi từ form này
    if (!age || !gender || !weight_kg || !height_cm || !activity_level || !goal) {
      return res.status(400).json({ msg: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }
    
    // SỬA ĐỔI 5: Câu lệnh SQL chỉ INSERT/UPDATE các trường mà form Onboarding gửi
    // Các trường như medical_history sẽ giữ giá trị NULL (hoặc giá trị cũ nếu đã có)
    const sql = `
        INSERT INTO health_profiles (
            user_id, age, gender, weight_kg, height_cm, 
            activity_level, goal 
        )
        VALUES (?, ?, ?, ?, ?, ?, ?) -- 7 giá trị
        ON DUPLICATE KEY UPDATE
            age = VALUES(age),
            gender = VALUES(gender),
            weight_kg = VALUES(weight_kg),
            height_cm = VALUES(height_cm),
            activity_level = VALUES(activity_level),
            goal = VALUES(goal); 
    `;

    // SỬA ĐỔI 6: Mảng params chỉ chứa 7 giá trị này
    const params = [
        userId, 
        parseInt(age, 10), 
        gender, 
        parseFloat(weight_kg), 
        parseFloat(height_cm), 
        activity_level, 
        goal
    ];
    
    await db.pool.execute(sql, params);

    // Lấy lại hồ sơ vừa cập nhật để trả về (giống getCurrentProfile)
    const [updatedProfile] = await db.pool.execute(
      `SELECT * FROM health_profiles WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({ 
      msg: 'Hồ sơ sức khỏe đã được cập nhật thành công!',
      profile: updatedProfile[0] // Trả về profile đã cập nhật
    });

  } catch (error) {
    console.error('Lỗi khi tạo/cập nhật hồ sơ:', error.message);
    res.status(500).json({ msg: 'Lỗi máy chủ nội bộ.' });
  }
};

module.exports = {
  getCurrentProfile,
  createOrUpdateHealthProfile,
};