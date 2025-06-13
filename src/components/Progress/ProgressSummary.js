
const ProgressSummary = ({ xp }) => {
  return (
    <div className="mt-10 md:mt-12 p-6 md:p-8 bg-neutral-white rounded-2xl shadow-xl border border-neutral-medium">
      <h2 className="text-2xl font-semibold text-brand-blue mb-3">Tu Progreso General</h2>
      <div className="space-y-2">
        <p className="text-text-secondary">
          Aquí se mostrará un resumen de tu avance y logros en FixGo.
        </p>
        <p className="text-text-primary">
          <strong className="font-medium text-text-secondary">Puntos XP Totales:</strong>{' '}
          <span className="font-bold text-accent-orange">{xp ?? 0}</span>
        </p>
      </div>
    </div>
  );
};

export default ProgressSummary;
