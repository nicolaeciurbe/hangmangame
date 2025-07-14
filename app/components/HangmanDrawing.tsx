interface HangmanDrawingProps {
  wrongGuesses: number;
  maxAttempts: number;
}

export default function HangmanDrawing({ wrongGuesses, maxAttempts }: HangmanDrawingProps) {
  return (
    <div className="flex justify-center items-center w-full h-64">
      <svg
        width="200"
        height="240"
        viewBox="0 0 200 240"
        className="border border-gray-300 rounded-lg bg-white"
      >
        {/* Base */}
        <line x1="20" y1="220" x2="180" y2="220" stroke="black" strokeWidth="3" />
        
        {/* Vertical pole */}
        <line x1="60" y1="220" x2="60" y2="20" stroke="black" strokeWidth="3" />
        
        {/* Top horizontal */}
        <line x1="60" y1="20" x2="140" y2="20" stroke="black" strokeWidth="3" />
        
        {/* Rope */}
        <line x1="140" y1="20" x2="140" y2="40" stroke="black" strokeWidth="2" />
        
        {/* Head - appears after 1 wrong guess */}
        {wrongGuesses >= 1 && (
          <circle cx="140" cy="50" r="10" stroke="black" strokeWidth="2" fill="none" />
        )}
        
        {/* Body - appears after 2 wrong guesses */}
        {wrongGuesses >= 2 && (
          <line x1="140" y1="60" x2="140" y2="100" stroke="black" strokeWidth="2" />
        )}
        
        {/* Left arm - appears after 3 wrong guesses */}
        {wrongGuesses >= 3 && (
          <line x1="140" y1="70" x2="120" y2="85" stroke="black" strokeWidth="2" />
        )}
        
        {/* Right arm - appears after 4 wrong guesses */}
        {wrongGuesses >= 4 && (
          <line x1="140" y1="70" x2="160" y2="85" stroke="black" strokeWidth="2" />
        )}
        
        {/* Left leg - appears after 5 wrong guesses */}
        {wrongGuesses >= 5 && (
          <line x1="140" y1="100" x2="120" y2="130" stroke="black" strokeWidth="2" />
        )}
        
        {/* Right leg - appears after 6 wrong guesses */}
        {wrongGuesses >= 6 && (
          <line x1="140" y1="100" x2="160" y2="130" stroke="black" strokeWidth="2" />
        )}
        
        {/* Face details - appear when head is visible */}
        {wrongGuesses >= 1 && (
          <>
            {/* Eyes */}
            <circle cx="137" cy="47" r="1" fill="black" />
            <circle cx="143" cy="47" r="1" fill="black" />
            {/* Sad mouth */}
            <path d="M 135 55 Q 140 58 145 55" stroke="black" strokeWidth="1" fill="none" />
          </>
        )}
      </svg>
    </div>
  );
} 