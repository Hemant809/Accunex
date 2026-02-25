const User = require("../models/User");
const Shop = require("../models/Shop");
const jwt = require("jsonwebtoken");

// ================= GENERATE TOKEN =================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      shop: user.shop,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { email, password, mobile } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create shop first
    const shop = await Shop.create({
      name: "My Shop",
      owner: null,
    });

    // Create admin user
    const user = await User.create({
      name: "Owner",
      email,
      password,
      mobile,
      role: "admin",
      shop: shop._id,
      isPasswordSet: true,
    });

    // Update shop owner
    shop.owner = user._id;
    await shop.save();

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      shopId: shop._id,
      message: "Registration successful"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('shop', 'name');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        createdAt: user.createdAt,
        shop: user.shop,
        token: generateToken(user),
        mustChangePassword: !user.isPasswordSet,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE ACCOUNT =================
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete account" });
    }

    // Delete shop and all related data
    await Shop.findByIdAndDelete(user.shop);
    await User.deleteMany({ shop: user.shop });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
