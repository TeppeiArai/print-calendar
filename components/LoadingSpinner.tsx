export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
