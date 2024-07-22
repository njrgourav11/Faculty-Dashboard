import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../pages/Authentication/firebase';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  name: string;
  roll: string;
  totalClasses?: number;
  classesAttended?: number;
  status?: string;
  subject?: string;
  phoneNo?: string;
}

const Faculty: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

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
      await updateStudentClasses(studentId, true);
    } catch (error) {
      console.error('Error marking present:', error);
    }
  };

  const markAbsent = async (studentId: string, studentName?: string, rollNumber?: string, subject?: string, phoneNumber?: string) => {
    try {
      await updateStudent(studentId, { status: 'absent' });
      await updateStudentClasses(studentId, false);
      const response = await fetch('http://localhost:5173/absent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName, rollNumber, subject, phoneNumber }),
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

  const updateStudentClasses = async (studentId: string, isPresent: boolean) => {
    try {
      const studentRef = doc(
        db,
        `batches/${selectedBatch}/sections/${selectedSection}/students/${studentId}`
      );
      const studentDoc = await getDoc(studentRef);
      if (studentDoc.exists()) {
        const studentData = studentDoc.data() as Student;
        const totalClasses = studentData.totalClasses || 0;
        const classesAttended = studentData.classesAttended || 0;
        const updatedTotalClasses = totalClasses + 1;
        const updatedClassesAttended = isPresent ? classesAttended + 1 : classesAttended;
        await updateDoc(studentRef, {
          totalClasses: updatedTotalClasses,
          classesAttended: updatedClassesAttended,
        });
      }
    } catch (error) {
      console.error('Error updating student classes:', error);
    }
  };

  const handleSubmit = () => {
    generateExcelSheet(students);
  };

  const generateExcelSheet = (data: Student[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(student => ({
      Name: student.name,
      Roll: student.roll,
      TotalClasses: student.totalClasses,
      ClassesAttended: student.classesAttended,
      Status: student.status,
      Subject: student.subject,
      PhoneNo: student.phoneNo,
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
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
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

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-6">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Name</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Roll Number</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Total Classes</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Classes Attended</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Status</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
          </div>
        </div>

        {students.length > 0 ? (
          students.map((student, key) => (
            <div
              className={`grid grid-cols-3 sm:grid-cols-6 ${
                key === students.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'
              }`}
              key={student.id}
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <div className="flex-shrink-0">
                  <p className="hidden text-black dark:text-white sm:block">{student.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{student.roll}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-meta-3">{student.totalClasses || 0}</p>
              </div>

              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="text-black dark:text-white">{student.classesAttended || 0}</p>
              </div>

              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="text-meta-5">{student.status || 'N/A'}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <button
                  onClick={() => markPresent(student.id)}
                  className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                >
                  Present
                </button>
                <button
                  onClick={() =>
                    markAbsent(
                      student.id,
                      student.name,
                      student.roll,
                      student.subject,
                      student.phoneNo
                    )
                  }
                  className="ml-2 px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Absent
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="p-2.5 xl:p-5 text-black dark:text-white">No students found.</p>
        )}
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Submit and Download Excel
        </button>
      </div>
    </div>
  );
};

export default Faculty;
