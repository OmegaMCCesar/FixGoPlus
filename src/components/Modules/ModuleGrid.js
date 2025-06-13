import ModuleCard from './ModuleCard';

const ModuleGrid = ({ modules }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {modules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
};

export default ModuleGrid;
