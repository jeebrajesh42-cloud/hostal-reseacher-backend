import React, { useState, useEffect } from 'react';
import { X, Plus, Save, IndianRupee } from 'lucide-react';
import hostelService from '../services/hostelService';

const CATEGORIES = [
  'Hostel Rent',
  'Security Deposit',
  'Food',
  'Electricity',
  'Water',
  'Internet',
  'Laundry',
  'Transportation',
  'Groceries',
  'Education',
  'Entertainment',
  'Medical',
  'Shopping',
  'Other'
];

const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Net Banking', 'Other'];

const ExpenseForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: 'Food',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
    hostel_id: '',
    is_recurring: false,
    notes: ''
  });

  const [hostelsList, setHostelsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || '',
        category: initialData.category || 'Food',
        amount: initialData.amount || '',
        expense_date: initialData.expense_date || new Date().toISOString().split('T')[0],
        payment_method: initialData.payment_method || 'UPI',
        hostel_id: initialData.hostel_id || '',
        is_recurring: Boolean(initialData.is_recurring),
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        description: '',
        category: 'Food',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'UPI',
        hostel_id: '',
        is_recurring: false,
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Load available hostels for tagging
  useEffect(() => {
    hostelService.getAllHostels()
      .then(res => setHostelsList(res))
      .catch(err => console.warn('Could not load hostels:', err.message));
  }, []);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.description.trim()) {
      errs.description = 'Description is required.';
    }
    const num = parseFloat(formData.amount);
    if (isNaN(num) || num <= 0) {
      errs.amount = 'Amount must be greater than 0.';
    }
    if (!formData.expense_date) {
      errs.expense_date = 'Date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        hostel_id: formData.hostel_id || null
      });
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-secondary-900 mb-1">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h3>
        <p className="text-xs text-secondary-500 mb-6">
          Record student expenses to monitor spending and budget limits.
        </p>

        {errors.form && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-bold text-secondary-700 block mb-1.5">
              Expense Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Monthly Hostel Rent, Mess Meal, Stationery"
              className={`w-full text-xs p-3 rounded-xl border ${
                errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
            />
            {errors.description && (
              <span className="text-[11px] text-rose-600 mt-1 block">{errors.description}</span>
            )}
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border ${
                    errors.amount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                />
              </div>
              {errors.amount && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.amount}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Expense Date *
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary-700 block mb-1.5">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked Hostel (Optional) */}
          <div>
            <label className="text-xs font-bold text-secondary-700 block mb-1.5">
              Link to Hostel (Optional)
            </label>
            <select
              value={formData.hostel_id}
              onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">None / General Expense</option>
              {hostelsList.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="is_recurring" className="text-xs font-semibold text-secondary-700 cursor-pointer select-none">
              Mark as recurring monthly expense (e.g. Rent, Mess, Wi-Fi)
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-secondary-700 block mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Transaction ID, UPI reference, shared with roommate"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
