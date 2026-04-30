import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, ClipboardList, Settings, Printer, LogOut, LayoutDashboard } from "lucide-react";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/siswa", label: "Data Siswa", icon: Users },
  { to: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpen },
  { to: "/admin/nilai", label: "Input Nilai", icon: ClipboardList },
  { to: "/admin/cetak", label: "Cetak SKL Massal", icon: Printer },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center text-center p-6">
      <div>
        <p className="font-serif text-xl mb-2">Akses ditolak</p>
        <p className="text-muted-foreground mb-4">Akun Anda bukan admin.</p>
        <Button onClick={() => { signOut(); navigate("/admin/login"); }}>Keluar</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gold flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-gold-foreground" />
            </div>
            <div>
              <div className="font-serif text-sm font-bold leading-tight">SKL Admin</div>
              <div className="text-[10px] opacity-70">SMA Muh. 01 PLG</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent"
                }`
              }
            >
              <it.icon className="h-4 w-4" /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs px-2 mb-2 truncate opacity-70">{user.email}</div>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
