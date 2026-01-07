import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Download, Upload } from 'lucide-react';

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState([
    { id: 1, name: 'Semester 1', subjects: [{ id: 1, name: '', credits: '', grade: '' }] }
  ]);
  const [gradeSystem, setGradeSystem] = useState('10'); // 10-point or 4-point

  const gradePoints = {
    '10': {
      'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
    },
    '4': {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0
    }
  };

  const addSemester = () => {
    const newId = Math.max(...semesters.map(s => s.id), 0) + 1;
    setSemesters([...semesters, {
      id: newId,
      name: `Semester ${newId}`,
      subjects: [{ id: 1, name: '', credits: '', grade: '' }]
    }]);
  };

  const removeSemester = (semId) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(s => s.id !== semId));
    }
  };

  const addSubject = (semId) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        const newSubId = Math.max(...sem.subjects.map(sub => sub.id), 0) + 1;
        return {
          ...sem,
          subjects: [...sem.subjects, { id: newSubId, name: '', credits: '', grade: '' }]
        };
      }
      return sem;
    }));
  };

  const removeSubject = (semId, subId) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId && sem.subjects.length > 1) {
        return {
          ...sem,
          subjects: sem.subjects.filter(sub => sub.id !== subId)
        };
      }
      return sem;
    }));
  };

  const updateSubject = (semId, subId, field, value) => {
    setSemesters(semesters.map(sem => {
      if (sem.id === semId) {
        return {
          ...sem,
          subjects: sem.subjects.map(sub => 
            sub.id === subId ? { ...sub, [field]: value } : sub
          )
        };
      }
      return sem;
    }));
  };

  const calculateSGPA = (semester) => {
    let totalCredits = 0;
    let totalPoints = 0;

    semester.subjects.forEach(subject => {
      const credits = parseFloat(subject.credits);
      const grade = subject.grade;
      
      if (credits && grade && gradePoints[gradeSystem][grade] !== undefined) {
        totalCredits += credits;
        totalPoints += credits * gradePoints[gradeSystem][grade];
      }
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    semesters.forEach(semester => {
      semester.subjects.forEach(subject => {
        const credits = parseFloat(subject.credits);
        const grade = subject.grade;
        
        if (credits && grade && gradePoints[gradeSystem][grade] !== undefined) {
          totalCredits += credits;
          totalPoints += credits * gradePoints[gradeSystem][grade];
        }
      });
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ semesters, gradeSystem }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cgpa_data.json';
    link.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.semesters && data.gradeSystem) {
            setSemesters(data.semesters);
            setGradeSystem(data.gradeSystem);
          }
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const cgpa = calculateCGPA();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">CGPA Calculator</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="text-gray-700 font-medium">Grade System:</label>
            <select
              value={gradeSystem}
              onChange={(e) => setGradeSystem(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="10">10-Point Scale</option>
              <option value="4">4-Point Scale (GPA)</option>
            </select>
          </div>
        </div>

        {/* CGPA Display */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
          <div className="text-center">
            <p className="text-xl mb-2 opacity-90">Your Overall CGPA</p>
            <p className="text-6xl font-bold">{cgpa}</p>
            <p className="text-sm mt-2 opacity-80">out of {gradeSystem}</p>
          </div>
        </div>

        {/* Semesters */}
        <div className="space-y-6">
          {semesters.map((semester) => (
            <div key={semester.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{semester.name}</h2>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">SGPA</p>
                    <p className="text-2xl font-bold text-indigo-600">{calculateSGPA(semester)}</p>
                  </div>
                  {semesters.length > 1 && (
                    <button
                      onClick={() => removeSemester(semester.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-gray-600 font-semibold">Subject Name</th>
                      <th className="text-left py-3 px-2 text-gray-600 font-semibold">Credits</th>
                      <th className="text-left py-3 px-2 text-gray-600 font-semibold">Grade</th>
                      <th className="py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {semester.subjects.map((subject) => (
                      <tr key={subject.id} className="border-b border-gray-100">
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => updateSubject(semester.id, subject.id, 'name', e.target.value)}
                            placeholder="Enter subject name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={subject.credits}
                            onChange={(e) => updateSubject(semester.id, subject.id, 'credits', e.target.value)}
                            placeholder="Credits"
                            min="0"
                            step="0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={subject.grade}
                            onChange={(e) => updateSubject(semester.id, subject.id, 'grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">Select Grade</option>
                            {Object.keys(gradePoints[gradeSystem]).map(grade => (
                              <option key={grade} value={grade}>
                                {grade} ({gradePoints[gradeSystem][grade]})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {semester.subjects.length > 1 && (
                            <button
                              onClick={() => removeSubject(semester.id, subject.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => addSubject(semester.id)}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>
          ))}
        </div>

        {/* Add Semester Button */}
        <button
          onClick={addSemester}
          className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-lg text-lg font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add New Semester
        </button>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Calculate your CGPA accurately • Save and load your data • Support for multiple grading systems</p>
        </div>
      </div>
    </div>
  );
}