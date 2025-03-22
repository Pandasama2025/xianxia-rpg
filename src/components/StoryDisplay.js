import React, { useState, useEffect } from 'react';
import './StoryDisplay.css';
import '../styles/WaterInkTheme.css';

const StoryDisplay = ({ chapter, playerStatus, isLoading }) => {
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedText, setPaginatedText] = useState([]);
  
  // 每页大约显示的字符数 (根据屏幕大小和UX调整)
  const charsPerPage = 500;
  
  // 章节变化时处理分页
  useEffect(() => {
    // 只有当chapter可用时才执行分页
    if (chapter && chapter.text) {
      // 重置到第一页
      setCurrentPage(1);
      
      // 分割文本为段落
      const paragraphs = chapter.text.split('\n').filter(p => p.trim() !== '');
      
      // 将段落组合成页面
      const pages = [];
      let currentPageText = '';
      let currentCharCount = 0;
      
      for (const paragraph of paragraphs) {
        // 如果添加此段落会超过每页字符限制，开始新页面
        if (currentCharCount + paragraph.length > charsPerPage && currentPageText !== '') {
          pages.push(currentPageText);
          currentPageText = paragraph;
          currentCharCount = paragraph.length;
        } else {
          // 添加段落到当前页面
          if (currentPageText !== '') {
            currentPageText += '\n\n';
            currentCharCount += 2;
          }
          currentPageText += paragraph;
          currentCharCount += paragraph.length;
        }
      }
      
      // 添加最后一页
      if (currentPageText !== '') {
        pages.push(currentPageText);
      }
      
      setPaginatedText(pages);
      setTotalPages(pages.length);
    }
  }, [chapter]);
  
  // 渲染对话和相关信息
  const renderDialogue = () => {
    if (chapter && chapter.dialogue && chapter.dialogue.length > 0) {
      return (
        <div className="dialogue-container">
          {chapter.dialogue.map((entry, index) => (
            <div key={index} className="dialogue-entry">
              <div className="speaker">{entry.speaker}:</div>
              <div className="speech">{entry.text}</div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // 处理页面切换
  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  // 获取当前页面内容
  const getCurrentPageContent = () => {
    if (paginatedText.length === 0) {
      return '';
    }
    return paginatedText[currentPage - 1];
  };
  
  // 渲染分页控制
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination-controls">
        <button 
          onClick={() => handlePageChange('prev')} 
          disabled={currentPage === 1}
          className="page-button prev-page"
        >
          上一页
        </button>
        <span className="page-indicator">
          {currentPage} / {totalPages}
        </span>
        <button 
          onClick={() => handlePageChange('next')} 
          disabled={currentPage === totalPages}
          className="page-button next-page"
        >
          下一页
        </button>
      </div>
    );
  };
  
  // 显示加载中或无数据提示
  if (isLoading) {
    return (
      <div className="story-display loading">
        <div className="loading-indicator">加载中...</div>
      </div>
    );
  }
  
  if (!chapter) {
    return (
      <div className="story-display">
        <div className="no-chapter">无章节数据</div>
      </div>
    );
  }
  
  return (
    <div className="story-display">
      <div className="story-content">
        <h2 className="chapter-title">{chapter.title}</h2>
        
        {chapter.characters && (
          <div className="character-info">
            <h3>场景角色</h3>
            {chapter.characters.map((char, index) => (
              <div key={index} className="character">
                <span className="character-name">{char.name}</span>
                {char.description && (
                  <span className="character-desc"> - {char.description}</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="chapter-text">
          {getCurrentPageContent().split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        {renderDialogue()}
        {renderPagination()}
      </div>
    </div>
  );
};

export default StoryDisplay;