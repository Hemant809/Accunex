import { useState, useEffect } from "react";
import { Phone, Mail, User, MoreVertical, X, Plus, Eye } from "lucide-react";
import axios from "axios";

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editStaff, setEditStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", mobile: "", role: "staff", department: "" });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const addStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/staff", newStaff, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewStaff({ name: "", email: "", mobile: "", role: "staff", department: "" });
      setShowAddModal(false);
      fetchStaff();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding staff");
    }
  };

  const toggleMenu = (id) => setMenuOpenId(menuOpenId === id ? null : id);

  const deleteStaff = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStaff();
    } catch (error) {
      alert("Error deleting staff");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/staff/${id}`, 
        { status: currentStatus === "Active" ? "Inactive" : "Active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStaff();
    } catch (error) {
      alert("Error updating status");
    }
  };

  const confirmRegistration = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/staff/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuOpenId(null);
      fetchStaff();
    } catch (error) {
      alert("Error confirming registration");
    }
  };

  const viewStaffProfile = async (staffId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`http://localhost:5000/api/users/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewProfile(data);
      setMenuOpenId(null);
    } catch (error) {
      alert("Error fetching profile");
    }
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/staff/${editStaff._id}`, editStaff, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditStaff(null);
      fetchStaff();
    } catch (error) {
      alert("Error updating staff");
    }
  };

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-neutral-800">
          Staff Management
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {staffList.map((member) => (
          <div
            key={member._id}
            className="relative bg-white p-6 rounded-lg border border-neutral-200 shadow-sm"
          >

            {/* Menu */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => toggleMenu(member._id)}
                className="text-neutral-500 hover:text-neutral-800"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpenId === member._id && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-md text-sm z-50">
                  {member.isRegistered && (
                    <button
                      onClick={() => viewStaffProfile(member._id)}
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-100 text-teal-600"
                    >
                      View Profile
                    </button>
                  )}
                  {member.status === "Pending" && (
                    <button
                      onClick={() => confirmRegistration(member._id)}
                      className="block w-full text-left px-4 py-2 text-green-600 hover:bg-neutral-100"
                    >
                      Confirm Registration
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditStaff(member);
                      setMenuOpenId(null);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-neutral-100"
                  >
                    Edit
                  </button>
                  {member.status !== "Pending" && (
                    <button
                      onClick={() => toggleStatus(member._id, member.status)}
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-100"
                    >
                      Toggle Status
                    </button>
                  )}
                  <button
                    onClick={() => deleteStaff(member._id)}
                    className="block w-full text-left px-4 py-2 text-rose-600 hover:bg-neutral-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-teal-600" />
              <h3 className="text-lg font-semibold text-neutral-800">
                {member.name}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                {member.email}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={14} />
                {member.mobile}
              </div>

              <div className="flex justify-between mt-3">
                <span className="text-xs bg-neutral-100 px-3 py-1 rounded-full">
                  {member.role}
                </span>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    member.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : member.status === "Pending"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <p className="text-xs text-neutral-400 mt-2">
                Joined: {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Add New Staff Member</h3>
                  <p className="text-teal-100 text-sm mt-1">Fill in the details below</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  placeholder="Enter full name"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-teal-500 p-3 rounded-lg outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  placeholder="staff@example.com"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-teal-500 p-3 rounded-lg outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Mobile Number
                </label>
                <input
                  placeholder="10-digit mobile number"
                  value={newStaff.mobile}
                  onChange={(e) => setNewStaff({ ...newStaff, mobile: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-teal-500 p-3 rounded-lg outline-none transition"
                  maxLength="10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-teal-500 p-3 rounded-lg outline-none transition bg-white"
                >
                  <option value="staff">Staff</option>
                  <option value="accountant">Accountant</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department (Optional)
                </label>
                <input
                  placeholder="e.g., Sales, Accounts"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-teal-500 p-3 rounded-lg outline-none transition"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-blue-800">
                  📧 Email invitation will be sent with registration link
                </p>
              </div>

              <button
                onClick={addStaff}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3.5 rounded-lg hover:from-teal-700 hover:to-teal-800 transition font-semibold shadow-lg"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editStaff && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-lg w-96 border border-neutral-200 shadow-lg">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">
                Edit Staff
              </h3>
              <button onClick={() => setEditStaff(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={editStaff.name}
                onChange={(e) =>
                  setEditStaff({ ...editStaff, name: e.target.value })
                }
                className="w-full border border-neutral-300 p-3 rounded-lg"
              />
              <input
                value={editStaff.email}
                onChange={(e) =>
                  setEditStaff({ ...editStaff, email: e.target.value })
                }
                className="w-full border border-neutral-300 p-3 rounded-lg"
              />
              <input
                value={editStaff.mobile}
                onChange={(e) =>
                  setEditStaff({ ...editStaff, mobile: e.target.value })
                }
                className="w-full border border-neutral-300 p-3 rounded-lg"
              />

              <button
                onClick={saveEdit}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition"
              >
                Save Changes
              </button>
            </div>

          </div>

        </div>
      )}

      {/* View Profile Modal */}
      {viewProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 rounded-t-xl sticky top-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Staff Profile</h3>
                  <p className="text-teal-100 text-sm mt-1">{viewProfile.name}</p>
                </div>
                <button 
                  onClick={() => setViewProfile(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Personal Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Full Name</label>
                    <p className="text-gray-900 font-medium">{viewProfile.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Email</label>
                    <p className="text-gray-900">{viewProfile.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Mobile</label>
                    <p className="text-gray-900">{viewProfile.mobile || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Role</label>
                    <p className="text-gray-900 capitalize">{viewProfile.role || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Employee ID</label>
                    <p className="text-gray-900">{viewProfile.employeeId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Department</label>
                    <p className="text-gray-900">{viewProfile.department || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Joining Date</label>
                    <p className="text-gray-900">{viewProfile.createdAt ? new Date(viewProfile.createdAt).toLocaleDateString('en-GB') : '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Status</label>
                    <p className="text-gray-900">{viewProfile.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Bank Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Bank Name</label>
                    <p className="text-gray-900">{viewProfile.bankName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Account Holder Name</label>
                    <p className="text-gray-900">{viewProfile.accountHolderName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">Account Number</label>
                    <p className="text-gray-900">{viewProfile.accountNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">IFSC Code</label>
                    <p className="text-gray-900">{viewProfile.ifscCode || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
