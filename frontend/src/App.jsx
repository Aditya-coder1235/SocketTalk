import React from 'react'
import {Routes,Route} from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage/>}></Route>
        <Route path='/chats' element={<ChatPage/>}></Route>
      </Routes>
    </div>
  )
}

export default App
