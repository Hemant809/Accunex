import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, FileText, UserCheck, CreditCard, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const shopId = location.state?.shopId;
  const userId = location.state?.userId;
  const registrationEmail = location.state?.email;
  const registrationMobile = location.state?.mobile;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    businessType: "",
    establishedYear: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    panNumber: "",
    registrationNumber: "",
    fssaiLicense: "",
    ownerAadhaar: "",
    ownerPan: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upiId: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Update Shop
      await axios.put(
        `http://localhost:5000/api/shops/${shopId}`,
        {
          name: formData.shopName,
          businessType: formData.businessType,
          establishedYear: formData.establishedYear,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          panNumber: formData.panNumber,
          registrationNumber: formData.registrationNumber,
          fssaiLicense: formData.fssaiLicense,
          ownerName: formData.ownerName,
          ownerAadhaar: formData.ownerAadhaar,
          ownerPan: formData.ownerPan,
          banking: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifsc: formData.ifsc,
            upiId: formData.upiId,
          },
        }
      );

      // Update User name
      await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        { name: formData.ownerName }
      );

      toast.success("Setup completed successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save information");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Company Information", icon: Building2 },
    { num: 2, title: "Legal & Compliance", icon: FileText },
    { num: 3, title: "Authorized Signatory", icon: UserCheck },
    { num: 4, title: "Company Banking", icon: CreditCard },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-2">
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Complete Your Profile</h1>
          <p className="text-sm text-slate-600">Let's set up your business information</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-4">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                step >= s.num ? "bg-teal-600 text-white" : "bg-white text-slate-400 border-2 border-slate-300"
              }`}>
                {step > s.num ? <CheckCircle size={24} /> : <s.icon size={24} />}
              </div>
              <p className={`text-xs font-medium ${step >= s.num ? "text-teal-600" : "text-slate-500"}`}>
                {s.title}
              </p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border p-5">
          
          {/* Step 1: Company Information */}
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Company Information</h2>
              
              <Input label="Shop Name" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Enter your shop name" required />
              <Input label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Enter owner full name" required />
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Business Type" name="businessType" value={formData.businessType} onChange={handleChange} placeholder="e.g., Retail, Wholesale" />
                <Input label="Established Year" name="establishedYear" value={formData.establishedYear} onChange={handleChange} placeholder="e.g., 2020" />
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="company@example.com" />
                <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit number" />
              </div>

              <h3 className="text-base font-semibold text-slate-700 mt-4 mb-2">Address</h3>
              <Input label="Street Address" name="street" value={formData.street} onChange={handleChange} placeholder="Street, Building" />
              
              <div className="grid md:grid-cols-3 gap-4">
                <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit" maxLength="6" />
              </div>
            </div>
          )}

          {/* Step 2: Legal & Compliance */}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Legal & Compliance</h2>
              <Input label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="ABCDE1234F" maxLength="10" />
              <Input label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Company Registration Number" />
              <Input label="FSSAI License (Optional)" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} placeholder="FSSAI License Number" />
            </div>
          )}

          {/* Step 3: Authorized Signatory */}
          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Authorized Signatory</h2>
              <Input label="Owner Aadhaar" name="ownerAadhaar" value={formData.ownerAadhaar} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength="12" />
              <Input label="Owner PAN" name="ownerPan" value={formData.ownerPan} onChange={handleChange} placeholder="ABCDE1234F" maxLength="10" />
            </div>
          )}

          {/* Step 4: Company Banking */}
          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 mb-3">Company Banking</h2>
              <Input label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank Name" />
              <Input label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Account Number" />
              <Input label="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleChange} placeholder="IFSC Code" maxLength="11" />
              <Input label="UPI ID (Optional)" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="example@upi" />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-5">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 flex items-center gap-2"
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Saving..." : "Complete Setup"}
                <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", value, onChange, placeholder, maxLength, required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
      />
    </div>
  );
}
