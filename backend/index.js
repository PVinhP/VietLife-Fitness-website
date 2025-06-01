const express = require("express");
const cors = require('cors')
const { connection } = require("./config/db")
const { workoutRouter } = require("./routes/WorkoutRoutes");
const {AuthMiddleware}= require("./middlewares/AuthMiddleware");
const { exerciseRouter } = require("./routes/ExerciseRoute");
const { nutritionRouter } = require("./routes/NutritionRoutes"); // Import route mới
const { blogRouter } = require("./routes/BlogRoute"); // Import route mới
const { lessonRouter } = require("./routes/LessonRoute"); // Import mới
const { cardioRouter } = require("./routes/CardioRoute"); // Import route mới
const { UserRouter } = require("./routes/UserRoutes"); // Import UserRouter



const app = express();
app.use(cors({ origin: "https://vietlife-fitness-website-16dd.onrender.com" })) // Chỉnh sửa cor
app.use(express.json())

app.get("/",(req,res)=>{
 res.send("OK")
})
app.use("/user",UserRouter) // Gắn API vào endpoint /user // mới: Thêm API người dùng

//app.use(AuthMiddleware)     // tắt để test nhớ bật lại
app.use("/workouts",workoutRouter);
app.use("/exercise",exerciseRouter);
app.use("/nutrition", nutritionRouter); // Gắn API vào endpoint /nutrition // mới: Thêm API thực phẩm
app.use("/blogs", blogRouter); // Gắn API vào endpoint /blogs // mới: Thêm API blog
app.use("/cardio", cardioRouter); // Gắn API vào endpoint /cardio // mới: Thêm API cardio
app.use("/lesson", lessonRouter); // Gắn API vào endpoint /lessons // mới: Thêm API bài học



app.listen(8080, async()=>{
  
    try {
         await connection
         console.log("connected to DB!!")
    } catch (error) {
        console.log(error)
    }

    console.log("port 8080 is running")
})





