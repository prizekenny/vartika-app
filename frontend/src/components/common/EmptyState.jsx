// components/common/EmptyState.jsx

const EmptyState = ({ message = "No data found.", icon = null }) => {
  return (
    <div className="text-center py-10 text-gray-400 space-y-2">
      {icon && <div className="flex justify-center text-4xl">{icon}</div>}
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
