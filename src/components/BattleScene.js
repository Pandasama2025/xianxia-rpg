/**
 * 战斗系统组件
 * 
 * 功能说明：
 * 1. 提供文字描述的战斗场景
 * 2. 支持基础攻击、防御和技能使用
 * 3. 战斗结果会影响玩家状态（修为、灵力等）
 * 4. 支持音效和动画效果
 * 
 * 与剧情整合：
 * - 在story.json中，选项可以使用battle字段触发战斗
 * - 例如：{ "text": "拔剑应战", "battle": "山贼" }
 * - 战斗胜利或失败后，可以跳转到不同的章节（通过battle.nextChapterOnVictory和battle.nextChapterOnDefeat字段）
 * 
 * 敌人类型：
 * - 山贼：基础敌人，低攻击力和防御力
 * - 炼气修士：中等难度，平衡的攻防属性
 * - 黑煞狼：高攻击，低防御的敌人
 * - 邪修者：高级敌人，高攻高防
 * 
 * 技能系统：
 * - 技能根据玩家修为自动解锁
 * - 使用技能消耗灵力，但造成更高伤害
 */

import React, { useState, useEffect } from 'react';
import './BattleScene.css';
import '../styles/WaterInkTheme.css';
import soundManager from '../audio/soundManager';

// 敌人数据定义
const enemies = {
  "山贼": {
    name: "山贼",
    health: 50,
    attack: 5,
    defense: 2,
    description: "手持短刀的山中盗匪，欲劫走你的灵石。",
    rewards: { 
      '修为': 15,
      '因果值': -5
    }
  },
  "炼气修士": {
    name: "炼气修士",
    health: 80,
    attack: 8,
    defense: 5,
    description: "身着灰色道袍的修士，正在试炼中想要击败你。",
    rewards: { 
      '修为': 30,
      '因果值': 0
    }
  },
  "黑煞狼": {
    name: "黑煞狼",
    health: 100,
    attack: 12,
    defense: 3,
    description: "身形巨大的灵兽，闪烁着冷幽的双眼。",
    rewards: { 
      '修为': 40,
      '因果值': 0
    }
  },
  "邪修者": {
    name: "邪修者",
    health: 120,
    attack: 15,
    defense: 10,
    description: "身着黑袍，气息不祥的修士，修炼的是禁忌功法。",
    rewards: { 
      '修为': 50,
      '因果值': -10
    }
  }
};

const BattleScene = ({ playerStatus, onStatusUpdate, onBattleEnd, enemyType }) => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemy, setEnemy] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [showSkills, setShowSkills] = useState(false);
  const [turn, setTurn] = useState(0);
  const [battleEnded, setBattleEnded] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [isDefending, setIsDefending] = useState(false);

  useEffect(() => {
    if (enemyType && enemies[enemyType]) {
      setEnemy({
        ...enemies[enemyType],
        currentHealth: enemies[enemyType].health
      });
      setPlayerHealth(playerStatus['体力'] * 2);
      setBattleLog([`你遇到了${enemies[enemyType].name}！`]);
      soundManager.playBackgroundMusic('battle');
    }
    return () => {
      soundManager.playBackgroundMusic('main');
    };
  }, [enemyType, playerStatus]);

  useEffect(() => {
    if (!enemy) return;
    
    if (playerHealth <= 0) {
      setBattleEnded(true);
      setBattleResult('defeat');
      setBattleLog(prev => [...prev, `你被${enemy.name}击败了...`]);
      soundManager.playEffectSound('magic');
      onBattleEnd(false);
    } else if (enemy.currentHealth <= 0) {
      setBattleEnded(true);
      setBattleResult('victory');
      setBattleLog(prev => [...prev, `你击败了${enemy.name}！`]);
      soundManager.playEffectSound('levelUp');
      
      if (enemy.rewards) {
        onStatusUpdate(enemy.rewards);
        const rewardText = Object.entries(enemy.rewards)
          .map(([key, value]) => `${key} ${value > 0 ? '+' : ''}${value}`)
          .join('，');
        setBattleLog(prev => [...prev, `获得奖励：${rewardText}`]);
      }
      onBattleEnd(true);
    }
  }, [playerHealth, enemy, onStatusUpdate, onBattleEnd]);

  const handleAttack = () => {
    if (cooldown || battleEnded || !enemy) return;
    
    const baseDamage = 5 + Math.floor(playerStatus['修为'] / 20);
    const damage = Math.max(1, baseDamage - enemy.defense);
    
    const newEnemyHealth = Math.max(0, enemy.currentHealth - damage);
    setEnemy(prev => ({
      ...prev,
      currentHealth: newEnemyHealth
    }));
    
    setBattleLog(prev => [...prev, `你对${enemy.name}造成了${damage}点伤害！`]);
    soundManager.playEffectSound('sword');
    
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 1000);
    
    if (newEnemyHealth > 0) {
      setTimeout(() => {
        enemyTurn();
      }, 1500);
    }
    
    setTurn(prev => prev + 1);
    setIsDefending(false);
  };

  const handleDefend = () => {
    if (cooldown || battleEnded || !enemy) return;
    
    setIsDefending(true);
    setBattleLog(prev => [...prev, "你摆出防御姿态，准备承受敌人的攻击。"]);
    soundManager.playEffectSound('shield');
    
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 1000);
    
    setTimeout(() => {
      enemyTurn();
    }, 1500);
    
    setTurn(prev => prev + 1);
  };

  const handleUseSkill = (skillId) => {
    if (cooldown || battleEnded || !enemy) return;
    
    const getSkillDefinition = (id) => {
      const skillDefinitions = {
        "基础剑法": { 
          damageMod: 1.2, 
          cost: { '灵力': 5 },
          description: "基础的剑招，略微提高伤害"
        },
        "御气术": { 
          damageMod: 1.5, 
          cost: { '灵力': 15 },
          description: "控制灵气攻击敌人，造成中等伤害"
        },
        "剑气化形": { 
          damageMod: 2, 
          cost: { '灵力': 30 },
          description: "剑气实体化，造成高额伤害"
        },
        "驭剑术": { 
          damageMod: 2.5, 
          cost: { '灵力': 50 },
          description: "御剑飞行，从空中发动强力攻击"
        },
        "剑气长虹": { 
          damageMod: 3, 
          cost: { '灵力': 80 },
          description: "释放剑气长虹，造成超高伤害"
        }
      };
      return skillDefinitions[id];
    };
    
    const skill = getSkillDefinition(skillId);
    if (!skill) return;
    
    if (skill.cost && skill.cost['灵力'] && playerStatus['灵力'] < skill.cost['灵力']) {
      setBattleLog(prev => [...prev, "灵力不足，无法使用此技能！"]);
      return;
    }
    
    if (skill.cost) {
      onStatusUpdate(skill.cost);
    }
    
    const baseDamage = 5 + Math.floor(playerStatus['修为'] / 20);
    const damage = Math.max(1, Math.floor((baseDamage - enemy.defense) * skill.damageMod));
    
    const newEnemyHealth = Math.max(0, enemy.currentHealth - damage);
    setEnemy(prev => ({
      ...prev,
      currentHealth: newEnemyHealth
    }));
    
    setBattleLog(prev => [...prev, `你使用${skillId}，对${enemy.name}造成了${damage}点伤害！`]);
    soundManager.playEffectSound('magic');
    
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    }, 1000);
    
    if (newEnemyHealth > 0) {
      setTimeout(() => {
        enemyTurn();
      }, 1500);
    }
    
    setTurn(prev => prev + 1);
    setIsDefending(false);
    setShowSkills(false);
  };

  const enemyTurn = () => {
    if (!enemy || battleEnded) return;
    
    let damage = enemy.attack;
    if (isDefending) {
      damage = Math.max(1, Math.floor(damage * 0.5));
      setBattleLog(prev => [...prev, `你的防御减少了伤害！`]);
    }
    
    const newPlayerHealth = Math.max(0, playerHealth - damage);
    setPlayerHealth(newPlayerHealth);
    
    setBattleLog(prev => [...prev, `${enemy.name}对你造成了${damage}点伤害！`]);
    soundManager.playEffectSound(isDefending ? 'shield' : 'hit');
  };

  const getAvailableSkills = () => {
    const skills = [];
    if (playerStatus['修为'] >= 0) skills.push("基础剑法");
    if (playerStatus['修为'] >= 20) skills.push("御气术");
    if (playerStatus['修为'] >= 50) skills.push("剑气化形");
    if (playerStatus['修为'] >= 100) skills.push("驭剑术");
    if (playerStatus['修为'] >= 200) skills.push("剑气长虹");
    return skills;
  };

  if (!enemy) return <div>加载中...</div>;

  return (
    <div className="battle-scene">
      <div className="battle-status">
        <div className="player-status">
          <h3>你的状态</h3>
          <p>生命值: {playerHealth}</p>
          <p>灵力: {playerStatus['灵力']}</p>
          <p>修为: {playerStatus['修为']}</p>
        </div>
        
        <div className="enemy-status">
          <h3>{enemy.name}</h3>
          <p>{enemy.description}</p>
          <p>生命值: {enemy.currentHealth}/{enemy.health}</p>
        </div>
      </div>

      <div className="battle-log">
        {battleLog.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>

      {!battleEnded && (
        <div className="battle-controls">
          <button 
            onClick={handleAttack}
            disabled={cooldown}
            className={cooldown ? 'cooldown' : ''}
          >
            攻击
          </button>
          
          <button 
            onClick={handleDefend}
            disabled={cooldown}
            className={`${cooldown ? 'cooldown' : ''} ${isDefending ? 'active' : ''}`}
          >
            防御
          </button>
          
          <button 
            onClick={() => setShowSkills(!showSkills)}
            disabled={cooldown}
            className={cooldown ? 'cooldown' : ''}
          >
            技能
          </button>
          
          {showSkills && (
            <div className="skill-menu">
              {getAvailableSkills().map(skillId => (
                <button 
                  key={skillId}
                  onClick={() => handleUseSkill(skillId)}
                  disabled={cooldown}
                >
                  {skillId}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {battleEnded && (
        <div className="battle-end">
          <h2>{battleResult === 'victory' ? '战斗胜利！' : '战斗失败...'}</h2>
          <button onClick={() => onBattleEnd(battleResult === 'victory')}>
            继续
          </button>
        </div>
      )}
    </div>
  );
};

export default BattleScene;