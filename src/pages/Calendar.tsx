import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

interface Note {
  date: Date;
  text: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendar = (year: number, month: number): (number | string)[][] => {
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = new Date(year, month, 1).getDay();
    const weeks: (number | string)[][] = [];
    let week: (number | string)[] = [];

    for (let i = 0; i < startDay; i++) {
      week.push('');
    }

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7 || day === daysInMonth) {
        weeks.push(week);
        week = [];
      }
    }

    while (week.length < 7) {
      week.push('');
    }
    weeks.push(week);

    return weeks;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = generateCalendar(year, month);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  };

  const handleSaveNote = (date: number) => {
    if (editingNote) {
      setNotes(notes.map(note =>
        note.date.toDateString() === new Date(year, month, date).toDateString()
          ? { ...note, text: noteText }
          : note
      ));
    } else {
      setNotes([...notes, { date: new Date(year, month, date), text: noteText }]);
    }
    setEditingNote(null);
    setNoteText('');
  };

  const handleEditNote = (date: number) => {
    const note = notes.find(note => note.date.toDateString() === new Date(year, month, date).toDateString());
    if (note) {
      setEditingNote(note);
      setNoteText(note.text);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Calendar" />

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <header className="p-4 text-center">
          <h2 className="text-xl font-semibold">{`${currentDate.toLocaleString('default', { month: 'long' })} ${year}`}</h2>
        </header>

        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
              {daysOfWeek.map(day => (
                <th key={day} className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
                  <span className="hidden lg:block">{day}</span>
                  <span className="block lg:hidden">{day.substring(0, 3)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i} className="grid grid-cols-7">
                {week.map((d, idx) => (
                  <td
                    key={idx}
                    className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 ${
                      d === day ? 'bg-primary text-white' : 'hover:bg-gray dark:hover:bg-meta-4'
                    } dark:border-strokedark md:h-25 md:p-6 xl:h-31`}
                    onClick={() => d && handleEditNote(d)}
                  >
                    <span className={`font-medium ${d === day ? 'text-white' : 'text-black dark:text-white'}`}>
                      {d}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {editingNote && (
          <div className="p-4">
            <textarea
              value={noteText}
              onChange={handleNoteChange}
              className="w-full p-2 border rounded-md"
              placeholder="Add or edit your note here..."
            />
            <button
              onClick={() => handleSaveNote(editingNote.date.getDate())}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Save Note
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Calendar;
