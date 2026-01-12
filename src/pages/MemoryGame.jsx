import { useState, useEffect, useRef } from 'react'
import Confetti from 'react-confetti'
import { playMatchSound, playVictorySound } from '../utils/sounds'
import './MemoryGame.css'

const TOTAL_PAIRS = 22 // Hebrew alphabet has 22 letters

function MemoryGame() {
  const [difficulty, setDifficulty] = useState(6) // Number of pairs
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [justMatched, setJustMatched] = useState([]) // Cards that just matched (show glow before fade)
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  const [musicMode, setMusicMode] = useState(1) // 0 = off, 1 = music1, 2 = music2
  const [cardSize, setCardSize] = useState(null) // Dynamic card size (calculated on mount)
  const [hasInteracted, setHasInteracted] = useState(false) // Track first user interaction
  const audioRef = useRef(null)

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      // Use visualViewport for more accurate mobile dimensions
      const vv = window.visualViewport
      setWindowSize({
        width: vv ? vv.width : window.innerWidth,
        height: vv ? vv.height : window.innerHeight
      })
    }

    handleResize() // Set initial size

    // Listen to both resize and visualViewport resize for mobile
    window.addEventListener('resize', handleResize)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // Set initial audio source on mount
  useEffect(() => {
    if (audioRef.current && musicMode !== 0) {
      const musicFile = musicMode === 1 ? '/music/game_audio_1.mp3' : '/music/game_audio_2.mp3'
      audioRef.current.src = musicFile
      audioRef.current.load()
    }
  }, [])

  // Calculate dynamic card size based on screen and difficulty
  useEffect(() => {
    const calculateCardSize = () => {
      const { width, height } = windowSize

      // Account for fixed header (80px) and control bar space
      const headerHeight = 80
      const cardAreaPadding = 30

      // Check if landscape or portrait based on aspect ratio
      const isLandscape = width >= height

      // Mobile safety buffer (for browser chrome that might not be accounted for)
      const isMobile = width < 768
      const mobileSafetyBuffer = isMobile ? (isLandscape ? 60 : 40) : 0

      // In landscape: controls on right side (100px)
      // In portrait: controls at bottom (90px)
      const controlsWidth = isLandscape ? 100 : 0
      const controlsHeight = isLandscape ? 0 : 90

      const availableHeight = height - headerHeight - cardAreaPadding - controlsHeight - mobileSafetyBuffer
      const availableWidth = width - 60 - controlsWidth // Side padding + controls

      // Each column gets half the width (minus column gap)
      const columnGap = 15
      const columnWidth = (availableWidth - columnGap) / 2

      // Card gap
      const gap = 15

      // Calculate optimal size by trying different card sizes
      let optimalSize = 60 // Start with minimum

      // Try different sizes from 150 down to 60
      for (let size = 150; size >= 60; size -= 2) {
        // How many cards fit per row in each column?
        const cardsPerRow = Math.floor((columnWidth + gap) / (size + gap))
        if (cardsPerRow < 1) continue

        // How many rows needed for 'difficulty' cards?
        const rowsNeeded = Math.ceil(difficulty / cardsPerRow)

        // Total height needed
        const totalHeight = rowsNeeded * size + (rowsNeeded - 1) * gap

        // If it fits, use this size
        if (totalHeight <= availableHeight && cardsPerRow >= 1) {
          optimalSize = size
          break
        }
      }

      // Ensure size is valid
      optimalSize = Math.max(60, Math.min(150, optimalSize))

      // Immediately update without batching
      setCardSize(optimalSize)
    }

    calculateCardSize()
  }, [windowSize, difficulty])

  // Toggle music mode: 0 -> 1 -> 2 -> 0
  const toggleMusic = () => {
    const nextMode = (musicMode + 1) % 3
    setMusicMode(nextMode)
    setHasInteracted(true) // Mark as interacted

    if (!audioRef.current) return

    if (nextMode === 0) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    } else {
      const musicFile = nextMode === 1 ? '/music/game_audio_1.mp3' : '/music/game_audio_2.mp3'
      audioRef.current.src = musicFile
      audioRef.current.load()
      audioRef.current.play().catch(err => console.log('Audio play failed:', err))
    }
  }

  // Initialize/reset game
  const initGame = (numPairs) => {
    setGameComplete(false)
    setShowModal(false)
    setFlipped([])
    setMatched([])
    setJustMatched([])
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
    // Start music on first card click
    if (!hasInteracted && audioRef.current && musicMode !== 0) {
      setHasInteracted(true)
      audioRef.current.play().catch(() => {}) // Silently fail if blocked
    }

    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) {
      return
    }

    // Prevent matching same card types (letter with letter, or animal with animal)
    if (flipped.length === 1) {
      const firstCard = cards[flipped[0]]
      const secondCard = cards[index]
      if (firstCard.type === secondCard.type) {
        return // Can only match letter with animal, not same types
      }
    }

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      const [first, second] = newFlipped

      if (cards[first].pairId === cards[second].pairId) {
        // Match found
        playMatchSound()
        const newMatches = [cards[first].id, cards[second].id]
        setJustMatched([...justMatched, ...newMatches])
        setFlipped([])

        // After 2 seconds, move from justMatched to matched (fade out)
        setTimeout(() => {
          setJustMatched(prev => prev.filter(id => !newMatches.includes(id)))
          setMatched(prev => [...prev, ...newMatches])
        }, 2000)
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
    <div className="memory-game" dir="rtl" style={{ '--card-size': cardSize ? `${cardSize}px` : '100px' }}>
      {/* Background Music Audio Element */}
      <audio ref={audioRef} loop />


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
              <div className="cards-grid">
                {cards.filter(card => card.type === 'letter').map((card, originalIndex) => {
                  const index = cards.indexOf(card)
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className={`card ${flipped.includes(index) || matched.includes(card.id) || justMatched.includes(card.id) ? 'flipped' : ''} ${justMatched.includes(card.id) ? 'just-matched' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
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
              <div className="cards-grid">
                {cards.filter(card => card.type === 'animal').map((card, originalIndex) => {
                  const index = cards.indexOf(card)
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className={`card ${flipped.includes(index) || matched.includes(card.id) || justMatched.includes(card.id) ? 'flipped' : ''} ${justMatched.includes(card.id) ? 'just-matched' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
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

        {/* Game Controls Bar */}
        <div className="game-controls">
          {/* New Game Button */}
          <button className="control-btn" onClick={() => initGame(difficulty)} aria-label="New game">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>

          {/* Difficulty Slider */}
          <div className="difficulty-control">
            <span className="difficulty-icon easy">😊</span>
            <input
              type="range"
              id="difficulty"
              min="3"
              max={TOTAL_PAIRS}
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              aria-label="Difficulty level"
            />
            <span className="difficulty-icon hard">🔥</span>
          </div>

          {/* Music Toggle Button */}
          <button className="control-btn" onClick={toggleMusic} aria-label="Toggle music">
            {musicMode === 0 && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M4.93 4.93l14.14 14.14" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
            {musicMode === 1 && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            )}
            {musicMode === 2 && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="7" cy="17" r="3"/>
                <rect x="9.5" y="6" width="1.5" height="11"/>
                <path d="M11 6 Q13 6 13 9 L11 8 Z"/>
                <circle cx="17" cy="17" r="3"/>
                <rect x="19.5" y="6" width="1.5" height="11"/>
                <path d="M21 6 Q23 6 23 9 L21 8 Z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Decorative stars */}
            <div className="star star-1">★</div>
            <div className="star star-2">★</div>
            <div className="star star-3">★</div>
            <div className="star star-4">★</div>
            <div className="star star-5">★</div>
            <div className="star star-6">★</div>

            {/* Achievement badge */}
            <div className="achievement-badge">
              <div className="badge-ribbon"></div>
              <div className="badge-circle">
                <div className="badge-icon">🏆</div>
              </div>
            </div>

            {/* Content */}
            <h2 className="victory-title">כל הכבוד!</h2>
            <div className="moves-display">
              <span className="moves-label">סיימת ב-</span>
              <span className="moves-number">{moves}</span>
              <span className="moves-label">מהלכים</span>
            </div>

            <div className="modal-divider"></div>

            <p className="shop-message">
              אפשר לקנות את הקלפים שלנו{' '}
              <a href="https://liveletters.co.il/shop/" target="_blank" rel="noopener noreferrer">
                באתר שלנו
              </a>
            </p>

            <button className="play-again-btn" onClick={() => {
              setShowModal(false)
              initGame(difficulty)
            }}>
              לשחק שוב
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemoryGame
