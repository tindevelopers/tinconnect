import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { EnhancedMeetingDashboard } from "../components/meetings/EnhancedMeetingDashboard";
import { VideoMeeting } from "../components/video/VideoMeeting";
import { Sidebar } from "../components/navigation/Sidebar";
import { Header } from "../components/navigation/Header";
import { Plus, Users, Building, LogOut, User, Video } from "lucide-react";
import {
  Tenant,
  User as UserProfile,
  Meeting,
} from "../../server/lib/database.types";
import { CreateTenantRequest, CreateUserRequest } from "@shared/api";

export default function EnhancedDashboard() {
  const { user, userProfile, tenant, signOut } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeSection, setActiveSection] = useState("meetings");
  const [showVideoMeeting, setShowVideoMeeting] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newTenant, setNewTenant] = useState<Partial<CreateTenantRequest>>({
    name: "",
    domain: "",
  });
  const [newUser, setNewUser] = useState<Partial<CreateUserRequest>>({
    name: "",
    email: "",
    role: "user",
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
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTenant),
      });

      if (response.ok) {
        const tenant = await response.json();
        setTenants([...tenants, tenant.data]);
        setNewTenant({ name: "", domain: "" });
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!currentTenant || !newUser.name || !newUser.email) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tenants/${currentTenant.id}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUser,
          tenantId: currentTenant.id,
        }),
      });

      if (response.ok) {
        const user = await response.json();
        setUsers([...users, user.data]);
        setNewUser({ name: "", email: "", role: "user" });
      }
    } catch (error) {
      console.error("Error creating user:", error);
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

  const handleSidebarItemClick = (item: string) => {
    setActiveSection(item);
  };

  if (showVideoMeeting && selectedMeeting) {
    return (
      <VideoMeeting meeting={selectedMeeting} onLeave={handleLeaveMeeting} />
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "meetings":
        return currentTenant ? (
          <EnhancedMeetingDashboard
            tenantId={currentTenant.id}
            onJoinMeeting={handleJoinMeeting}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Please select a tenant to view meetings.
            </p>
          </div>
        );

      case "contacts":
        return (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Users & Contacts</span>
              </CardTitle>
              <CardDescription>
                Manage users and contacts in your organization
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
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">Role</Label>
                  <select
                    id="userRole"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as any })
                    }
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
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
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
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "dashboard":
        return (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Organizations</span>
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
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tenantDomain">Domain</Label>
                  <Input
                    id="tenantDomain"
                    placeholder="example.com"
                    value={newTenant.domain}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, domain: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleCreateTenant}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Organization
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Tenants List */}
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-gray-500">{tenant.domain}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTenant(tenant)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Switch
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeSection.charAt(0).toUpperCase() +
                  activeSection.slice(1).replace("-", " ")}
              </h3>
              <p className="text-gray-500">This section is coming soon.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Full Width */}
      <Header
        user={
          userProfile
            ? { name: userProfile.name, avatar_url: userProfile.avatar_url }
            : undefined
        }
        tenant={currentTenant ? { name: currentTenant.name } : undefined}
      />

      {/* Content Area with Sidebar and Main Content */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Floating Sidebar - Narrower */}
        <Sidebar
          activeItem={activeSection}
          onItemClick={handleSidebarItemClick}
          className="h-[calc(100vh-180px)] flex-shrink-0"
        />

        {/* Main Content */}
        <main className="flex-1">{renderContent()}</main>
      </div>
    </div>
  );
}
