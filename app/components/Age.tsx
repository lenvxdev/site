import { Tooltip } from "./Tooltip";

const BIRTH_YEAR = 2011;

export function Age() {
  const now = new Date().getFullYear();
  const age = now - BIRTH_YEAR;
  return (
    <Tooltip content={`${now} − ${BIRTH_YEAR} = ${age}`}>
      {age}
    </Tooltip>
  );
}
