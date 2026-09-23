import type { Governorate } from "../types";

export const stripGovernorateSuffix = (s: string) =>
  s.replace(/governorate|محافظة/gi, "").trim().toLowerCase();

export function matchGovernorateByName(
  city: string,
  state: string,
  governorates: Governorate[],
): Governorate | undefined {
  const pickedCity = stripGovernorateSuffix(city);
  const pickedState = stripGovernorateSuffix(state);
  return governorates.find((g) => {
    const name = stripGovernorateSuffix(g.name);
    return name === pickedCity || name === pickedState ||
      (pickedCity.length > 0 && (name.includes(pickedCity) || pickedCity.includes(name))) ||
      (pickedState.length > 0 && (name.includes(pickedState) || pickedState.includes(name)));
  });
}
