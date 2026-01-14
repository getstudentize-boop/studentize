import { Loader } from "./loader";

export const CardSkeleton = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="border border-zinc-200 rounded-xl bg-white shadow-sm">
      <div className="p-5 flex flex-col gap-3">
        <Loader className="w-40 h-6" />
        <Loader className="w-32 h-5" />
        <div className="flex gap-2">
          <Loader className="w-20 h-5" />
          <Loader className="w-16 h-5" />
        </div>
      </div>
      <div className="px-4 py-3 border-t border-zinc-100 flex justify-center gap-4 items-center bg-zinc-50/50 rounded-b-xl">
        <Loader className="w-36 h-6" />
      </div>
      {children}
    </div>
  );
};

export const TableSkeleton = ({ columns = 6, rows = 8 }: { columns?: number; rows?: number }) => {
  const cols = Array.from({ length: columns });
  const rowsArr = Array.from({ length: rows });

  return (
    <table className="w-full">
      <thead>
        <tr>
          {cols.map((_, i) => (
            <th key={i} className="text-left pb-2">
              <Loader className="w-32 h-4" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rowsArr.map((_, r) => (
          <tr key={r} className="odd:bg-white even:bg-zinc-50">
            {cols.map((_, c) => (
              <td key={c} className="py-3 pr-4">
                <Loader />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const TableSkeletonBody = ({ columns = 6, rows = 8 }: { columns?: number; rows?: number }) => {
  const cols = Array.from({ length: columns });
  const rowsArr = Array.from({ length: rows });

  return (
    <>
      {rowsArr.map((_, r) => (
        <tr key={r} className="odd:bg-white even:bg-zinc-50">
          {cols.map((_, c) => (
            <td key={c} className="py-3 pr-4">
              <Loader />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
