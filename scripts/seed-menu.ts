/**
 * Script to seed the menu database with all menu items
 * Run with: npm run seed-menu
 */

import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "";

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);

const menuItems = [
  // LOADED FRIES
  { name: "FROSTY FRIES", category: "Loaded Fries", price: 35, description: "FRIED CHICKEN, FRIES, GARLIC AOILI, CHEESE SAUCE, BBQ, HERBS" },
  { name: "SHAWARMA FRIES", category: "Loaded Fries", price: 45, description: "SHAWARMA, FRIES, WHITE SAUCE, CHEESE SAUCE, HERBS, PAPRIKA" },
  { name: "KOREAN FRIES", category: "Loaded Fries", price: 45, description: "KOREAN CHICKEN, FRIES, CHEESE SAUCE, SESAME" },
  { name: "SPICY VOLCANO FRIES", category: "Loaded Fries", price: 65, description: "FRIED CHICKEN, SHAWARMA, SMOOKED TURKEY, CHEESE SAUCE, FRIES, ALGERIAN, BBQ, HERBS" },
  { name: "TASTY FRIES", category: "Loaded Fries", price: 70, description: "FRIED CHICKEN, SHAWARMA, MAC N CHEESE, FRIES, TASTY SAUCE, HERBS, PICKLES" },
  { name: "CRUNCH FRIES", category: "Loaded Fries", price: 60, description: "FRIED CHICKEN, POTATO WEDGES, CHEESE SAUCE, FOR YOU SAUCE, HERBS" },
  { name: "POUTINE FRIED CHICKEN", category: "Loaded Fries", price: 45, description: "FRIED CHICKEN, SMOKED TURKEY, FRIES, CHEESE SAUCE, MOZZARELLA" },

  // PREMIUM SANDWICHES
  { name: "KOREAN BURGER", category: "Premium Sandwiches", price: 45, description: "KOREAN FRIED CHICKEN, JALAPENOS, LETTUCE, GARLIC AIOLI, CHILLI CHEESE" },
  { name: "TASTY TRIPLE", category: "Premium Sandwiches", price: 90, description: "TRIPLE BEEF, TRIPLE CHEESE, TASTY SAUCE, CARAMELIZED ONIONS, LETTUCE" },
  { name: "MUSHROOM SWISS BURGER", category: "Premium Sandwiches", price: 50, description: "BEEF, MUSHROOMS, EMMENTAL, CARAMELISED ONIONS, BURGER SAUCE, LETTUCE" },
  { name: "RODEO BURGER", category: "Premium Sandwiches", price: 75, description: "2X BEEF, ONION RINGS, CHILLI CHEESE, CARAMELISED ONIONS, 2X CHEDDAR, BBQ" },
  { name: "CHICAGO BURGER", category: "Premium Sandwiches", price: 55, description: "FRIED CHICKEN, MOZZARELLA, SMOKED TURKEY, MUSHROOMS, CARAMELISED ONIONS, BBQ, GARLIC AIOLI, LETTUCE" },

  // COMBOS
  { name: "FOR YOU COMBO", category: "Combos", price: 100, description: "FRIED CHICKEN TENDERS, ONION RINGS, CHILLI CHEESE, CHEESE FINGERS, BURGER BUN, FRIES, MAC N CHEESE, SODA, SUNDAE" },
  { name: "LOS ANGELES (L.A) COMBO", category: "Combos", price: 85, description: "SLIDER CHEESE BURGER, SLIDER CHICKEN BURGER, FRIES, MAC N CHEESE, SODA, SUNDAE" },
  { name: "NASHVILLE CHICKEN COMBO", category: "Combos", price: 60, description: "SPICY CHICKEN, MAC N CHEESE, FRIES, SODA, BURGER BUN" },

  // SANDWICHES
  { name: "SHAWARMA", category: "Sandwiches", price: 35 },
  { name: "FRIED CHICKEN WRAP", category: "Sandwiches", price: 55 },
  { name: "FRIED CHICKEN SANDWICH", category: "Sandwiches", price: 45 },
  { name: "BURRITO MEXICANO", category: "Sandwiches", price: 60 },
  { name: "CHICKEN BURGER", category: "Sandwiches", price: 35 },
  { name: "CHEESE BURGER", category: "Sandwiches", price: 45 },
  { name: "TACOS FRIED CHICKEN", category: "Sandwiches", price: 45 },
  { name: "ARABIAN BITES", category: "Sandwiches", price: 60 },

  // SIDES
  { name: "ONION RINGS", category: "Sides", price: 35 },
  { name: "CHILLI CHEESE", category: "Sides", price: 35 },
  { name: "CHEESE FINGERS", category: "Sides", price: 35 },
  { name: "FRIES", category: "Sides", price: 15 },
  { name: "MAC N CHEESE", category: "Sides", price: 25 },
  { name: "MAC SALAD", category: "Sides", price: 25 },

  // LOADED MAC
  { name: "MAC N SMOKEY", category: "Loaded Mac", price: 0, description: "OVEN BAKED MAC N CHEESE, SMOKED TURKEY, CHEESE" },
  { name: "MAC N CHICKEN", category: "Loaded Mac", price: 0, description: "MAC N CHEESE, FRIED CHICKEN, CHEESE, CHIVES, CRISPY ONIONS, EMMENTAL" },
  { name: "KOREAN MAC", category: "Loaded Mac", price: 0, description: "MAC N CHEESE, KOREAN CHICKEN, GARLIC AIOLI, SESAME, CHIVES" },

  // SUNDAE
  { name: "SUNDAE CLASSIC", category: "Sundae", price: 0, description: "CHOCOLATE, CARAMEL, OREO, KINDER, KITKAT, STRAWBERRY" },
  { name: "SUNDAE DELUXE", category: "Sundae", price: 0, description: "PISTACHIO, SPECIAL" },

  // FOR YOU ROLLS (3PCS)
  { name: "FRIED SUSHI CRUNCHY", category: "For You Rolls", price: 35 },
  { name: "SUSHI PIZZA", category: "For You Rolls", price: 40 },
  { name: "MAKI FRY", category: "For You Rolls", price: 45 },
  { name: "FOR YOU FRY", category: "For You Rolls", price: 50 },
  { name: "DRAGON EYE", category: "For You Rolls", price: 45 },
  { name: "ALASKA ROLL", category: "For You Rolls", price: 80, description: "SAUMON, CONCOMBRE, CHEESE" },
  { name: "MALIBU ROLL", category: "For You Rolls", price: 45, description: "EBI TEMPURA, SURIMI, CHEESE" },
  { name: "PHILLY ROLL", category: "For You Rolls", price: 75, description: "SAUMON, CIBOULETTE, ANANAS, AVOCAT, CHEESE" },
  { name: "TOKYO STYLE SUSHI PIZZA", category: "For You Rolls", price: 55, description: "SAUMON, AVOCAT, SURIMI, WAKAME, SESAME, KAMIKAZE, TERYAKI, CHEESE" },

  // SPRING ROLLS (6PCS)
  { name: "SAUMON", category: "Spring Rolls", price: 45, description: "SAUMON, AVOCAT, SURIMI, CHEESE" },
  { name: "CREVETTE", category: "Spring Rolls", price: 40, description: "CREVETTES, AVOCAT, SURIMI, CHEESE" },
  { name: "MANGUE EBI", category: "Spring Rolls", price: 45, description: "CREVETTE, SURIMI, MANGUE, CHEESE, TOBIKO" },
  { name: "HAWAII", category: "Spring Rolls", price: 55, description: "SAUMON, MANGUE, SURIMI, CHEESE, TOBIKO" },
  { name: "MARBELLA", category: "Spring Rolls", price: 55, description: "SAUMON, CREVETTES, SURIMI, AVOCAT, CHEESE, TOBIKO" },

  // MAKIS (6PCS)
  { name: "SAUMON + CHEESE", category: "Makis", price: 25 },
  { name: "CREVETTE + CHEESE", category: "Makis", price: 25 },
  { name: "SURIMI + CHEESE", category: "Makis", price: 25 },
  { name: "AVOCAT + CHEESE", category: "Makis", price: 20 },
  { name: "CONCOMBRE + CHEESE", category: "Makis", price: 20 },
  { name: "SAUMON AVOCAT CHEESE", category: "Makis", price: 35 },

  // FUTOMAKIS (6PCS)
  { name: "SAUMON", category: "Futomakis", price: 45 },
  { name: "CREVETTE", category: "Futomakis", price: 40 },
  { name: "SURIMI", category: "Futomakis", price: 40 },

  // CALIFORNIAS (4PCS)
  { name: "CREME CHEESE", category: "Californias", price: 35, description: "SAUMON, AVOCAT, SURIMI, CHEESE, TOBIKO" },
  { name: "CLASSIQUE", category: "Californias", price: 30, description: "SURIMI, CHEESE, AVOCAT, TOBIKO" },
  { name: "EBI FRY", category: "Californias", price: 35, description: "CREVETTES, SURIMI, AVOCAT, CHEESE, CIBOULETTE" },
  { name: "SÉSAME", category: "Californias", price: 35, description: "SAUMON, CHEESE, AVOCAT, SESAMES" },
  { name: "EBI TOBIKO", category: "Californias", price: 40, description: "CREVETTES, CHEESE, AVOCAT, TOBIKO" },

  // BOXES
  { name: "MAKINSANITY (16PCS)", category: "Boxes", price: 45 },
  { name: "SUMMER BOX (20PCS)", category: "Boxes", price: 110, description: "SPRING HAWAII & MAKI FRY 3, ALASKA ROLL 4" },
  { name: "FOR YOU BOX (14PCS)", category: "Boxes", price: 75 },
  { name: "RAINBOW BOX (16PCS)", category: "Boxes", price: 100 },
  { name: "24 PIECES BOX", category: "Boxes", price: 130 },
  { name: "FRIED SUSHI BOX (32PCS)", category: "Boxes", price: 145 },

  // SUSHI BURRITO
  { name: "CLASSIC", category: "Sushi Burrito", price: 55, description: "RIZ, SAUMON, GOMA WAKAME, AVOCAT, SURIMI, ANANAS/MANGUE, CREME CHEESE" },
  { name: "GAMBAS", category: "Sushi Burrito", price: 50, description: "RIZ, CREVETTES PANÉES, AVOCAT, SURIMI, TOBIKO, CREME CHEESE" },
  { name: "CÉSAR", category: "Sushi Burrito", price: 55, description: "RIZ, CREVETTES PANÉES, FRIED CHICKEN, ANANAS/MANGUE, GOMA WAKAME, CHEESE" },

  // BOWLS
  { name: "CHIRASHI CLASSIC", category: "Bowls", price: 55, description: "SAUMON, SURIMI, AVOCAT, RIZ" },
  { name: "CHIRASHI MIXED", category: "Bowls", price: 60, description: "SAUMON, CREVETTES, SURIMI, AVOCAT, RIZ" },
  { name: "POKE BOWL", category: "Bowls", price: 80, description: "SAUMON, AVOCAT, RIZ, ANANAS, CREVETTES, FRIED CHICKEN, SESAME, WAKAME, CONCOMBRE" },

  // DESSERTS
  { name: "BANOFFEE PIE", category: "Desserts", price: 20 },
  { name: "CHEESECUP", category: "Desserts", price: 25 },
  { name: "OREO PARFAIT", category: "Desserts", price: 30 },
  { name: "WAFFLE", category: "Desserts", price: 35 },

  // DRINKS + COFFEE
  { name: "MILKSHAKE", category: "Drinks", price: 35 },
  { name: "PINA COLADA SHAKE", category: "Drinks", price: 40 },
  { name: "MOJITO", category: "Drinks", price: 40 },
  { name: "TROPICAL FIZZ", category: "Drinks", price: 30 },
  { name: "PINEAPPLE FIZZ", category: "Drinks", price: 30 },
  { name: "SWEET FUSION SMOOTHIE", category: "Drinks", price: 35 },
  { name: "ESPRESSO", category: "Coffee", price: 20 },
  { name: "LATTE", category: "Coffee", price: 25 },
  { name: "AMERICANO", category: "Coffee", price: 20 },
  { name: "MINT TEA", category: "Coffee", price: 20 },
  { name: "ICED LATTE", category: "Coffee", price: 25 },
  { name: "ICED MACCHIATO", category: "Coffee", price: 25 },
  { name: "SODA", category: "Drinks", price: 20 },
  { name: "SPECIAL SODA", category: "Drinks", price: 25 },
  { name: "GLASS SODA", category: "Drinks", price: 20 },
  { name: "JUICE", category: "Drinks", price: 25 },
  { name: "PANACHE", category: "Drinks", price: 20 },
  { name: "WATER", category: "Drinks", price: 15 }
];

async function seedMenu() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI environment variable is required");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing menu items
    await MenuItem.deleteMany({});
    console.log("Cleared existing menu items");

    // Insert all menu items
    const result = await MenuItem.insertMany(menuItems);
    console.log(`Successfully inserted ${result.length} menu items`);

    // Show summary by category
    const categories = await MenuItem.distinct("category");
    console.log("\nMenu categories:");
    for (const category of categories) {
      const count = await MenuItem.countDocuments({ category });
      console.log(`  - ${category}: ${count} items`);
    }

    await mongoose.disconnect();
    console.log("\nMenu seeding completed!");
  } catch (error) {
    console.error("Error seeding menu:", error);
    process.exit(1);
  }
}

seedMenu();

