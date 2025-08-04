export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
          status: "Pending" | "Approved" | "Rejected";
          created_at: string;
          department: string | null;
          phone_number: string | null;
        };
        Insert: {
          id?: number;
          first_name?: string;
          last_name?: string;
          email?: string;
          status?: "Pending" | "Approved" | "Rejected";
          created_at?: string;
          department?: string | null;
          phone_number?: string | null;
        };
        Update: {
          id?: number;
          first_name?: string;
          last_name?: string;
          email?: string;
          status?: "Pending" | "Approved" | "Rejected";
          created_at?: string;
          department?: string | null;
          phone_number?: string | null;
        };
        Relationships: [];
      };
    };
    Views: object;
    Functions: object;
    Enums: object;
  };
}
