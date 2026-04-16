export default function EmptyState({ title }: { title: string }) {
  return (
    <div className="text-center text-gray-500 py-6">
      {title}
    </div>
  );
}