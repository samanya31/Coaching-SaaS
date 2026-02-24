import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Faculty from "./pages/Faculty";
import Results from "./pages/Results";
import DemoClasses from "./pages/DemoClasses";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Student Portal
import { StudentLogin } from "./pages/student/Login";
import { StudentLoginTest } from "./pages/student/LoginTest";
import { StudentLayout } from "./components/student/StudentLayout";
import { StudentLoginRoute } from "./components/student/StudentLoginRoute";
import { StudentDashboard } from "./pages/student/Dashboard";
import { StudentCourses } from "./pages/student/Courses";
import { StudentLiveClasses } from "./pages/student/LiveClasses";
import { StudentTests } from "./pages/student/Tests";
import { TakeTest } from "./pages/student/TakeTest";
import { TestResult } from "./pages/student/TestResult";
import { StudentMaterials } from "./pages/student/Materials";
import { StudentPerformance } from "./pages/student/Performance";
import { StudentSettings } from './pages/student/Settings';
import { StudentPayments } from '@/pages/student/Payments';
import { StudentHelp } from './pages/student/Help';
import { Batches } from "./pages/student/Batches";
import { BatchDetail } from "./pages/student/BatchDetail";
import { VideoPlayerPage } from "./pages/student/VideoPlayerPage";
import { AuthProvider } from "./contexts/AuthContext";
import { ExamGoalProvider } from "./contexts/ExamGoalContext";
import { MobileRedirect } from "./components/MobileRedirect";
import { TenantProvider } from "./app/providers/TenantProvider";

// Admin Portal
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AdminLoginRoute } from "./components/admin/AdminLoginRoute";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { Students } from '@/pages/admin/Students';
import { StudentForm } from '@/pages/admin/StudentForm';
import { Leads } from '@/pages/admin/Leads';
import { StudentDetail } from '@/pages/admin/StudentDetail';
import { Batches as AdminBatches } from "./pages/admin/Batches";
import { BatchDetail as AdminBatchDetail } from "./pages/admin/BatchDetail";
import { BatchForm } from "./pages/admin/BatchForm";
import { Website } from "./pages/admin/Website";
import { BannerForm } from "./pages/admin/BannerForm";
import { Content } from "./pages/admin/Content";
import { ContentForm } from "./pages/admin/ContentForm";
import { LiveClasses } from "./pages/admin/LiveClasses";
import { LiveClassForm } from "./pages/admin/LiveClassForm";
import { Finance } from "./pages/admin/Finance";
import { Settings } from "./pages/admin/Settings";
import { Tests } from "./pages/admin/Tests";
import { TestForm } from "./pages/admin/TestForm";
import { Announcements } from "./pages/admin/Announcements";
import { AnnouncementForm } from "./pages/admin/AnnouncementForm";
import { Instructors } from "./pages/admin/Instructors";
import { InstructorForm } from "./pages/admin/InstructorForm";
import { Reports } from "./pages/admin/Reports";
import { IDCardGenerator } from "./pages/admin/IDCardGenerator";
import { AdminLogin } from "./pages/admin/Login";
import { SupportTickets } from "./pages/admin/SupportTickets";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MobileRedirect />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/results" element={<Results />} />
            <Route path="/demo-classes" element={<DemoClasses />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

            {/* Student Portal Routes */}
            <Route path="/student/login" element={
              <StudentLoginRoute>
                <TenantProvider>
                  <StudentLogin />
                </TenantProvider>
              </StudentLoginRoute>
            } />
            <Route path="/student/login-test" element={
              <StudentLoginRoute>
                <TenantProvider>
                  <StudentLoginTest />
                </TenantProvider>
              </StudentLoginRoute>
            } />
            <Route
              path="/student/dashboard"
              element={
                <TenantProvider>
                  <ExamGoalProvider>
                    <StudentLayout />
                  </ExamGoalProvider>
                </TenantProvider>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="batches" element={<Batches />} />
              <Route path="batch/:batchId" element={<BatchDetail />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="live-classes" element={<StudentLiveClasses />} />
              <Route path="tests" element={<StudentTests />} />
              <Route path="tests/:id/take" element={<TakeTest />} />
              <Route path="tests/:id/result" element={<TestResult />} />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="materials" element={<StudentMaterials />} />
              <Route path="profile" element={<StudentSettings />} />
              <Route path="help" element={<StudentHelp />} />
            </Route>

            <Route path="/student/player/:id" element={
              <TenantProvider>
                <VideoPlayerPage />
              </TenantProvider>
            } />

            {/* Admin Portal Routes */}
            <Route path="/admin/login" element={
              <AdminLoginRoute>
                <AdminLogin />
              </AdminLoginRoute>
            } />

            <Route element={<AdminProtectedRoute />}>
              <Route
                path="/admin/dashboard"
                element={
                  <TenantProvider>
                    <AdminLayout />
                  </TenantProvider>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="students/new" element={<StudentForm />} />
                <Route path="leads" element={<Leads />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="students/:id/edit" element={<StudentForm />} />
                <Route path="students/:id/id-card" element={<IDCardGenerator />} />
                <Route path="batches" element={<AdminBatches />} />
                <Route path="batches/new" element={<BatchForm />} />
                <Route path="batches/:id" element={<AdminBatchDetail />} />
                <Route path="batches/:id/edit" element={<BatchForm />} />
                <Route path="website" element={<Website />} />
                <Route path="website/new" element={<BannerForm />} />
                <Route path="website/:id/edit" element={<BannerForm />} />
                <Route path="content" element={<Content />} />
                <Route path="content/new" element={<ContentForm />} />
                <Route path="content/:id/edit" element={<ContentForm />} />
                <Route path="live-classes" element={<LiveClasses />} />
                <Route path="live-classes/new" element={<LiveClassForm />} />
                <Route path="live-classes/:id/edit" element={<LiveClassForm />} />
                <Route path="tests" element={<Tests />} />
                <Route path="tests/new" element={<TestForm />} />
                <Route path="tests/:id/edit" element={<TestForm />} />
                <Route path="payments" element={<Finance />} />
                <Route path="settings" element={<Settings />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="announcements/new" element={<AnnouncementForm />} />
                <Route path="announcements/:id/edit" element={<AnnouncementForm />} />
                <Route path="instructors" element={<Instructors />} />
                <Route path="instructors/new" element={<InstructorForm />} />
                <Route path="instructors/:id/edit" element={<InstructorForm />} />
                <Route path="reports" element={<Reports />} />
                <Route path="support-tickets" element={<SupportTickets />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
