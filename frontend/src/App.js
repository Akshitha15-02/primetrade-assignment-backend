import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App(){
  return (
    <BrowserRouter>
      <div style={{padding:20}}>
        <h2>Primetrade - Demo Frontend</h2>
        <nav>
          <Link to="/register">Register</Link> | <Link to="/login">Login</Link> | <Link to="/dashboard">Dashboard</Link>
        </nav>
        <Routes>
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="*" element={<div>Welcome. Use links above.</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;