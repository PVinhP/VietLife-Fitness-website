import './App.css' 
import './App.css';
import { BrowserRouter } from 'react-router-dom'; // Thêm import này
import Allroutes from './routes/Allroutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter> {/* Wrap toàn bộ app với BrowserRouter */}
      <div className="App">
        <Navbar/>
        <Allroutes/>
        <Footer/>
      </div>
    </BrowserRouter>
  );
}

export default App; 