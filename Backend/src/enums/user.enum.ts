export const GenderEnum = {
  MALE: "Male",
  FEMALE: "Female",
  NONBINARY: "Nonbinary",
} as const;

export type GenderEnumType = keyof typeof GenderEnum;
