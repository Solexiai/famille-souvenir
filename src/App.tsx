import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SupabaseConfigurationAlert } from "@/components/SupabaseConfigurationAlert";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import SetupPage from "./pages/SetupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import CirclePage from "./pages/CirclePage";
import MembersPage from "./pages/MembersPage";
import MemoriesPage from "./pages/MemoriesPage";
import DocumentsPage from "./pages/DocumentsPage";
import GovernancePage from "./pages/GovernancePage";
import ChecklistPage from "./pages/ChecklistPage";
import ExecutorPage from "./pages/ExecutorPage";
import VaultPage from "./pages/VaultPage";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import PricingPage from "./pages/PricingPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <AuthProvider>
        <TooltipProvider>
          <SupabaseConfigurationAlert />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/invitation/accept" element={<AcceptInvitationPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected routes */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/circle" element={<ProtectedRoute><CirclePage /></ProtectedRoute>} />
              <Route path="/circle/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
              <Route path="/governance" element={<ProtectedRoute><GovernancePage /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
              <Route path="/checklist" element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} />
              <Route path="/memories" element={<ProtectedRoute><MemoriesPage /></ProtectedRoute>} />
              <Route path="/executor" element={<ProtectedRoute><ExecutorPage /></ProtectedRoute>} />
              <Route path="/vault" element={<ProtectedRoute><VaultPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LocaleProvider>
  </QueryClientProvider>
);

export default App;
