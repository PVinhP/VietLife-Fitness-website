// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware để xác thực JWT token
const authMiddleware = (req, res, next) => {
  // Lấy token từ header 'Authorization'
  const authHeader = req.headers.authorization;

  // Kiểm tra xem header và token có tồn tại không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Không có token, quyền truy cập bị từ chối' });
  }

  try {
    // Tách token từ chuỗi "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Xác thực token với secret key của bạn
    // Chắc chắn rằng bạn đã định nghĩa JWT_SECRET trong file .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn thông tin user đã giải mã vào đối tượng request
    // Ở đây tôi giả định payload của bạn chứa object user có id
    req.user = { id: decoded.userId }; // Hoặc tên field id tương ứng trong payload của bạn

    next(); // Chuyển sang middleware hoặc controller tiếp theo
  } catch (error) {
    console.error('Lỗi xác thực token:', error.message);
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;
























/* const jwt = require("jsonwebtoken")

const AuthMiddleware=(req,res,next)=>{
  const token = req.headers.authorization
  if(token){
    try {
        const decoded = jwt.verify(token.split(" ")[1],"VietLife")
        if(decoded){
            // console.log(decoded)
            req.body.userId=decoded.userId
            req.body.username=decoded.username
            console.log(req.body)
            next()
        }else{
            res.status(400).send({"msg":"Please login to access this function!!!"})
        }
    } catch (error) {
        res.send({"msg":"Please login to access this function!!!"})
    }
  }else{
    res.status(400).send({"msg":"Please login to access this function!!!"})
  }
}

module.exports={AuthMiddleware}

*/