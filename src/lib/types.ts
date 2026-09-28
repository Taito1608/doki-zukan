export type Profile = {
  id: string;
  display_name: string;
  photo_path: string | null;
  job_type: string | null;
  hometown: string | null;
  hobbies: string[];
  birth_month: number | null;
  birth_day: number | null;
  message: string | null;
  updated_at: string;
};

/** 署名付きの写真URLを付けたプロフィール */
export type ProfileWithPhoto = Profile & { photo_url: string | null };

export type Member = {
  id: string;
  is_admin: boolean;
  joined_at: string;
};

export type BirthdayMessage = {
  id: string;
  to_user_id: string;
  from_user_id: string;
  year: number;
  body: string;
  created_at: string;
  updated_at: string;
};
