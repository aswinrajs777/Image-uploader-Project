import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../src/Components/Login/Login';
import Register from '../src/Components/Register/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import { ToastContainer } from 'react-toastify';
import { UserProvider } from './Context/UserContext';
import 'react-toastify/dist/ReactToastify.css';
import Profile from './Components/Profile/Profile';

function App() {
  return (
    <UserProvider>
      <ToastContainer />
      <Router>
        <div className="App">
          <Routes>
            <Route index element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/profile" element={<Profile/>} />
          </Routes>
        </div>
      </Router>
      

    </UserProvider>
  );
}

export default App;
