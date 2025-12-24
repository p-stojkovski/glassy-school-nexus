import React, { useId } from 'react';

interface LabeledSelectProps {
  label: React.ReactNode;
  labelId?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  /** Optional helper text rendered below the select */
  helper?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Small wrapper to consistently render a label above a Select (or any control).
 * It intentionally doesn't attempt to mutate children; callers should add
 * aria-labelledby to the interactive element (e.g. the SelectTrigger) using
 * the generated label id when necessary.
 */
const LabeledSelect: React.FC<LabeledSelectProps> = ({
  label,
  labelId,
  labelClassName = 'text-xs text-white/50 font-medium',
  wrapperClassName = '',
  helper,
  children,
}) => {
  const autoId = useId();
  const finalLabelId = labelId ?? `labeled-select-label-${autoId}`;

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`.trim()}>
      <span id={finalLabelId} className={labelClassName}>
        {label}
      </span>

      {children}

      {helper && <span className="text-xs text-white/50">{helper}</span>}
    </div>
  );
};

export default LabeledSelect;
