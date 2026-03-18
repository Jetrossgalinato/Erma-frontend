export type NavbarUserData = {
  email: string;
  first_name?: string;
  last_name?: string;
  acc_role?: string;
};

export type PersonalNotification = {
  id: string;
  title: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};
