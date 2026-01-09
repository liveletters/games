import { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { playMatchSound, playVictorySound } from '../utils/sounds'
import './MemoryGame.css'

const TOTAL_PAIRS = 22 // Hebrew alphabet has 22 letters

function MemoryGame() {
  const [difficulty, setDifficulty] = useState(6) // Number of pairs
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize/reset game
  const initGame = (numPairs) => {
    setGameComplete(false)
    setShowModal(false)
    setFlipped([])
    setMatched([])
    setMoves(0)

    // Select random pairs based on difficulty
    const selectedPairs = []
    const availableNumbers = Array.from({ length: TOTAL_PAIRS }, (_, i) => i + 1)

    for (let i = 0; i < numPairs; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length)
      selectedPairs.push(availableNumbers[randomIndex])
      availableNumbers.splice(randomIndex, 1)
    }

    // Create card pairs
    const gameCards = []
    selectedPairs.forEach(num => {
      const paddedNum = String(num).padStart(2, '0')
      gameCards.push({
        id: `letter-${num}`,
        type: 'letter',
        image: `/images/letters/letter_${paddedNum}.png`,
        pairId: num
      })
      gameCards.push({
        id: `animal-${num}`,
        type: 'animal',
        image: `/images/animals/animal_${paddedNum}.png`,
        pairId: num
      })
    })

    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }

  // Auto-start game on mount and when difficulty changes
  useEffect(() => {
    initGame(difficulty)
  }, [difficulty])

  // Handle card click
  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) {
      return
    }

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      const [first, second] = newFlipped

      if (cards[first].pairId === cards[second].pairId) {
        // Match found
        playMatchSound()
        setMatched([...matched, cards[first].id, cards[second].id])
        setFlipped([])
      } else {
        // No match
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  // Check if game is complete
  useEffect(() => {
    if (matched.length === difficulty * 2 && matched.length > 0) {
      setGameComplete(true)
      playVictorySound()
      setTimeout(() => setShowModal(true), 1000)
    }
  }, [matched, difficulty])

  return (
    <div className="memory-game" dir="rtl">
      {gameComplete && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="game-container">
        <div className="game-content">
          <div className="cards-container">
            <div className="cards-column">
              <h3 className="column-title">אותיות</h3>
              <div className="cards-grid">
                {cards.filter(card => card.type === 'letter').map((card, originalIndex) => {
                  const index = cards.indexOf(card)
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className={`card ${flipped.includes(index) || matched.includes(card.id) ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="card-inner">
                        <div className={`card-front ${card.type}`}>
                        </div>
                        <div className={`card-back ${card.type}`}>
                          <img src={card.image} alt={card.type} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="cards-column">
              <h3 className="column-title">בעלי חיים</h3>
              <div className="cards-grid">
                {cards.filter(card => card.type === 'animal').map((card, originalIndex) => {
                  const index = cards.indexOf(card)
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className={`card ${flipped.includes(index) || matched.includes(card.id) ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="card-inner">
                        <div className={`card-front ${card.type}`}>
                        </div>
                        <div className={`card-back ${card.type}`}>
                          <img src={card.image} alt={card.type} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <button
          className="start-button"
          onClick={() => initGame(difficulty)}
        >
          התחל משחק חדש
        </button>

        {/* Difficulty slider - always at bottom, full width */}
        <div className="difficulty-selector">
          <label htmlFor="difficulty">רמת קושי</label>
          <input
            type="range"
            id="difficulty"
            min="3"
            max={TOTAL_PAIRS}
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
          />
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>כל הכבוד! סיימת ב-{moves} מהלכים!</h2>
            <p className="shop-message">
              אפשר לקנות את הקלפים שלנו באתר{' '}
              <a href="https://liveletters.co.il/shop/" target="_blank" rel="noopener noreferrer">
                כאן
              </a>
            </p>
            <button onClick={() => setShowModal(false)}>לשחק שוב</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemoryGame
