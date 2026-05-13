const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── Connect ───────────────────────────────────────────────────────────────
mongoose
  .connect("mongodb://localhost:27017/kisanbazar")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });

// ─── Schemas ───────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: String, phone: String, address: Object }, { timestamps: true });
const CategorySchema = new mongoose.Schema({ name: { type: String, unique: true }, description: String, icon: String }, { timestamps: true });
const FarmerProfileSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, farmName: String, description: String, farmImages: [String], farmingPractices: [String], establishedYear: Number, acceptsPickup: Boolean, acceptsDelivery: Boolean, deliveryRadius: Number, isVerified: Boolean }, { timestamps: true });
const ProductSchema = new mongoose.Schema({ farmer: mongoose.Schema.Types.ObjectId, name: String, description: String, category: mongoose.Schema.Types.ObjectId, price: Number, unit: String, quantityAvailable: Number, images: [String], isOrganic: Boolean, isFeatured: Boolean, isActive: Boolean, harvestDate: Date, availableUntil: Date }, { timestamps: true });
const OrderSchema = new mongoose.Schema({ consumer: mongoose.Schema.Types.ObjectId, farmer: mongoose.Schema.Types.ObjectId, items: [{ product: mongoose.Schema.Types.ObjectId, quantity: Number, price: Number }], totalAmount: Number, status: String, paymentMethod: String, notes: String }, { timestamps: true });

const User = mongoose.model("User", UserSchema);
const Category = mongoose.model("Category", CategorySchema);
const FarmerProfile = mongoose.model("FarmerProfile", FarmerProfileSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

// ─── Main Seed Function ────────────────────────────────────────────────────
async function seed() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await FarmerProfile.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // ── Hash password helper
    const hashPassword = async (pw) => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(pw, salt);
    };

    // ── 1. CATEGORIES ──────────────────────────────────────────────────────
    const categories = await Category.insertMany([
      { name: "Vegetables", description: "Fresh farm vegetables", icon: "🥦" },
      { name: "Fruits", description: "Seasonal fresh fruits", icon: "🍎" },
      { name: "Grains & Pulses", description: "Rice, wheat, lentils and more", icon: "🌾" },
      { name: "Dairy", description: "Milk, paneer, curd and more", icon: "🥛" },
      { name: "Herbs & Spices", description: "Fresh herbs and dry spices", icon: "🌿" },
      { name: "Organic", description: "Certified organic produce", icon: "🌱" },
    ]);
    console.log("✅ Categories seeded:", categories.length);

    const [vegetables, fruits, grains, dairy, herbs, organic] = categories;

    // ── 2. USERS ───────────────────────────────────────────────────────────

    // Admin
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@kisanbazar.com",
      password: await hashPassword("admin123"),
      role: "admin",
      phone: "9000000000",
      address: { street: "123 Admin Lane", city: "New Delhi", state: "Delhi", zipCode: "110001" },
    });

    // Farmers
    const farmer1 = await User.create({
      name: "Ramesh Kumar",
      email: "ramesh@kisanbazar.com",
      password: await hashPassword("farmer123"),
      role: "farmer",
      phone: "9111111111",
      address: { street: "Green Farm Road", city: "Dehradun", state: "Uttarakhand", zipCode: "248001" },
    });

    const farmer2 = await User.create({
      name: "Sunita Devi",
      email: "sunita@kisanbazar.com",
      password: await hashPassword("farmer123"),
      role: "farmer",
      phone: "9222222222",
      address: { street: "Village Nainital", city: "Nainital", state: "Uttarakhand", zipCode: "263001" },
    });

    const farmer3 = await User.create({
      name: "Mohan Singh",
      email: "mohan@kisanbazar.com",
      password: await hashPassword("farmer123"),
      role: "farmer",
      phone: "9333333333",
      address: { street: "Haridwar Farm Belt", city: "Haridwar", state: "Uttarakhand", zipCode: "249401" },
    });

    // Consumers
    const consumer1 = await User.create({
      name: "Priya Sharma",
      email: "priya@gmail.com",
      password: await hashPassword("consumer123"),
      role: "consumer",
      phone: "9444444444",
      address: { street: "45 MG Road", city: "Dehradun", state: "Uttarakhand", zipCode: "248001" },
    });

    const consumer2 = await User.create({
      name: "Arjun Mehta",
      email: "arjun@gmail.com",
      password: await hashPassword("consumer123"),
      role: "consumer",
      phone: "9555555555",
      address: { street: "12 Rajpur Road", city: "Dehradun", state: "Uttarakhand", zipCode: "248009" },
    });

    console.log("✅ Users seeded: Admin + 3 Farmers + 2 Consumers");

    // ── 3. FARMER PROFILES ─────────────────────────────────────────────────
    await FarmerProfile.insertMany([
      {
        user: farmer1._id,
        farmName: "Ramesh Green Farms",
        description: "We grow fresh vegetables and fruits using traditional and sustainable farming methods in the foothills of Dehradun.",
        farmingPractices: ["Organic Farming", "Drip Irrigation", "Composting"],
        establishedYear: 2010,
        acceptsPickup: true,
        acceptsDelivery: true,
        deliveryRadius: 20,
        isVerified: true,
      },
      {
        user: farmer2._id,
        farmName: "Sunita's Organic Garden",
        description: "Family-run organic farm specializing in herbs, spices and seasonal vegetables grown without pesticides.",
        farmingPractices: ["100% Organic", "Natural Pest Control", "Rain Water Harvesting"],
        establishedYear: 2015,
        acceptsPickup: true,
        acceptsDelivery: false,
        deliveryRadius: 0,
        isVerified: true,
      },
      {
        user: farmer3._id,
        farmName: "Mohan Dairy & Grains",
        description: "We specialize in fresh dairy products and traditional grains grown in the fertile plains of Haridwar.",
        farmingPractices: ["Traditional Farming", "Free Range", "No Hormones"],
        establishedYear: 2005,
        acceptsPickup: true,
        acceptsDelivery: true,
        deliveryRadius: 30,
        isVerified: true,
      },
    ]);
    console.log("✅ Farmer profiles seeded");

    // ── 4. PRODUCTS ────────────────────────────────────────────────────────
    const products = await Product.insertMany([
      // Farmer 1 - Vegetables & Fruits
      { farmer: farmer1._id, name: "Fresh Tomatoes", description: "Juicy red tomatoes grown without chemicals. Perfect for curries and salads.", category: vegetables._id, price: 40, unit: "kg", quantityAvailable: 100, isOrganic: true, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { farmer: farmer1._id, name: "Green Spinach", description: "Fresh spinach leaves, hand-picked daily from our farm.", category: vegetables._id, price: 30, unit: "bunch", quantityAvailable: 50, isOrganic: true, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { farmer: farmer1._id, name: "Potatoes", description: "Fresh desi potatoes, great for all Indian dishes.", category: vegetables._id, price: 25, unit: "kg", quantityAvailable: 200, isOrganic: false, isFeatured: false, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { farmer: farmer1._id, name: "Alphonso Mangoes", description: "Sweet and aromatic Alphonso mangoes, freshly harvested this season.", category: fruits._id, price: 150, unit: "dozen", quantityAvailable: 80, isOrganic: false, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { farmer: farmer1._id, name: "Bananas", description: "Fresh yellow bananas, naturally ripened on the plant.", category: fruits._id, price: 50, unit: "dozen", quantityAvailable: 120, isOrganic: false, isFeatured: false, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },

      // Farmer 2 - Herbs, Organic
      { farmer: farmer2._id, name: "Fresh Coriander", description: "Aromatic fresh coriander leaves, organic and pesticide-free.", category: herbs._id, price: 20, unit: "bunch", quantityAvailable: 60, isOrganic: true, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { farmer: farmer2._id, name: "Mint Leaves", description: "Fresh mint leaves perfect for chutneys, drinks and cooking.", category: herbs._id, price: 15, unit: "bunch", quantityAvailable: 40, isOrganic: true, isFeatured: false, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { farmer: farmer2._id, name: "Organic Onions", description: "Certified organic red onions grown with natural compost.", category: organic._id, price: 35, unit: "kg", quantityAvailable: 150, isOrganic: true, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
      { farmer: farmer2._id, name: "Organic Garlic", description: "Strong and flavorful organic garlic bulbs.", category: organic._id, price: 80, unit: "kg", quantityAvailable: 70, isOrganic: true, isFeatured: false, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { farmer: farmer2._id, name: "Turmeric Powder", description: "Pure organic turmeric powder made from farm-grown turmeric.", category: herbs._id, price: 120, unit: "250g", quantityAvailable: 30, isOrganic: true, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },

      // Farmer 3 - Dairy & Grains
      { farmer: farmer3._id, name: "Fresh Cow Milk", description: "Pure and fresh cow milk, collected every morning from our free-range cows.", category: dairy._id, price: 60, unit: "litre", quantityAvailable: 50, isOrganic: false, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
      { farmer: farmer3._id, name: "Homemade Paneer", description: "Fresh paneer made daily from pure cow milk.", category: dairy._id, price: 280, unit: "kg", quantityAvailable: 20, isOrganic: false, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { farmer: farmer3._id, name: "Desi Ghee", description: "Pure hand-churned desi cow ghee, traditionally made.", category: dairy._id, price: 600, unit: "500g", quantityAvailable: 25, isOrganic: false, isFeatured: true, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      { farmer: farmer3._id, name: "Basmati Rice", description: "Long-grain aromatic basmati rice grown in the Gangetic plains.", category: grains._id, price: 90, unit: "kg", quantityAvailable: 300, isOrganic: false, isFeatured: false, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
      { farmer: farmer3._id, name: "Masoor Dal", description: "Clean and fresh red lentils, protein-rich and delicious.", category: grains._id, price: 110, unit: "kg", quantityAvailable: 100, isOrganic: false, isFeatured: false, isActive: true, harvestDate: new Date(), availableUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) },
    ]);
    console.log("✅ Products seeded:", products.length);

    // ── 5. ORDERS ──────────────────────────────────────────────────────────
    await Order.insertMany([
      {
        consumer: consumer1._id,
        farmer: farmer1._id,
        items: [
          { product: products[0]._id, quantity: 2, price: 40 },
          { product: products[1]._id, quantity: 3, price: 30 },
        ],
        totalAmount: 170,
        status: "completed",
        paymentMethod: "cash",
        notes: "Please pack carefully",
      },
      {
        consumer: consumer1._id,
        farmer: farmer3._id,
        items: [
          { product: products[10]._id, quantity: 5, price: 60 },
          { product: products[11]._id, quantity: 1, price: 280 },
        ],
        totalAmount: 580,
        status: "accepted",
        paymentMethod: "bank_transfer",
        notes: "Morning delivery preferred",
      },
      {
        consumer: consumer2._id,
        farmer: farmer2._id,
        items: [
          { product: products[5]._id, quantity: 4, price: 20 },
          { product: products[7]._id, quantity: 2, price: 35 },
        ],
        totalAmount: 150,
        status: "pending",
        paymentMethod: "cash",
        notes: "",
      },
      {
        consumer: consumer2._id,
        farmer: farmer3._id,
        items: [
          { product: products[12]._id, quantity: 1, price: 600 },
          { product: products[13]._id, quantity: 5, price: 90 },
        ],
        totalAmount: 1050,
        status: "completed",
        paymentMethod: "cash",
        notes: "Quality product!",
      },
    ]);
    console.log("✅ Orders seeded");

    // ── Summary ────────────────────────────────────────────────────────────
    console.log("\n🎉 Database seeded successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 LOGIN CREDENTIALS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👑 Admin:    admin@kisanbazar.com  / admin123");
    console.log("🌾 Farmer 1: ramesh@kisanbazar.com / farmer123");
    console.log("🌾 Farmer 2: sunita@kisanbazar.com / farmer123");
    console.log("🌾 Farmer 3: mohan@kisanbazar.com  / farmer123");
    console.log("🛒 Consumer: priya@gmail.com       / consumer123");
    console.log("🛒 Consumer: arjun@gmail.com       / consumer123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    mongoose.disconnect();
    process.exit(1);
  }
}

seed();
