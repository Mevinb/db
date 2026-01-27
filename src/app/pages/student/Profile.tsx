import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/app/context/AuthContext';
import { dashboardApi, authApi } from '@/app/services/api';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Edit2, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StudentProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    bloodGroup: '',
    emergencyContact: '',
    program: '',
    semester: '',
    rollNo: '',
    batch: '',
    section: '',
    cgpa: 0,
    totalCredits: 0,
    department: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const response = await dashboardApi.getStudentDashboard();
        
        if (response.success && response.data) {
          const data = response.data;
          const profileData = data.profile || {};
          
          setProfile({
            name: user.name || profileData.name || '',
            email: user.email || '',
            phone: profileData.phone || 'Not provided',
            address: profileData.address || 'Not provided',
            dateOfBirth: profileData.dateOfBirth || profileData.dob || '',
            bloodGroup: profileData.bloodGroup || 'Not provided',
            emergencyContact: profileData.emergencyContact || 'Not provided',
            program: profileData.program?.name || 'Not assigned',
            semester: profileData.semester ? `Semester ${profileData.semester}` : 'Not assigned',
            rollNo: profileData.rollNumber || 'Not assigned',
            batch: profileData.enrollmentYear ? `${profileData.enrollmentYear}-${profileData.enrollmentYear + 4}` : 'Not assigned',
            section: profileData.section || 'A',
            cgpa: data.overview?.cgpa || profileData.cgpa || 0,
            totalCredits: profileData.creditsCompleted || 0,
            department: profileData.department?.name || 'Not assigned',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Use auth user data as fallback
        setProfile(prev => ({
          ...prev,
          name: user?.name || '',
          email: user?.email || '',
        }));
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      const response = await authApi.updateProfile({
        name: profile.name,
        email: profile.email,
      });
      
      if (response.success) {
        await refreshUser();
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-500">View and manage your personal information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Profile Header Card */}
        <Card className="border-purple-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-500 to-purple-600" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                <User className="w-12 h-12 text-purple-600" />
              </div>
              <div className="flex-1 pt-4 sm:pt-0">
                <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                <p className="text-gray-500">{profile.rollNo} • {profile.program}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center px-4 py-2 bg-purple-100 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{profile.cgpa}</p>
                  <p className="text-xs text-gray-500">CGPA</p>
                </div>
                <div className="text-center px-4 py-2 bg-purple-100 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{profile.totalCredits}</p>
                  <p className="text-xs text-gray-500">Credits</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="border-purple-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{profile.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email Address</label>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-500" />
                    {profile.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-500" />
                      {profile.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Date of Birth</label>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    {new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  {isEditing ? (
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      rows={2}
                      className="w-full mt-1 px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-purple-500 mt-0.5" />
                      {profile.address}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="border-purple-100">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Academic Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Roll Number</label>
                    <p className="font-medium text-gray-800">{profile.rollNo}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Section</label>
                    <p className="font-medium text-gray-800">{profile.section}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Program</label>
                  <p className="font-medium text-gray-800">{profile.program}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Current Semester</label>
                    <p className="font-medium text-gray-800">{profile.semester}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Batch</label>
                    <p className="font-medium text-gray-800">{profile.batch}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-100">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-center">
                    <Award className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{profile.cgpa}</p>
                    <p className="text-purple-200 text-sm">Current CGPA</p>
                  </div>
                  <div className="p-4 bg-purple-100 rounded-xl text-center">
                    <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{profile.totalCredits}</p>
                    <p className="text-gray-500 text-sm">Credits Earned</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-purple-100 lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Blood Group</label>
                  <p className="font-medium text-gray-800 text-lg">{profile.bloodGroup}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Emergency Contact</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.emergencyContact}
                      onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">{profile.emergencyContact}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Status</label>
                  <p className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
