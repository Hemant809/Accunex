const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (req.user.role === "accountant" && role !== "staff") {
      return res
        .status(403)
        .json({ message: "Accountant can create staff only" });
    }

    if (!["accountant", "staff"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      shop: req.user.shop,
      createdBy: req.user._id,
      isPasswordSet: false,
    });

    res.status(201).json({
      message: "User created successfully",
      temporaryPassword: tempPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  const user = await User.findById(req.user._id);

  user.password = newPassword;
  user.isPasswordSet = true;

  await user.save();

  res.json({ message: "Password updated successfully" });
};

exports.updateUser = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: false }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
