import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar,
  Clock,
  Users,
  Video,
  StreamIcon as LiveStream,
  FileText,
  Settings
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    active: false
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Calendar,
    active: true
  },
  {
    id: 'scheduling',
    label: 'Scheduling Editor',
    icon: Clock,
    active: false
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: Users,
    active: false
  },
  {
    id: 'video-demand',
    label: 'Video on Demand',
    icon: Video,
    active: false
  },
  {
    id: 'live-streaming',
    label: 'Live Streaming',
    icon: LiveStream,
    active: false,
    hasSubmenu: true
  },
  {
    id: 'forms',
    label: 'Forms',
    icon: FileText,
    active: false
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  activeItem = 'meetings',
  onItemClick
}) => {
  return (
    <div className={cn(
      "w-80 bg-white shadow-lg border-r border-gray-200 h-full",
      className
    )}>
      <div className="p-6">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItem || item.active;
            
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => onItemClick?.(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors",
                    "hover:bg-gray-50",
                    isActive ? "text-blue-700 bg-blue-50" : "text-gray-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm tracking-wide uppercase">
                    {item.label}
                  </span>
                  {item.hasSubmenu && (
                    <div className="ml-auto">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-700 rounded-l-full" />
                )}
                
                {/* Separator line */}
                <div className="h-px bg-gray-100 mx-4 mt-3" />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Download App Button */}
      <div className="absolute bottom-6 left-6 right-6">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors">
          Download Desktop App
        </button>
      </div>
    </div>
  );
};
