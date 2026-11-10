import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AuthGuard } from "./components/AuthGuard";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadVideoPage } from "./pages/UploadVideoPage";
import { VideoListPage } from "./pages/VideoListPage";
import { VideoDetailPage } from "./pages/VideoDetailPage";
import { ProtectedRoute, GuestRoute, RoleRoute } from "./components/RouteGuards";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        }
      />
      <Route
        path="/upload-video"
        element={
          <ProtectedRoute><RoleRoute role="docente"><UploadVideoPage /></RoleRoute></ProtectedRoute>
        }
      />
      <Route
        path="/manage-videos"
        element={
          <ProtectedRoute><VideoListPage /></ProtectedRoute>
        }
      />
      <Route
        path="/videos/:id"
        element={
          <ProtectedRoute><VideoDetailPage /></ProtectedRoute>
        }
      />
      <Route path="/403" element={<AccessDeniedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
