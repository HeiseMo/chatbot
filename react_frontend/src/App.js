import Header from './components/Header';
import DocumentTools from './components/DocumentTools';
import IndexQuery from './components/IndexQuery';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <div className='app'>
      <Header />
      <div className='content'>
        <DocumentTools />
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
