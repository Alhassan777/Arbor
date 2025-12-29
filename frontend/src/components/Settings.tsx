import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Icons } from './ui/Icons';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { apiKey, model, theme, setApiKey, setModel, toggleTheme } = useSettingsStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState(model);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
    setLocalModel(model);
  }, [apiKey, model, isOpen]);

  const handleSave = () => {
    setApiKey(localApiKey);
    setModel(localModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Icons.Close className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Theme Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Appearance
              </label>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                {theme === 'dark' ? (
                  <Icons.Moon className="text-gray-600 dark:text-gray-400" />
                ) : (
                  <Icons.Sun className="text-gray-600" />
                )}
              </button>
            </div>

            {/* API Key Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Gemini API Key
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Your API key is stored locally in your browser and is never sent to our servers.
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full pr-12 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {showKey ? (
                    <Icons.EyeOff className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Icons.Eye className="text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                AI Model
              </label>
              <select
                value={localModel}
                onChange={(e) => setLocalModel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemini-2.5-flash">
                  Gemini 2.5 Flash (Recommended - Latest & Fast)
                </option>
                <option value="gemini-1.5-flash">
                  Gemini 1.5 Flash (Fast & Efficient)
                </option>
                <option value="gemini-1.5-pro">
                  Gemini 1.5 Pro (Most Capable)
                </option>
                <option value="gemini-2.0-flash-exp">
                  Gemini 2.0 Flash Experimental
                </option>
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Choose the AI model that best fits your needs. Flash offers the best balance of
                speed and quality.
              </p>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icons.Info className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Privacy & Security</p>
                  <p>
                    Your API key is stored only in your browser's local storage and is sent directly
                    to Google's servers. We never see or store your API key on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
