import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ onVolumeChange }) => {
  const [settings, setSettings] = useState({
    textSpeed: 50,
    fontSize: 16,
    theme: 'default',
    soundEffects: true,
    backgroundMusic: true,
    autoSave: true,
    masterVolume: 100,
    bgmVolume: 80,
    effectsVolume: 90,
    uiVolume: 80
  });
  
  const [settingsMessage, setSettingsMessage] = useState(null);
  
  useEffect(() => {
    // Load existing settings on component mount
    loadSettings();
  }, []);
  
  const loadSettings = () => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('xianxiaSettings'));
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const saveSettings = () => {
    try {
      localStorage.setItem('xianxiaSettings', JSON.stringify(settings));
      showMessage('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Failed to save settings', 'error');
    }
  };
  
  const resetSettings = () => {
    const defaultSettings = {
      textSpeed: 50,
      fontSize: 16,
      theme: 'default',
      soundEffects: true,
      backgroundMusic: true,
      autoSave: true,
      masterVolume: 100,
      bgmVolume: 80,
      effectsVolume: 90,
      uiVolume: 80
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('xianxiaSettings', JSON.stringify(defaultSettings));
    showMessage('Settings reset to defaults', 'success');
  };
  
  const handleInputChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };
  
  const handleSliderChange = (setting, event) => {
    const value = parseInt(event.target.value, 10);
    setSettings({
      ...settings,
      [setting]: value
    });
  };
  
  const handleToggleChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };
  
  const handleVolumeChange = (volumeType, value) => {
    setSettings({
      ...settings,
      [volumeType + 'Volume']: value
    });
    
    // 调用父组件传递的回调函数
    if (onVolumeChange) {
      onVolumeChange(volumeType, value / 100);
    }
  };
  
  const showMessage = (text, type) => {
    setSettingsMessage({ text, type });
    setTimeout(() => setSettingsMessage(null), 3000);
  };
  
  return (
    <div className="settings-container water-ink-container">
      <h2 className="settings-title ink-heading">Settings</h2>
      
      {/* Settings Message */}
      {settingsMessage && (
        <div className={`settings-message ${settingsMessage.type}`}>
          {settingsMessage.text}
        </div>
      )}
      
      {/* Text Settings */}
      <div className="settings-section">
        <h3 className="section-title">Text & Display</h3>
        
        <div className="setting-item">
          <label className="setting-label">Text Speed</label>
          <div className="setting-control">
            <input
              type="range"
              min="10"
              max="100"
              value={settings.textSpeed}
              onChange={(e) => handleSliderChange('textSpeed', e)}
              className="slider-control"
            />
            <div className="setting-value">{settings.textSpeed}%</div>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Font Size</label>
          <div className="setting-control">
            <input
              type="range"
              min="12"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleSliderChange('fontSize', e)}
              className="slider-control"
            />
            <div className="setting-value">{settings.fontSize}px</div>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Theme</label>
          <div className="setting-control">
            <select
              value={settings.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              className="select-control"
            >
              <option value="default">Default - Water Ink</option>
              <option value="dark">Dark - Night Scroll</option>
              <option value="light">Light - Cloud Parchment</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Audio Settings */}
      <div className="settings-section">
        <h3 className="section-title">Audio</h3>
        
        <div className="setting-item">
          <label className="setting-label">Sound Effects</label>
          <div className="setting-control">
            <div 
              className={`toggle-switch ${settings.soundEffects ? 'on' : 'off'}`}
              onClick={() => handleToggleChange('soundEffects')}
            >
              <div className="toggle-switch-knob"></div>
            </div>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Background Music</label>
          <div className="setting-control">
            <div 
              className={`toggle-switch ${settings.backgroundMusic ? 'on' : 'off'}`}
              onClick={() => handleToggleChange('backgroundMusic')}
            >
              <div className="toggle-switch-knob"></div>
            </div>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Master Volume</label>
          <div className="setting-control">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.masterVolume}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                handleVolumeChange('master', value);
              }}
              className="slider-control"
            />
            <div className="setting-value">{settings.masterVolume}%</div>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">BGM Volume</label>
          <div className="setting-control">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.bgmVolume}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                handleVolumeChange('bgm', value);
              }}
              className="slider-control"
            />
            <div className="setting-value">{settings.bgmVolume}%</div>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">Effects Volume</label>
          <div className="setting-control">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.effectsVolume}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                handleVolumeChange('effects', value);
              }}
              className="slider-control"
            />
            <div className="setting-value">{settings.effectsVolume}%</div>
          </div>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">UI Sounds Volume</label>
          <div className="setting-control">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.uiVolume}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                handleVolumeChange('ui', value);
              }}
              className="slider-control"
            />
            <div className="setting-value">{settings.uiVolume}%</div>
          </div>
        </div>
      </div>
      
      {/* Game Settings */}
      <div className="settings-section">
        <h3 className="section-title">Game</h3>
        
        <div className="setting-item">
          <label className="setting-label">Auto Save</label>
          <div className="setting-control">
            <div 
              className={`toggle-switch ${settings.autoSave ? 'on' : 'off'}`}
              onClick={() => handleToggleChange('autoSave')}
            >
              <div className="toggle-switch-knob"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="settings-actions">
        <button 
          className="save-settings-button ink-button ink-button-primary"
          onClick={saveSettings}
        >
          Save Settings
        </button>
        <button 
          className="reset-settings-button ink-button ink-button-danger"
          onClick={resetSettings}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default Settings;