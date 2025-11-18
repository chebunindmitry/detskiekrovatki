
import React from 'react';
import { MessageSender } from '../types';

interface ChatBubbleProps {
  sender: MessageSender;
  text: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ sender, text }) => {
  const isBot = sender === MessageSender.BOT;

  const bubbleClasses = isBot
    ? 'bg-[#242d37] text-white self-start rounded-br-none'
    : 'bg-[#5288c1] text-white self-end rounded-bl-none';

  return (
    <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl shadow-md ${bubbleClasses}`}>
      <p className="text-base">{text}</p>
    </div>
  );
};

export default ChatBubble;
