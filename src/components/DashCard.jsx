export function DashCard({ title, subtitle, icon, children, onButtonClick }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {icon && <span className="card-icon">{icon}</span>}
          {title}
        </h3>
        <p className="card-subtitle">{subtitle}</p>
      </div>

      <div className="card-content">
        {children}
      </div>
    </div>
  );
}
