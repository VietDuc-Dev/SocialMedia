export const AudienceEnum = {
  USER: "User",
  ADMIN: "Admin",
} as const;

export const GenderEnum = {
  MALE: "Male",
  FEMALE: "Female",
  NONBINARY: "Nonbinary",
} as const;

export type AudienceEnumType = keyof typeof AudienceEnum;
export type GenderEnumType = keyof typeof GenderEnum;
