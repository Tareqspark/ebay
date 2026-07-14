// Compact source taxonomy: [name, icon, description, featured, children]
// children: [childName, [grandchildNames...]][]
export const RAW = [
  ["Electronics", "Zap", "Explore the latest TVs, audio gear, wearables, and smart home tech.", true, [
    ["TV & Home Theater", ["4K & 8K TVs","OLED TVs","QLED TVs","Smart TVs","Projectors & Screens","Soundbars","Home Theater Systems","TV Mounts & Stands","Streaming Media Players","AV Receivers","TV Antennas","Universal Remotes","HDMI Cables & Switches"]],
    ["Headphones & Audio", ["Over-Ear Headphones","Wireless Earbuds","Bluetooth Speakers","Turntables & Vinyl","Home Audio Systems","Portable Radios","Microphones","Car Audio","Audio Cables & Adapters","Soundbar Accessories","Noise-Cancelling Headphones","Karaoke Machines","Headphone Amplifiers"]],
    ["Wearable Technology", ["Smartwatches","Fitness Trackers","VR & AR Headsets","Smart Glasses","Smart Rings","Wearable Accessories","Health Monitors","GPS Sport Watches","Smart Earbuds","Kids' Smartwatches"]],
    ["Smart Home", ["Smart Speakers","Smart Plugs","Smart Lighting","Video Doorbells","Security Cameras","Smart Thermostats","Smart Locks","Smart Hubs & Controllers","Smart Sensors","Robot Vacuums","Smart Sprinkler Controllers","Smart Switches","Smart Blinds"]],
    ["Home Surveillance", ["Security Systems","NVR & DVR Kits","Dash Cams","Baby Monitors","Outdoor Cameras","Doorbell Cameras","Motion Sensors","Wireless Camera Kits","Security System Sensors"]],
    ["Batteries & Power", ["AA & AAA Batteries","Rechargeable Batteries","Battery Chargers","Power Banks","Wall Chargers","Solar Chargers","Car Battery Chargers","Portable Generators","Coin Cell Batteries","Power Strips & Surge Protectors"]],
    ["GPS & Navigation", ["Car GPS Units","Handheld GPS","GPS Trackers","Marine GPS","Fitness GPS Devices","Aviation GPS","Pet GPS Trackers"]],
    ["Portable Electronics", ["MP3 Players","Portable DVD Players","Voice Recorders","E-Readers","Handheld Games","Electronic Translators","Portable Projectors","Portable Chargers"]],
    ["Office Electronics", ["Calculators","Label Makers","Paper Shredders","Laminators","Business Projectors","Barcode Scanners","Time Clocks"]]
  ]],
  ["Computers & Tablets", "Laptop", "Laptops, desktops, tablets, and every component in between.", true, [
    ["Laptops", ["Gaming Laptops","Ultrabooks","2-in-1 Laptops","Chromebooks","MacBooks","Business Laptops","Laptop Sleeves & Bags","Laptop Chargers","Budget Laptops","Laptop Batteries"]],
    ["Desktop Computers", ["Gaming Desktops","All-in-One PCs","Mini PCs","Workstations","Desktop Bundles","Refurbished Desktops","Barebone PCs"]],
    ["Tablets", ["Android Tablets","iPads","Windows Tablets","Kids Tablets","Tablet Cases","Tablet Keyboards","Stylus Pens","Tablet Screen Protectors","Tablet Stands"]],
    ["Computer Components", ["Graphics Cards","Processors (CPUs)","Motherboards","RAM & Memory","Power Supplies","Computer Cases","Cooling & Fans","Solid State Drives","Hard Drives","Sound Cards","Capture Cards","Optical Drives"]],
    ["Monitors", ["Gaming Monitors","4K Monitors","Ultrawide Monitors","Portable Monitors","Monitor Mounts & Stands","Touchscreen Monitors","Curved Monitors","Professional Color-Accurate Monitors"]],
    ["Networking", ["Routers","Modems","Mesh WiFi Systems","Network Switches","Range Extenders","Network Cables","Powerline Adapters","WiFi Adapters","Network Attached Storage"]],
    ["Printers & Scanners", ["Inkjet Printers","Laser Printers","3D Printers","All-in-One Printers","Scanners","Printer Ink & Toner","Label Printers","3D Printer Filament","Printer Paper"]],
    ["Computer Accessories", ["Keyboards","Mice","Webcams","USB Hubs","Docking Stations","External Hard Drives","Flash Drives","Mouse Pads","Laptop Stands","Cable Organizers","Privacy Screens"]],
    ["Software", ["Operating Systems","Antivirus & Security","Office & Productivity","Design Software","Educational Software","Accounting Software","Video Editing Software","PDF & Document Software"]]
  ]],
  ["Cell Phones & Accessories", "Smartphone", "Unlocked phones, cases, chargers, and accessories for every device.", true, [
    ["Smartphones", ["Android Phones","iPhones","Unlocked Phones","Refurbished Phones","Rugged Phones","Flip Phones","Foldable Phones","Budget Smartphones"]],
    ["Phone Cases & Covers", ["iPhone Cases","Samsung Cases","Wallet Cases","Rugged Cases","Clear Cases","MagSafe Cases","Battery Cases","Waterproof Cases"]],
    ["Chargers & Cables", ["Wall Chargers","Car Chargers","Wireless Chargers","USB-C Cables","Lightning Cables","Charging Stations","Multi-Device Chargers","Fast Charging Adapters"]],
    ["Screen Protectors", ["Tempered Glass","Privacy Screen Protectors","Camera Lens Protectors","Anti-Glare Protectors","Anti-Blue Light Protectors","Foldable Screen Protectors"]],
    ["Power Banks & Batteries", ["Portable Power Banks","Replacement Batteries","Solar Chargers","Slim Power Banks","Fast-Charging Power Banks","MagSafe Power Banks"]],
    ["Mounts & Holders", ["Car Mounts","Bike Mounts","Desk Stands","PopSockets & Grips","Tripod Mounts","Motorcycle Mounts","Treadmill Mounts"]],
    ["Smartwatch Bands", ["Apple Watch Bands","Fitbit Bands","Samsung Watch Bands","Garmin Bands","Universal Watch Bands","Metal Watch Bands"]],
    ["Prepaid Phones & Plans", ["Prepaid Phones","SIM Cards","Mobile Hotspots","eSIM Devices","International SIM Cards","Prepaid Plan Cards"]],
    ["Headsets & Earpieces", ["Bluetooth Headsets","Wired Earphones","Hands-Free Kits","Conference Speakerphones","Trucker Headsets"]]
  ]],
  ["Video Games & Consoles", "Gamepad2", "Consoles, games, and gear for every platform and player.", true, [
    ["Consoles", ["PlayStation Consoles","Xbox Consoles","Nintendo Switch Consoles","Retro Consoles","Handheld Consoles","Console Bundles","Console Skins & Faceplates","Console Storage"]],
    ["Video Games", ["Action & Adventure","Sports Games","Racing Games","Role-Playing Games","Shooter Games","Family & Kids Games","Strategy Games","Fighting Games","Puzzle Games","Horror Games"]],
    ["Gaming Accessories", ["Controllers","Gaming Headsets","Charging Docks","Memory Cards","Gaming Keyboards","Gaming Mice","Racing Wheels","Controller Skins","VR Motion Controllers","Flight Sticks"]],
    ["PC Gaming", ["Gaming PCs","Gaming Chairs","Gaming Desks","Graphics Cards","Gaming Monitors","Gaming Laptops","Streaming Gear","Capture Cards"]],
    ["Virtual Reality", ["VR Headsets","VR Accessories","VR Games","VR Fitness Gear","VR Controllers"]],
    ["Game Collectibles", ["Amiibo & Figures","Trading Cards","Strategy Guides","Limited Edition Games","Retro Game Cartridges"]]
  ]],
  ["Cameras & Photography", "Camera", "Cameras, lenses, and studio gear for photographers of every level.", false, [
    ["Digital Cameras", ["DSLR Cameras","Mirrorless Cameras","Point & Shoot Cameras","Instant Cameras","Film Cameras","Action Cameras","Medium Format Cameras","360 Cameras"]],
    ["Lenses", ["Zoom Lenses","Prime Lenses","Wide Angle Lenses","Macro Lenses","Telephoto Lenses","Lens Filters","Lens Adapters","Fisheye Lenses"]],
    ["Drones", ["Camera Drones","Racing Drones","Drone Accessories","Drone Batteries","Drone Propellers","Drone Landing Pads","Beginner Drones"]],
    ["Photography Accessories", ["Tripods & Monopods","Camera Bags","Camera Straps","Memory Cards","Flashes & Lighting","Camera Batteries","Remote Shutters","Camera Cleaning Kits","Light Reflectors"]],
    ["Video Production", ["Camcorders","Gimbals & Stabilizers","Shotgun Microphones","Video Lighting Kits","Green Screens","Teleprompters","Boom Poles"]],
    ["Binoculars & Optics", ["Binoculars","Telescopes","Spotting Scopes","Rangefinders","Night Vision Devices","Monoculars"]]
  ]],
  ["Home & Kitchen", "UtensilsCrossed", "Everything for cooking, dining, and everyday living at home.", true, [
    ["Cookware", ["Pots & Pans","Cookware Sets","Dutch Ovens","Skillets & Griddles","Pressure Cookers","Woks","Roasting Pans","Grill Pans","Steamers"]],
    ["Kitchen Appliances", ["Coffee Makers","Blenders","Toasters","Air Fryers","Microwaves","Stand Mixers","Slow Cookers","Food Processors","Electric Kettles","Espresso Machines","Rice Cookers","Juicers","Toaster Ovens"]],
    ["Bakeware", ["Baking Sheets","Cake Pans","Muffin Pans","Cooling Racks","Rolling Pins","Pie Dishes","Bread Pans","Baking Mats","Decorating Tools"]],
    ["Cutlery & Knives", ["Chef Knives","Knife Sets","Cutting Boards","Knife Sharpeners","Kitchen Shears","Steak Knives","Paring Knives"]],
    ["Dinnerware & Tableware", ["Plates","Bowls","Glassware","Flatware Sets","Serveware","Mugs & Cups","Placemats & Table Linens","Wine Glasses","Napkins & Napkin Rings"]],
    ["Kitchen Storage", ["Food Storage Containers","Pantry Organizers","Spice Racks","Kitchen Canisters","Drawer Organizers","Wine Racks","Lazy Susans"]],
    ["Home Décor", ["Wall Art","Decorative Pillows","Candles & Holders","Mirrors","Vases","Area Rugs","Curtains & Drapes","Picture Frames","Wall Clocks","Decorative Trays"]],
    ["Cleaning Supplies", ["Vacuum Cleaners","Mops & Brooms","Cleaning Chemicals","Laundry Supplies","Trash Cans","Air Fresheners","Steam Cleaners","Cleaning Caddies"]],
    ["Small Kitchen Tools", ["Measuring Cups","Kitchen Utensils","Can Openers","Graters & Peelers","Kitchen Scales","Mixing Bowls","Salad Spinners","Funnels & Strainers"]]
  ]],
  ["Furniture", "Sofa", "Stylish, comfortable furniture for every room in the house.", true, [
    ["Living Room Furniture", ["Sofas & Couches","Sectionals","Recliners","Coffee Tables","TV Stands","Accent Chairs","Bookcases","Ottomans","Entertainment Centers","Console Tables","End Tables"]],
    ["Bedroom Furniture", ["Beds & Bed Frames","Mattresses","Dressers","Nightstands","Armoires & Wardrobes","Bedroom Sets","Vanities","Bedroom Benches"]],
    ["Dining Room Furniture", ["Dining Tables","Dining Chairs","Bar Stools","Buffets & Sideboards","Dining Sets","Kitchen Islands","China Cabinets"]],
    ["Home Office Furniture", ["Desks","Office Chairs","Filing Cabinets","Bookshelves","Standing Desks","Office Storage","Credenzas"]],
    ["Outdoor Furniture", ["Patio Sets","Outdoor Sofas","Patio Umbrellas","Outdoor Dining Sets","Hammocks","Outdoor Storage Boxes","Adirondack Chairs"]],
    ["Storage & Organization", ["Shelving Units","Storage Cabinets","Closet Organizers","Shoe Racks","Entryway Furniture","Coat Racks"]],
    ["Kids' Furniture", ["Kids Beds","Toy Storage","Kids Desks","Bunk Beds","Kids Bookshelves","Kids Table & Chair Sets"]]
  ]],
  ["Major Appliances", "Refrigerator", "Kitchen and laundry appliances built for everyday performance.", false, [
    ["Refrigeration", ["Refrigerators","Freezers","Mini Fridges","Wine Coolers","Ice Makers","Beverage Coolers","Refrigerator Water Filters"]],
    ["Laundry", ["Washing Machines","Dryers","Washer & Dryer Sets","Portable Washers","Laundry Pedestals","Ironing Centers"]],
    ["Cooking Appliances", ["Ranges & Stoves","Wall Ovens","Cooktops","Range Hoods","Microwave Ovens","Warming Drawers"]],
    ["Dishwashers", ["Built-In Dishwashers","Portable Dishwashers","Countertop Dishwashers","Dishwasher Parts & Accessories"]],
    ["Climate Control", ["Air Conditioners","Space Heaters","Dehumidifiers","Humidifiers","Air Purifiers","Ceiling Fans","Portable Fans","HVAC Filters"]],
    ["Small Appliances", ["Vacuum Cleaners","Sewing Machines","Water Coolers","Garbage Disposals","Water Softeners","Trash Compactors"]]
  ]],
  ["Bedding & Bath", "BedDouble", "Soft, cozy bedding and bath essentials for a better home.", false, [
    ["Bedding", ["Comforters & Sets","Bed Sheets","Duvet Covers","Quilts & Bedspreads","Pillows","Mattress Protectors","Blankets & Throws","Bed Skirts","Pillow Shams"]],
    ["Bath", ["Towels","Bath Mats","Shower Curtains","Bathroom Accessories","Bathrobes","Shower Caddies","Bath Rugs","Washcloths"]],
    ["Kids Bedding", ["Kids Comforter Sets","Crib Bedding","Kids Sheets","Sleeping Bags for Kids","Nap Mats"]],
    ["Mattresses & Support", ["Memory Foam Mattresses","Innerspring Mattresses","Mattress Toppers","Adjustable Bed Bases","Bed Pillows","Body Pillows","Mattress Foundations"]]
  ]],
  ["Home Improvement & Tools", "Hammer", "Power tools, hardware, and supplies for every project.", true, [
    ["Power Tools", ["Drills","Circular Saws","Sanders","Angle Grinders","Nail Guns","Rotary Tools","Impact Drivers","Reciprocating Saws","Table Saws","Miter Saws","Heat Guns"]],
    ["Hand Tools", ["Wrenches","Screwdrivers","Hammers","Pliers","Tool Sets","Measuring Tools","Levels","Utility Knives","Chisels","Hand Saws"]],
    ["Building Materials", ["Lumber","Drywall","Insulation","Roofing Materials","Concrete & Cement","Plywood & Sheet Goods","Weatherstripping"]],
    ["Plumbing", ["Faucets","Pipes & Fittings","Water Heaters","Toilets","Sump Pumps","Drain Cleaning Tools","Water Filtration Systems"]],
    ["Electrical", ["Wiring & Cable","Circuit Breakers","Light Switches & Outlets","Generators","Extension Cords","Voltage Testers","Conduit & Fittings"]],
    ["Paint & Wall Treatments", ["Interior Paint","Exterior Paint","Paint Brushes & Rollers","Wallpaper","Primers","Painter's Tape","Paint Sprayers","Drop Cloths"]],
    ["Hardware", ["Screws & Fasteners","Hinges","Locks & Deadbolts","Cabinet Hardware","Casters & Wheels","Chain & Rope"]],
    ["Safety Equipment", ["Work Gloves","Safety Glasses","Respirators","Hard Hats","First Aid Kits","High-Visibility Apparel","Ear Protection"]],
    ["Ladders & Scaffolding", ["Step Ladders","Extension Ladders","Scaffolding Towers","Ladder Accessories","Attic Ladders"]]
  ]],
  ["Automotive & Powersports", "Car", "Parts, accessories, and gear for cars, trucks, and powersports.", true, [
    ["Replacement Parts", ["Brakes","Batteries","Filters","Belts & Hoses","Suspension Parts","Engines & Components","Exhaust Systems","Ignition Parts","Cooling System Parts","Transmission Parts","Sensors"]],
    ["Car Electronics", ["Car Stereos","Dash Cams","GPS Units","Backup Cameras","Car Alarms","Amplifiers & Speakers","CB Radios"]],
    ["Tires & Wheels", ["All-Season Tires","Winter Tires","Performance Tires","Wheels & Rims","Tire Accessories","Tire Pressure Monitors","Wheel Locks"]],
    ["Interior Accessories", ["Seat Covers","Floor Mats","Steering Wheel Covers","Car Organizers","Sun Shades","Seat Cushions","Dash Cameras Mounts"]],
    ["Exterior Accessories", ["Car Covers","Roof Racks","Mud Flaps","Bike Racks","Running Boards","Bumper Guards","Cargo Carriers"]],
    ["Tools & Equipment", ["Jacks & Lifts","Diagnostic Tools","Car Care Kits","Battery Chargers","Oil Filters & Funnels","Torque Wrenches"]],
    ["Motorcycle & Powersports", ["Motorcycle Parts","Motorcycle Helmets","Riding Gear","ATV & UTV Parts","Snowmobile Parts","Motorcycle Accessories","Motorcycle Luggage"]],
    ["Car Care", ["Car Wash & Wax","Detailing Supplies","Air Fresheners","Touch-Up Paint","Microfiber Towels","Ceramic Coatings"]]
  ]],
  ["Men's Clothing", "Shirt", "Everyday essentials to statement pieces for men.", true, [
    ["Tops", ["T-Shirts","Dress Shirts","Casual Button-Downs","Sweaters","Hoodies & Sweatshirts","Polo Shirts","Tank Tops","Henleys"]],
    ["Bottoms", ["Jeans","Chinos","Dress Pants","Shorts","Joggers","Cargo Pants","Sweatpants"]],
    ["Outerwear", ["Jackets","Coats","Vests","Blazers","Raincoats","Parkas"]],
    ["Suits & Formal", ["Suits","Suit Separates","Tuxedos","Dress Vests","Suit Accessories","Formal Shirts"]],
    ["Activewear", ["Athletic T-Shirts","Track Pants","Compression Wear","Gym Shorts","Athletic Jackets","Base Layers"]],
    ["Underwear & Sleepwear", ["Boxers & Briefs","Undershirts","Pajamas","Robes","Thermal Underwear","Socks"]],
    ["Accessories", ["Belts","Hats","Ties","Wallets","Sunglasses","Gloves","Pocket Squares"]]
  ]],
  ["Women's Clothing", "Shirt", "Trend-forward styles and everyday essentials for women.", true, [
    ["Tops", ["Blouses","T-Shirts","Tank Tops","Sweaters","Tunics","Bodysuits","Cardigans","Camisoles"]],
    ["Dresses", ["Casual Dresses","Cocktail Dresses","Maxi Dresses","Formal Dresses","Sundresses","Wrap Dresses","Wedding Guest Dresses"]],
    ["Bottoms", ["Jeans","Leggings","Skirts","Shorts","Dress Pants","Capris","Joggers"]],
    ["Outerwear", ["Jackets","Coats","Blazers","Vests","Raincoats","Ponchos & Capes"]],
    ["Activewear", ["Sports Bras","Leggings","Athletic Tops","Track Suits","Yoga Pants","Running Shorts"]],
    ["Intimates & Sleepwear", ["Bras","Panties","Shapewear","Pajamas & Robes","Camisoles","Slips"]],
    ["Accessories", ["Handbags","Scarves","Belts","Sunglasses","Hair Accessories","Gloves","Hats"]],
    ["Maternity", ["Maternity Tops","Maternity Dresses","Maternity Bottoms","Nursing Wear","Maternity Activewear","Maternity Underwear"]]
  ]],
  ["Kids' & Baby", "Baby", "Clothing, gear, and essentials for babies and kids.", true, [
    ["Baby Clothing", ["Bodysuits","Sleepers","Baby Outfit Sets","Baby Outerwear","Socks & Booties","Baby Hats","Baby Mittens"]],
    ["Baby Gear", ["Strollers","Car Seats","Baby Carriers","Diaper Bags","High Chairs","Baby Swings & Bouncers","Baby Walkers","Playards"]],
    ["Nursery", ["Cribs","Changing Tables","Crib Bedding","Baby Monitors","Nursery Décor","Nursery Gliders","Crib Mattresses"]],
    ["Feeding", ["Bottles","Breast Pumps","Baby Food Makers","Bibs & Burp Cloths","Sippy Cups","High Chair Accessories","Formula Dispensers"]],
    ["Diapering", ["Diapers","Baby Wipes","Diaper Pails","Changing Pads","Diaper Rash Cream","Cloth Diapers"]],
    ["Kids' Clothing", ["Boys' Clothing","Girls' Clothing","School Uniforms","Kids' Outerwear","Kids' Sleepwear","Kids' Swimwear"]],
    ["Toys for Babies", ["Rattles & Teethers","Baby Gyms","Stacking Toys","Soft Toys for Infants","Bath Toys"]],
    ["Safety", ["Baby Gates","Outlet Covers","Cabinet Locks","Baby Monitors","Corner & Edge Guards","Baby Proofing Kits"]]
  ]],
  ["Shoes", "Footprints", "Footwear for every occasion, from sneakers to formal wear.", false, [
    ["Men's Shoes", ["Sneakers","Dress Shoes","Boots","Sandals","Loafers","Athletic Shoes","Slippers","Work Boots"]],
    ["Women's Shoes", ["Heels","Flats","Sneakers","Boots","Sandals","Wedges","Slippers","Espadrilles"]],
    ["Kids' Shoes", ["Boys' Shoes","Girls' Shoes","Infant Shoes","School Shoes","Light-Up Shoes","Rain Boots for Kids"]],
    ["Athletic Shoes", ["Running Shoes","Basketball Shoes","Training Shoes","Soccer Cleats","Hiking Shoes","Tennis Shoes","Golf Shoes"]],
    ["Shoe Care & Accessories", ["Shoe Care Kits","Insoles","Shoe Laces","Shoe Trees","Shoe Storage","Shoe Horns"]]
  ]],
  ["Jewelry & Watches", "Watch", "Fine jewelry, fashion pieces, and watches for every style.", false, [
    ["Fine Jewelry", ["Necklaces","Earrings","Bracelets","Rings","Jewelry Sets","Anklets","Pendants"]],
    ["Fashion Jewelry", ["Costume Necklaces","Statement Earrings","Layered Bracelets","Body Jewelry","Brooches & Pins","Charm Bracelets"]],
    ["Watches", ["Men's Watches","Women's Watches","Smartwatches","Luxury Watches","Watch Bands","Pocket Watches","Kids' Watches"]],
    ["Engagement & Wedding", ["Engagement Rings","Wedding Bands","Bridal Sets","Anniversary Rings","Promise Rings"]],
    ["Jewelry Care", ["Jewelry Boxes","Jewelry Cleaning Supplies","Jewelry Organizers","Jewelry Repair Kits","Ring Sizers"]]
  ]],
  ["Health & Beauty", "Sparkles", "Skincare, makeup, wellness, and personal care essentials.", true, [
    ["Skincare", ["Moisturizers","Facial Cleansers","Serums","Sunscreen","Anti-Aging Treatments","Face Masks","Eye Creams","Toners","Exfoliators"]],
    ["Makeup", ["Foundation","Lipstick","Mascara","Eyeshadow","Concealer","Makeup Brushes","Blush","Setting Sprays","Makeup Removers"]],
    ["Hair Care", ["Shampoo & Conditioner","Hair Styling Tools","Hair Color","Hair Treatments","Brushes & Combs","Hair Extensions","Scalp Care","Hair Accessories"]],
    ["Personal Care", ["Deodorant","Oral Care","Shaving & Grooming","Bath & Body","Feminine Care","Foot Care","Hand Sanitizer","Cotton Swabs & Balls"]],
    ["Vitamins & Supplements", ["Multivitamins","Protein Supplements","Herbal Supplements","Weight Management","Probiotics","Sports Nutrition","Omega-3 & Fish Oil"]],
    ["Medical Supplies", ["First Aid","Mobility Aids","Blood Pressure Monitors","Thermometers","Braces & Supports","Compression Wear","Pill Organizers"]],
    ["Fragrance", ["Women's Perfume","Men's Cologne","Fragrance Gift Sets","Body Sprays","Solid Perfumes"]],
    ["Wellness & Relaxation", ["Massage Tools","Aromatherapy","Sleep Aids","Heating Pads","Essential Oil Diffusers"]]
  ]],
  ["Sporting Goods & Outdoors", "Dumbbell", "Gear and equipment for sports, fitness, and outdoor adventure.", true, [
    ["Exercise & Fitness", ["Treadmills","Dumbbells","Yoga Mats","Exercise Bikes","Resistance Bands","Weight Benches","Ellipticals","Kettlebells","Foam Rollers","Jump Ropes"]],
    ["Team Sports", ["Basketball Gear","Soccer Gear","Football Gear","Baseball & Softball Gear","Volleyball Gear","Hockey Gear","Lacrosse Gear"]],
    ["Outdoor Recreation", ["Camping Gear","Hiking Equipment","Tents","Sleeping Bags","Backpacks","Camping Cookware","Camping Furniture","Headlamps & Lanterns"]],
    ["Cycling", ["Mountain Bikes","Road Bikes","Bike Helmets","Bike Accessories","Electric Bikes","Bike Repair Tools","Bike Lights","Bike Locks"]],
    ["Water Sports", ["Kayaks","Paddleboards","Life Jackets","Swim Gear","Fishing Gear","Snorkeling Gear","Wetsuits","Fishing Rods & Reels"]],
    ["Golf", ["Golf Clubs","Golf Balls","Golf Bags","Golf Apparel","Golf Shoes","Golf Accessories","Golf Gloves","Golf Rangefinders"]],
    ["Winter Sports", ["Skis","Snowboards","Winter Sports Apparel","Ice Skates","Snow Sleds","Ski Goggles","Snowshoes"]],
    ["Hunting", ["Hunting Bows","Hunting Optics","Hunting Apparel","Game Cameras","Hunting Blinds","Hunting Backpacks"]]
  ]],
  ["Toys, Games & Hobbies", "Puzzle", "Toys, games, and hobby supplies for kids and collectors alike.", true, [
    ["Building Toys", ["Building Blocks","Construction Sets","Model Kits","Magnetic Building Tiles","Marble Runs"]],
    ["Dolls & Action Figures", ["Fashion Dolls","Action Figures","Playsets","Plush Toys","Collectible Figures","Doll Accessories"]],
    ["Games & Puzzles", ["Board Games","Card Games","Jigsaw Puzzles","Trivia Games","Party Games","3D Puzzles"]],
    ["Outdoor Play", ["Ride-On Toys","Water Toys","Playground Sets","Sports Toys","Trampolines","Sandbox Toys"]],
    ["Educational Toys", ["STEM Toys","Learning Tablets","Musical Toys","Flash Cards","Coding Toys","Science Kits"]],
    ["Remote Control & Vehicles", ["RC Cars","RC Drones","RC Boats","Die-Cast Vehicles","RC Trucks","RC Helicopters"]],
    ["Arts & Crafts for Kids", ["Craft Kits","Coloring Books","Play-Doh & Modeling Compound","Sticker Sets","Kids' Paint Sets"]],
    ["Hobbies", ["Model Trains","RC Hobby Parts","Puzzles for Adults","Collectible Card Games","Diecast Collectibles"]]
  ]],
  ["Pet Supplies", "PawPrint", "Food, toys, and gear to keep every pet happy and healthy.", false, [
    ["Dog Supplies", ["Dog Food","Dog Toys","Dog Beds","Dog Collars & Leashes","Dog Crates","Dog Grooming Supplies","Dog Apparel","Dog Treats","Dog Bowls & Feeders"]],
    ["Cat Supplies", ["Cat Food","Cat Litter","Cat Toys","Cat Trees & Scratchers","Cat Carriers","Cat Treats","Cat Bowls & Feeders"]],
    ["Fish & Aquatic", ["Aquariums","Fish Food","Aquarium Filters","Aquarium Decor","Aquarium Lighting","Aquarium Heaters"]],
    ["Small Animal Supplies", ["Hamster Cages","Rabbit Supplies","Small Pet Food","Bedding & Litter","Small Pet Toys","Small Pet Habitats"]],
    ["Bird Supplies", ["Bird Cages","Bird Food","Bird Toys","Bird Feeders","Bird Perches","Bird Baths"]],
    ["Reptile Supplies", ["Terrariums","Reptile Food","Heating & Lighting","Reptile Substrate","Reptile Decor"]],
    ["Pet Health", ["Flea & Tick Control","Pet Vitamins","Grooming Supplies","Pet Dental Care","Pet First Aid"]]
  ]],
  ["Books, Movies & Music", "BookOpen", "Bestsellers, films, and music across every genre.", false, [
    ["Books", ["Fiction","Non-Fiction","Children's Books","Textbooks","Cookbooks","Comics & Graphic Novels","Self-Help Books","Biographies","Young Adult Books","Poetry"]],
    ["Movies", ["Blu-ray","DVD","4K UHD","Box Sets","Classic Films","Anime","Documentaries","Foreign Films"]],
    ["Music", ["Vinyl Records","CDs","Cassette Tapes","Music Merchandise","Music Box Sets","Sheet Music"]],
    ["Magazines", ["Magazine Subscriptions","Back Issues","Digital Magazine Subscriptions"]],
    ["E-Readers & Audiobooks", ["E-Readers","Audiobook Devices","Audiobook Subscriptions","E-Reader Cases"]]
  ]],
  ["Musical Instruments & Gear", "Music", "Instruments and studio gear for musicians of every level.", false, [
    ["Guitars & Bass", ["Acoustic Guitars","Electric Guitars","Bass Guitars","Guitar Amps","Guitar Accessories","Guitar Pedals","Guitar Strings","Guitar Cases"]],
    ["Keyboards & Pianos", ["Digital Pianos","Keyboards","Synthesizers","Piano Accessories","MIDI Controllers","Piano Benches"]],
    ["Percussion", ["Drum Sets","Cymbals","Electronic Drums","Hand Percussion","Drum Accessories","Drumsticks","Drum Heads"]],
    ["Band & Orchestra", ["Wind Instruments","String Instruments","Brass Instruments","Orchestra Accessories","Instrument Reeds","Rosin"]],
    ["DJ & Studio Equipment", ["DJ Controllers","Studio Monitors","Audio Interfaces","Studio Microphones","Mixers","Studio Headphones","Turntables for DJs"]],
    ["Accessories", ["Instrument Cases","Straps","Tuners","Sheet Music Stands","Metronomes","Music Stands"]]
  ]],
  ["Office & School Supplies", "Briefcase", "Everything for the office, classroom, and home workspace.", false, [
    ["Writing Supplies", ["Pens","Pencils","Markers & Highlighters","Notebooks","Notepads","Erasers"]],
    ["Office Furniture", ["Desks","Office Chairs","Filing Cabinets","Bookcases","Conference Tables","Room Dividers"]],
    ["Paper Products", ["Printer Paper","Sticky Notes","Envelopes","Cardstock","Notepads & Legal Pads","Index Cards"]],
    ["Office Electronics", ["Calculators","Label Makers","Paper Shredders","Laminators","Postage Scales","Time Clocks"]],
    ["School Supplies", ["Backpacks","Lunch Boxes","Binders","Art Supplies for School","Pencil Cases","Rulers & Protractors"]],
    ["Organization", ["Desk Organizers","File Folders","Storage Boxes","Bulletin Boards","Whiteboards","Planners & Calendars"]]
  ]],
  ["Arts, Crafts & Sewing", "Palette", "Supplies for painting, sewing, and every creative project.", false, [
    ["Painting & Drawing", ["Paints","Paint Brushes","Canvases","Drawing Pads","Colored Pencils","Markers","Easels","Palette Knives"]],
    ["Sewing", ["Sewing Machines","Fabric","Thread","Sewing Patterns","Sewing Notions","Sewing Machine Accessories","Pins & Needles","Fabric Scissors"]],
    ["Knitting & Crochet", ["Yarn","Knitting Needles","Crochet Hooks","Knitting Patterns","Stitch Markers","Yarn Bowls"]],
    ["Scrapbooking", ["Scrapbook Paper","Stickers","Photo Albums","Rubber Stamps","Die Cutting Machines","Adhesives & Glue"]],
    ["Beading & Jewelry Making", ["Beads","Jewelry Wire","Jewelry Findings","Jewelry Tools","Charms & Pendants","Beading Thread"]],
    ["Party Supplies", ["Balloons","Party Decorations","Gift Wrap","Greeting Cards","Party Favors","Tablecloths & Banners"]]
  ]],
  ["Collectibles & Fine Art", "Gem", "Rare finds, fine art, and collectibles for enthusiasts.", false, [
    ["Coins & Currency", ["US Coins","World Coins","Paper Money","Bullion & Precious Metals","Coin Collecting Supplies","Coin Albums"]],
    ["Sports Memorabilia", ["Autographed Items","Trading Cards","Game-Used Gear","Sports Photos","Bobbleheads"]],
    ["Fine Art", ["Paintings","Sculptures","Art Prints","Photography Art","Original Drawings","Mixed Media Art"]],
    ["Antiques", ["Antique Furniture","Vintage Home Decor","Antique Tools","Vintage Ceramics","Antique Clocks"]],
    ["Stamps", ["US Stamps","World Stamps","Stamp Collections","Stamp Collecting Supplies","First Day Covers"]],
    ["Entertainment Memorabilia", ["Movie Memorabilia","Music Memorabilia","Autographs","Vintage Posters","Concert Tickets & Programs"]]
  ]],
  ["Garden & Outdoor Living", "Trees", "Everything to grow, garden, and gather outdoors.", true, [
    ["Gardening", ["Plants & Seeds","Planters & Pots","Garden Tools","Soil & Fertilizer","Watering Equipment","Garden Gloves","Greenhouses","Trellises"]],
    ["Lawn Care", ["Lawn Mowers","Trimmers & Edgers","Leaf Blowers","Lawn Sprinklers","Lawn Spreaders","Lawn Aerators"]],
    ["Outdoor Cooking", ["Grills","Smokers","Grill Accessories","Outdoor Pizza Ovens","Grill Covers","Charcoal & Wood Pellets"]],
    ["Outdoor Decor", ["Garden Statues","Outdoor Lighting","Wind Chimes","Flags & Banners","Bird Baths","Garden Flags"]],
    ["Pools & Spas", ["Above-Ground Pools","Pool Accessories","Hot Tubs","Pool Cleaning Supplies","Pool Toys","Pool Covers"]],
    ["Patio & Shade", ["Patio Umbrellas","Gazebos","Awnings","Outdoor Curtains","Shade Sails","Pergolas"]]
  ]],
  ["Grocery & Gourmet Food", "ShoppingBasket", "Pantry staples, snacks, and gourmet foods delivered fresh.", false, [
    ["Pantry Staples", ["Pasta & Rice","Canned Goods","Cooking Oils","Baking Supplies","Spices & Seasonings","Condiments & Sauces","Broths & Stocks"]],
    ["Snacks", ["Chips & Pretzels","Nuts & Dried Fruit","Cookies & Crackers","Candy & Chocolate","Granola & Snack Bars","Popcorn","Jerky"]],
    ["Beverages", ["Coffee","Tea","Juice","Sparkling Water","Sports Drinks","Bottled Water","Energy Drinks"]],
    ["Breakfast Foods", ["Cereal","Oatmeal","Pancake Mix","Breakfast Bars","Syrups & Toppings","Breakfast Drinks"]],
    ["Specialty Diets", ["Gluten-Free Foods","Organic Foods","Keto-Friendly Foods","Vegan Foods","Low-Sugar Foods","Non-GMO Foods"]],
    ["Gourmet & Gifts", ["Gift Baskets","Chocolate & Sweets","Specialty Cheeses","Gourmet Sauces","Olive Oil & Vinegar"]]
  ]],
  ["Luggage & Travel Gear", "Luggage", "Luggage, bags, and accessories for every trip.", false, [
    ["Luggage", ["Checked Luggage","Carry-On Luggage","Luggage Sets","Garment Bags","Hardside Luggage","Softside Luggage"]],
    ["Backpacks & Bags", ["Travel Backpacks","Duffel Bags","Laptop Bags","Toiletry Bags","Fanny Packs","Weekender Bags"]],
    ["Travel Accessories", ["Packing Cubes","Luggage Tags","Travel Pillows","TSA Locks","Luggage Scales","Travel Bottles"]],
    ["Outdoor Travel Gear", ["Travel Adapters","Portable Chargers","Travel First Aid Kits","Travel Umbrellas","Travel Blankets"]]
  ]],
  ["Industrial & Scientific", "FlaskConical", "Equipment and supplies for lab, industrial, and business use.", false, [
    ["Lab Equipment", ["Microscopes","Lab Glassware","Scales & Balances","Test Tubes","Lab Safety Equipment","Centrifuges","Lab Timers"]],
    ["Industrial Equipment", ["Material Handling Equipment","Hydraulic Components","Pneumatic Components","Industrial Storage","Conveyor Parts","Industrial Motors"]],
    ["Safety & Facility Supplies", ["Safety Signage","Janitorial Supplies","Personal Protective Equipment","Spill Containment","Fire Safety Equipment"]],
    ["Fasteners & Hardware", ["Industrial Fasteners","Adhesives & Sealants","Abrasives","Industrial Bearings","Industrial Chains"]],
    ["Packaging & Shipping", ["Shipping Boxes & Mailers","Packing Tape","Shipping Labels","Pallet Wrap","Bubble Wrap & Cushioning","Packing Peanuts"]]
  ]],
  ["Baby & Wedding Registry Essentials", "Gift", "Curated gear and gifts for new parents and newlyweds.", false, [
    ["Registry Building Blocks", ["Baby Registry Starter Kits","Wedding Registry Starter Kits","Gift Cards","Universal Registry Items"]],
    ["New Parent Essentials", ["Baby Care Kits","Postpartum Recovery Kits","Parenting Books","Baby Sleep Aids"]],
    ["Wedding & Home Essentials", ["Cookware Sets","Bedding Sets","Small Kitchen Appliances","Bar & Entertaining Sets"]]
  ]],
  ["Seasonal & Holiday", "PartyPopper", "Decorations, gifts, and essentials for every holiday and season.", false, [
    ["Christmas", ["Christmas Trees","Christmas Ornaments","Christmas Lights","Stockings & Tree Skirts","Holiday Inflatables","Nativity Sets"]],
    ["Halloween", ["Costumes","Halloween Decorations","Halloween Candy","Pumpkin Carving Kits","Halloween Props"]],
    ["Easter", ["Easter Baskets","Easter Egg Decorating","Easter Decorations","Plush Bunnies"]],
    ["Fourth of July", ["Patriotic Decorations","Fireworks Accessories","Outdoor Party Supplies"]],
    ["Thanksgiving & Fall", ["Fall Decor","Thanksgiving Tableware","Harvest Decorations"]],
    ["Valentine's Day", ["Valentine's Décor","Gift Sets","Greeting Cards & Gift Wrap"]]
  ]]
];
