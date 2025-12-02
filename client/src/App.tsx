import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import LandingMain from "./pages/LandingMain";
import LandingCompany from "./pages/LandingCompany";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import GlobalUserManagement from "@/pages/GlobalUserManagement";
import ManageUsers from "./pages/ManageUsers";
import AprList from "./pages/AprList";
import NewApr from "./pages/NewApr";
import AprDetail from "./pages/AprDetail";
import PendingApprovals from "./pages/PendingApprovals";
import Statistics from "./pages/Statistics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingMain} />
      <Route path="/empresa/:code" component={LandingCompany} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/dashboard" component={SuperAdminDashboard} />
      <Route path="/admin/users" component={GlobalUserManagement} />
      <Route path="/company/users" component={ManageUsers} />
      <Route path="/aprs" component={AprList} />
      <Route path="/aprs/new" component={NewApr} />
      <Route path="/aprs/pending" component={PendingApprovals} />
      <Route path="/aprs/:id" component={AprDetail} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
