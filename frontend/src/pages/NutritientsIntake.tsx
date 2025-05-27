import React from 'react'
import Chart from 'react-apexcharts';


let data = [
  {
    series: [45, 20, 25, 10],
    category: "Bữa sáng",
    options: {
      labels: ['Carbohydrate', 'Protein', 'Chất béo', "Chất xơ"],
      colors: ['#10B981', '#60A5FA', '#F87171', '#2DD4BF'],
      legend: {
        position: 'bottom' as 'bottom',
        labels: {
          colors: '#1F2937', // text-gray-900 for legend text
        },
      },
    },
  },
  {
    series: [50, 25, 20, 5],
    category: "Bữa trưa",
    options: {
      labels: ['Carbohydrate', 'Protein', 'Chất béo', "Chất xơ"],
      colors: ['#10B981', '#60A5FA', '#F87171', '#2DD4BF'],
      legend: {
        position: 'bottom' as 'bottom',
        labels: {
          colors: '#1F2937', // text-gray-900 for legend text
        },
      },
    },
  },
  {
    series: [40, 30, 25, 5],
    category: "Bữa tối",
    options: {
      labels: ['Carbohydrate', 'Protein', 'Chất béo', "Chất xơ"],
      colors: ['#10B981', '#60A5FA', '#F87171', '#2DD4BF'],
      legend: {
        position: 'bottom' as 'bottom',
        labels: {
          colors: '#1F2937', // text-gray-900 for legend text
        },
      },
    },
  }
]

const NutrientsIntake: React.FC = () => {
  return (
    <div className='mt-20 bg-gray-100'>
      <h1 className="mb-3 text-4xl font-bold text-center text-gray-900">Hướng dẫn về Nạp Chất Dinh Dưỡng</h1>
      <div className='grid lg:grid-cols-3 md:grid-cols-1 sm:grid-cols-1 gap-4 px-8'>
        <img 
          className='w-96 m-auto rounded-xl shadow-md' 
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8aGVhbHRoeSUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60" 
          alt="Thực phẩm lành mạnh" 
        />
        <p className="w-96 m-auto text-xl leading-8 text-gray-600">
          Sau đây là những khuyến nghị chung về việc nạp chất dinh dưỡng cho người lớn, bao gồm carbohydrate, chất béo và protein. Nếu bạn có bất kỳ vấn đề sức khỏe nào, điều quan trọng là cần tham khảo ý kiến bác sĩ trước khi thực hiện bất kỳ thay đổi nào về chế độ ăn uống dựa trên những hướng dẫn này.
        </p>
        <img 
          className='w-96 m-auto rounded-xl shadow-md' 
          src="https://media.istockphoto.com/id/1384900198/photo/vegan-food-colorful-fresh-vegetables-and-fruits-and-dried-legumes-in-a-row-on-white.jpg?b=1&s=170667a&w=0&k=20&c=T1sKSXgAPlj5OSkxf0ukrR5tPIjDHmCiifzwy4PtA0U=" 
          alt="Rau củ quả tươi" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-8 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
        {data.map((item, i) => (
          <div key={i} className='bg-white rounded-lg p-4 shadow-md'>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 text-center">{item.category}</h1>
            <Chart
              options={item.options}
              series={item.series}
              type="pie"
              width="100%"
          />
        </div>
    
        ))}
      </div>
    </div>
  );
};

export default NutrientsIntake;