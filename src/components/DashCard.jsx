export function DashCard({ title, subtitle, icon: Icon, children, actions, className = "" }) {
  return (
    <div className={`card ${className}`}>
        
      {/* Header */}
      <div className="mb-4">
        <h3 className="flex items-center gap-2 pb-1">
          {Icon && <Icon className="text-xl" color="var(--primary)" />}
          {title}
        </h3>
        {subtitle && <p className="text-gray-500 pb-2">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="mb-4">
        {children}
      </div>

      {/* Actions (buttons) */}
      {actions && (
        <div className="inline-flex flex-wrap gap-2 pt-2">
          {actions}
        </div>
      )}

    </div>
  );
}