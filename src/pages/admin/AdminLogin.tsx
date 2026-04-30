import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login Admin — SKL";
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/admin");
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { nama }, emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Silakan login.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login berhasil");
        navigate("/admin");
      }
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link to="/"><Button variant="ghost" className="text-primary-foreground hover:bg-primary-glow"><ArrowLeft className="h-4 w-4 mr-2" />Beranda</Button></Link>
      </div>
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-3 shadow-gold">
            <GraduationCap className="h-7 w-7 text-gold-foreground" />
          </div>
          <h1 className="font-serif text-2xl">Panel Admin SKL</h1>
          <p className="text-sm text-muted-foreground">SMA Muhammadiyah 01 Palembang</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium">Nama</label>
              <Input value={nama} onChange={(e) => setNama(e.target.value)} required maxLength={100} />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-hero h-11">
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </Button>
        </form>

        <div className="text-center mt-4 text-sm text-muted-foreground">
          {mode === "login" ? (
            <>Belum ada akun admin?{" "}
              <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Daftar admin pertama</button>
            </>
          ) : (
            <>Sudah punya akun?{" "}
              <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Masuk</button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">Pendaftar pertama otomatis menjadi admin.</p>
      </Card>
    </div>
  );
};

export default AdminLogin;
