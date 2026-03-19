import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mail, Calendar } from 'lucide-react';
import { RoleBadge } from '../components/shared/Badges';
import { getAllUsers, mapBackendUserToUiUser } from '../lib/api';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError('');
        const backendUsers = await getAllUsers();
        if (cancelled) return;
        setUsers(Array.isArray(backendUsers) ? backendUsers.map(mapBackendUserToUiUser) : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load users');
        setUsers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(
      (user) => user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q)
    );
  }, [searchQuery, users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Team members and their roles
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm transition-all"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">Loading users...</div>
        ) : (
          filteredUsers.map((user) => {
            // This page only fetches users. If you want assigned/completed counts too,
            // we can add another endpoint call per user.
            const assignedIssuesCount = 0;
            const completedIssuesCount = 0;

          return (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="mt-2">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{assignedIssuesCount}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{completedIssuesCount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </div>
            </Link>
          );
          })
        )}
      </div>

      {filteredUsers.length === 0 && (
        <div className="p-8 text-center text-muted-foreground rounded-xl bg-card border border-border">
          No users found
        </div>
      )}
    </div>
  );
}
