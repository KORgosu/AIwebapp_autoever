import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Master from './components/Master';
import Guest from './components/Guest';
import CreateGuest from './components/CreateGuest';
import BranchManager from './components/BranchManager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/master" element={<Master />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/create-guest" element={<CreateGuest />} />
        <Route path="/branches" element={<BranchManager />} />
      </Routes>
    </Router>
  );
}

export default App; 