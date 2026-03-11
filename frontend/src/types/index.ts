export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  Bio?: string;
  soicalLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UserPrefernces {
  theme: "dawn" | "noon" | "golden" | "night"; //string literal union
  isAudioEnabled: boolean;
}

export interface User extends BaseUser {
  preferences: UserPrefernces;
}
