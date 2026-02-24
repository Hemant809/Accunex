const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const Staff = require("./models/Staff");
const Shop = require("./models/Shop");
const Product = require("./models/Product");
const Purchase = require("./models/Purchase");
const Sale = require("./models/Sale");
const Supplier = require("./models/Supplier");
const Expense = require("./models/Expense");
const Payment = require("./models/Payment");
const Receipt = require("./models/Receipt");

const deleteAllTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    console.log("\n🗑️  Deleting all test data...\n");

    // Delete all collections
    await User.deleteMany({});
    console.log("✅ Users deleted");

    await Staff.deleteMany({});
    console.log("✅ Staff deleted");

    await Shop.deleteMany({});
    console.log("✅ Shops deleted");

    await Product.deleteMany({});
    console.log("✅ Products deleted");

    await Purchase.deleteMany({});
    console.log("✅ Purchases deleted");

    await Sale.deleteMany({});
    console.log("✅ Sales deleted");

    await Supplier.deleteMany({});
    console.log("✅ Suppliers deleted");

    await Expense.deleteMany({});
    console.log("✅ Expenses deleted");

    await Payment.deleteMany({});
    console.log("✅ Payments deleted");

    await Receipt.deleteMany({});
    console.log("✅ Receipts deleted");

    console.log("\n✅ All test data deleted successfully!");
    console.log("🎉 Database is now clean and ready for production!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

deleteAllTestData();
