const Staff = require("../models/Staff");
const Shop = require("../models/Shop");
const { sendStaffRegistrationNotification } = require("../utils/notificationService");

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ shop: req.user.shop }).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addStaff = async (req, res) => {
  try {
    // Get shop details to generate employee ID
    const shop = await Shop.findById(req.user.shop);
    
    // Generate Employee ID from company name
    let employeeId = "";
    if (shop && shop.name) {
      // Extract initials from company name
      const words = shop.name.trim().split(/\s+/);
      const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
      
      // Get count of existing staff to generate number
      const staffCount = await Staff.countDocuments({ shop: req.user.shop });
      const staffNumber = String(staffCount + 1).padStart(2, '0');
      
      employeeId = `${initials}${staffNumber}`;
    }
    
    const staff = new Staff({ 
      ...req.body,
      employeeId: employeeId,
      shop: req.user.shop,
      status: "Pending",
      isRegistered: false
    });
    await staff.save();
    
    console.log("\n=== SENDING NOTIFICATIONS ===");
    console.log("Staff Email:", staff.email);
    console.log("Staff Name:", staff.name);
    console.log("Staff Role:", staff.role);
    console.log("Employee ID:", employeeId);
    console.log("Shop Name:", shop?.name || "Unknown Shop");
    
    // Send notifications with shop name
    sendStaffRegistrationNotification(staff, shop?.name).catch(err => {
      console.error("\n❌ Notification error:", err.message);
    });
    
    res.status(201).json({ 
      ...staff.toObject(), 
      message: "Staff added. Check backend console for notification status." 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.confirmRegistration = async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, shop: req.user.shop },
      { status: "Active", isRegistered: true },
      { new: true }
    );
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, shop: req.user.shop },
      req.body,
      { new: true }
    );
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({ _id: req.params.id, shop: req.user.shop });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    
    // Delete associated User account if exists
    const User = require("../models/User");
    await User.findOneAndDelete({ email: staff.email, shop: req.user.shop });
    
    res.json({ message: "Staff and associated account deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ email: staff.email, role: staff.role, name: staff.name, employeeId: staff.employeeId, department: staff.department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffUserProfile = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    
    const User = require("../models/User");
    const user = await User.findOne({ email: staff.email, shop: req.user.shop });
    
    if (!user) return res.status(404).json({ message: "User profile not found" });
    
    res.json({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
      createdAt: user.createdAt,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeStaffRegistration = async (req, res) => {
  try {
    const { staffId, name, mobile, password } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    if (staff.isRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    const User = require("../models/User");
    await User.create({
      name,
      email: staff.email,
      mobile,
      password,
      role: staff.role,
      employeeId: staff.employeeId,
      department: staff.department,
      shop: staff.shop,
      isPasswordSet: true,
    });

    staff.name = name;
    staff.mobile = mobile;
    staff.isRegistered = true;
    staff.status = "Active";
    await staff.save();

    res.json({ message: "Registration completed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
