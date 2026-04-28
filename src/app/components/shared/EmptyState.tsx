import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | React.ReactNode;
}

function isIconComponent(icon: any): icon is LucideIcon {
  return typeof icon === 'function';
}

function isLegacyAction(action: any): action is { label: string; onClick: () => void } {
  return action && typeof action === 'object' && 'label' in action && 'onClick' in action;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <Inbox className="h-8 w-8 text-muted-foreground" />;
    if (isIconComponent(icon)) {
      const Icon = icon as LucideIcon;
      return <Icon className="h-8 w-8 text-muted-foreground" />;
    }
    return icon as React.ReactNode;
  };

  const renderAction = () => {
    if (!action) return null;
    if (isLegacyAction(action)) {
      return (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      );
    }
    return <div className="mt-4">{action as React.ReactNode}</div>;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {renderIcon()}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {renderAction()}
    </div>
  );
}