import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
    <>
      <Breadcrumb pageName="Calendar" />

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
              {daysOfWeek.map((day) => (
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
      </div>
    </>
  );
};

export default Calendar;
