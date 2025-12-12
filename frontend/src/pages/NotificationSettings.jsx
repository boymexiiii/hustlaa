import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getPreferences();
      setPreferences(response.data);
    } catch (error) {
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationsAPI.updatePreferences(preferences);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const notificationTypes = [
    { key: 'bookings', label: 'Bookings', icon: '📅' },
    { key: 'payments', label: 'Payments', icon: '💳' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
    { key: 'messages', label: 'Messages', icon: '💬' }
  ];

  const channels = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'push', label: 'Push Notifications', icon: Smartphone },
    { key: 'in_app', label: 'In-App', icon: MessageSquare }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={28} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        </div>

        <p className="text-gray-600 mb-8">
          Customize how and when you receive notifications about your bookings, payments, reviews, and messages.
        </p>

        {/* Notification Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Notification Type</th>
                {channels.map(channel => (
                  <th key={channel.key} className="text-center py-3 px-4 font-semibold text-gray-900">
                    <div className="flex flex-col items-center gap-1">
                      <channel.icon size={20} className="text-gray-600" />
                      <span className="text-sm">{channel.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notificationTypes.map(type => (
                <tr key={type.key} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{type.icon}</span>
                      {type.label}
                    </div>
                  </td>
                  {channels.map(channel => {
                    const prefKey = `${channel.key}_${type.key}`;
                    return (
                      <td key={prefKey} className="text-center py-4 px-4">
                        <label className="flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[prefKey] || false}
                            onChange={() => handleToggle(prefKey)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tip</h3>
          <p className="text-blue-800 text-sm">
            You can always manage your notification preferences here. We'll respect your choices and only send you notifications you want to receive.
          </p>
        </div>
      </div>
    </div>
  );
}
