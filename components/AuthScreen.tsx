import React, { useState } from 'react';
import { useI18n } from '../i18n';

interface AuthScreenProps {
  onPinVerify?: (pin: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  onPinVerify,
}) => {
  const { t } = useI18n();
  const [pin, setPin] = useState('');

  const handlePinVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(onPinVerify) onPinVerify(pin);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-center">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">{t('app.unlock')}</h2>
        <form onSubmit={handlePinVerifySubmit} className="space-y-4">
          <div>
            <label htmlFor="enter-pin" className="sr-only">
              {t('app.enterPin')}
            </label>
            <input
              id="enter-pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={t('app.enterPin')}
              className="w-full px-4 py-3 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-2xl tracking-widest"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 text-lg font-semibold text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t('app.confirm')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
