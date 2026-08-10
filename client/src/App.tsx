import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import { SiteLayout } from "./components/site/SiteLayout";
import { startLogin } from "@/const";

import Home from "./pages/Home";
import Founder from "./pages/Founder";
import BrandStory from "./pages/BrandStory";
import GuitarList from "./pages/GuitarList";
import GuitarDetail from "./pages/GuitarDetail";
import AccessoriesList from "./pages/AccessoriesList";
import AccessoryDetail from "./pages/AccessoryDetail";
import Catalog from "./pages/Catalog";
import Gallery from "./pages/Gallery";
import Dealers from "./pages/Dealers";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import TrackOrder from "./pages/TrackOrder";
import OrderConfirm from "./pages/OrderConfirm";
import Admin from "./pages/Admin";
import Marketplace from "./pages/Marketplace";
import MarketplaceNew from "./pages/MarketplaceNew";
import MarketplaceDetail from "./pages/MarketplaceDetail";
import MyListings from "./pages/MyListings";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/founder" component={Founder} />
      <Route path="/brand-story" component={BrandStory} />
      <Route path="/guitar" component={GuitarList} />
      <Route path="/guitar/:code" component={GuitarDetail} />
      <Route path="/accessories" component={AccessoriesList} />
      <Route path="/accessories/:code" component={AccessoryDetail} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/dealers" component={Dealers} />
      <Route path="/contact" component={Contact} />
      <Route path="/shop" component={Shop} />
      <Route path="/orders/track" component={TrackOrder} />
      <Route path="/orders/confirm" component={OrderConfirm} />
      <Route path="/admin" component={Admin} />
      
      {/* Route สำหรับจัดการหน้า Login */}
      <Route path="/login">
        {() => {
          if (typeof startLogin === "function") {
            startLogin();
          } else {
            window.location.href = "/api/oauth/login";
          }
          return null;
        }}
      </Route>

      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/new" component={MarketplaceNew} />
      <Route path="/marketplace/my-listings" component={MyListings} />
      <Route path="/marketplace/:id" component={MarketplaceDetail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LocaleProvider>
          <TooltipProvider>
            <Toaster />
            <ScrollToTop />
            <SiteLayout>
              <Router />
            </SiteLayout>
          </TooltipProvider>
        </LocaleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;