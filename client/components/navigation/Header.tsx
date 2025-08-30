import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Building, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    name: string;
    avatar_url?: string;
  };
  tenant?: {
    name: string;
  };
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  user,
  tenant,
  className 
}) => {
  return (
    <header className={cn(
      "bg-white shadow-sm border-b border-gray-200 h-18",
      className
    )}>
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo and Branding */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            {/* Logo placeholder - you can replace with actual logo */}
            <div className="text-2xl font-bold text-blue-700">
              rOOmZZ
            </div>
          </div>
          
          {tenant && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Building className="w-3 h-3 mr-1" />
              {tenant.name}
            </Badge>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-8">
          {/* Action Buttons */}
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold uppercase tracking-wide"
            >
              START
            </Button>
            <Button 
              variant="ghost" 
              className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold uppercase tracking-wide"
            >
              JOIN
            </Button>
            <Button 
              variant="ghost" 
              className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold uppercase tracking-wide"
            >
              SCHEDULE
            </Button>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
