import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItemConfig } from './types';

interface AppBreadcrumbProps {
  /** Array of breadcrumb items to render */
  items: BreadcrumbItemConfig[];
  /** Optional className for the nav element */
  className?: string;
  /** Whether to show icons (default: true) */
  showIcons?: boolean;
  /** Maximum width for truncating long labels */
  maxLabelWidth?: string;
}

/**
 * Centralized breadcrumb component that provides consistent navigation
 * across the application. Uses the app's glass-morphism design language.
 */
const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({
  items,
  className = '',
  showIcons = true,
  maxLabelWidth = '200px',
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex items-center text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrentPage = item.isCurrentPage ?? !item.href;
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {/* Separator (not for first item) */}
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-white/40 mx-1" aria-hidden="true" />
              )}

              {/* Breadcrumb content */}
              {isCurrentPage || !item.href ? (
                // Current page (non-clickable)
                <span
                  className="flex items-center gap-1.5 text-white font-medium"
                  aria-current="page"
                >
                  {showIcons && Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                  <span
                    className={isLast ? `truncate` : ''}
                    style={isLast ? { maxWidth: maxLabelWidth } : undefined}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                </span>
              ) : (
                // Clickable link
                <Link
                  to={item.href}
                  className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
                >
                  {showIcons && Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                  <span className="hidden sm:inline">{item.label}</span>
                  {/* Show icon-only on mobile for first item (Dashboard) */}
                  {index === 0 && !showIcons && (
                    <span className="sm:hidden">{item.label}</span>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default AppBreadcrumb;
