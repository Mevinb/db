import React, { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { Calendar, Clock, MapPin, BookOpen, Users } from 'lucide-react';

interface ScheduleItem {
  id: string;
  course: string;
  code: string;
  time: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'lab' | 'tutorial';
  students: number;
}

interface DaySchedule {
  day: string;
  classes: ScheduleItem[];
}

const FacultySchedule: React.FC = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  
  const weekSchedule: DaySchedule[] = [
    {
      day: 'Monday',
      classes: [
        { id: '1', course: 'Data Structures', code: 'CS201', time: '9:00 AM', endTime: '10:30 AM', room: 'Room 101', type: 'lecture', students: 45 },
        { id: '2', course: 'Database Systems', code: 'CS302', time: '2:00 PM', endTime: '3:30 PM', room: 'Room 105', type: 'lecture', students: 52 },
      ]
    },
    {
      day: 'Tuesday',
      classes: [
        { id: '3', course: 'Operating Systems', code: 'CS301', time: '11:00 AM', endTime: '12:30 PM', room: 'Room 203', type: 'lecture', students: 38 },
        { id: '4', course: 'Computer Networks', code: 'CS303', time: '3:00 PM', endTime: '4:30 PM', room: 'Room 202', type: 'lecture', students: 41 },
      ]
    },
    {
      day: 'Wednesday',
      classes: [
        { id: '5', course: 'Data Structures', code: 'CS201', time: '9:00 AM', endTime: '10:30 AM', room: 'Room 101', type: 'lecture', students: 45 },
        { id: '6', course: 'Data Structures Lab', code: 'CS201L', time: '2:00 PM', endTime: '5:00 PM', room: 'Lab 1', type: 'lab', students: 25 },
      ]
    },
    {
      day: 'Thursday',
      classes: [
        { id: '7', course: 'Operating Systems', code: 'CS301', time: '11:00 AM', endTime: '12:30 PM', room: 'Room 203', type: 'lecture', students: 38 },
        { id: '8', course: 'Computer Networks', code: 'CS303', time: '3:00 PM', endTime: '4:30 PM', room: 'Room 202', type: 'lecture', students: 41 },
      ]
    },
    {
      day: 'Friday',
      classes: [
        { id: '9', course: 'Database Systems', code: 'CS302', time: '10:00 AM', endTime: '11:30 AM', room: 'Room 105', type: 'lecture', students: 52 },
        { id: '10', course: 'Database Systems Lab', code: 'CS302L', time: '2:00 PM', endTime: '5:00 PM', room: 'Lab 2', type: 'lab', students: 26 },
      ]
    },
    {
      day: 'Saturday',
      classes: [
        { id: '11', course: 'Data Structures Tutorial', code: 'CS201T', time: '10:00 AM', endTime: '11:00 AM', room: 'Room 101', type: 'tutorial', students: 45 },
      ]
    },
  ];

  const currentDaySchedule = weekSchedule.find(d => d.day === selectedDay);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-purple-500';
      case 'lab': return 'bg-green-500';
      case 'tutorial': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-purple-100 text-purple-700';
      case 'lab': return 'bg-green-100 text-green-700';
      case 'tutorial': return 'bg-blue-100 text-blue-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  const totalClasses = weekSchedule.reduce((acc, day) => acc + day.classes.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Schedule</h1>
            <p className="text-gray-500">View your weekly class schedule</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-xl">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-600">{totalClasses} Classes/Week</span>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex flex-wrap gap-2">
          {weekSchedule.map((day) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                selectedDay === day.day
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-600 border-2 border-purple-200 hover:border-purple-400'
              }`}
            >
              {day.day}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                selectedDay === day.day ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
              }`}>
                {day.classes.length}
              </span>
            </button>
          ))}
        </div>

        {/* Schedule for Selected Day */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">{selectedDay}'s Classes</h2>
          
          {currentDaySchedule && currentDaySchedule.classes.length > 0 ? (
            <div className="grid gap-4">
              {currentDaySchedule.classes.map((classItem) => (
                <Card key={classItem.id} className="border-purple-100 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className={`w-2 ${getTypeColor(classItem.type)}`} />
                      <div className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">{classItem.code}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeBadge(classItem.type)}`}>
                                {classItem.type}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{classItem.course}</h3>
                          </div>
                          <div className="flex flex-wrap gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span>{classItem.time} - {classItem.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-500" />
                              <span>{classItem.room}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-purple-500" />
                              <span>{classItem.students} Students</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-purple-100">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-gray-500">No classes scheduled for {selectedDay}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-gray-600">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Lab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Tutorial</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultySchedule;
