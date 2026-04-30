export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      mata_pelajaran: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          kelompok: Database["public"]["Enums"]["kelompok_mapel"]
          kode: string
          nama: string
          updated_at: string
          urutan: number
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          kelompok?: Database["public"]["Enums"]["kelompok_mapel"]
          kode: string
          nama: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          kelompok?: Database["public"]["Enums"]["kelompok_mapel"]
          kode?: string
          nama?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      nilai: {
        Row: {
          created_at: string
          id: string
          mapel_id: string
          nilai_akhir: number | null
          sem1: number | null
          sem2: number | null
          sem3: number | null
          sem4: number | null
          sem5: number | null
          sem6: number | null
          siswa_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mapel_id: string
          nilai_akhir?: number | null
          sem1?: number | null
          sem2?: number | null
          sem3?: number | null
          sem4?: number | null
          sem5?: number | null
          sem6?: number | null
          siswa_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mapel_id?: string
          nilai_akhir?: number | null
          sem1?: number | null
          sem2?: number | null
          sem3?: number | null
          sem4?: number | null
          sem5?: number | null
          sem6?: number | null
          siswa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nilai_mapel_id_fkey"
            columns: ["mapel_id"]
            isOneToOne: false
            referencedRelation: "mata_pelajaran"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nilai_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      pengaturan: {
        Row: {
          alamat: string
          bentuk_pendidikan: string | null
          created_at: string
          id: string
          jenjang: string | null
          judul_pengumuman: string | null
          kabupaten: string | null
          kecamatan: string | null
          kelurahan: string | null
          kepala_sekolah: string
          nama_sekolah: string
          nip_kepala: string | null
          npsn: string
          pengumuman_dibuka: boolean
          pesan_pengumuman: string | null
          provinsi: string | null
          status_sekolah: string | null
          tahun_pelajaran: string | null
          tanggal_pengumuman: string | null
          updated_at: string
          url_validasi_base: string | null
        }
        Insert: {
          alamat?: string
          bentuk_pendidikan?: string | null
          created_at?: string
          id?: string
          jenjang?: string | null
          judul_pengumuman?: string | null
          kabupaten?: string | null
          kecamatan?: string | null
          kelurahan?: string | null
          kepala_sekolah?: string
          nama_sekolah?: string
          nip_kepala?: string | null
          npsn?: string
          pengumuman_dibuka?: boolean
          pesan_pengumuman?: string | null
          provinsi?: string | null
          status_sekolah?: string | null
          tahun_pelajaran?: string | null
          tanggal_pengumuman?: string | null
          updated_at?: string
          url_validasi_base?: string | null
        }
        Update: {
          alamat?: string
          bentuk_pendidikan?: string | null
          created_at?: string
          id?: string
          jenjang?: string | null
          judul_pengumuman?: string | null
          kabupaten?: string | null
          kecamatan?: string | null
          kelurahan?: string | null
          kepala_sekolah?: string
          nama_sekolah?: string
          nip_kepala?: string | null
          npsn?: string
          pengumuman_dibuka?: boolean
          pesan_pengumuman?: string | null
          provinsi?: string | null
          status_sekolah?: string | null
          tahun_pelajaran?: string | null
          tanggal_pengumuman?: string | null
          updated_at?: string
          url_validasi_base?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nama: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nama?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nama?: string
        }
        Relationships: []
      }
      siswa: {
        Row: {
          created_at: string
          id: string
          jenis_kelamin: string | null
          jurusan: string | null
          kelas: string | null
          nama: string
          nama_orang_tua: string | null
          nis: string | null
          nisn: string
          no_peserta_ujian: string | null
          no_seri_ijazah: string | null
          status_lulus: boolean
          tanggal_lahir: string | null
          tanggal_lulus: string | null
          tempat_lahir: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          jurusan?: string | null
          kelas?: string | null
          nama: string
          nama_orang_tua?: string | null
          nis?: string | null
          nisn: string
          no_peserta_ujian?: string | null
          no_seri_ijazah?: string | null
          status_lulus?: boolean
          tanggal_lahir?: string | null
          tanggal_lulus?: string | null
          tempat_lahir?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          jurusan?: string | null
          kelas?: string | null
          nama?: string
          nama_orang_tua?: string | null
          nis?: string | null
          nisn?: string
          no_peserta_ujian?: string | null
          no_seri_ijazah?: string | null
          status_lulus?: boolean
          tanggal_lahir?: string | null
          tanggal_lulus?: string | null
          tempat_lahir?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      kelompok_mapel: "A" | "B" | "Peminatan" | "Lintas Minat"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      kelompok_mapel: ["A", "B", "Peminatan", "Lintas Minat"],
    },
  },
} as const
