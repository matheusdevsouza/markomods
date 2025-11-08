import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';

const RoleBadge = ({ role, className }) => {
  const roleConfig = {
    'admin': {
      icon: Crown,
      label: 'Admin',
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30',
      iconColor: 'text-purple-400'
    },
    'supervisor': {
      icon: Shield,
      label: 'Supervisor',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30',
      iconColor: 'text-blue-400'
    },
    'moderator': {
      icon: UserCog,
      label: 'Moderador',
      className: 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30',
      iconColor: 'text-green-400'
    }
  };

  if (!role || !['admin', 'supervisor', 'moderator'].includes(role)) {
    return null;
  }

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        'border flex items-center gap-1 transition-colors cursor-default text-xs px-2 py-0.5',
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.iconColor)} />
      {config.label}
    </Badge>
  );
};

export default RoleBadge;

