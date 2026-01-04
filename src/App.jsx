import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MemoryGame from './pages/MemoryGame'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/memory-game" element={<MemoryGame />} />
      </Routes>
    </Router>
  )
}

export default App
