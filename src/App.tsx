import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import HasilSiswa from "./pages/HasilSiswa";
import SKLPage from "./pages/SKLPage";
import Validasi from "./pages/Validasi";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SiswaPage from "./pages/admin/SiswaPage";
import MapelPage from "./pages/admin/MapelPage";
import NilaiPage from "./pages/admin/NilaiPage";
import PengaturanPage from "./pages/admin/PengaturanPage";
import CetakMassal from "./pages/admin/CetakMassal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
