import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../pages/Authentication/firebase';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  name: string;
  roll: string;
  status?: string;
}

const Faculty: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [time, setTime] = useState<string>(new Date().toISOString().split('T')[1].split('.')[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const batches = [
    { id: 'Batch 2021', name: 'Batch 2021' },
    { id: 'Batch 2022', name: 'Batch 2022' },
    { id: 'Batch 2023', name: 'Batch 2023' },
    { id: 'Batch 2024', name: 'Batch 2024' },
  ];

  const sections = Array.from({ length: 10 }, (_, i) => ({
    id: `Section ${String.fromCharCode(65 + i)}`,
    name: `Section ${String.fromCharCode(65 + i)}`,
  }));

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedBatch && selectedSection) {
        try {
          const batchRef = doc(db, 'batches', selectedBatch);
          const sectionRef = doc(batchRef, 'sections', selectedSection);
          const studentQuerySnapshot = await getDocs(collection(sectionRef, 'students'));
          const studentsData: Student[] = [];
          studentQuerySnapshot.forEach((doc) => {
            studentsData.push({ id: doc.id, ...doc.data() } as Student);
          });
          setStudents(studentsData);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [selectedBatch, selectedSection]);

  const updateStudent = async (studentId: string, data: Partial<Student>) => {
    try {
      const studentRef = doc(
        db,
        `batches/${selectedBatch}/sections/${selectedSection}/students/${studentId}`
      );
      await updateDoc(studentRef, data);
      const studentDoc = await getDoc(studentRef);
      if (studentDoc.exists()) {
        const updatedStudent = { id: studentDoc.id, ...studentDoc.data() } as Student;
        const updatedStudents = students.map((student) =>
          student.id === studentId ? updatedStudent : student
        );
        setStudents(updatedStudents);
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const markPresent = async (studentId: string) => {
    try {
      await updateStudent(studentId, { status: 'present' });
    } catch (error) {
      console.error('Error marking present:', error);
    }
  };

  const markAbsent = async (studentId: string, studentName?: string, rollNumber?: string) => {
    try {
      await updateStudent(studentId, { status: 'absent' });
      const response = await fetch('http://localhost:5000/absent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName, rollNumber, date, time }),
      });
      if (response.ok) {
        alert('SMS sent successfully');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to send SMS. Status: ${response.status}, Details: ${errorText}`);
      }
    } catch (error) {
      console.error('Error marking absent:', error);
    }
  };

  const handleSubmit = () => {
    generateExcelSheet(students);
  };

  const generateExcelSheet = (data: Student[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(student => ({
      Name: student.name,
      Roll: student.roll,
      Status: student.status,
      Date: date,
      Time: time,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-4 pt-6 pb-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <h4 className="mb-6 text-lg font-semibold text-black dark:text-white md:text-xl lg:text-2xl">
        Faculty Management
      </h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black dark:text-white">Select Batch:</label>
        <select
          onChange={(e) => setSelectedBatch(e.target.value)}
          value={selectedBatch}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black dark:text-white">Select Section:</label>
        <select
          onChange={(e) => setSelectedSection(e.target.value)}
          value={selectedSection}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select Section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black dark:text-white">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-black dark:text-white">Time:</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Roll Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-gray-100">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-300">
                    {student.roll}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'present'
                          ? 'bg-green-100 text-grey-800 dark:bg-green-900 dark:text-green-100'
                          : student.status === 'absent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {student.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => markPresent(student.id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAbsent(student.id, student.name, student.roll)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Absent
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Submit and Download Excel
        </button>
      </div>
    </div>
  );
};

export default Faculty;
