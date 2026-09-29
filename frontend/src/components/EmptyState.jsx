import React from 'react';
import { SearchX, Inbox, HeartOff, SlidersHorizontal } from 'lucide-react';

const icons = {
  search: SearchX,
  inbox: Inbox,
  favorites: HeartOff,
  filter: SlidersHorizontal
};

const EmptyState = ({
  icon = 'inbox',
  title = 'No records found',
  description = 'Try adjusting your search filters or add a new record to get started.',
  actionLabel = null,
  onAction = null
}) => {
  const IconComponent = icons[icon] || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 ring-8 ring-primary-50/50">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-secondary-900 mb-1">{title}</h3>
      <p className="text-secondary-500 text-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
