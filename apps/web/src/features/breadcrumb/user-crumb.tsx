import { Loader } from "@/components/loader";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { ComponentProps } from "react";

type Props = { userId: string } & ComponentProps<"span">;

export const UserCrumb = ({ userId, ...props }: Props) => {
  const userQuery = useQuery(
    orpc.user.getName.queryOptions({ input: { userId } })
  );

  const user = userQuery.data;

  if (userQuery.isPending) {
    return <Loader className="w-24" />;
  }

  return <span {...props}>{user?.name}</span>;
};
