import './App.css';
import Allroutes from './routes/Allroutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbotapi from './components/Chatbot/Chatbot'; // Import chatbot

function App() {
  return (
    <div className="App">
      <Navbar />
      <Allroutes />
      <Chatbotapi /> {/* Thêm chatbot vào layout chính */}
      <Footer />
    </div>
  );
}

export default App;