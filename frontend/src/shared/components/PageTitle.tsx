import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function PageTitle({ children }: Props) {
  return (
    <h1 className="mb-10 border-b border-base-300 pb-5 text-2xl font-bold tracking-wide">
      {children}
    </h1>
  );
}
