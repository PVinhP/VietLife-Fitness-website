import axios from "axios"

export const getWorkouts=()=>{
    return axios.get("https://vietlife-fitness-website-host.onrender.com/workouts")
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log(err);
    })
};