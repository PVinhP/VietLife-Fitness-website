export const MOCK_AI_PLAN = {
    user_name: "Vinh",
    analysis: {
        title: "Chiến thuật: Tái cấu trúc cơ thể (Body Recomposition)",
        content: "Chào Vinh, với chiều cao 1m75 và 65kg, chỉ số BMI của bạn là 21.2 (Bình thường). Tuy nhiên, dựa trên mục tiêu 'Muốn to ngực và vai' của bạn, chúng ta sẽ tập trung vào phương pháp Hypertrophy (Phì đại cơ) với mức tạ vừa phải nhưng cường độ cao. Dinh dưỡng sẽ ưu tiên High Protein để xây dựng cơ bắp mà không tích thêm mỡ.",
        tags: ["Tăng cơ", "Giữ cân", "Ưu tiên thân trên"]
    },
    workout_schedule: [
        {
            day: "Thứ 2",
            focus: "Ngực & Tay sau (Push)",
            exercises: [
                { id: 1, name: "Đẩy ngực tạ đơn", sets: "4", reps: "10-12" },
                { id: 71, name: "Đẩy vai tạ đơn", sets: "3", reps: "12" },
                { id: 21, name: "Hít đất", sets: "3", reps: "To failure" }
            ]
        },
        {
            day: "Thứ 3",
            focus: "Lưng & Tay trước (Pull)",
            exercises: [
                { id: 49, name: "Kéo tạ đơn (Row)", sets: "4", reps: "10-12" },
                { id: 3, name: "Cuốn tay trước", sets: "3", reps: "12-15" }
            ]
        },
        // ... thêm các ngày khác
    ],
    nutrition_plan: {
        calories: 2400,
        macro: { p: 160, c: 280, f: 70 },
        meals: [
            { time: "Sáng", name: "Bánh mì ốp la 2 trứng", desc: "Thêm 1 hộp sữa đậu nành ít đường." },
            { time: "Trưa", name: "Cơm bình dân (Thịt luộc)", desc: "1 bát cơm + 150g thịt luộc + Rau muống luộc. Bỏ nước thịt kho." },
            { time: "Trước tập", name: "Chuối & Cà phê đen", desc: "1 quả chuối tiêu + 1 ly cà phê không đường để tỉnh táo." },
            { time: "Tối", name: "Ức gà xào nấm", desc: "Ăn kèm khoai lang luộc thay vì cơm trắng." }
        ]
    }
};