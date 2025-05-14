async function fetchAllExercises() {
    let allExercises = [];
    let offset = 0;
    let limit = 50; // Lấy 50 bài mỗi lần để giảm số request
    let hasMore = true;

    while (hasMore) {
        let url = `https://exercisedb-api.vercel.app/api/v1/exercises?offset=${offset}&limit=${limit}`;
        let response = await fetch(url);
        let data = await response.json();

        if (data.data.exercises.length === 0) {
            hasMore = false;
        } else {
            allExercises = allExercises.concat(data.data.exercises);
            offset += limit;
        }
    }

    console.log("Tổng số bài tập:", allExercises.length);
    console.log(allExercises);
}

fetchAllExercises();
