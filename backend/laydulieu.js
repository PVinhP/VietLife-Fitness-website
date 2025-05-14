const fs = require('fs');
const fetch = require('node-fetch');

const API_URL = 'https://exercisedb-api.vercel.app/api/v1/exercises';
const LIMIT = 50; // Số bài tập lấy mỗi lần (có thể thay đổi)
let allExercises = [];

async function fetchAllExercises() {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        let response = await fetch(`${API_URL}?offset=${offset}&limit=${LIMIT}`);
        let data = await response.json();

        if (data.data && data.data.exercises.length > 0) {
            allExercises = allExercises.concat(data.data.exercises);
            offset += LIMIT;
            console.log(`✅ Đã tải: ${allExercises.length} bài tập`);
        } else {
            hasMore = false;
        }
    }

    fs.writeFileSync('exercises.json', JSON.stringify(allExercises, null, 2));
    console.log('📂 Tất cả dữ liệu đã được lưu vào exercises.json');
}

fetchAllExercises();
