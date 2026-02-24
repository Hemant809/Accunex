import { useAuth } from "../../context/AuthContext";
import AdminProfile from "./AdminProfile";
import AccountantProfile from "./AccountantProfile";
import StaffProfile from "./StaffProfile";

export default function ProfileRouter() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") return <AdminProfile />;
  if (user.role === "accountant") return <AccountantProfile />;
  if (user.role === "staff") return <StaffProfile />;

  return <div>Unauthorized</div>;
}
