import React, { useState } from 'react';
import { XMarkIcon } from './icons';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: (hideFor7Days: boolean) => void;
  content: string;
}

const ParsedLine: React.FC<{ line: string }> = ({ line }) => {
    // Regex for bold **text** and links [text](url)
    const regex = /(\*\*(.*?)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
    
    // FIX: Replaced `JSX.Element` with `React.ReactNode` to resolve "Cannot find namespace 'JSX'" error.
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
        // Push text before match
        if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
        }
        
        // Check if it is a bold match
        if (match[2] !== undefined) {
            parts.push(<strong key={lastIndex}>{match[2]}</strong>);
        }
        // Check if it is a link match
        else if (match[4] !== undefined && match[5] !== undefined) {
            parts.push(
                <a href={match[5]} key={lastIndex} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                    {match[4]}
                </a>
            );
        }
        
        lastIndex = regex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
    }

    return <p>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</p>;
};


const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, content }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
      }
      if (line === '---') {
        return <hr key={index} className="my-4" />;
      }
      if (line.trim() === '') {
        return <p key={index}></p>;
      }
      return <ParsedLine key={index} line={line} />;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg transform transition-all relative max-h-[90vh] flex flex-col">
        <button type="button" onClick={() => onClose(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">📢 공지사항</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4 whitespace-pre-wrap">
          {renderContent(content)}
        </div>
        <div className="mt-6 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
                <input
                    id="dont-show-again"
                    name="dont-show-again"
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="dont-show-again" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    7일 동안 보지 않기
                </label>
            </div>
            <button
              type="button"
              onClick={() => onClose(dontShowAgain)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              확인
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;