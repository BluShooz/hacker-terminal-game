import React, { useState, useCallback, useRef } from 'react';
import { TIERS, INITIAL_TIME, DESCRAMBLE_COST } from './constants';
import { GameState, type TierLevel } from './types';
import { audioService } from './services/audioService';
import { StatDisplay } from './components/StatDisplay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.BOOTING);
  const [score, setScore] = useState(0);
  const [tier, setTier] = useState<TierLevel>(3);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [message, setMessage] = useState("SYSTEM READY. INITIALIZE CONNECTION.");
  const [bossActive, setBossActive] = useState(false);
  const [bossIndex, setBossIndex] = useState(0);
  const [isFlickering, setIsFlickering] = useState(false);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossWordsRef = useRef<string[]>([]);

  const scramble = (word: string) => {
    let scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
    // Ensure it's actually scrambled if the word is long enough
    while (scrambled === word && word.length > 3) {
      scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
    }
    return scrambled;
  };

  const handleTimeout = () => {
    audioService.playAlarm();
    setScrambledWord(currentWord);

    if (tier === 6) {
      setMessage("🚨 TRACE COMPLETE — IDENTITY COMPROMISED");
      setTimeout(() => window.location.reload(), 3000);
    } else {
      setMessage(`🚨 TIMEOUT. WORD REVEALED: ${currentWord}`);
      setTimeout(() => {
        loadWord(tier);
      }, 2000);
    }
  };

  const startTimer = useCallback((customTime?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(customTime ?? INITIAL_TIME);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [tier, bossActive]);

  const loadWord = useCallback((targetTier: TierLevel) => {
    const allWords = TIERS[targetTier];
    // Filter out words already used in this session
    const availableWords = allWords.filter(w => !usedWords.has(w));

    // Fallback: If somehow all words are used (unlikely with expanded list), reset pool for this tier
    const pool = availableWords.length > 0 ? availableWords : allWords;

    const word = pool[Math.floor(Math.random() * pool.length)];

    // Mark as used
    setUsedWords(prev => {
      const next = new Set(prev);
      next.add(word);
      return next;
    });

    setCurrentWord(word);
    setScrambledWord(scramble(word));
    setUserInput("");
    setMessage(`BREACHING TIER ${targetTier} FIREWALL...`);
    startTimer();
  }, [startTimer, usedWords]);

  const loadBossWord = useCallback((index: number) => {
    const word = bossWordsRef.current[index];
    if (!word) return;

    setCurrentWord(word);
    setScrambledWord(scramble(word));
    setUserInput("");

    if (flickerRef.current) clearInterval(flickerRef.current);
    const speed = 150 - (index * 40);
    flickerRef.current = setInterval(() => {
      setIsFlickering(true);
      setScrambledWord(Math.random() > 0.6 ? scramble(word) : word);
      setTimeout(() => setIsFlickering(false), 50);
    }, speed);

    startTimer(INITIAL_TIME);
  }, [startTimer]);

  const startBossMode = useCallback(() => {
    setBossActive(true);
    setBossIndex(0);
    const selectedWords: string[] = [];
    const poolTier6 = TIERS[6].filter(w => !usedWords.has(w));
    const fallbackPool = TIERS[6];

    const sourcePool = poolTier6.length >= 3 ? poolTier6 : fallbackPool;
    const shuffled = [...sourcePool].sort(() => 0.5 - Math.random());

    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      selectedWords.push(shuffled[i]);
    }

    bossWordsRef.current = selectedWords;
    setGameState(GameState.BOSS_INTRO);
    setMessage("🧨 SUDDEN DEATH DETECTED. BOSS ENCRYPTION ENGAGED.");

    // Add boss words to used list
    setUsedWords(prev => {
      const next = new Set(prev);
      selectedWords.forEach(w => next.add(w));
      return next;
    });

    setTimeout(() => {
      setGameState(GameState.PLAYING);
      loadBossWord(0);
    }, 3000);
  }, [usedWords, loadBossWord]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);

    if (val === currentWord) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flickerRef.current) clearInterval(flickerRef.current);
      audioService.playBeep(1200, 0.05);

      if (bossActive) {
        const nextIndex = bossIndex + 1;
        setScore((s) => s + 50);
        if (nextIndex >= bossWordsRef.current.length) {
          setMessage("💥 BOSS FIREWALL BREACHED. DATA SECURED.");
          setScore((s) => s + 100);
          setBossActive(false);
          setGameState(GameState.SUCCESS);
        } else {
          setBossIndex(nextIndex);
          loadBossWord(nextIndex);
        }
      } else {
        const points = tier * 10;
        const newScore = score + points;

        setScore(newScore);
        setMessage("✅ ACCESS GRANTED. NEXT SECTOR LOADING...");

        setTimeout(() => {
          // Check for tier progression
          let nextTier = tier;
          if (newScore >= tier * 100 && tier < 6) {
            nextTier = (tier + 1) as TierLevel;
            setTier(nextTier);
          }

          if (nextTier === 6 && !bossActive) {
            startBossMode();
          } else {
            loadWord(nextTier);
          }
        }, 1000);
      }
    }
  };

  const handleBoot = () => {
    audioService.init();
    setGameState(GameState.PLAYING);
    loadWord(3);
  };

  const handleDescramble = () => {
    if (score >= DESCRAMBLE_COST) {
      setScore(s => s - DESCRAMBLE_COST);
      setScrambledWord(currentWord);
      setMessage("⚠️ TRACE LEAKED: WORD REVEALED (-25)");
      audioService.playBeep(400, 0.2);
    } else {
      setMessage("❌ INSUFFICIENT DATA POINTS");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden flex flex-wrap content-start">
        {Array.from({ length: 400 }).map((_, i) => (
          <div key={i} className="w-8 h-8 border border-green-500/20 text-[8px] flex items-center justify-center">
            {Math.floor(Math.random() * 2)}
          </div>
        ))}
      </div>

      <div className="max-w-3xl w-full z-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-glow mb-2 flex items-center justify-center gap-4">
            <span className="text-2xl text-green-800">[CMD]</span>
            HACKER_TERMINAL
            <span className="text-2xl text-green-800">_v.2.0</span>
          </h1>
          <div className="h-1 bg-green-900 w-full relative">
            <div className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, (score / 600) * 100)}%` }}></div>
          </div>
        </header>

        {gameState === GameState.BOOTING && (
          <div className="text-center p-12 border border-green-500 bg-black/80 glitch-border">
            <p className="mb-8 text-xl animate-pulse">ESTABLISHING ENCRYPTED TUNNEL...</p>
            <button
              onClick={handleBoot}
              className="px-10 py-4 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-all text-xl font-bold uppercase tracking-widest"
            >
              Initialize Breach
            </button>
          </div>
        )}

        {(gameState === GameState.PLAYING || gameState === GameState.BOSS_INTRO || gameState === GameState.SUCCESS) && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <StatDisplay label="Sector Tier" value={tier} />
              <StatDisplay label="Score" value={score} glowColor="text-yellow-400" />
              <StatDisplay label="Breach Timer" value={tier === 6 ? "??" : timeLeft} glowColor={timeLeft < 10 ? "text-red-500" : "text-green-400"} />
            </div>

            <div className="p-8 md:p-12 border border-green-500 bg-black/80 glitch-border text-center relative overflow-hidden min-h-[400px] flex flex-col justify-between">
              {gameState === GameState.BOSS_INTRO ? (
                <div className="flex-1 flex items-center justify-center">
                  <h2 className="text-5xl md:text-7xl font-black text-red-500 animate-bounce tracking-tighter">
                    BOSS HACK INITIATED
                  </h2>
                </div>
              ) : gameState === GameState.SUCCESS ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-5xl md:text-7xl font-black text-yellow-400 animate-pulse tracking-tighter">
                    FIREWALL BREACHED
                  </h2>
                  <p className="text-2xl uppercase">Mainframe Accessed. All data secured.</p>
                  <button onClick={() => window.location.reload()} className="px-6 py-2 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">REBOOT SYSTEM</button>
                </div>
              ) : (
                <>
                  <div className={`mb-12 transition-all ${isFlickering ? 'flicker blur-sm' : ''}`}>
                    <p className="text-sm text-green-700 mb-2 uppercase tracking-[0.5em]">Scrambled Packet</p>
                    <div className="text-4xl md:text-6xl font-mono font-bold tracking-[0.2em] break-all leading-tight">
                      {scrambledWord}
                    </div>
                  </div>

                  <div className="space-y-6 max-w-md mx-auto w-full">
                    <input
                      type="text"
                      value={userInput}
                      onChange={handleInputChange}
                      placeholder="Enter Deciphered Key..."
                      className="w-full bg-black border-b-2 border-green-900 focus:border-green-500 outline-none p-4 text-3xl text-center font-mono tracking-widest transition-all"
                      autoFocus
                    />

                    <button
                      onClick={handleDescramble}
                      className="w-full py-2 border border-green-900 text-green-900 hover:border-green-500 hover:text-green-500 text-sm font-mono tracking-widest transition-all"
                    >
                      🔓 TRACE DECRYPTION (-{DESCRAMBLE_COST} PTS)
                    </button>
                  </div>

                  <div className="mt-8 pt-4 border-t border-green-900/50">
                    <p className={`text-sm md:text-base font-bold transition-all duration-300 ${message.includes('🚨') || message.includes('🧨') ? 'text-red-500' : 'text-green-500'}`}>
                      {message}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between text-[10px] text-green-900 font-mono">
              <span>ENCRYPTION_LAYER: AES-256_MODIFIED</span>
              <span>STATUS: {tier === 6 ? 'STRESS_DETECTION_ACTIVE' : 'STABLE'}</span>
              <span>UPLINK_SPEED: 1.2GBPS</span>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-10 text-[10px] text-green-950 font-mono w-full px-10 flex justify-between uppercase tracking-widest">
        <span>&copy; 2024 Terminal_Zero. Unique Challenge Mode Enabled.</span>
        <span>Secure Connection Active</span>
      </footer>
    </div>
  );
};

export default App;
