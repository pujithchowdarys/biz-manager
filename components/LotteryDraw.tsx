import React, { useState, useEffect } from 'react';
import { ChitMember } from '../types';

interface LotteryDrawProps {
  participants: ChitMember[];
  onWinnerSelected: (winner: ChitMember) => void;
}

const LotteryDraw: React.FC<LotteryDrawProps> = ({ participants, onWinnerSelected }) => {
  const [displayedName, setDisplayedName] = useState<string>('...');
  const [isDrawing, setIsDrawing] = useState(true);
  const [winner, setWinner] = useState<ChitMember | null>(null);

  useEffect(() => {
    setIsDrawing(true);
    let fastIntervalId: number;
    let slowIntervalId: number;
    let slowDownTimeoutId: number;
    let stopTimeoutId: number;

    if (participants.length > 0) {
      // Fast shuffle
      fastIntervalId = window.setInterval(() => {
        const randomIndex = Math.floor(Math.random() * participants.length);
        setDisplayedName(participants[randomIndex].name);
      }, 75);

      // Slow down
      slowDownTimeoutId = window.setTimeout(() => {
          clearInterval(fastIntervalId);
          slowIntervalId = window.setInterval(() => {
            const randomIndex = Math.floor(Math.random() * participants.length);
            setDisplayedName(participants[randomIndex].name);
        }, 300);
      }, 3000)

      // Stop and select winner
      stopTimeoutId = window.setTimeout(() => {
        clearInterval(slowIntervalId);
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const finalWinner = participants[winnerIndex];
        setWinner(finalWinner);
        setDisplayedName(finalWinner.name);
        setIsDrawing(false);
        onWinnerSelected(finalWinner);
      }, 5000);
    }

    return () => {
      clearInterval(fastIntervalId);
      clearInterval(slowIntervalId);
      clearTimeout(slowDownTimeoutId);
      clearTimeout(stopTimeoutId);
    };
  }, [participants, onWinnerSelected]);

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div 
        className={`text-4xl font-bold p-6 border-4 rounded-lg transition-all duration-300 w-full text-center truncate ${isDrawing ? 'border-gray-300 text-gray-500' : 'border-green-500 text-green-500 scale-110'}`}
      >
        {displayedName}
      </div>
      {winner && (
        <p className="mt-4 text-lg font-semibold text-green-600 animate-pulse">
          We have a winner!
        </p>
      )}
    </div>
  );
};

export default LotteryDraw;
