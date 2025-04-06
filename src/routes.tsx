import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./Layout";
import ManageCompany from "./pages/ManageCompany";
import ManageUsers from "./pages/ManageUsers";
import ChangePassword from "./pages/ResetPassword";
import DashboardWrapper from "./component/DashboardWrapper";
import AddCompany from "./pages/AddCompany";
import AddUser from "./pages/AddUser";
import WindWrapperPage from "./pages/WindWrapperPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

      

        <Route path="" element={<Layout />}>
          <Route
            path="external-tracking/:containerId"
            element={<WindWrapperPage />}
          />
          <Route path="dashboard" element={<DashboardWrapper />} />
          <Route path="manage-company" element={<ManageCompany />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="/add-company" element={<AddCompany />} />
          <Route path="/add-user" element={<AddUser />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
