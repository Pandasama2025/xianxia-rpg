import React, { useState, useEffect } from 'react';
import { db } from './firebase/config';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import StoryDisplay from './components/StoryDisplay';
import Options from './components/Options';
import PlayerStatus from './components/PlayerStatus';
import storyData from './data/story.json';
import './App.css';

function App() {
  const [currentChapter, setCurrentChapter] = useState(null);
  const [playerStatus, setPlayerStatus] = useState({
    cultivation: '练气期',
    spiritualPower: 100,
    karma: 0,
    sect: null
  });

  useEffect(() => {
    // Load initial chapter
    const startChapter = storyData.chapters.find(chapter => chapter.id === 'start');
    setCurrentChapter(startChapter);

    // Try to load saved game
    const loadSavedGame = async () => {
      try {
        const saveRef = doc(collection(db, 'saves'), 'latest');
        const saveDoc = await getDoc(saveRef);
        
        if (saveDoc.exists()) {
          const saveData = saveDoc.data();
          setCurrentChapter(storyData.chapters.find(chapter => chapter.id === saveData.chapterId));
          setPlayerStatus(saveData.playerStatus);
        }
      } catch (error) {
        console.error('Error loading saved game:', error);
      }
    };

    loadSavedGame();
  }, []);

  const handleOptionSelect = async (option) => {
    // Update player status based on option effects
    if (option.effects) {
      setPlayerStatus(prevStatus => ({
        ...prevStatus,
        ...option.effects
      }));
    }

    // Find and set next chapter
    const nextChapter = storyData.chapters.find(chapter => chapter.id === option.nextChapter);
    setCurrentChapter(nextChapter);

    // Save game state
    try {
      const saveRef = doc(collection(db, 'saves'), 'latest');
      await setDoc(saveRef, {
        chapterId: option.nextChapter,
        playerStatus: {
          ...playerStatus,
          ...option.effects
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  if (!currentChapter) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="app">
      <div className="game-container">
        <PlayerStatus status={playerStatus} />
        <StoryDisplay title={currentChapter.title} text={currentChapter.text} />
        <Options options={currentChapter.options} onSelect={handleOptionSelect} />
      </div>
    </div>
  );
}

export default App;