/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const BOOK_IMAGE_URL = 'https://github.com/vellymad/-/blob/018feba49050b0d55ec03a933faed080a75d4902/project_20250922_1112049-01.png?raw=true';
const OPEN_BOOK_IMAGE_URL = 'https://github.com/vellymad/-/blob/89e756fefed8736ce0a15205f96b766ed905ffcc/project_20251003_1904398-01.png?raw=true';
const TITLE_IMAGE_URL = 'https://github.com/vellymad/-/blob/018feba49050b0d55ec03a933faed080a75d4902/project_20250922_1210462-01.png?raw=true';
const LOCK_IMAGE_URL = 'https://github.com/vellymad/-/blob/cb15f94384a0170db7e34667456063d76952bc18/%D0%97%D0%B0%D0%BC%D0%BE%D0%BA.png?raw=true';
const CLICK_SOUND_URL = 'Click.wav';
const ORNATE_BACK_ICON_URL = 'https://cdn.jsdelivr.net/gh/vellymad/-@718a6af3fa910f893c0ba1d934996188ea678511/%D0%9D%D0%B0%D0%B7%D0%B0%D0%B4.png';
const ORNATE_RESTART_ICON_URL = 'https://cdn.jsdelivr.net/gh/vellymad/-@718a6af3fa910f893c0ba1d934996188ea678511/%D0%A0%D0%B5%D0%BF%D0%BB%D0%B5%D0%B9.png';
const CHAPTER_1_BG_URL = 'https://github.com/vellymad/-/blob/b069788ad6095507ea386d9274a994876a444dfa/02.10.2025%2022.13.02%20386%2016.jpg?raw=true';
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const GAME_STATE_KEY = 'somnumGameState';

interface GameState {
  currentChapter: number;
  unlockedChapters: number;
}

const defaultGameState: GameState = {
  currentChapter: 1,
  unlockedChapters: 1,
};

const loadGameState = (): GameState => {
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.currentChapter && parsedState.unlockedChapters) {
        return parsedState;
      }
    }
  } catch (error) {
    console.error("Failed to load game state:", error);
  }
  return defaultGameState;
};

const saveGameState = (state: GameState) => {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
};

function App() {
  const [view, setView] = useState('menu'); // 'menu', 'chapters', 'game'
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [activeChapter, setActiveChapter] = useState<number>(gameState.currentChapter);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);


  useEffect(() => {
    let isCancelled = false;
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);

    const gain = context.createGain();
    gain.gain.value = 0.3;
    gain.connect(context.destination);
    setGainNode(gain);

    const loadSound = async () => {
      try {
        const response = await fetch(CLICK_SOUND_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (isCancelled) return;
        const decodedData = await context.decodeAudioData(arrayBuffer);
        if (isCancelled) return;
        setAudioBuffer(decodedData);
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading or decoding audio file:', error);
        }
      }
    };
    loadSound();
    return () => {
      isCancelled = true;
      if (context.state !== 'closed') {
        context.close().catch(e => console.error("Failed to close AudioContext", e));
      }
    };
  }, []);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const playClickSound = () => {
    if (!audioContext || !audioBuffer || !gainNode) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    try {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNode);
      source.start(0);
    } catch(e) {
      console.error("Error playing sound", e);
    }
  };

  const handleNavigation = (targetView: string) => {
    playClickSound();
    setView(targetView);
  };

  const handleSilentNavigation = (targetView: string) => {
    setView(targetView);
  };
  
  const navigateToGame = (chapter: number) => {
    playClickSound();
    setActiveChapter(chapter);
    setGameState(prev => ({ ...prev, currentChapter: chapter }));
    setView('game');
  };

  const MainMenu = () => (
    <nav className="buttons-container" aria-label="Главное меню">
      <button className="menu-button" aria-label="Начать игру" onClick={() => navigateToGame(gameState.currentChapter)}>Начать</button>
      <button className="menu-button" aria-label="Открыть главы" onClick={() => handleNavigation('chapters')}>Загрузить</button>
    </nav>
  );

  const ChapterSelect = () => {
    const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null);
    const tooltipTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
      return () => {
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }, []);

    const showTooltip = (index: number) => {
      playClickSound();
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      setVisibleTooltip(index);
      tooltipTimeoutRef.current = window.setTimeout(() => {
        setVisibleTooltip(null);
      }, 3000);
    };
    
    return (
      <div className="chapter-select-container">
        <div className="chapter-list">
          {ROMAN_NUMERALS.map((numeral, index) => {
            const chapterNumber = index + 1;
            const isLocked = chapterNumber > gameState.unlockedChapters;
            return (
              <button
                key={chapterNumber}
                className={`chapter-item ${isLocked ? 'locked' : ''}`}
                onClick={() => isLocked ? showTooltip(index) : navigateToGame(chapterNumber)}
                aria-label={`Глава ${numeral}${isLocked ? ', заблокировано' : ''}`}
              >
                <span>Глава {numeral}</span>
                {isLocked && <img src={LOCK_IMAGE_URL} className="lock-icon" alt="Заблокировано" />}
                {isLocked && visibleTooltip === index && (
                  <div className="tooltip">
                    Чтобы разблокировать эту главу, сначала прочтите предыдущую
                  </div>
                )}
              </button>
            );
          })}
        </div>
         <button className="menu-button back-button" onClick={() => handleNavigation('menu')}>Назад</button>
      </div>
    );
  };
  
  const DialogueBox = () => {
    const character = "Никкаль";
    const dialogue = "Ниалл...";
    const choices = [
      "Мне однажды снились эти облака.",
      "Как мы не упали?",
    ];
  
    const handleChoice = (choice: string) => {
      console.log(`Player chose: ${choice}`);
      playClickSound();
    };
  
    return (
      <div className="dialogue-container" aria-live="polite" role="dialog" aria-labelledby="character-name" aria-describedby="dialogue-text">
        <div className="character-nameplate-wrapper">
          <div className="character-nameplate" id="character-name">
            <span>{character}</span>
          </div>
        </div>
        <div className="dialogue-box">
          <p className="dialogue-text" id="dialogue-text">{dialogue}</p>
        </div>
        <div className="dialogue-choices" role="group" aria-label="Варианты ответа">
          {choices.map((choice, index) => (
            <button key={index} className="dialogue-choice-button" onClick={() => handleChoice(choice)}>
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const GameView = ({ chapter, onExit }: { chapter: number; onExit: () => void; }) => {
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);
    const [isFadingIn, setIsFadingIn] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsFadingIn(false), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleRestart = () => {
      console.log(`Restarting chapter ${chapter}`);
      setShowRestartConfirm(false);
      setIsPanelVisible(false);
    };

    const getBackgroundImage = () => {
      switch(chapter) {
        case 1:
          return `url(${CHAPTER_1_BG_URL})`;
        default:
          return 'none';
      }
    };

    const togglePanel = () => setIsPanelVisible(prev => !prev);

    return (
     <div 
        className="game-view-container" 
        aria-label={`Игровой экран, глава ${chapter}`}
        role="application"
      >
        <div 
          className="game-panel-trigger"
          onClick={togglePanel}
          aria-label="Показать или скрыть панель управления"
          role="button"
        ></div>

        <div className={`fade-in-overlay ${!isFadingIn ? 'hidden' : ''}`} aria-hidden="true"></div>
        <div className="game-background" style={{ backgroundImage: getBackgroundImage() }} aria-hidden="true"></div>
        
        <div className={`game-top-panel ${isPanelVisible ? 'visible' : ''}`} onClick={togglePanel}>
            <button className="panel-button" aria-label="Выход в главное меню" onClick={(e) => { e.stopPropagation(); onExit(); }}>
                <img src={ORNATE_BACK_ICON_URL} alt="Назад"/>
            </button>
            <button className="panel-button" aria-label="Начать главу сначала" onClick={(e) => { e.stopPropagation(); setShowRestartConfirm(true); }}>
                <img src={ORNATE_RESTART_ICON_URL} alt="Перезапуск"/>
            </button>
        </div>

        <DialogueBox />

        {showRestartConfirm && (
            <div className="confirmation-dialog-overlay" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
                <div className="confirmation-dialog">
                    <p id="confirm-dialog-title">Вы готовы начать главу сначала?</p>
                    <div className="confirmation-dialog-buttons">
                        <button onClick={handleRestart}>Да</button>
                        <button onClick={() => setShowRestartConfirm(false)}>Нет</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };


  return (
    <main className="main-container" role="main">
      {view === 'game' ? (
        <GameView chapter={activeChapter} onExit={() => handleSilentNavigation('menu')} />
      ) : (
        <div className={`book-wrapper ${view === 'chapters' ? 'open' : ''}`}>
          <img 
            src={view === 'chapters' ? OPEN_BOOK_IMAGE_URL : BOOK_IMAGE_URL} 
            alt={view === 'chapters' ? "Открытая книга" : "Старинная книга на столе"} 
            className="book-image" 
          />
          {view === 'menu' && <img src={TITLE_IMAGE_URL} alt="Сладкий Сомнум" className="game-title" />}
          {view === 'menu' && <MainMenu />}
          {view === 'chapters' && <ChapterSelect />}
        </div>
      )}
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);