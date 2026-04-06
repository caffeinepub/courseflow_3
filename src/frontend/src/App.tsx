import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminCourseEditorPage } from "@/pages/AdminCourseEditorPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { CertificateVerifyPage } from "@/pages/CertificateVerifyPage";
import { CourseDetailPage } from "@/pages/CourseDetailPage";
import { CoursePlayerPage } from "@/pages/CoursePlayerPage";
import { CoursesPage } from "@/pages/CoursesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ReferralDashboardPage } from "@/pages/ReferralDashboardPage";
import { SignupPage } from "@/pages/SignupPage";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

// Root layout with providers
function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <Outlet />
          <Toaster position="top-right" richColors closeButton />
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Layout with Navbar + Footer
function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

// Full-screen layout (no nav/footer)
function FullScreenLayout() {
  return <Outlet />;
}

// 404 Not Found
function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-5 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm">
          The page you're looking for doesn't exist.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

// Pricing placeholder
function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-foreground mb-3">Pricing</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Each course is individually priced. Browse our catalog to find the right
        course for you.
      </p>
      <Link to="/courses">
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Browse Courses
        </button>
      </Link>
    </div>
  );
}

// About placeholder
function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-3xl font-bold text-foreground mb-3">
        About CourseFlow
      </h1>
      <p className="text-muted-foreground leading-relaxed">
        CourseFlow is a modern online learning platform dedicated to providing
        high-quality education for everyone. Our mission is to make world-class
        learning accessible, affordable, and enjoyable.
      </p>
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({ component: RootLayout });

const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main",
  component: MainLayout,
});
const fullScreenLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "fullscreen",
  component: FullScreenLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/",
  component: HomePage,
});
const coursesRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/courses",
  component: CoursesPage,
});
const courseDetailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/courses/$id",
  component: CourseDetailPage,
});
const loginRoute = createRoute({
  getParentRoute: () => fullScreenLayoutRoute,
  path: "/login",
  component: LoginPage,
});
const signupRoute = createRoute({
  getParentRoute: () => fullScreenLayoutRoute,
  path: "/signup",
  component: SignupPage,
});
const profileRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});
const dashboardRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});
const pricingRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/pricing",
  component: PricingPage,
});
const aboutRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/about",
  component: AboutPage,
});
const adminRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/admin",
  component: AdminDashboardPage,
});
const adminNewCourseRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/admin/courses/new",
  component: AdminCourseEditorPage,
});
const adminEditCourseRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/admin/courses/$id/edit",
  component: AdminCourseEditorPage,
});
const referralRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/referral",
  component: ReferralDashboardPage,
});
const verifyRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: "/verify",
  component: CertificateVerifyPage,
});
const playerRoute = createRoute({
  getParentRoute: () => fullScreenLayoutRoute,
  path: "/learn/$courseId/$lessonId",
  component: CoursePlayerPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
    homeRoute,
    coursesRoute,
    courseDetailRoute,
    profileRoute,
    dashboardRoute,
    pricingRoute,
    aboutRoute,
    adminRoute,
    adminNewCourseRoute,
    adminEditCourseRoute,
    referralRoute,
    verifyRoute,
  ]),
  fullScreenLayoutRoute.addChildren([loginRoute, signupRoute, playerRoute]),
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
