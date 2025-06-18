import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Master from './components/Master';
import Guest from './components/Guest';
import CreateGuest from './components/CreateGuest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/master" element={<Master />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/create-guest" element={<CreateGuest />} />
      </Routes>
    </Router>
  );
}

export default App; 