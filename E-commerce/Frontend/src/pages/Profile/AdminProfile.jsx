import { useState, useEffect } from "react";
import { Edit2, Check, X, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";

/* ---------------- SECTION ---------------- */
function Section({ title, sectionKey, editing, setEditing, onSave, children, editable = true }) {
  const isEditing = editing === sectionKey;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-neutral-800">
          {title}
        </h3>

        {editable &&
          (!isEditing ? (
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
                onClick={() => {
                  if (onSave) onSave();
                  setEditing(null);
                }}
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
          ))}
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
        value={value || ""}
        onChange={handleChange}
        readOnly={!editable || !isEditing}
        className={`w-full px-4 py-2 rounded-lg border border-neutral-300 
        focus:ring-2 focus:ring-teal-500 focus:outline-none
        ${!editable ? "bg-neutral-100 cursor-not-allowed" : "bg-white"}`}
      />
    </div>
  );
}

/* ---------------- ADMIN PROFILE ---------------- */
export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(null);

  console.log("AdminProfile - Full User Object:", user);
  console.log("AdminProfile - User Name:", user?.name);
  console.log("AdminProfile - LocalStorage User:", JSON.parse(localStorage.getItem('user')));

  const [data, setData] = useState({
    companyName: "",
    businessType: "",
    establishedYear: "",
    companyEmail: "",
    companyPhone: "",
    address: "",

    gstNumber: "",
    panNumber: "",
    registrationNumber: "",
    fssaiLicense: "",

    ownerName: user?.name || "",
    ownerAadhaar: "",
    ownerPan: "",

    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data: shopData } = await axios.get("/shops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (shopData) {
        setData({
          companyName: shopData.name || "",
          businessType: shopData.businessType || "",
          establishedYear: shopData.establishedYear || "",
          companyEmail: shopData.email || "",
          companyPhone: shopData.phone || "",
          address: `${shopData.address?.street || ""}, ${shopData.address?.city || ""}, ${shopData.address?.state || ""}`.trim(),
          gstNumber: shopData.gstNumber || "",
          panNumber: shopData.panNumber || "",
          registrationNumber: shopData.registrationNumber || "",
          fssaiLicense: shopData.fssaiLicense || "",
          ownerName: shopData.ownerName || user?.name || "",
          ownerAadhaar: shopData.ownerAadhaar || "",
          ownerPan: shopData.ownerPan || "",
          bankName: shopData.banking?.bankName || "",
          accountNumber: shopData.banking?.accountNumber || "",
          ifsc: shopData.banking?.ifsc || "",
          upiId: shopData.banking?.upiId || "",
        });
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const saveCompanyInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const updateData = {
        name: data.companyName,
        businessType: data.businessType,
        establishedYear: data.establishedYear,
        email: data.companyEmail,
        phone: data.companyPhone,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        registrationNumber: data.registrationNumber,
        fssaiLicense: data.fssaiLicense,
        ownerName: data.ownerName,
        ownerAadhaar: data.ownerAadhaar,
        ownerPan: data.ownerPan,
        banking: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          ifsc: data.ifsc,
          upiId: data.upiId,
        },
      };

      const { data: updatedShop } = await axios.put(
        "/shops",
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, shop: updatedShop };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Information updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Save error:", error);
      alert(error.response?.data?.message || "Error updating");
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-800">
          {data.companyName}
        </h2>
        <p className="text-sm text-neutral-500">
          Owner: {data.ownerName}
        </p>
      </div>

      {/* COMPANY INFO */}
      <Section title="Company Information" sectionKey="company" editing={editing} setEditing={setEditing} onSave={saveCompanyInfo}>
        {(edit) => (
          <>
            <Field label="Company Name" name="companyName" value={data.companyName} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Business Type" name="businessType" value={data.businessType} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Established Year" name="establishedYear" value={data.establishedYear} editable={false} />
            <Field label="Company Email" name="companyEmail" value={data.companyEmail} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Company Phone" name="companyPhone" value={data.companyPhone} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Address" name="address" value={data.address} editable={true} isEditing={edit} handleChange={handleChange} />
          </>
        )}
      </Section>

      {/* LEGAL DETAILS (NO EDIT ICON) */}
      <Section
        title="Legal & Compliance"
        sectionKey="legal"
        editing={editing}
        setEditing={setEditing}
        editable={false}
      >
        {() => (
          <>
            <Field label="GST Number" name="gstNumber" value={data.gstNumber} editable={false} />
            <Field label="PAN Number" name="panNumber" value={data.panNumber} editable={false} />
            <Field label="Business Registration No." name="registrationNumber" value={data.registrationNumber} editable={false} />
            <Field label="FSSAI License" name="fssaiLicense" value={data.fssaiLicense} editable={false} />
          </>
        )}
      </Section>

      {/* AUTHORIZED SIGNATORY */}
      <Section title="Authorized Signatory" sectionKey="owner" editing={editing} setEditing={setEditing} onSave={saveCompanyInfo}>
        {(edit) => (
          <>
            <Field label="Owner Name" name="ownerName" value={data.ownerName} editable={true} isEditing={edit} handleChange={handleChange} />
            <Field label="Owner Aadhaar" name="ownerAadhaar" value={data.ownerAadhaar} editable={false} />
            <Field label="Owner PAN" name="ownerPan" value={data.ownerPan} editable={false} />
          </>
        )}
      </Section>

      {/* BANKING */}
      <Section title="Company Banking" sectionKey="bank" editing={editing} setEditing={setEditing} onSave={saveCompanyInfo}>
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
