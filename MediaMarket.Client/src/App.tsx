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
import AuthPage from "./pages/AuthPage";
import AgencyDashboard from "./pages/AgencyDashboard";
import MediaDashboard from "./pages/MediaDashboard";
import AddOffer from "./pages/AddOffer";
import AdminDashboard from "./pages/AdminDashboard";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/offers" element={<OffersListing />} />
                <Route path="/offers/:id" element={<OfferDetail />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/agency" element={<AgencyDashboard />} />
                <Route path="/media" element={<MediaDashboard />} />
                <Route path="/media/offers/new" element={<AddOffer />} />
                <Route path="/admin" element={<AdminDashboard />} />
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
