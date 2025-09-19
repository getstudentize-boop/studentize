import { useRef, useState } from "react";

export const useTableHeight = () => {
  const [tableHeight, setTableHeight] = useState(0);

  const tableRef = useRef<HTMLDivElement>(null);

  const handleRef = (r: HTMLDivElement | null) => {
    if (!r || !!tableHeight) return;
    setTableHeight(r.clientHeight);
  };

  return { tableHeight, tableRef, handleRef };
};
