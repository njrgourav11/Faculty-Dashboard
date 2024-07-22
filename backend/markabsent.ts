// Function to mark a student as absent
const markAbsent = async (studentId: string, studentName?: string, rollNumber?: string, subject?: string, phoneNumber?: string) => {
  try {
    // Update the student's status to absent in the database
    await updateStudent(studentId, { status: 'absent' });
    
    // Update the student's classes attendance record
    await updateStudentClasses(studentId, false);
    
    // Send a POST request to the backend to notify about the absence
    const response = await fetch('http://localhost:5173/absent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentName, rollNumber, subject, phoneNumber }),
    });
    
    // Check if the request was successful
    if (response.ok) {
      alert('SMS sent successfully');
    } else {
      const errorText = await response.text();
      throw new Error(`Failed to send SMS. Status: ${response.status}, Details: ${errorText}`);
    }
  } catch (error) {
    // Handle errors
    console.error('Error marking absent:', error);
  }
};
