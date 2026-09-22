export function SearchBox({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/" method="GET" className="flex gap-2">
      <input
        type="text"
        name="keyword"
        defaultValue={defaultValue}
        placeholder="記事を検索"
        className="input input-bordered input-sm flex-1"
      />
      <button
        type="submit"
        className="btn btn-sm btn-outline"
        aria-label="検索"
      >
        検索
      </button>
    </form>
  );
}
