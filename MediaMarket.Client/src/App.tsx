import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Landing from "./pages/Landing";
import OffersListing from "./pages/OffersListing";
import OfferDetail from "./pages/OfferDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AgencyDashboard from "./pages/AgencyDashboard";
import MediaDashboard from "./pages/MediaDashboard";
import AddOffer from "./pages/AddOffer";
import AdminDashboard from "./pages/AdminDashboard";
import TermsPage from "./pages/TermsPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import AuthInitializer from "./components/AuthInitializer";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Komponenta na zachytenie Supabase redirectu
const SupabaseRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skontroluj, či je v hash access_token (Supabase email verification alebo reset password redirect)
    const hash = window.location.hash;
    if (hash && location.pathname === '/') {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      // Ak je access_token a type=signup, presmeruj na verify-email
      if (accessToken && type === 'signup') {
        // Presmeruj na verify-email s hash parametrami
        window.location.href = `/verify-email${hash}`;
      }
      // Ak je access_token a type=recovery, presmeruj na reset-password
      else if (accessToken && type === 'recovery') {
        // Presmeruj na reset-password s hash parametrami
        window.location.href = `/reset-password${hash}`;
      }
    }
  }, [location, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <SupabaseRedirectHandler />
          <AuthInitializer />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/offers" element={<OffersListing />} />
                <Route path="/offers/:id" element={<OfferDetail />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/agency" element={<AgencyDashboard />} />
                <Route path="/media" element={<MediaDashboard />} />
                <Route path="/media/offers/new" element={<AddOffer />} />
                <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/verify-email" element={<VerifyEmailPage />} />
                          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="/reset-password" element={<ResetPasswordPage />} />
                          <Route path="/terms" element={<TermsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
