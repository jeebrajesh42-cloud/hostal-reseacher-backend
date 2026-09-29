import React from 'react';
import { 
  Home, Shield, Utensils, Zap, Droplet, Wifi, Shirt, 
  Bus, ShoppingCart, GraduationCap, Film, HeartPulse, 
  ShoppingBag, MoreHorizontal, Edit, Trash2, Repeat
} from 'lucide-react';

const categoryIcons = {
  'Hostel Rent': Home,
  'Security Deposit': Shield,
  'Food': Utensils,
  'Electricity': Zap,
  'Water': Droplet,
  'Internet': Wifi,
  'Laundry': Shirt,
  'Transportation': Bus,
  'Groceries': ShoppingCart,
  'Education': GraduationCap,
  'Entertainment': Film,
  'Medical': HeartPulse,
  'Shopping': ShoppingBag,
  'Other': MoreHorizontal
};

const categoryColors = {
  'Hostel Rent': 'bg-blue-50 text-blue-600',
  'Security Deposit': 'bg-indigo-50 text-indigo-600',
  'Food': 'bg-amber-50 text-amber-600',
  'Electricity': 'bg-yellow-50 text-yellow-600',
  'Transportation': 'bg-emerald-50 text-emerald-600',
  'Groceries': 'bg-teal-50 text-teal-600',
  'Education': 'bg-purple-50 text-purple-600',
  'Entertainment': 'bg-pink-50 text-pink-600',
  'Medical': 'bg-rose-50 text-rose-600',
  'Other': 'bg-slate-50 text-slate-600'
};

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const IconComponent = categoryIcons[expense.category] || MoreHorizontal;
  const colorClass = categoryColors[expense.category] || 'bg-slate-50 text-slate-600';

  const formattedDate = new Date(expense.expense_date).toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
      {/* Category Icon & Details */}
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-secondary-900 line-clamp-1">{expense.description}</h4>
            {expense.is_recurring && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-50 text-primary-700">
                <Repeat className="w-2.5 h-2.5" /> Recurring
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-500 mt-0.5">
            <span className="font-semibold text-secondary-700">{expense.category}</span>
            <span>•</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-600">
              {expense.payment_method}
            </span>
            {expense.hostels?.name && (
              <>
                <span>•</span>
                <span className="text-primary-600 font-medium truncate max-w-[150px]">
                  {expense.hostels.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        <div className="text-left sm:text-right">
          <span className="text-base font-extrabold text-secondary-900 block">
            ₹{expense.amount?.toLocaleString('en-IN')}
          </span>
          {expense.notes && (
            <span className="text-[11px] text-secondary-400 line-clamp-1 max-w-[180px]">
              {expense.notes}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(expense)}
            className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit expense"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
