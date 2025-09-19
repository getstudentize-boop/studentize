import { ReactNode } from "react";

export const Repeat = ({
  component,
  times,
}: {
  component: ReactNode;
  times: number;
}) => {
  return <>{Array.from({ length: times }, (_, i) => component)}</>;
};
