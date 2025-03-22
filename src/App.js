import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './styles/WaterInkTheme.css';

// 导入组件
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import StatusBar from './components/StatusBar';
import SoundControls from './components/SoundControls';
import Settings from './components/Settings';
import SaveLoad from './components/SaveLoad';
import CharacterSheet from './components/CharacterSheet';

// 导入数据和工具
import { chapters } from './data/storyData';
import { initialPlayerStatus } from './data/gameState';
import { applyEffects } from './utils/gameUtils';
import soundManager from './audio/soundManager';

function App() {
  // 游戏状态
  const [playerStatus, setPlayerStatus] = useState(initialPlayerStatus);
  const [currentChapter, setCurrentChapter] = useState(chapters[0]);
  const [storyHistory, setStoryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI状态
  const [uiState, setUiState] = useState({
    showOptions: true,
    activeView: 'story', // 'story', 'settings', 'save', 'character'
    theme: 'default',
    fontSize: 16
  });
  
  // WebSocket连接
  const [ws, setWs] = useState(null);
  
  // 初始化音效和WebSocket连接
  useEffect(() => {
    // 初始化音效
    soundManager.init();
    
    // WebSocket连接尝试
    let wsConnection = null;
    try {
      wsConnection = new WebSocket('ws://localhost:3001');
      
      wsConnection.onopen = () => {
        console.log('WebSocket连接已建立');
        // 发送初始化消息
        wsConnection.send(JSON.stringify({ type: 'init', userId: 'player1' }));
      };
      
      wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('收到WebSocket消息:', data);
        
        // 处理不同类型的消息
        if (data.type === 'chapter_update') {
          handleChapterUpdate(data.chapter);
        } else if (data.type === 'player_update') {
          handlePlayerUpdate(data.player);
        }
      };
      
      wsConnection.onerror = (error) => {
        console.log('WebSocket连接失败，继续以离线模式运行');
      };
      
      wsConnection.onclose = () => {
        console.log('WebSocket连接已关闭');
      };
      
      setWs(wsConnection);
    } catch (error) {
      console.log('无法建立WebSocket连接，以离线模式运行');
    }
    
    // 清理函数
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
      soundManager.stopAll();
    };
  }, []);
  
  // 处理章节更新
  const handleChapterUpdate = (chapterData) => {
    if (chapterData && chapterData.id) {
      const updatedChapter = chapters.find(ch => ch.id === chapterData.id) || chapterData;
      setCurrentChapter(updatedChapter);
    }
  };
  
  // 处理玩家状态更新
  const handlePlayerUpdate = (playerData) => {
    if (playerData) {
      setPlayerStatus(prevStatus => ({
        ...prevStatus,
        ...playerData
      }));
    }
  };
  
  // 处理玩家选项选择
  const handleOptionSelect = useCallback((option) => {
    // 保存当前状态到历史记录
    setStoryHistory(prev => [
      ...prev, 
      { 
        chapterId: currentChapter.id,
        playerStatus: {...playerStatus},
        selectedOption: option.text
      }
    ]);
    
    // 应用效果到玩家状态
    if (option.effects) {
      const updatedStatus = applyEffects(playerStatus, option.effects);
      setPlayerStatus(updatedStatus);
      
      // 播放相关音效
      if (option.effects.sound) {
        soundManager.play(option.effects.sound);
      }
    }
    
    // 切换到新章节
    if (option.nextChapter) {
      setIsLoading(true);
      
      // 模拟加载时间（可替换为实际加载逻辑）
      setTimeout(() => {
        const nextChapter = chapters.find(ch => ch.id === option.nextChapter);
        if (nextChapter) {
          setCurrentChapter(nextChapter);
          
          // 如果新章节有背景音乐，播放它
          if (nextChapter.backgroundMusic) {
            soundManager.playMusic(nextChapter.backgroundMusic);
          }
        }
        setIsLoading(false);
      }, 500);
    }
  }, [currentChapter, playerStatus]);
  
  // 切换UI视图
  const switchView = (view) => {
    setUiState({
      ...uiState,
      activeView: view
    });
    
    // 播放UI切换音效
    soundManager.playUI('switch');
  };
  
  // 处理音量变化
  const handleVolumeChange = (type, value) => {
    switch(type) {
      case 'master':
        soundManager.setMasterVolume(value);
        break;
      case 'bgm':
        soundManager.setMusicVolume(value);
        break;
      case 'effects':
        soundManager.setEffectsVolume(value);
        break;
      case 'ui':
        soundManager.setUIVolume(value);
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="App water-ink-theme">
      <header className="App-header">
        <h1 className="ink-heading">修仙奇缘</h1>
        <div className="header-controls">
          <button 
            className={`header-button ${uiState.activeView === 'story' ? 'active' : ''}`}
            onClick={() => switchView('story')}
          >
            故事
          </button>
          <button 
            className={`header-button ${uiState.activeView === 'character' ? 'active' : ''}`}
            onClick={() => switchView('character')}
          >
            人物
          </button>
          <button 
            className={`header-button ${uiState.activeView === 'save' ? 'active' : ''}`}
            onClick={() => switchView('save')}
          >
            存档
          </button>
          <button 
            className={`header-button ${uiState.activeView === 'settings' ? 'active' : ''}`}
            onClick={() => switchView('settings')}
          >
            设置
          </button>
        </div>
        <SoundControls />
      </header>
      
      <main className="App-main">
        <StatusBar playerStatus={playerStatus} />
        
        <div className="content-area">
          {uiState.activeView === 'story' && (
            <>
              <StoryDisplay 
                chapter={currentChapter} 
                playerStatus={playerStatus}
                isLoading={isLoading}
              />
              
              {!isLoading && uiState.showOptions && (
                <Options 
                  options={currentChapter.options} 
                  onSelect={handleOptionSelect}
                  playerStatus={playerStatus}
                />
              )}
            </>
          )}
          
          {uiState.activeView === 'character' && (
            <CharacterSheet playerStatus={playerStatus} />
          )}
          
          {uiState.activeView === 'settings' && (
            <Settings onVolumeChange={handleVolumeChange} />
          )}
          
          {uiState.activeView === 'save' && (
            <SaveLoad 
              gameState={{
                playerStatus,
                currentChapter,
                storyHistory
              }}
              onLoad={(saveData) => {
                if (saveData.playerStatus) setPlayerStatus(saveData.playerStatus);
                if (saveData.currentChapter) setCurrentChapter(saveData.currentChapter);
                if (saveData.storyHistory) setStoryHistory(saveData.storyHistory);
                switchView('story');
              }}
            />
          )}
        </div>
      </main>
      
      <footer className="App-footer">
        <div className="footer-content">
          <p>修仙奇缘 &copy; 2023 - 一个修仙世界的冒险故事</p>
        </div>
      </footer>
    </div>
  );
}

export default App;