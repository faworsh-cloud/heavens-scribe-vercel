import React, { useState } from 'react';
import { XMarkIcon } from './icons';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => void;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(pin);
    setPin('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm transform transition-all relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">관리자 인증</h2>
          <div>
            <label htmlFor="admin-pin" className="sr-only">관리자 PIN</label>
            <input
              id="admin-pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)}
              placeholder="관리자 PIN 입력"
              className="w-full px-4 py-2 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
            인증
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthModal;
