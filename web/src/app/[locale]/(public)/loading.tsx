export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Đang tải nội dung / Loading content"
      className="mx-auto max-w-7xl px-8 py-20"
    >
      <div aria-hidden="true" className="h-10 w-2/5 bg-stone-200" />
      <div aria-hidden="true" className="mt-8 h-5 w-3/5 bg-stone-200" />
      <div aria-hidden="true" className="mt-3 h-5 w-1/2 bg-stone-200" />
      <span className="sr-only">Đang tải nội dung / Loading content</span>
    </div>
  );
}
