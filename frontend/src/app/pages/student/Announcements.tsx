import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { announcementsApi } from '@/app/services/api';
import { Bell, Calendar, AlertCircle, Info, AlertTriangle, Search } from 'lucide-react';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  postedBy?: { name: string } | string;
}

const StudentAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await announcementsApi.getActive();
        if (response.success && response.data) {
          setAnnouncements(response.data as unknown as Announcement[]);
          setFilteredAnnouncements(response.data as unknown as Announcement[]);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
      setLoading(false);
    };

    fetchAnnouncements();
  }, [user]);

  useEffect(() => {
    let filtered = announcements;

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((a) => a.priority === filterPriority);
    }

    setFilteredAnnouncements(filtered);
  }, [searchQuery, filterPriority, announcements]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'medium':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50/50';
      case 'medium':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50/50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50/50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Announcements</h1>
          <p className="text-slate-600 mt-1">Stay updated with the latest announcements</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-800">{announcements.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">High Priority</p>
            <p className="text-xl font-bold text-red-600">{announcements.filter((a) => a.priority === 'high').length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertTriangle size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Medium Priority</p>
            <p className="text-xl font-bold text-yellow-600">{announcements.filter((a) => a.priority === 'medium').length}</p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            {searchQuery || filterPriority !== 'all' ? 'No Matching Announcements' : 'No Announcements'}
          </h3>
          <p className="text-slate-500">
            {searchQuery || filterPriority !== 'all'
              ? 'Try adjusting your filters'
              : 'There are no announcements at this time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement._id}
              className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${getPriorityStyles(announcement.priority)}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getPriorityIcon(announcement.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">{announcement.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityBadge(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-slate-600 whitespace-pre-wrap">{announcement.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500 whitespace-nowrap">
                    <Calendar size={14} />
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;
