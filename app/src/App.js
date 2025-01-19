import './styles/index.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { Login } from './Login.js';

function App() {
  return (
  <div className="App">
    <Routes>
      <Route path='/' element={<HomePage />}></Route>
      <Route path='/login' element={<Login />}></Route>
    </Routes>
  </div>
  );
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );
}

export default App;
