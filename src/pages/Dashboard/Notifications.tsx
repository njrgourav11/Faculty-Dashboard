import { useState } from 'react';
import { db, collection, addDoc } from '../Authentication/firebase'; // Adjust path as needed

const SendNotification = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !message) {
      setError('Title and message are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        date: new Date(date),
      });
      setTitle('');
      setMessage('');
      setDate(new Date());
      alert('Notification sent successfully!');
    } catch (err) {
      setError('Failed to send notification.');
      console.error('Error sending notification:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Send Notification</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="datetime-local"
            id="date"
            value={date.toISOString().slice(0, -1)}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        <button
          type="submit"
          className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
            loading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
};

export default SendNotification;
