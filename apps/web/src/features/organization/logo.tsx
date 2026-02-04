import { ComponentProps } from "react";

const organizationLogoMap = {
  dn8br0q0b8wed8b3wni4u1yf:
    "https://studyco.com/wp-content/uploads/2024/09/Logo-New-01-800x800.png",
};

type ImageProps = ComponentProps<"img"> & {
  organizationId?: string;
};

export const OrganizationLogo = ({ organizationId, ...props }: ImageProps) => {
  return (
    <img
      src={
        organizationLogoMap[
          organizationId as keyof typeof organizationLogoMap
        ] ?? "/logo.png"
      }
      alt={props.alt}
      {...props}
    />
  );
};
