import './styles/index.css';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { Login } from './Login.js';
import RequireAuth from '@auth-kit/react-router/RequireAuth';
// import AuthOutlet from '@auth-kit/react-router/AuthOutlet';
// import { AuthOutlet } from "react-auth-kit";
import ProtectedRoutes from './ProtectedRoutes.js';

function App() {
  return (
  <div className="App">
    <Routes>
      <Route path='/login' element={<Login />}/>
      <Route element={<ProtectedRoutes/>}>
        <Route path='/' element={<HomePage/>}/>
      </Route>
      <Route element={<Route/>}>
      <Route path='/hello' element={<RequireAuth fallbackPath='/login'><HomePage/></RequireAuth>}></Route>
      </Route>
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