import React from 'react';
import { createPortal } from 'react-dom';

const TelegramChatButton: React.FC = () => {
  const telegramLink = `https://t.me/AquaTracking_Bot`;
  const content = (
    <a
      href={telegramLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-16 right-6 z-[9999] pointer-events-auto bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
      aria-label="Chat on Telegram"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M21.44,3.48l-2.86,13.54a2.2,2.2,0,0,1-4.2.24l-2.65-6.39-6.39-2.65a2.2,2.2,0,0,1,.24-4.2L21.52,2.56A2.2,2.2,0,0,1,21.44,3.48ZM8.41,12.89,10.6,15,16,7.5Z" />
      </svg>
    </a>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default TelegramChatButton;
