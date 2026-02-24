import { useState } from "react";
import { Edit2, Check, X, Camera, Lock, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* ---------------- SECTION ---------------- */
function Section({ title, sectionKey, editing, setEditing, children }) {
  const isEditing = editing === sectionKey;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-neutral-800">
          {title}
        </h3>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setEditing(sectionKey)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition"
          >
            <Edit2 size={16} />
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-2 bg-emerald-500 text-white rounded-lg"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-2 bg-red-500 text-white rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {children(isEditing)}
      </div>
    </div>
  );
}

/* ---------------- FIELD ---------------- */
function Field({ label, name, value, editable, isEditing, handleChange }) {
  return (
    <div>
      <label className="text-xs text-neutral-500 block mb-2 flex items-center gap-2">
        {label}
        {!editable && <Lock size={12} />}
      </label>

      <input
        name={name}
        value={value}
        onChange={handleChange}
        readOnly={!editable || !isEditing}
        className={`w-full px-4 py-2 rounded-lg border border-neutral-300 
        focus:ring-2 focus:ring-teal-500 focus:outline-none
        ${!editable ? "bg-neutral-100 cursor-not-allowed" : "bg-white"}`}
      />
    </div>
  );
}

/* ---------------- MAIN PROFILE ---------------- */
export default function AccountantProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(null);

  const [profile, setProfile] = useState({
    fullName: user?.name || "",
    gender: "",
    dob: "",
    designation: "",
    department: user?.department || "",
    employeeId: user?.employeeId || "",
    joiningDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : "",
    status: "Active",
    lastLogin: "",

    email: user?.email || "",
    phone: user?.mobile || "",
    altPhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    aadhaar: "",
    pan: "",

    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid grid-cols-4 gap-8">

      {/* LEFT SUMMARY */}
      <div className="col-span-1 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6 h-fit">

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
              {profile.fullName.charAt(0).toUpperCase() || "U"}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-neutral-300"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="text-center">
            <h2 className="font-semibold text-lg text-neutral-800">
              {profile.fullName || "User"}
            </h2>
            <p className="text-sm text-neutral-500 capitalize">
              {user?.role || ""}
            </p>
            <p className="text-xs text-neutral-400">
              {profile.department || ""}
            </p>
          </div>

          <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full">
            {profile.status}
          </span>
        </div>

        <div className="text-xs text-neutral-500 border-t border-neutral-200 pt-4 space-y-2">
          <div>Employee ID: {profile.employeeId || "-"}</div>
          <div>Joining Date: {profile.joiningDate || "-"}</div>
          <div>Last Login: {profile.lastLogin || "-"}</div>
        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="col-span-3 space-y-8">

        <Section title="Professional Information" sectionKey="professional" editing={editing} setEditing={setEditing}>
          {(edit) => (
            <>
              <Field label="Full Name" name="fullName" value={profile.fullName} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Gender" name="gender" value={profile.gender} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Date of Birth" name="dob" value={profile.dob} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Designation" name="designation" value={profile.designation} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Department" name="department" value={profile.department} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Employee ID" name="employeeId" value={profile.employeeId} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Joining Date" name="joiningDate" value={profile.joiningDate} editable={true} isEditing={edit} handleChange={handleChange} />
            </>
          )}
        </Section>

        <Section title="Contact Information" sectionKey="contact" editing={editing} setEditing={setEditing}>
          {(edit) => (
            <>
              <Field label="Email" name="email" value={profile.email} editable={false} isEditing={edit} handleChange={handleChange} />
              <Field label="Phone" name="phone" value={profile.phone} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Alternate Phone" name="altPhone" value={profile.altPhone} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Address" name="address" value={profile.address} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="City" name="city" value={profile.city} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="State" name="state" value={profile.state} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Pincode" name="pincode" value={profile.pincode} editable={true} isEditing={edit} handleChange={handleChange} />
            </>
          )}
        </Section>

        <Section title="Identity Details" sectionKey="identity" editing={editing} setEditing={setEditing}>
          {(edit) => (
            <>
              <Field label="Aadhaar Number" name="aadhaar" value={profile.aadhaar} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="PAN Number" name="pan" value={profile.pan} editable={true} isEditing={edit} handleChange={handleChange} />
            </>
          )}
        </Section>

        <Section title="Banking Information" sectionKey="bank" editing={editing} setEditing={setEditing}>
          {(edit) => (
            <>
              <Field label="Bank Name" name="bankName" value={profile.bankName} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="Account Number" name="accountNumber" value={profile.accountNumber} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="IFSC Code" name="ifsc" value={profile.ifsc} editable={true} isEditing={edit} handleChange={handleChange} />
              <Field label="UPI ID" name="upiId" value={profile.upiId} editable={true} isEditing={edit} handleChange={handleChange} />
            </>
          )}
        </Section>

        <Section title="Security Status" sectionKey="security" editing={editing} setEditing={setEditing}>
          {() => (
            <div className="flex items-center gap-2 text-sm text-neutral-500 col-span-2">
              <Shield size={16} />
              Two-Factor Authentication Enabled
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}
