
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className={`max-w-xs md:max-w-sm px-4 py-3 rounded-2xl shadow-md bg-[#242d37] text-white self-start rounded-br-none`}>
      <div className="flex items-center space-x-1">
          <span className="text-gray-400">Бот печатает</span>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
