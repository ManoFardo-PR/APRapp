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
import AprList from "./pages/AprList";
import NewApr from "./pages/NewApr";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingMain} />
      <Route path="/empresa/:code" component={LandingCompany} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/aprs" component={AprList} />
      <Route path="/aprs/new" component={NewApr} />
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
