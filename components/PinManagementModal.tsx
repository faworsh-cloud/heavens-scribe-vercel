import React, { useState, useEffect } from 'react';
import { verifyPin } from '../utils/auth';
import { XMarkIcon } from './icons';

interface PinManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPinSet: (pin: string) => void;
  pinHash: string | null;
}

const PinManagementModal: React.FC<PinManagementModalProps> = ({
  isOpen,
  onClose,
  onPinSet,
  pinHash,
}) => {
  const [stage, setStage] = useState<'enterOld' | 'setNew'>(pinHash ? 'enterOld' : 'setNew');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStage(pinHash ? 'enterOld' : 'setNew');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
    }
  }, [isOpen, pinHash]);

  const handleOldPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinHash) return;
    const isValid = await verifyPin(oldPin, pinHash);
    if (isValid) {
      setStage('setNew');
      setError('');
    } else {
      setError('기존 PIN이 일치하지 않습니다.');
    }
  };

  const handleNewPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPin.length < 4) {
      setError('PIN은 4자리 이상이어야 합니다.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('새 PIN이 일치하지 않습니다.');
      return;
    }
    onPinSet(newPin);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm transform transition-all relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        {stage === 'enterOld' && (
          <form onSubmit={handleOldPinSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">기존 PIN 확인</h2>
            <div>
              <label htmlFor="old-pin" className="sr-only">기존 PIN</label>
              <input
                id="old-pin" type="password" value={oldPin} onChange={(e) => setOldPin(e.target.value)}
                placeholder="기존 PIN 입력"
                className="w-full px-4 py-2 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">
              확인
            </button>
          </form>
        )}
        
        {stage === 'setNew' && (
          <form onSubmit={handleNewPinSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{pinHash ? '새 PIN 설정' : 'PIN 설정'}</h2>
            <div>
              <label htmlFor="new-pin" className="sr-only">새 PIN</label>
              <input
                id="new-pin" type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)}
                placeholder="새 PIN 입력 (4자리 이상)"
                className="w-full px-4 py-2 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="confirm-new-pin" className="sr-only">새 PIN 확인</label>
              <input
                id="confirm-new-pin" type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="새 PIN 확인"
                className="w-full px-4 py-2 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
             <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                취소
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                저장
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PinManagementModal;