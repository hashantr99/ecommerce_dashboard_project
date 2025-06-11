const SkeletonCard = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  export default SkeletonCard;