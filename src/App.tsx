import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index.tsx";

const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const HasilSiswa = lazy(() => import("./pages/HasilSiswa"));
const SKLPage = lazy(() => import("./pages/SKLPage"));
const Validasi = lazy(() => import("./pages/Validasi"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SiswaPage = lazy(() => import("./pages/admin/SiswaPage"));
const MapelPage = lazy(() => import("./pages/admin/MapelPage"));
const NilaiPage = lazy(() => import("./pages/admin/NilaiPage"));
const PengaturanPage = lazy(() => import("./pages/admin/PengaturanPage"));
const CetakMassal = lazy(() => import("./pages/admin/CetakMassal"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Memuat...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/hasil/:nisn" element={<HasilSiswa />} />
            <Route path="/skl/:nisn" element={<SKLPage />} />
            <Route path="/validasi/:nisn" element={<Validasi />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="siswa" element={<SiswaPage />} />
              <Route path="mapel" element={<MapelPage />} />
              <Route path="nilai" element={<NilaiPage />} />
              <Route path="cetak" element={<CetakMassal />} />
              <Route path="pengaturan" element={<PengaturanPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
