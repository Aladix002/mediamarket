import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
