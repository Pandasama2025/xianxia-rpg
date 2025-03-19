import React, { useState, useEffect } from 'react';
import './App.css';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import PlayerStatus from './components/PlayerStatus';
import SaveLoadScreen from './components/SaveLoadScreen';
import SoundControls from './components/SoundControls';
import Cultivation from './components/Cultivation';
import BattleScene from './components/BattleScene';
import soundManager from './audio/soundManager';
import storyData from './data/story.json';
import './styles/WaterInkTheme.css';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerStatus, setPlayerStatus] = useState({
    '修为': 0,
    '灵力': 100,
    '体力': 100,
    '道心': 50,
    '因果值': 0,
    '执念值': 0,
    '剑意类型': "无",
    '宗门立场': "无"
  });
  const [showSaveLoadScreen, setShowSaveLoadScreen] = useState(false);
  const [showCultivation, setShowCultivation] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [currentEnemy, setCurrentEnemy] = useState(null);
  
  useEffect(() => {
    setCurrentChapter(storyData.chapters[0]);
    if (storyData.variables) {
      setPlayerStatus(prevStatus => ({
        ...prevStatus,
        ...storyData.variables
      }));
    }
    setIsLoading(false);
    soundManager.init();
    soundManager.playBackgroundMusic('main');
    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);
  
  const getCurrentOptions = () => {
    if (currentChapter.dialogue && currentChapter.dialogue.length > 0) {
      const lastDialogue = currentChapter.dialogue[currentChapter.dialogue.length - 1];
      if (lastDialogue.options) {
        return lastDialogue.options;
      }
    }
    return currentChapter.options || [];
  };
  
  const handleResetGame = () => {
    const initialStatus = {
      '修为': 0,
      '灵力': 100,
      '体力': 100,
      '道心': 50
    };
    
    if (storyData.variables) {
      setPlayerStatus({
        ...initialStatus,
        ...storyData.variables
      });
    } else {
      setPlayerStatus(initialStatus);
    }
    
    setCurrentChapter(storyData.chapters[0]);
    soundManager.playUISound('select');
  };
  
  const handleOptionSelect = (option) => {
    soundManager.playUISound('click');
    
    if (option.battle) {
      setCurrentEnemy(option.battle);
      setShowBattle(true);
      return;
    }
    
    if (option.effects && Object.keys(option.effects).length > 0) {
      const hadCultivationImprovement = option.effects['修为'] && option.effects['修为'] > 0;
      
      setPlayerStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        
        Object.entries(option.effects).forEach(([stat, value]) => {
          if (typeof value === 'number') {
            if (newStatus.hasOwnProperty(stat)) {
              newStatus[stat] += value;
            } else {
              newStatus[stat] = value;
            }
            
            if (newStatus[stat] < 0) {
              newStatus[stat] = 0;
            }
            
            if (stat === '灵力' && newStatus[stat] > 100) {
              newStatus[stat] = 100;
            }
            if (stat === '道心' && newStatus[stat] > 100) {
              newStatus[stat] = 100;
            }
            if (stat === '体力' && newStatus[stat] > 100) {
              newStatus[stat] = 100;
            }
          } else if (typeof value === 'boolean') {
            newStatus[stat] = value;
          } else if (typeof value === 'string') {
            if (stat === '物品') {
              const inventory = newStatus['物品库存'] || [];
              inventory.push(value);
              newStatus['物品库存'] = inventory;
            } else {
              newStatus[stat] = value;
            }
          }
        });
        
        return newStatus;
      });
      
      if (hadCultivationImprovement) {
        soundManager.playEffectSound('levelUp');
      }
    }
    
    if (option.nextId) {
      const nextChapter = storyData.chapters.find(
        chapter => chapter.id === option.nextId
      );
      
      if (nextChapter) {
        setCurrentChapter(nextChapter);
        
        if (nextChapter.assets && nextChapter.assets.bgm) {
          soundManager.playBackgroundMusic(nextChapter.assets.bgm);
        }
      } else {
        console.error('找不到章节:', option.nextId);
      }
    }
  };

  const handleLoadGame = (chapterId, loadedPlayerStatus) => {
    setIsLoading(true);
    soundManager.playUISound('select');
    setPlayerStatus(loadedPlayerStatus);
    
    const chapter = storyData.chapters.find(
      chapter => chapter.id === chapterId
    );
    
    if (chapter) {
      setCurrentChapter(chapter);
      if (chapter.assets && chapter.assets.bgm) {
        soundManager.playBackgroundMusic(chapter.assets.bgm);
      } else {
        soundManager.playBackgroundMusic('main');
      }
    } else {
      console.error('加载游戏时找不到章节:', chapterId);
    }
    
    setIsLoading(false);
  };

  const toggleSaveLoadScreen = () => {
    setShowSaveLoadScreen(!showSaveLoadScreen);
    soundManager.playUISound('click');
  };

  const toggleCultivation = () => {
    setShowCultivation(!showCultivation);
    soundManager.playUISound('click');
  };

  const handleCultivationUpdate = (effects) => {
    setPlayerStatus(prevStatus => {
      const newStatus = { ...prevStatus };
      Object.entries(effects).forEach(([stat, value]) => {
        if (newStatus.hasOwnProperty(stat)) {
          newStatus[stat] += value;
          if (newStatus[stat] < 0) newStatus[stat] = 0;
          if (stat === '灵力' && newStatus[stat] > 100) newStatus[stat] = 100;
          if (stat === '道心' && newStatus[stat] > 100) newStatus[stat] = 100;
          if (stat === '体力' && newStatus[stat] > 100) newStatus[stat] = 100;
        }
      });
      return newStatus;
    });
  };

  const handleBattleUpdate = (effects) => {
    setPlayerStatus(prevStatus => {
      const newStatus = { ...prevStatus };
      Object.entries(effects).forEach(([stat, value]) => {
        if (newStatus.hasOwnProperty(stat)) {
          newStatus[stat] += value;
          if (newStatus[stat] < 0) newStatus[stat] = 0;
          if (stat === '灵力' && newStatus[stat] > 100) newStatus[stat] = 100;
          if (stat === '体力' && newStatus[stat] > 100) newStatus[stat] = 100;
        }
      });
      return newStatus;
    });
  };

  const handleBattleEnd = (isVictory) => {
    setShowBattle(false);
    setCurrentEnemy(null);
    
    if (isVictory) {
      soundManager.playEffectSound('victory');
      if (currentChapter.battle && currentChapter.battle.victory) {
        const nextChapter = storyData.chapters.find(
          chapter => chapter.id === currentChapter.battle.victory
        );
        if (nextChapter) {
          setCurrentChapter(nextChapter);
        }
      }
    } else {
      soundManager.playEffectSound('defeat');
      if (currentChapter.battle && currentChapter.battle.defeat) {
        const nextChapter = storyData.chapters.find(
          chapter => chapter.id === currentChapter.battle.defeat
        );
        if (nextChapter) {
          setCurrentChapter(nextChapter);
        }
      }
    }
  };

  const triggerBattle = (enemyType) => {
    setCurrentEnemy(enemyType);
    setShowBattle(true);
  };

  if (isLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>仙侠文字RPG</h1>
        <div className="game-controls">
          <button onClick={toggleSaveLoadScreen}>存档/读档</button>
          <button onClick={toggleCultivation}>修炼</button>
          <button onClick={handleResetGame}>重新开始</button>
          <button onClick={() => triggerBattle('test')}>测试战斗</button>
        </div>
        <PlayerStatus status={playerStatus} />
        <SoundControls />
      </header>
      
      <main>
        {showBattle ? (
          <BattleScene
            enemy={currentEnemy}
            playerStatus={playerStatus}
            onUpdate={handleBattleUpdate}
            onEnd={handleBattleEnd}
          />
        ) : (
          <>
            <StoryDisplay chapter={currentChapter} />
            <Options
              options={getCurrentOptions()}
              onSelect={handleOptionSelect}
            />
          </>
        )}
        
        {showSaveLoadScreen && (
          <SaveLoadScreen
            onClose={toggleSaveLoadScreen}
            onLoad={handleLoadGame}
            currentChapter={currentChapter}
            playerStatus={playerStatus}
          />
        )}
        
        {showCultivation && (
          <Cultivation
            onClose={toggleCultivation}
            onUpdate={handleCultivationUpdate}
            playerStatus={playerStatus}
          />
        )}
      </main>
    </div>
  );
}

export default App;