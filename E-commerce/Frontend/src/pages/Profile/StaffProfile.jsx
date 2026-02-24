import { useState } from "react";
import { Edit2, Check, X, Lock } from "lucide-react";
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

/* ---------------- STAFF PROFILE ---------------- */
export default function StaffProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(null);

  const [data, setData] = useState({
    fullName: user?.name || "",
    gender: "",
    dob: "",
    phone: user?.mobile || "",
    altPhone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    employeeId: user?.employeeId || "",
    department: user?.department || "",
    joiningDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : "",

    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">
          {data.fullName}
        </h2>
        <p className="text-sm text-neutral-500">
          {data.department}
        </p>
      </div>

      {/* EMPLOYMENT DETAILS */}
      <Section title="Employment Details" sectionKey="employment" editing={editing} setEditing={setEditing}>
        {() => (
          <>
            <Field label="Employee ID" name="employeeId" value={data.employeeId} editable={false} />
            <Field label="Department" name="department" value={data.department} editable={false} />
            <Field label="Date of Joining" name="joiningDate" value={data.joiningDate} editable={false} />
          </>
        )}
      </Section>

      {/* PERSONAL INFORMATION */}
      <Section title="Personal Information" sectionKey="personal" editing={editing} setEditing={setEditing}>
        {(edit) => (
          <>
            <Field label="Full Name" name="fullName" value={data.fullName} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Gender" name="gender" value={data.gender} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Date of Birth" name="dob" value={data.dob} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Phone Number" name="phone" value={data.phone} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Alternate Phone" name="altPhone" value={data.altPhone} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Email" name="email" value={data.email} editable={true} isEditing={edit} handleChange={handleChange} />
          </>
        )}
      </Section>

      {/* ADDRESS DETAILS */}
      <Section title="Address Details" sectionKey="address" editing={editing} setEditing={setEditing}>
        {(edit) => (
          <>
            <Field label="Address" name="address" value={data.address} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="City" name="city" value={data.city} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="State" name="state" value={data.state} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Pincode" name="pincode" value={data.pincode} editable={true} isEditing={edit} handleChange={handleChange} />
          </>
        )}
      </Section>

      {/* BANKING DETAILS */}
      <Section title="Banking Details" sectionKey="bank" editing={editing} setEditing={setEditing}>
        {(edit) => (
          <>
            <Field label="Bank Name" name="bankName" value={data.bankName} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Account Number" name="accountNumber" value={data.accountNumber} editable={false} />
            <Field label="IFSC Code" name="ifsc" value={data.ifsc} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="UPI ID" name="upiId" value={data.upiId} editable={true} isEditing={edit} handleChange={handleChange} />
          </>
        )}
      </Section>

    </div>
  );
}
