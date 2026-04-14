import React from 'react'
import {Routes,Route} from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'

const App = () => {
  return (
      <div>
          <Routes>
              <Route path="/" element={<Dashboard />}></Route>
              <Route path="/signup" element={<SignupPage />}></Route>
              <Route path="/login" element={<LoginPage />}></Route>
          </Routes>
      </div>
  );
}

export default App
