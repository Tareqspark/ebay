// Hand-authored reference data for the admin dashboard mock dataset
// (suppliers, name pools, warehouses, etc). Consumed by generate-admin-data.mjs.

export const SUPPLIERS = [
  { name: "Northline Sourcing Co.", region: "Vietnam", integration: "REST API", frequency: "hourly" },
  { name: "Pacific Crate Wholesale", region: "China", integration: "REST API", frequency: "hourly" },
  { name: "Anchor & Co. Trading", region: "China", integration: "CSV Feed", frequency: "daily" },
  { name: "Silverline Import Partners", region: "India", integration: "EDI", frequency: "every-6-hours" },
  { name: "Vantage Point Distribution", region: "USA", integration: "REST API", frequency: "hourly" },
  { name: "Harbor Union Supply", region: "Mexico", integration: "CSV Feed", frequency: "daily" },
  { name: "Cascade Sourcing Group", region: "Vietnam", integration: "REST API", frequency: "every-6-hours" },
  { name: "Redwood Trade Partners", region: "USA", integration: "EDI", frequency: "daily" },
  { name: "Blue Compass Logistics", region: "Turkey", integration: "CSV Feed", frequency: "daily" },
  { name: "Ironwood Wholesale", region: "China", integration: "REST API", frequency: "every-6-hours" },
  { name: "Lattice Supply Chain", region: "Indonesia", integration: "FTP", frequency: "daily" },
  { name: "Wavecrest Trading Co.", region: "Poland", integration: "EDI", frequency: "every-6-hours" },
  { name: "Crestline Import Group", region: "China", integration: "REST API", frequency: "hourly" },
  { name: "Delta Basin Sourcing", region: "Mexico", integration: "CSV Feed", frequency: "daily" },
];

export const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth",
  "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen",
  "Daniel", "Nancy", "Matthew", "Lisa", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Emily", "Andrew", "Olivia", "Paul", "Michelle", "Joshua", "Amanda", "Kenneth", "Melissa",
  "Kevin", "Rebecca", "Brian", "Laura", "George", "Stephanie", "Timothy", "Kimberly", "Ronald", "Amy",
  "Jason", "Angela", "Edward", "Nicole", "Jeffrey", "Christina", "Ryan", "Samantha", "Jacob", "Victoria",
  "Gary", "Rachel", "Nicholas", "Catherine", "Eric", "Hannah", "Jonathan", "Megan", "Stephen", "Julia",
  "Larry", "Grace", "Justin", "Natalie", "Scott", "Andrea", "Brandon", "Sophia", "Benjamin", "Chloe",
];
export const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
];

export const US_LOCATIONS = [
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Houston", state: "TX" },
  { city: "Phoenix", state: "AZ" },
  { city: "Philadelphia", state: "PA" },
  { city: "San Antonio", state: "TX" },
  { city: "San Diego", state: "CA" },
  { city: "Dallas", state: "TX" },
  { city: "Austin", state: "TX" },
  { city: "Jacksonville", state: "FL" },
  { city: "San Jose", state: "CA" },
  { city: "Columbus", state: "OH" },
  { city: "Charlotte", state: "NC" },
  { city: "Indianapolis", state: "IN" },
  { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" },
  { city: "Boston", state: "MA" },
  { city: "Portland", state: "OR" },
  { city: "Nashville", state: "TN" },
  { city: "Atlanta", state: "GA" },
  { city: "Miami", state: "FL" },
  { city: "Minneapolis", state: "MN" },
  { city: "Detroit", state: "MI" },
  { city: "Raleigh", state: "NC" },
  { city: "Salt Lake City", state: "UT" },
  { city: "Kansas City", state: "MO" },
  { city: "Sacramento", state: "CA" },
  { city: "Pittsburgh", state: "PA" },
  { city: "Tampa", state: "FL" },
];

export const WAREHOUSES = ["West Coast DC", "East Coast DC", "Central DC", "Supplier Direct"];

export const CARRIERS = ["USPS", "UPS", "FedEx", "DHL Express"];

export const PAYMENT_METHODS = [
  "Visa •••• 4242",
  "Visa •••• 1881",
  "Mastercard •••• 5521",
  "Mastercard •••• 9034",
  "American Express •••• 1005",
  "Discover •••• 6011",
  "PayPal",
  "Shop Pay Installments",
];

export const ADMIN_USERS = ["Priya Patel", "Marcus Chen", "Sofia Ricci", "Daniel Osei", "Grace Kim", "System"];

export const IMPORT_ERROR_REASONS = [
  "Missing required field: weight",
  "Duplicate SKU detected",
  "Image URL returned 404",
  "Price below minimum margin threshold",
  "Category could not be mapped",
  "Invalid UPC/EAN checksum",
  "Supplier feed timeout",
  "Currency conversion rate unavailable",
];

export const SYSTEM_COMPONENTS = [
  { name: "Storefront API", baseLatency: 80 },
  { name: "Admin API", baseLatency: 65 },
  { name: "Payment Gateway", baseLatency: 210 },
  { name: "Supplier Sync Engine", baseLatency: 340 },
  { name: "Search Index", baseLatency: 45 },
  { name: "Image CDN", baseLatency: 30 },
  { name: "Email Delivery", baseLatency: 520 },
];
