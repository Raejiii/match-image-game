"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Pause, Play, RefreshCw, HelpCircle } from 'lucide-react'
import gameConfig from '../config/game-config.json'

export function SpaceMemoryGame() {
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [overlay, setOverlay] = useState('start')
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    resetGame()
    return () => {
      if (window.resetTimer) {
        clearTimeout(window.resetTimer)
      }
    }
  }, [])

  const resetGame = () => {
    if (window.resetTimer) {
      clearTimeout(window.resetTimer)
    }

    const totalPairs = 8
    const selectedCards = gameConfig.cards.slice(0, totalPairs)
    const shuffledCards = [...selectedCards, ...selectedCards]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        itemId: item.id,
        src: item.src,
        alt: item.alt,
        isFlipped: true,
        isMatched: false,
      }))
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setIsPaused(false)
    setOverlay('start')
    setGameStarted(false)

    window.resetTimer = setTimeout(() => {
      setOverlay(null)
      setTimeout(() => {
        setCards(cards => cards.map(card => ({ ...card, isFlipped: false })))
        setGameStarted(true)
      }, 500)
    }, 5000)
  }

  const handleCardClick = (id) => {
    if (!gameStarted || isPaused || flippedCards.length === 2) return
    if (cards[id].isMatched) return

    setCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    )

    setFlippedCards(prev => [...prev, id])

    if (flippedCards.length === 1) {
      const [firstCardId] = flippedCards
      if (cards[firstCardId].itemId === cards[id].itemId) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === firstCardId || card.id === id
              ? { ...card, isMatched: true }
              : card
          )
        )
        setFlippedCards([])
        setMatchedPairs(prev => prev + 1)
        if (matchedPairs + 1 === 8) {
          setOverlay('win')
          setGameStarted(false)
        }
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === id
                ? { ...card, isFlipped: false }
                : card
            )
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const togglePause = () => {
    if (!gameStarted) return
    setIsPaused(!isPaused)
    setOverlay(isPaused ? null : 'pause')
  }

  const showHelp = () => {
    setIsPaused(true)
    setOverlay('help')
  }

  return (
    <div className="h-screen w-full bg-[#ffe4d0] text-white p-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        {/* Control buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={togglePause}
            className="w-12 h-12 rounded-full bg-violet-500 hover:bg-violet-600 flex items-center justify-center transition-colors"
            disabled={!gameStarted}
            aria-label={isPaused ? "Resume game" : "Pause game"}
          >
            {isPaused ? (
              <Play className="w-6 h-6 text-white" />
            ) : (
              <Pause className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={resetGame}
            className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center transition-colors"
            aria-label="Reset game"
          >
            <RefreshCw className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={showHelp}
            className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
            aria-label="Show help"
          >
            <HelpCircle className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Game grid */}
        <div className="grid grid-cols-4 gap-2">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl transition-all duration-300 transform ${
                card.isFlipped || card.isMatched
                  ? 'bg-white shadow-lg rotate-0'
                  : 'bg-white shadow-lg hover:shadow-xl rotate-180'
              }`}
              disabled={card.isFlipped || card.isMatched || isPaused || !gameStarted}
              aria-label={`${card.alt} card ${card.isFlipped || card.isMatched ? 'revealed' : 'hidden'}`}
            >
              <div className={`w-full h-full transition-all duration-300 ${card.isFlipped || card.isMatched ? 'rotate-0' : 'rotate-180'}`}>
                {(card.isFlipped || card.isMatched) && (
                  <img
                    src={card.src}
                    alt={card.alt}
                    className="w-11/12 h-11/12 object-contain"
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Overlay */}
        {overlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-black p-4 rounded-xl max-w-xs w-full text-center">
              {overlay === 'start' && (
                <>
                  <h2 className="text-xl font-bold mb-2">Memorize the Cards!</h2>
                  <p className="mb-2">You have 5 seconds to memorize the positions of all cards before they flip over.</p>
                  <p className="text-sm text-gray-600 mb-2">Game will start automatically...</p>
                </>
              )}
              {overlay === 'pause' && (
                <>
                  <h2 className="text-xl font-bold mb-4">Game Paused</h2>
                  <p className="mb-4">Take a break! Click the pause button to resume.</p>
                </>
              )}
              {overlay === 'help' && (
                <>
                  <h2 className="text-xl font-bold mb-4">How to Play</h2>
                  <p className="mb-4">Find matching pairs of space objects by flipping cards two at a time. Remember their positions and match all pairs to win!</p>
                </>
              )}
              {overlay === 'win' && (
                <>
                  <h2 className="text-xl font-bold mb-4">Congratulations!</h2>
                  <p className="mb-4">You've matched all the pairs and won the game!</p>
                </>
              )}
              {overlay !== 'start' && (
                <button
                  onClick={() => {
                    setOverlay(null)
                    if (overlay === 'help') setIsPaused(false)
                    if (overlay === 'win') resetGame()
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {overlay === 'pause' ? 'Resume' : overlay === 'win' ? 'Play Again' : 'Got it!'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}