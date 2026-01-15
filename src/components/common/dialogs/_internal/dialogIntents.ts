/**
 * Intent-based styling system for Standard Dialog components.
 * Maps semantic intents to Tailwind CSS classes for consistent UX.
 */

export type DialogIntent = 'primary' | 'success' | 'danger' | 'warning';

/**
 * Button color classes by intent
 */
export const intentButtonStyles: Record<DialogIntent, string> = {
  primary: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-orange-500 hover:bg-orange-600 text-white',
};

/**
 * Icon color classes by intent
 */
export const intentIconStyles: Record<DialogIntent, string> = {
  primary: 'text-yellow-400',
  success: 'text-green-400',
  danger: 'text-red-400',
  warning: 'text-orange-400',
};
