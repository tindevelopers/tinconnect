import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { MeetingDashboard } from '../components/meetings/MeetingDashboard';
import { VideoMeeting } from '../components/video/VideoMeeting';
import { Plus, Users, Building, LogOut, User } from 'lucide-react';
import { Tenant, User as UserProfile, Meeting } from '../../server/lib/database.types';
import { CreateTenantRequest, CreateUserRequest } from '@shared/api';

export default function Dashboard() {
  const { user, userProfile, tenant, signOut } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState('meetings');
  const [showVideoMeeting, setShowVideoMeeting] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newTenant, setNewTenant] = useState<Partial<CreateTenantRequest>>({
    name: '',
    domain: '',
  });
  const [newUser, setNewUser] = useState<Partial<CreateUserRequest>>({
    name: '',
    email: '',
    role: 'user',
  });

  useEffect(() => {
    if (tenant) {
      setCurrentTenant(tenant);
    }
  }, [tenant]);

  const handleCreateTenant = async () => {
    if (!newTenant.name || !newTenant.domain) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant),
      });
      
      if (response.ok) {
        const tenant = await response.json();
        setTenants([...tenants, tenant.data]);
        setNewTenant({ name: '', domain: '' });
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!currentTenant || !newUser.name || !newUser.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tenants/${currentTenant.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          tenantId: currentTenant.id,
        }),
      });
      
      if (response.ok) {
        const user = await response.json();
        setUsers([...users, user.data]);
        setNewUser({ name: '', email: '', role: 'user' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowVideoMeeting(true);
  };

  const handleLeaveMeeting = () => {
    setShowVideoMeeting(false);
    setSelectedMeeting(null);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (showVideoMeeting && selectedMeeting) {
    return (
      <VideoMeeting
        meeting={selectedMeeting}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">TIN Connect</h1>
              {currentTenant && (
                <Badge variant="secondary">
                  <Building className="w-3 h-3 mr-1" />
                  {currentTenant.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">{userProfile.name}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
          </TabsList>

          <TabsContent value="meetings" className="space-y-6">
            {currentTenant && (
              <MeetingDashboard
                tenantId={currentTenant.id}
                onJoinMeeting={handleJoinMeeting}
              />
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </CardTitle>
                <CardDescription>
                  Manage users in your tenant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create User Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="userName">Name</Label>
                    <Input
                      id="userName"
                      placeholder="User name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="userRole">Role</Label>
                    <select
                      id="userRole"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleCreateUser} 
                      disabled={loading || !currentTenant}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Users List */}
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Tenants</span>
                </CardTitle>
                <CardDescription>
                  Manage your organization tenants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create Tenant Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tenantName">Name</Label>
                    <Input
                      id="tenantName"
                      placeholder="Organization name"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantDomain">Domain</Label>
                    <Input
                      id="tenantDomain"
                      placeholder="example.com"
                      value={newTenant.domain}
                      onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleCreateTenant} 
                      disabled={loading}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tenant
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Tenants List */}
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-500">{tenant.domain}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTenant(tenant)}
                      >
                        Switch
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
