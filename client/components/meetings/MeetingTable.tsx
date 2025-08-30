import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Edit, 
  ExternalLink,
  Play,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  List,
  Grid3X3,
  CalendarIcon
} from 'lucide-react';
import { Meeting } from '../../../server/lib/database.types';
import { cn } from '@/lib/utils';

interface MeetingTableProps {
  meetings: Meeting[];
  onJoinMeeting: (meeting: Meeting) => void;
  onEditMeeting?: (meeting: Meeting) => void;
}

type ViewMode = 'list' | 'calendar' | 'team-calendar';

export const MeetingTable: React.FC<MeetingTableProps> = ({
  meetings,
  onJoinMeeting,
  onEditMeeting
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const itemsPerPage = 10;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeetings = meetings.slice(startIndex, endIndex);
  const totalPages = Math.ceil(meetings.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      active: { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
      scheduled: { variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      ended: { variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const config = variants[status] || variants.ended;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const viewModes = [
    { id: 'list', label: 'List View', icon: List },
    { id: 'calendar', label: 'Calendar View', icon: Grid3X3 },
    { id: 'team-calendar', label: 'Team Calendar', icon: CalendarIcon }
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Upcoming</h1>
          
          {/* View Mode Tabs */}
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
            {viewModes.map((mode, index) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as ViewMode)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors",
                    "border-r border-gray-200 last:border-r-0",
                    isActive ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 bg-gray-50 border-b-2 border-teal-500">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 uppercase tracking-wider">
          <div className="col-span-2">Title</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-2">Date/Time</div>
          <div className="col-span-2">Attendees</div>
          <div className="col-span-1">Videos</div>
          <div className="col-span-2">Documents</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {currentMeetings.map((meeting, index) => (
          <div 
            key={meeting.id} 
            className={cn(
              "px-6 py-4 hover:bg-gray-50 transition-colors",
              index % 2 === 1 && "bg-gray-25"
            )}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Title */}
              <div className="col-span-2">
                <h3 className="font-medium text-gray-900">{meeting.title}</h3>
              </div>

              {/* ID */}
              <div className="col-span-2">
                <span className="text-sm text-gray-600 font-mono">
                  {meeting.id.slice(0, 16)}...
                </span>
              </div>

              {/* Date/Time */}
              <div className="col-span-2">
                <div className="space-y-1">
                  <div className="text-sm text-gray-900">{formatDate(meeting.created_at)}</div>
                  <div className="text-sm text-gray-600">{formatTime(meeting.created_at)}</div>
                </div>
              </div>

              {/* Attendees */}
              <div className="col-span-2">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">john@email.com</div>
                  <div className="text-xs text-gray-500">sydney@email.com</div>
                  <div className="text-xs text-gray-500">veronica@janeemail.com</div>
                </div>
              </div>

              {/* Videos */}
              <div className="col-span-1">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">Video 1</Badge>
                  <Badge variant="outline" className="text-xs">Video 2</Badge>
                  <Badge variant="outline" className="text-xs">Video 3</Badge>
                </div>
              </div>

              {/* Documents */}
              <div className="col-span-2">
                <div className="space-y-1">
                  <Badge className="text-xs bg-blue-100 text-blue-800">Document 1</Badge>
                  <Badge className="text-xs bg-blue-100 text-blue-800">Document 2</Badge>
                  <Badge className="text-xs bg-blue-100 text-blue-800">Document 3</Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex flex-col space-y-2">
                  {meeting.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => onJoinMeeting(meeting)}
                      className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-3 py-1"
                    >
                      START
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1"
                  >
                    LINK
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditMeeting?.(meeting)}
                    className="text-blue-700 hover:bg-blue-50 text-xs px-3 py-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    EDIT
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            
            return (
              <Button
                key={pageNum}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "w-10 h-10 p-0",
                  isActive && "bg-teal-500 border-teal-500 hover:bg-teal-600"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 5 && (
            <>
              <span className="px-2 text-gray-500">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                className="w-10 h-10 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
