import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../components/common/Sidebar";
import Button from "../../components/common/Button";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRole, setFilterRole] = useState(''); // 'student', 'teacher', or '' for all
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);

  // Fetch students and teachers only
  const fetchUsers = async (page = 1, role = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('geep_token');
      
      // Build query - backend excludes admins by default
      let url = `${API_BASE_URL}/admin/users?page=${page}&limit=50`;
      
      // If filterRole is set, use it to filter by specific role
      if (role) {
        url += `&role=${role}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Backend already filters out admins, but add extra safety filter
          const filteredUsers = data.data.users.filter(u => 
            u.role === 'student' || u.role === 'teacher'
          );
          setUsers(filteredUsers);
          setTotalPages(data.data.pagination?.pages || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchUsers(usersPage, filterRole);
  }, [usersPage, filterRole]);

  // Load pending teachers
  useEffect(() => {
    const loadPendingTeachers = async () => {
      try {
        setLoadingApprovals(true);
        const token = localStorage.getItem('geep_token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/admin/pending-teachers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPendingTeachers(data.data.teachers || []);
          }
        }
      } catch (error) {
        console.error('Error fetching pending teachers:', error);
      } finally {
        setLoadingApprovals(false);
      }
    };
    loadPendingTeachers();
  }, []);

  // Handle teacher approval/rejection
  const handleTeacherAction = async (teacherId, action) => {
    try {
      const token = localStorage.getItem('geep_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/admin/teachers/${teacherId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove teacher from pending list
          setPendingTeachers(prev => prev.filter(t => t._id !== teacherId));
          alert(`Teacher ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error?.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Teacher action error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen animated-bg">
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main flex-1">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8 animate-slide-down">
              <h1 className="text-4xl font-bold nature-gradient-text mb-2 flex items-center gap-3">
                <span className="text-5xl animate-bounce-slow">👑</span>
                Admin Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome, <span className="font-semibold text-primary-700">{user?.name}</span>! Manage students and teachers
              </p>
            </div>

            {/* Pending Teachers Section */}
            {pendingTeachers.length > 0 && (
              <div className="eco-card bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 mb-6 animate-slide-down">
                <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                  <span className="text-3xl">⚠️</span>
                  Pending Teacher Approvals ({pendingTeachers.length})
                </h2>
                {loadingApprovals ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading pending teachers...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTeachers.map((teacher) => (
                      <div
                        key={teacher._id}
                        className="bg-white rounded-lg p-4 flex items-center justify-between border border-yellow-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{teacher.avatar || "👨‍🏫"}</div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                            <p className="text-sm text-gray-600">{teacher.email}</p>
                            <p className="text-xs text-gray-500">
                              Registered: {new Date(teacher.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTeacherAction(teacher._id, 'approve')}
                          >
                            ✓ Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to reject this teacher?')) {
                                handleTeacherAction(teacher._id, 'reject');
                              }
                            }}
                          >
                            ✗ Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="eco-card environment-card">
              <div className="p-4 sm:p-6">
                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-slide-up">
                  <h2 className="text-xl sm:text-2xl font-bold nature-gradient-text flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">👥</span>
                    Students & Teachers
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={filterRole === '' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFilterRole('');
                        setUsersPage(1);
                      }}
                    >
                      🌍 All
                    </Button>
                    <Button 
                      variant={filterRole === 'student' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFilterRole('student');
                        setUsersPage(1);
                      }}
                    >
                      👨‍🎓 Students
                    </Button>
                    <Button 
                      variant={filterRole === 'teacher' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFilterRole('teacher');
                        setUsersPage(1);
                      }}
                    >
                      👨‍🏫 Teachers
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block environment-spinner w-12 h-12 mb-4"></div>
                    <p className="mt-4 text-gray-600 font-medium flex items-center justify-center gap-2">
                      <span className="animate-pulse-slow">🌿</span>
                      Loading environmental data...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-wrapper">
                      <table className="w-full min-w-[640px]">
                        <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider">Avatar</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider">Name</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider hidden md:table-cell">Email</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider">Role</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider">Points</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider hidden lg:table-cell">Level</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider hidden lg:table-cell">Badges</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-primary-800 uppercase tracking-wider hidden xl:table-cell">Joined Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-primary-100">
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="px-6 py-12 text-center empty-state">
                                <div className="empty-state-icon">🌿</div>
                                <p className="text-gray-500 font-medium">
                                  No {filterRole ? filterRole + 's' : 'users'} found
                                </p>
                              </td>
                            </tr>
                          ) : (
                            users.map((u, index) => (
                              <tr 
                                key={u._id} 
                                className="environment-card hover:bg-primary-50/50 transition-all animate-slide-up"
                                style={{ animationDelay: `${index * 30}ms` }}
                              >
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="relative">
                                    <span className="text-2xl sm:text-3xl animate-bounce-slow">{u.avatar || '👤'}</span>
                                    <span className="absolute -top-1 -right-1 text-xs hidden sm:block">🌿</span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="font-bold text-gray-800 text-sm sm:text-base">{u.name}</div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                                  <div className="text-sm text-gray-600">{u.email}</div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                                    u.role === 'teacher' 
                                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                                      : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                                  } capitalize`}>
                                    {u.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-yellow-50 to-yellow-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-yellow-200 w-fit">
                                    <span className="text-yellow-500 animate-pulse-slow text-sm sm:text-base">⭐</span>
                                    <span className="text-xs sm:text-sm font-bold text-gray-800">{u.points || 0}</span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                                  <span className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-semibold border border-primary-200">
                                    {u.level || 'Beginner'}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                                  <div className="flex items-center gap-1">
                                    <span className="text-base sm:text-lg">🏆</span>
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                      {u.badges?.length || 0}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 font-medium hidden xl:table-cell">
                                  {formatDate(u.createdAt)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination */}
                    {users.length > 0 && (
                      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                          Page {usersPage} of {totalPages}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setUsersPage(prev => Math.max(1, prev - 1));
                            }}
                            disabled={usersPage === 1}
                          >
                            Previous
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setUsersPage(prev => prev + 1);
                            }}
                            disabled={usersPage >= totalPages || users.length < 50}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
