// AUTO-GENERATED FILE. Do not edit directly.
// Source data lives in scripts/category-source.mjs — run
// `node scripts/generate-categories.mjs` to regenerate.
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BedDouble,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Dumbbell,
  FlaskConical,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Hammer,
  Laptop,
  Luggage,
  Music,
  Palette,
  PartyPopper,
  PawPrint,
  Puzzle,
  Refrigerator,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Watch,
  Zap,
} from "lucide-react";

export interface GrandchildCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ChildCategory {
  id: string;
  name: string;
  slug: string;
  children: GrandchildCategory[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  image: string;
  description: string;
  featured: boolean;
  children: ChildCategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    icon: Zap,
    image: "https://picsum.photos/seed/electronics/800/500",
    description: "Explore the latest TVs, audio gear, wearables, and smart home tech.",
    featured: true,
    children: [
      {
        id: "electronics-tv-and-home-theater",
        name: "TV & Home Theater",
        slug: "tv-and-home-theater",
        children: [
          { id: "electronics-tv-and-home-theater-4k-and-8k-tvs", name: "4K & 8K TVs", slug: "4k-and-8k-tvs" },
          { id: "electronics-tv-and-home-theater-oled-tvs", name: "OLED TVs", slug: "oled-tvs" },
          { id: "electronics-tv-and-home-theater-qled-tvs", name: "QLED TVs", slug: "qled-tvs" },
          { id: "electronics-tv-and-home-theater-smart-tvs", name: "Smart TVs", slug: "smart-tvs" },
          { id: "electronics-tv-and-home-theater-projectors-and-screens", name: "Projectors & Screens", slug: "projectors-and-screens" },
          { id: "electronics-tv-and-home-theater-soundbars", name: "Soundbars", slug: "soundbars" },
          { id: "electronics-tv-and-home-theater-home-theater-systems", name: "Home Theater Systems", slug: "home-theater-systems" },
          { id: "electronics-tv-and-home-theater-tv-mounts-and-stands", name: "TV Mounts & Stands", slug: "tv-mounts-and-stands" },
          { id: "electronics-tv-and-home-theater-streaming-media-players", name: "Streaming Media Players", slug: "streaming-media-players" },
          { id: "electronics-tv-and-home-theater-av-receivers", name: "AV Receivers", slug: "av-receivers" },
          { id: "electronics-tv-and-home-theater-tv-antennas", name: "TV Antennas", slug: "tv-antennas" },
          { id: "electronics-tv-and-home-theater-universal-remotes", name: "Universal Remotes", slug: "universal-remotes" },
          { id: "electronics-tv-and-home-theater-hdmi-cables-and-switches", name: "HDMI Cables & Switches", slug: "hdmi-cables-and-switches" }
        ],
      },
      {
        id: "electronics-headphones-and-audio",
        name: "Headphones & Audio",
        slug: "headphones-and-audio",
        children: [
          { id: "electronics-headphones-and-audio-over-ear-headphones", name: "Over-Ear Headphones", slug: "over-ear-headphones" },
          { id: "electronics-headphones-and-audio-wireless-earbuds", name: "Wireless Earbuds", slug: "wireless-earbuds" },
          { id: "electronics-headphones-and-audio-bluetooth-speakers", name: "Bluetooth Speakers", slug: "bluetooth-speakers" },
          { id: "electronics-headphones-and-audio-turntables-and-vinyl", name: "Turntables & Vinyl", slug: "turntables-and-vinyl" },
          { id: "electronics-headphones-and-audio-home-audio-systems", name: "Home Audio Systems", slug: "home-audio-systems" },
          { id: "electronics-headphones-and-audio-portable-radios", name: "Portable Radios", slug: "portable-radios" },
          { id: "electronics-headphones-and-audio-microphones", name: "Microphones", slug: "microphones" },
          { id: "electronics-headphones-and-audio-car-audio", name: "Car Audio", slug: "car-audio" },
          { id: "electronics-headphones-and-audio-audio-cables-and-adapters", name: "Audio Cables & Adapters", slug: "audio-cables-and-adapters" },
          { id: "electronics-headphones-and-audio-soundbar-accessories", name: "Soundbar Accessories", slug: "soundbar-accessories" },
          { id: "electronics-headphones-and-audio-noise-cancelling-headphones", name: "Noise-Cancelling Headphones", slug: "noise-cancelling-headphones" },
          { id: "electronics-headphones-and-audio-karaoke-machines", name: "Karaoke Machines", slug: "karaoke-machines" },
          { id: "electronics-headphones-and-audio-headphone-amplifiers", name: "Headphone Amplifiers", slug: "headphone-amplifiers" }
        ],
      },
      {
        id: "electronics-wearable-technology",
        name: "Wearable Technology",
        slug: "wearable-technology",
        children: [
          { id: "electronics-wearable-technology-smartwatches", name: "Smartwatches", slug: "smartwatches" },
          { id: "electronics-wearable-technology-fitness-trackers", name: "Fitness Trackers", slug: "fitness-trackers" },
          { id: "electronics-wearable-technology-vr-and-ar-headsets", name: "VR & AR Headsets", slug: "vr-and-ar-headsets" },
          { id: "electronics-wearable-technology-smart-glasses", name: "Smart Glasses", slug: "smart-glasses" },
          { id: "electronics-wearable-technology-smart-rings", name: "Smart Rings", slug: "smart-rings" },
          { id: "electronics-wearable-technology-wearable-accessories", name: "Wearable Accessories", slug: "wearable-accessories" },
          { id: "electronics-wearable-technology-health-monitors", name: "Health Monitors", slug: "health-monitors" },
          { id: "electronics-wearable-technology-gps-sport-watches", name: "GPS Sport Watches", slug: "gps-sport-watches" },
          { id: "electronics-wearable-technology-smart-earbuds", name: "Smart Earbuds", slug: "smart-earbuds" },
          { id: "electronics-wearable-technology-kids-smartwatches", name: "Kids' Smartwatches", slug: "kids-smartwatches" }
        ],
      },
      {
        id: "electronics-smart-home",
        name: "Smart Home",
        slug: "smart-home",
        children: [
          { id: "electronics-smart-home-smart-speakers", name: "Smart Speakers", slug: "smart-speakers" },
          { id: "electronics-smart-home-smart-plugs", name: "Smart Plugs", slug: "smart-plugs" },
          { id: "electronics-smart-home-smart-lighting", name: "Smart Lighting", slug: "smart-lighting" },
          { id: "electronics-smart-home-video-doorbells", name: "Video Doorbells", slug: "video-doorbells" },
          { id: "electronics-smart-home-security-cameras", name: "Security Cameras", slug: "security-cameras" },
          { id: "electronics-smart-home-smart-thermostats", name: "Smart Thermostats", slug: "smart-thermostats" },
          { id: "electronics-smart-home-smart-locks", name: "Smart Locks", slug: "smart-locks" },
          { id: "electronics-smart-home-smart-hubs-and-controllers", name: "Smart Hubs & Controllers", slug: "smart-hubs-and-controllers" },
          { id: "electronics-smart-home-smart-sensors", name: "Smart Sensors", slug: "smart-sensors" },
          { id: "electronics-smart-home-robot-vacuums", name: "Robot Vacuums", slug: "robot-vacuums" },
          { id: "electronics-smart-home-smart-sprinkler-controllers", name: "Smart Sprinkler Controllers", slug: "smart-sprinkler-controllers" },
          { id: "electronics-smart-home-smart-switches", name: "Smart Switches", slug: "smart-switches" },
          { id: "electronics-smart-home-smart-blinds", name: "Smart Blinds", slug: "smart-blinds" }
        ],
      },
      {
        id: "electronics-home-surveillance",
        name: "Home Surveillance",
        slug: "home-surveillance",
        children: [
          { id: "electronics-home-surveillance-security-systems", name: "Security Systems", slug: "security-systems" },
          { id: "electronics-home-surveillance-nvr-and-dvr-kits", name: "NVR & DVR Kits", slug: "nvr-and-dvr-kits" },
          { id: "electronics-home-surveillance-dash-cams", name: "Dash Cams", slug: "dash-cams" },
          { id: "electronics-home-surveillance-baby-monitors", name: "Baby Monitors", slug: "baby-monitors" },
          { id: "electronics-home-surveillance-outdoor-cameras", name: "Outdoor Cameras", slug: "outdoor-cameras" },
          { id: "electronics-home-surveillance-doorbell-cameras", name: "Doorbell Cameras", slug: "doorbell-cameras" },
          { id: "electronics-home-surveillance-motion-sensors", name: "Motion Sensors", slug: "motion-sensors" },
          { id: "electronics-home-surveillance-wireless-camera-kits", name: "Wireless Camera Kits", slug: "wireless-camera-kits" },
          { id: "electronics-home-surveillance-security-system-sensors", name: "Security System Sensors", slug: "security-system-sensors" }
        ],
      },
      {
        id: "electronics-batteries-and-power",
        name: "Batteries & Power",
        slug: "batteries-and-power",
        children: [
          { id: "electronics-batteries-and-power-aa-and-aaa-batteries", name: "AA & AAA Batteries", slug: "aa-and-aaa-batteries" },
          { id: "electronics-batteries-and-power-rechargeable-batteries", name: "Rechargeable Batteries", slug: "rechargeable-batteries" },
          { id: "electronics-batteries-and-power-battery-chargers", name: "Battery Chargers", slug: "battery-chargers" },
          { id: "electronics-batteries-and-power-power-banks", name: "Power Banks", slug: "power-banks" },
          { id: "electronics-batteries-and-power-wall-chargers", name: "Wall Chargers", slug: "wall-chargers" },
          { id: "electronics-batteries-and-power-solar-chargers", name: "Solar Chargers", slug: "solar-chargers" },
          { id: "electronics-batteries-and-power-car-battery-chargers", name: "Car Battery Chargers", slug: "car-battery-chargers" },
          { id: "electronics-batteries-and-power-portable-generators", name: "Portable Generators", slug: "portable-generators" },
          { id: "electronics-batteries-and-power-coin-cell-batteries", name: "Coin Cell Batteries", slug: "coin-cell-batteries" },
          { id: "electronics-batteries-and-power-power-strips-and-surge-protectors", name: "Power Strips & Surge Protectors", slug: "power-strips-and-surge-protectors" }
        ],
      },
      {
        id: "electronics-gps-and-navigation",
        name: "GPS & Navigation",
        slug: "gps-and-navigation",
        children: [
          { id: "electronics-gps-and-navigation-car-gps-units", name: "Car GPS Units", slug: "car-gps-units" },
          { id: "electronics-gps-and-navigation-handheld-gps", name: "Handheld GPS", slug: "handheld-gps" },
          { id: "electronics-gps-and-navigation-gps-trackers", name: "GPS Trackers", slug: "gps-trackers" },
          { id: "electronics-gps-and-navigation-marine-gps", name: "Marine GPS", slug: "marine-gps" },
          { id: "electronics-gps-and-navigation-fitness-gps-devices", name: "Fitness GPS Devices", slug: "fitness-gps-devices" },
          { id: "electronics-gps-and-navigation-aviation-gps", name: "Aviation GPS", slug: "aviation-gps" },
          { id: "electronics-gps-and-navigation-pet-gps-trackers", name: "Pet GPS Trackers", slug: "pet-gps-trackers" }
        ],
      },
      {
        id: "electronics-portable-electronics",
        name: "Portable Electronics",
        slug: "portable-electronics",
        children: [
          { id: "electronics-portable-electronics-mp3-players", name: "MP3 Players", slug: "mp3-players" },
          { id: "electronics-portable-electronics-portable-dvd-players", name: "Portable DVD Players", slug: "portable-dvd-players" },
          { id: "electronics-portable-electronics-voice-recorders", name: "Voice Recorders", slug: "voice-recorders" },
          { id: "electronics-portable-electronics-e-readers", name: "E-Readers", slug: "e-readers" },
          { id: "electronics-portable-electronics-handheld-games", name: "Handheld Games", slug: "handheld-games" },
          { id: "electronics-portable-electronics-electronic-translators", name: "Electronic Translators", slug: "electronic-translators" },
          { id: "electronics-portable-electronics-portable-projectors", name: "Portable Projectors", slug: "portable-projectors" },
          { id: "electronics-portable-electronics-portable-chargers", name: "Portable Chargers", slug: "portable-chargers" }
        ],
      },
      {
        id: "electronics-office-electronics",
        name: "Office Electronics",
        slug: "office-electronics",
        children: [
          { id: "electronics-office-electronics-calculators", name: "Calculators", slug: "calculators" },
          { id: "electronics-office-electronics-label-makers", name: "Label Makers", slug: "label-makers" },
          { id: "electronics-office-electronics-paper-shredders", name: "Paper Shredders", slug: "paper-shredders" },
          { id: "electronics-office-electronics-laminators", name: "Laminators", slug: "laminators" },
          { id: "electronics-office-electronics-business-projectors", name: "Business Projectors", slug: "business-projectors" },
          { id: "electronics-office-electronics-barcode-scanners", name: "Barcode Scanners", slug: "barcode-scanners" },
          { id: "electronics-office-electronics-time-clocks", name: "Time Clocks", slug: "time-clocks" }
        ],
      }
    ],
  },
  {
    id: "computers-and-tablets",
    name: "Computers & Tablets",
    slug: "computers-and-tablets",
    icon: Laptop,
    image: "https://picsum.photos/seed/computers-and-tablets/800/500",
    description: "Laptops, desktops, tablets, and every component in between.",
    featured: true,
    children: [
      {
        id: "computers-and-tablets-laptops",
        name: "Laptops",
        slug: "laptops",
        children: [
          { id: "computers-and-tablets-laptops-gaming-laptops", name: "Gaming Laptops", slug: "gaming-laptops" },
          { id: "computers-and-tablets-laptops-ultrabooks", name: "Ultrabooks", slug: "ultrabooks" },
          { id: "computers-and-tablets-laptops-2-in-1-laptops", name: "2-in-1 Laptops", slug: "2-in-1-laptops" },
          { id: "computers-and-tablets-laptops-chromebooks", name: "Chromebooks", slug: "chromebooks" },
          { id: "computers-and-tablets-laptops-macbooks", name: "MacBooks", slug: "macbooks" },
          { id: "computers-and-tablets-laptops-business-laptops", name: "Business Laptops", slug: "business-laptops" },
          { id: "computers-and-tablets-laptops-laptop-sleeves-and-bags", name: "Laptop Sleeves & Bags", slug: "laptop-sleeves-and-bags" },
          { id: "computers-and-tablets-laptops-laptop-chargers", name: "Laptop Chargers", slug: "laptop-chargers" },
          { id: "computers-and-tablets-laptops-budget-laptops", name: "Budget Laptops", slug: "budget-laptops" },
          { id: "computers-and-tablets-laptops-laptop-batteries", name: "Laptop Batteries", slug: "laptop-batteries" }
        ],
      },
      {
        id: "computers-and-tablets-desktop-computers",
        name: "Desktop Computers",
        slug: "desktop-computers",
        children: [
          { id: "computers-and-tablets-desktop-computers-gaming-desktops", name: "Gaming Desktops", slug: "gaming-desktops" },
          { id: "computers-and-tablets-desktop-computers-all-in-one-pcs", name: "All-in-One PCs", slug: "all-in-one-pcs" },
          { id: "computers-and-tablets-desktop-computers-mini-pcs", name: "Mini PCs", slug: "mini-pcs" },
          { id: "computers-and-tablets-desktop-computers-workstations", name: "Workstations", slug: "workstations" },
          { id: "computers-and-tablets-desktop-computers-desktop-bundles", name: "Desktop Bundles", slug: "desktop-bundles" },
          { id: "computers-and-tablets-desktop-computers-refurbished-desktops", name: "Refurbished Desktops", slug: "refurbished-desktops" },
          { id: "computers-and-tablets-desktop-computers-barebone-pcs", name: "Barebone PCs", slug: "barebone-pcs" }
        ],
      },
      {
        id: "computers-and-tablets-tablets",
        name: "Tablets",
        slug: "tablets",
        children: [
          { id: "computers-and-tablets-tablets-android-tablets", name: "Android Tablets", slug: "android-tablets" },
          { id: "computers-and-tablets-tablets-ipads", name: "iPads", slug: "ipads" },
          { id: "computers-and-tablets-tablets-windows-tablets", name: "Windows Tablets", slug: "windows-tablets" },
          { id: "computers-and-tablets-tablets-kids-tablets", name: "Kids Tablets", slug: "kids-tablets" },
          { id: "computers-and-tablets-tablets-tablet-cases", name: "Tablet Cases", slug: "tablet-cases" },
          { id: "computers-and-tablets-tablets-tablet-keyboards", name: "Tablet Keyboards", slug: "tablet-keyboards" },
          { id: "computers-and-tablets-tablets-stylus-pens", name: "Stylus Pens", slug: "stylus-pens" },
          { id: "computers-and-tablets-tablets-tablet-screen-protectors", name: "Tablet Screen Protectors", slug: "tablet-screen-protectors" },
          { id: "computers-and-tablets-tablets-tablet-stands", name: "Tablet Stands", slug: "tablet-stands" }
        ],
      },
      {
        id: "computers-and-tablets-computer-components",
        name: "Computer Components",
        slug: "computer-components",
        children: [
          { id: "computers-and-tablets-computer-components-graphics-cards", name: "Graphics Cards", slug: "graphics-cards" },
          { id: "computers-and-tablets-computer-components-processors-cpus", name: "Processors (CPUs)", slug: "processors-cpus" },
          { id: "computers-and-tablets-computer-components-motherboards", name: "Motherboards", slug: "motherboards" },
          { id: "computers-and-tablets-computer-components-ram-and-memory", name: "RAM & Memory", slug: "ram-and-memory" },
          { id: "computers-and-tablets-computer-components-power-supplies", name: "Power Supplies", slug: "power-supplies" },
          { id: "computers-and-tablets-computer-components-computer-cases", name: "Computer Cases", slug: "computer-cases" },
          { id: "computers-and-tablets-computer-components-cooling-and-fans", name: "Cooling & Fans", slug: "cooling-and-fans" },
          { id: "computers-and-tablets-computer-components-solid-state-drives", name: "Solid State Drives", slug: "solid-state-drives" },
          { id: "computers-and-tablets-computer-components-hard-drives", name: "Hard Drives", slug: "hard-drives" },
          { id: "computers-and-tablets-computer-components-sound-cards", name: "Sound Cards", slug: "sound-cards" },
          { id: "computers-and-tablets-computer-components-capture-cards", name: "Capture Cards", slug: "capture-cards" },
          { id: "computers-and-tablets-computer-components-optical-drives", name: "Optical Drives", slug: "optical-drives" }
        ],
      },
      {
        id: "computers-and-tablets-monitors",
        name: "Monitors",
        slug: "monitors",
        children: [
          { id: "computers-and-tablets-monitors-gaming-monitors", name: "Gaming Monitors", slug: "gaming-monitors" },
          { id: "computers-and-tablets-monitors-4k-monitors", name: "4K Monitors", slug: "4k-monitors" },
          { id: "computers-and-tablets-monitors-ultrawide-monitors", name: "Ultrawide Monitors", slug: "ultrawide-monitors" },
          { id: "computers-and-tablets-monitors-portable-monitors", name: "Portable Monitors", slug: "portable-monitors" },
          { id: "computers-and-tablets-monitors-monitor-mounts-and-stands", name: "Monitor Mounts & Stands", slug: "monitor-mounts-and-stands" },
          { id: "computers-and-tablets-monitors-touchscreen-monitors", name: "Touchscreen Monitors", slug: "touchscreen-monitors" },
          { id: "computers-and-tablets-monitors-curved-monitors", name: "Curved Monitors", slug: "curved-monitors" },
          { id: "computers-and-tablets-monitors-professional-color-accurate-monitors", name: "Professional Color-Accurate Monitors", slug: "professional-color-accurate-monitors" }
        ],
      },
      {
        id: "computers-and-tablets-networking",
        name: "Networking",
        slug: "networking",
        children: [
          { id: "computers-and-tablets-networking-routers", name: "Routers", slug: "routers" },
          { id: "computers-and-tablets-networking-modems", name: "Modems", slug: "modems" },
          { id: "computers-and-tablets-networking-mesh-wifi-systems", name: "Mesh WiFi Systems", slug: "mesh-wifi-systems" },
          { id: "computers-and-tablets-networking-network-switches", name: "Network Switches", slug: "network-switches" },
          { id: "computers-and-tablets-networking-range-extenders", name: "Range Extenders", slug: "range-extenders" },
          { id: "computers-and-tablets-networking-network-cables", name: "Network Cables", slug: "network-cables" },
          { id: "computers-and-tablets-networking-powerline-adapters", name: "Powerline Adapters", slug: "powerline-adapters" },
          { id: "computers-and-tablets-networking-wifi-adapters", name: "WiFi Adapters", slug: "wifi-adapters" },
          { id: "computers-and-tablets-networking-network-attached-storage", name: "Network Attached Storage", slug: "network-attached-storage" }
        ],
      },
      {
        id: "computers-and-tablets-printers-and-scanners",
        name: "Printers & Scanners",
        slug: "printers-and-scanners",
        children: [
          { id: "computers-and-tablets-printers-and-scanners-inkjet-printers", name: "Inkjet Printers", slug: "inkjet-printers" },
          { id: "computers-and-tablets-printers-and-scanners-laser-printers", name: "Laser Printers", slug: "laser-printers" },
          { id: "computers-and-tablets-printers-and-scanners-3d-printers", name: "3D Printers", slug: "3d-printers" },
          { id: "computers-and-tablets-printers-and-scanners-all-in-one-printers", name: "All-in-One Printers", slug: "all-in-one-printers" },
          { id: "computers-and-tablets-printers-and-scanners-scanners", name: "Scanners", slug: "scanners" },
          { id: "computers-and-tablets-printers-and-scanners-printer-ink-and-toner", name: "Printer Ink & Toner", slug: "printer-ink-and-toner" },
          { id: "computers-and-tablets-printers-and-scanners-label-printers", name: "Label Printers", slug: "label-printers" },
          { id: "computers-and-tablets-printers-and-scanners-3d-printer-filament", name: "3D Printer Filament", slug: "3d-printer-filament" },
          { id: "computers-and-tablets-printers-and-scanners-printer-paper", name: "Printer Paper", slug: "printer-paper" }
        ],
      },
      {
        id: "computers-and-tablets-computer-accessories",
        name: "Computer Accessories",
        slug: "computer-accessories",
        children: [
          { id: "computers-and-tablets-computer-accessories-keyboards", name: "Keyboards", slug: "keyboards" },
          { id: "computers-and-tablets-computer-accessories-mice", name: "Mice", slug: "mice" },
          { id: "computers-and-tablets-computer-accessories-webcams", name: "Webcams", slug: "webcams" },
          { id: "computers-and-tablets-computer-accessories-usb-hubs", name: "USB Hubs", slug: "usb-hubs" },
          { id: "computers-and-tablets-computer-accessories-docking-stations", name: "Docking Stations", slug: "docking-stations" },
          { id: "computers-and-tablets-computer-accessories-external-hard-drives", name: "External Hard Drives", slug: "external-hard-drives" },
          { id: "computers-and-tablets-computer-accessories-flash-drives", name: "Flash Drives", slug: "flash-drives" },
          { id: "computers-and-tablets-computer-accessories-mouse-pads", name: "Mouse Pads", slug: "mouse-pads" },
          { id: "computers-and-tablets-computer-accessories-laptop-stands", name: "Laptop Stands", slug: "laptop-stands" },
          { id: "computers-and-tablets-computer-accessories-cable-organizers", name: "Cable Organizers", slug: "cable-organizers" },
          { id: "computers-and-tablets-computer-accessories-privacy-screens", name: "Privacy Screens", slug: "privacy-screens" }
        ],
      },
      {
        id: "computers-and-tablets-software",
        name: "Software",
        slug: "software",
        children: [
          { id: "computers-and-tablets-software-operating-systems", name: "Operating Systems", slug: "operating-systems" },
          { id: "computers-and-tablets-software-antivirus-and-security", name: "Antivirus & Security", slug: "antivirus-and-security" },
          { id: "computers-and-tablets-software-office-and-productivity", name: "Office & Productivity", slug: "office-and-productivity" },
          { id: "computers-and-tablets-software-design-software", name: "Design Software", slug: "design-software" },
          { id: "computers-and-tablets-software-educational-software", name: "Educational Software", slug: "educational-software" },
          { id: "computers-and-tablets-software-accounting-software", name: "Accounting Software", slug: "accounting-software" },
          { id: "computers-and-tablets-software-video-editing-software", name: "Video Editing Software", slug: "video-editing-software" },
          { id: "computers-and-tablets-software-pdf-and-document-software", name: "PDF & Document Software", slug: "pdf-and-document-software" }
        ],
      }
    ],
  },
  {
    id: "cell-phones-and-accessories",
    name: "Cell Phones & Accessories",
    slug: "cell-phones-and-accessories",
    icon: Smartphone,
    image: "https://picsum.photos/seed/cell-phones-and-accessories/800/500",
    description: "Unlocked phones, cases, chargers, and accessories for every device.",
    featured: true,
    children: [
      {
        id: "cell-phones-and-accessories-smartphones",
        name: "Smartphones",
        slug: "smartphones",
        children: [
          { id: "cell-phones-and-accessories-smartphones-android-phones", name: "Android Phones", slug: "android-phones" },
          { id: "cell-phones-and-accessories-smartphones-iphones", name: "iPhones", slug: "iphones" },
          { id: "cell-phones-and-accessories-smartphones-unlocked-phones", name: "Unlocked Phones", slug: "unlocked-phones" },
          { id: "cell-phones-and-accessories-smartphones-refurbished-phones", name: "Refurbished Phones", slug: "refurbished-phones" },
          { id: "cell-phones-and-accessories-smartphones-rugged-phones", name: "Rugged Phones", slug: "rugged-phones" },
          { id: "cell-phones-and-accessories-smartphones-flip-phones", name: "Flip Phones", slug: "flip-phones" },
          { id: "cell-phones-and-accessories-smartphones-foldable-phones", name: "Foldable Phones", slug: "foldable-phones" },
          { id: "cell-phones-and-accessories-smartphones-budget-smartphones", name: "Budget Smartphones", slug: "budget-smartphones" }
        ],
      },
      {
        id: "cell-phones-and-accessories-phone-cases-and-covers",
        name: "Phone Cases & Covers",
        slug: "phone-cases-and-covers",
        children: [
          { id: "cell-phones-and-accessories-phone-cases-and-covers-iphone-cases", name: "iPhone Cases", slug: "iphone-cases" },
          { id: "cell-phones-and-accessories-phone-cases-and-covers-samsung-cases", name: "Samsung Cases", slug: "samsung-cases" },
          { id: "cell-phones-and-accessories-phone-cases-and-covers-wallet-cases", name: "Wallet Cases", slug: "wallet-cases" },
          { id: "cell-phones-and-accessories-phone-cases-and-covers-rugged-cases", name: "Rugged Cases", slug: "rugged-cases" },
          { id: "cell-phones-and-accessories-phone-cases-and-covers-clear-cases", name: "Clear Cases", slug: "clear-cases" },
          { id: "cell-phones-and-accessories-phone-cases-and-covers-magsafe-cases", name: "MagSafe Cases", slug: "magsafe-cases" },
          { id: "cell-phones-and-accessories-phone-cases-and-covers-battery-cases", name: "Battery Cases", slug: "battery-cases" },
          { id: "cell-phones-and-accessories-phone-cases-and-covers-waterproof-cases", name: "Waterproof Cases", slug: "waterproof-cases" }
        ],
      },
      {
        id: "cell-phones-and-accessories-chargers-and-cables",
        name: "Chargers & Cables",
        slug: "chargers-and-cables",
        children: [
          { id: "cell-phones-and-accessories-chargers-and-cables-wall-chargers", name: "Wall Chargers", slug: "wall-chargers" },
          { id: "cell-phones-and-accessories-chargers-and-cables-car-chargers", name: "Car Chargers", slug: "car-chargers" },
          { id: "cell-phones-and-accessories-chargers-and-cables-wireless-chargers", name: "Wireless Chargers", slug: "wireless-chargers" },
          { id: "cell-phones-and-accessories-chargers-and-cables-usb-c-cables", name: "USB-C Cables", slug: "usb-c-cables" },
          { id: "cell-phones-and-accessories-chargers-and-cables-lightning-cables", name: "Lightning Cables", slug: "lightning-cables" },
          { id: "cell-phones-and-accessories-chargers-and-cables-charging-stations", name: "Charging Stations", slug: "charging-stations" },
          { id: "cell-phones-and-accessories-chargers-and-cables-multi-device-chargers", name: "Multi-Device Chargers", slug: "multi-device-chargers" },
          { id: "cell-phones-and-accessories-chargers-and-cables-fast-charging-adapters", name: "Fast Charging Adapters", slug: "fast-charging-adapters" }
        ],
      },
      {
        id: "cell-phones-and-accessories-screen-protectors",
        name: "Screen Protectors",
        slug: "screen-protectors",
        children: [
          { id: "cell-phones-and-accessories-screen-protectors-tempered-glass", name: "Tempered Glass", slug: "tempered-glass" },
          { id: "cell-phones-and-accessories-screen-protectors-privacy-screen-protectors", name: "Privacy Screen Protectors", slug: "privacy-screen-protectors" },
          { id: "cell-phones-and-accessories-screen-protectors-camera-lens-protectors", name: "Camera Lens Protectors", slug: "camera-lens-protectors" },
          { id: "cell-phones-and-accessories-screen-protectors-anti-glare-protectors", name: "Anti-Glare Protectors", slug: "anti-glare-protectors" },
          { id: "cell-phones-and-accessories-screen-protectors-anti-blue-light-protectors", name: "Anti-Blue Light Protectors", slug: "anti-blue-light-protectors" },
          { id: "cell-phones-and-accessories-screen-protectors-foldable-screen-protectors", name: "Foldable Screen Protectors", slug: "foldable-screen-protectors" }
        ],
      },
      {
        id: "cell-phones-and-accessories-power-banks-and-batteries",
        name: "Power Banks & Batteries",
        slug: "power-banks-and-batteries",
        children: [
          { id: "cell-phones-and-accessories-power-banks-and-batteries-portable-power-banks", name: "Portable Power Banks", slug: "portable-power-banks" },
          { id: "cell-phones-and-accessories-power-banks-and-batteries-replacement-batteries", name: "Replacement Batteries", slug: "replacement-batteries" },
          { id: "cell-phones-and-accessories-power-banks-and-batteries-solar-chargers", name: "Solar Chargers", slug: "solar-chargers" },
          { id: "cell-phones-and-accessories-power-banks-and-batteries-slim-power-banks", name: "Slim Power Banks", slug: "slim-power-banks" },
          { id: "cell-phones-and-accessories-power-banks-and-batteries-fast-charging-power-banks", name: "Fast-Charging Power Banks", slug: "fast-charging-power-banks" },
          { id: "cell-phones-and-accessories-power-banks-and-batteries-magsafe-power-banks", name: "MagSafe Power Banks", slug: "magsafe-power-banks" }
        ],
      },
      {
        id: "cell-phones-and-accessories-mounts-and-holders",
        name: "Mounts & Holders",
        slug: "mounts-and-holders",
        children: [
          { id: "cell-phones-and-accessories-mounts-and-holders-car-mounts", name: "Car Mounts", slug: "car-mounts" },
          { id: "cell-phones-and-accessories-mounts-and-holders-bike-mounts", name: "Bike Mounts", slug: "bike-mounts" },
          { id: "cell-phones-and-accessories-mounts-and-holders-desk-stands", name: "Desk Stands", slug: "desk-stands" },
          { id: "cell-phones-and-accessories-mounts-and-holders-popsockets-and-grips", name: "PopSockets & Grips", slug: "popsockets-and-grips" },
          { id: "cell-phones-and-accessories-mounts-and-holders-tripod-mounts", name: "Tripod Mounts", slug: "tripod-mounts" },
          { id: "cell-phones-and-accessories-mounts-and-holders-motorcycle-mounts", name: "Motorcycle Mounts", slug: "motorcycle-mounts" },
          { id: "cell-phones-and-accessories-mounts-and-holders-treadmill-mounts", name: "Treadmill Mounts", slug: "treadmill-mounts" }
        ],
      },
      {
        id: "cell-phones-and-accessories-smartwatch-bands",
        name: "Smartwatch Bands",
        slug: "smartwatch-bands",
        children: [
          { id: "cell-phones-and-accessories-smartwatch-bands-apple-watch-bands", name: "Apple Watch Bands", slug: "apple-watch-bands" },
          { id: "cell-phones-and-accessories-smartwatch-bands-fitbit-bands", name: "Fitbit Bands", slug: "fitbit-bands" },
          { id: "cell-phones-and-accessories-smartwatch-bands-samsung-watch-bands", name: "Samsung Watch Bands", slug: "samsung-watch-bands" },
          { id: "cell-phones-and-accessories-smartwatch-bands-garmin-bands", name: "Garmin Bands", slug: "garmin-bands" },
          { id: "cell-phones-and-accessories-smartwatch-bands-universal-watch-bands", name: "Universal Watch Bands", slug: "universal-watch-bands" },
          { id: "cell-phones-and-accessories-smartwatch-bands-metal-watch-bands", name: "Metal Watch Bands", slug: "metal-watch-bands" }
        ],
      },
      {
        id: "cell-phones-and-accessories-prepaid-phones-and-plans",
        name: "Prepaid Phones & Plans",
        slug: "prepaid-phones-and-plans",
        children: [
          { id: "cell-phones-and-accessories-prepaid-phones-and-plans-prepaid-phones", name: "Prepaid Phones", slug: "prepaid-phones" },
          { id: "cell-phones-and-accessories-prepaid-phones-and-plans-sim-cards", name: "SIM Cards", slug: "sim-cards" },
          { id: "cell-phones-and-accessories-prepaid-phones-and-plans-mobile-hotspots", name: "Mobile Hotspots", slug: "mobile-hotspots" },
          { id: "cell-phones-and-accessories-prepaid-phones-and-plans-esim-devices", name: "eSIM Devices", slug: "esim-devices" },
          { id: "cell-phones-and-accessories-prepaid-phones-and-plans-international-sim-cards", name: "International SIM Cards", slug: "international-sim-cards" },
          { id: "cell-phones-and-accessories-prepaid-phones-and-plans-prepaid-plan-cards", name: "Prepaid Plan Cards", slug: "prepaid-plan-cards" }
        ],
      },
      {
        id: "cell-phones-and-accessories-headsets-and-earpieces",
        name: "Headsets & Earpieces",
        slug: "headsets-and-earpieces",
        children: [
          { id: "cell-phones-and-accessories-headsets-and-earpieces-bluetooth-headsets", name: "Bluetooth Headsets", slug: "bluetooth-headsets" },
          { id: "cell-phones-and-accessories-headsets-and-earpieces-wired-earphones", name: "Wired Earphones", slug: "wired-earphones" },
          { id: "cell-phones-and-accessories-headsets-and-earpieces-hands-free-kits", name: "Hands-Free Kits", slug: "hands-free-kits" },
          { id: "cell-phones-and-accessories-headsets-and-earpieces-conference-speakerphones", name: "Conference Speakerphones", slug: "conference-speakerphones" },
          { id: "cell-phones-and-accessories-headsets-and-earpieces-trucker-headsets", name: "Trucker Headsets", slug: "trucker-headsets" }
        ],
      }
    ],
  },
  {
    id: "video-games-and-consoles",
    name: "Video Games & Consoles",
    slug: "video-games-and-consoles",
    icon: Gamepad2,
    image: "https://picsum.photos/seed/video-games-and-consoles/800/500",
    description: "Consoles, games, and gear for every platform and player.",
    featured: true,
    children: [
      {
        id: "video-games-and-consoles-consoles",
        name: "Consoles",
        slug: "consoles",
        children: [
          { id: "video-games-and-consoles-consoles-playstation-consoles", name: "PlayStation Consoles", slug: "playstation-consoles" },
          { id: "video-games-and-consoles-consoles-xbox-consoles", name: "Xbox Consoles", slug: "xbox-consoles" },
          { id: "video-games-and-consoles-consoles-nintendo-switch-consoles", name: "Nintendo Switch Consoles", slug: "nintendo-switch-consoles" },
          { id: "video-games-and-consoles-consoles-retro-consoles", name: "Retro Consoles", slug: "retro-consoles" },
          { id: "video-games-and-consoles-consoles-handheld-consoles", name: "Handheld Consoles", slug: "handheld-consoles" },
          { id: "video-games-and-consoles-consoles-console-bundles", name: "Console Bundles", slug: "console-bundles" },
          { id: "video-games-and-consoles-consoles-console-skins-and-faceplates", name: "Console Skins & Faceplates", slug: "console-skins-and-faceplates" },
          { id: "video-games-and-consoles-consoles-console-storage", name: "Console Storage", slug: "console-storage" }
        ],
      },
      {
        id: "video-games-and-consoles-video-games",
        name: "Video Games",
        slug: "video-games",
        children: [
          { id: "video-games-and-consoles-video-games-action-and-adventure", name: "Action & Adventure", slug: "action-and-adventure" },
          { id: "video-games-and-consoles-video-games-sports-games", name: "Sports Games", slug: "sports-games" },
          { id: "video-games-and-consoles-video-games-racing-games", name: "Racing Games", slug: "racing-games" },
          { id: "video-games-and-consoles-video-games-role-playing-games", name: "Role-Playing Games", slug: "role-playing-games" },
          { id: "video-games-and-consoles-video-games-shooter-games", name: "Shooter Games", slug: "shooter-games" },
          { id: "video-games-and-consoles-video-games-family-and-kids-games", name: "Family & Kids Games", slug: "family-and-kids-games" },
          { id: "video-games-and-consoles-video-games-strategy-games", name: "Strategy Games", slug: "strategy-games" },
          { id: "video-games-and-consoles-video-games-fighting-games", name: "Fighting Games", slug: "fighting-games" },
          { id: "video-games-and-consoles-video-games-puzzle-games", name: "Puzzle Games", slug: "puzzle-games" },
          { id: "video-games-and-consoles-video-games-horror-games", name: "Horror Games", slug: "horror-games" }
        ],
      },
      {
        id: "video-games-and-consoles-gaming-accessories",
        name: "Gaming Accessories",
        slug: "gaming-accessories",
        children: [
          { id: "video-games-and-consoles-gaming-accessories-controllers", name: "Controllers", slug: "controllers" },
          { id: "video-games-and-consoles-gaming-accessories-gaming-headsets", name: "Gaming Headsets", slug: "gaming-headsets" },
          { id: "video-games-and-consoles-gaming-accessories-charging-docks", name: "Charging Docks", slug: "charging-docks" },
          { id: "video-games-and-consoles-gaming-accessories-memory-cards", name: "Memory Cards", slug: "memory-cards" },
          { id: "video-games-and-consoles-gaming-accessories-gaming-keyboards", name: "Gaming Keyboards", slug: "gaming-keyboards" },
          { id: "video-games-and-consoles-gaming-accessories-gaming-mice", name: "Gaming Mice", slug: "gaming-mice" },
          { id: "video-games-and-consoles-gaming-accessories-racing-wheels", name: "Racing Wheels", slug: "racing-wheels" },
          { id: "video-games-and-consoles-gaming-accessories-controller-skins", name: "Controller Skins", slug: "controller-skins" },
          { id: "video-games-and-consoles-gaming-accessories-vr-motion-controllers", name: "VR Motion Controllers", slug: "vr-motion-controllers" },
          { id: "video-games-and-consoles-gaming-accessories-flight-sticks", name: "Flight Sticks", slug: "flight-sticks" }
        ],
      },
      {
        id: "video-games-and-consoles-pc-gaming",
        name: "PC Gaming",
        slug: "pc-gaming",
        children: [
          { id: "video-games-and-consoles-pc-gaming-gaming-pcs", name: "Gaming PCs", slug: "gaming-pcs" },
          { id: "video-games-and-consoles-pc-gaming-gaming-chairs", name: "Gaming Chairs", slug: "gaming-chairs" },
          { id: "video-games-and-consoles-pc-gaming-gaming-desks", name: "Gaming Desks", slug: "gaming-desks" },
          { id: "video-games-and-consoles-pc-gaming-graphics-cards", name: "Graphics Cards", slug: "graphics-cards" },
          { id: "video-games-and-consoles-pc-gaming-gaming-monitors", name: "Gaming Monitors", slug: "gaming-monitors" },
          { id: "video-games-and-consoles-pc-gaming-gaming-laptops", name: "Gaming Laptops", slug: "gaming-laptops" },
          { id: "video-games-and-consoles-pc-gaming-streaming-gear", name: "Streaming Gear", slug: "streaming-gear" },
          { id: "video-games-and-consoles-pc-gaming-capture-cards", name: "Capture Cards", slug: "capture-cards" }
        ],
      },
      {
        id: "video-games-and-consoles-virtual-reality",
        name: "Virtual Reality",
        slug: "virtual-reality",
        children: [
          { id: "video-games-and-consoles-virtual-reality-vr-headsets", name: "VR Headsets", slug: "vr-headsets" },
          { id: "video-games-and-consoles-virtual-reality-vr-accessories", name: "VR Accessories", slug: "vr-accessories" },
          { id: "video-games-and-consoles-virtual-reality-vr-games", name: "VR Games", slug: "vr-games" },
          { id: "video-games-and-consoles-virtual-reality-vr-fitness-gear", name: "VR Fitness Gear", slug: "vr-fitness-gear" },
          { id: "video-games-and-consoles-virtual-reality-vr-controllers", name: "VR Controllers", slug: "vr-controllers" }
        ],
      },
      {
        id: "video-games-and-consoles-game-collectibles",
        name: "Game Collectibles",
        slug: "game-collectibles",
        children: [
          { id: "video-games-and-consoles-game-collectibles-amiibo-and-figures", name: "Amiibo & Figures", slug: "amiibo-and-figures" },
          { id: "video-games-and-consoles-game-collectibles-trading-cards", name: "Trading Cards", slug: "trading-cards" },
          { id: "video-games-and-consoles-game-collectibles-strategy-guides", name: "Strategy Guides", slug: "strategy-guides" },
          { id: "video-games-and-consoles-game-collectibles-limited-edition-games", name: "Limited Edition Games", slug: "limited-edition-games" },
          { id: "video-games-and-consoles-game-collectibles-retro-game-cartridges", name: "Retro Game Cartridges", slug: "retro-game-cartridges" }
        ],
      }
    ],
  },
  {
    id: "cameras-and-photography",
    name: "Cameras & Photography",
    slug: "cameras-and-photography",
    icon: Camera,
    image: "https://picsum.photos/seed/cameras-and-photography/800/500",
    description: "Cameras, lenses, and studio gear for photographers of every level.",
    featured: false,
    children: [
      {
        id: "cameras-and-photography-digital-cameras",
        name: "Digital Cameras",
        slug: "digital-cameras",
        children: [
          { id: "cameras-and-photography-digital-cameras-dslr-cameras", name: "DSLR Cameras", slug: "dslr-cameras" },
          { id: "cameras-and-photography-digital-cameras-mirrorless-cameras", name: "Mirrorless Cameras", slug: "mirrorless-cameras" },
          { id: "cameras-and-photography-digital-cameras-point-and-shoot-cameras", name: "Point & Shoot Cameras", slug: "point-and-shoot-cameras" },
          { id: "cameras-and-photography-digital-cameras-instant-cameras", name: "Instant Cameras", slug: "instant-cameras" },
          { id: "cameras-and-photography-digital-cameras-film-cameras", name: "Film Cameras", slug: "film-cameras" },
          { id: "cameras-and-photography-digital-cameras-action-cameras", name: "Action Cameras", slug: "action-cameras" },
          { id: "cameras-and-photography-digital-cameras-medium-format-cameras", name: "Medium Format Cameras", slug: "medium-format-cameras" },
          { id: "cameras-and-photography-digital-cameras-360-cameras", name: "360 Cameras", slug: "360-cameras" }
        ],
      },
      {
        id: "cameras-and-photography-lenses",
        name: "Lenses",
        slug: "lenses",
        children: [
          { id: "cameras-and-photography-lenses-zoom-lenses", name: "Zoom Lenses", slug: "zoom-lenses" },
          { id: "cameras-and-photography-lenses-prime-lenses", name: "Prime Lenses", slug: "prime-lenses" },
          { id: "cameras-and-photography-lenses-wide-angle-lenses", name: "Wide Angle Lenses", slug: "wide-angle-lenses" },
          { id: "cameras-and-photography-lenses-macro-lenses", name: "Macro Lenses", slug: "macro-lenses" },
          { id: "cameras-and-photography-lenses-telephoto-lenses", name: "Telephoto Lenses", slug: "telephoto-lenses" },
          { id: "cameras-and-photography-lenses-lens-filters", name: "Lens Filters", slug: "lens-filters" },
          { id: "cameras-and-photography-lenses-lens-adapters", name: "Lens Adapters", slug: "lens-adapters" },
          { id: "cameras-and-photography-lenses-fisheye-lenses", name: "Fisheye Lenses", slug: "fisheye-lenses" }
        ],
      },
      {
        id: "cameras-and-photography-drones",
        name: "Drones",
        slug: "drones",
        children: [
          { id: "cameras-and-photography-drones-camera-drones", name: "Camera Drones", slug: "camera-drones" },
          { id: "cameras-and-photography-drones-racing-drones", name: "Racing Drones", slug: "racing-drones" },
          { id: "cameras-and-photography-drones-drone-accessories", name: "Drone Accessories", slug: "drone-accessories" },
          { id: "cameras-and-photography-drones-drone-batteries", name: "Drone Batteries", slug: "drone-batteries" },
          { id: "cameras-and-photography-drones-drone-propellers", name: "Drone Propellers", slug: "drone-propellers" },
          { id: "cameras-and-photography-drones-drone-landing-pads", name: "Drone Landing Pads", slug: "drone-landing-pads" },
          { id: "cameras-and-photography-drones-beginner-drones", name: "Beginner Drones", slug: "beginner-drones" }
        ],
      },
      {
        id: "cameras-and-photography-photography-accessories",
        name: "Photography Accessories",
        slug: "photography-accessories",
        children: [
          { id: "cameras-and-photography-photography-accessories-tripods-and-monopods", name: "Tripods & Monopods", slug: "tripods-and-monopods" },
          { id: "cameras-and-photography-photography-accessories-camera-bags", name: "Camera Bags", slug: "camera-bags" },
          { id: "cameras-and-photography-photography-accessories-camera-straps", name: "Camera Straps", slug: "camera-straps" },
          { id: "cameras-and-photography-photography-accessories-memory-cards", name: "Memory Cards", slug: "memory-cards" },
          { id: "cameras-and-photography-photography-accessories-flashes-and-lighting", name: "Flashes & Lighting", slug: "flashes-and-lighting" },
          { id: "cameras-and-photography-photography-accessories-camera-batteries", name: "Camera Batteries", slug: "camera-batteries" },
          { id: "cameras-and-photography-photography-accessories-remote-shutters", name: "Remote Shutters", slug: "remote-shutters" },
          { id: "cameras-and-photography-photography-accessories-camera-cleaning-kits", name: "Camera Cleaning Kits", slug: "camera-cleaning-kits" },
          { id: "cameras-and-photography-photography-accessories-light-reflectors", name: "Light Reflectors", slug: "light-reflectors" }
        ],
      },
      {
        id: "cameras-and-photography-video-production",
        name: "Video Production",
        slug: "video-production",
        children: [
          { id: "cameras-and-photography-video-production-camcorders", name: "Camcorders", slug: "camcorders" },
          { id: "cameras-and-photography-video-production-gimbals-and-stabilizers", name: "Gimbals & Stabilizers", slug: "gimbals-and-stabilizers" },
          { id: "cameras-and-photography-video-production-shotgun-microphones", name: "Shotgun Microphones", slug: "shotgun-microphones" },
          { id: "cameras-and-photography-video-production-video-lighting-kits", name: "Video Lighting Kits", slug: "video-lighting-kits" },
          { id: "cameras-and-photography-video-production-green-screens", name: "Green Screens", slug: "green-screens" },
          { id: "cameras-and-photography-video-production-teleprompters", name: "Teleprompters", slug: "teleprompters" },
          { id: "cameras-and-photography-video-production-boom-poles", name: "Boom Poles", slug: "boom-poles" }
        ],
      },
      {
        id: "cameras-and-photography-binoculars-and-optics",
        name: "Binoculars & Optics",
        slug: "binoculars-and-optics",
        children: [
          { id: "cameras-and-photography-binoculars-and-optics-binoculars", name: "Binoculars", slug: "binoculars" },
          { id: "cameras-and-photography-binoculars-and-optics-telescopes", name: "Telescopes", slug: "telescopes" },
          { id: "cameras-and-photography-binoculars-and-optics-spotting-scopes", name: "Spotting Scopes", slug: "spotting-scopes" },
          { id: "cameras-and-photography-binoculars-and-optics-rangefinders", name: "Rangefinders", slug: "rangefinders" },
          { id: "cameras-and-photography-binoculars-and-optics-night-vision-devices", name: "Night Vision Devices", slug: "night-vision-devices" },
          { id: "cameras-and-photography-binoculars-and-optics-monoculars", name: "Monoculars", slug: "monoculars" }
        ],
      }
    ],
  },
  {
    id: "home-and-kitchen",
    name: "Home & Kitchen",
    slug: "home-and-kitchen",
    icon: UtensilsCrossed,
    image: "https://picsum.photos/seed/home-and-kitchen/800/500",
    description: "Everything for cooking, dining, and everyday living at home.",
    featured: true,
    children: [
      {
        id: "home-and-kitchen-cookware",
        name: "Cookware",
        slug: "cookware",
        children: [
          { id: "home-and-kitchen-cookware-pots-and-pans", name: "Pots & Pans", slug: "pots-and-pans" },
          { id: "home-and-kitchen-cookware-cookware-sets", name: "Cookware Sets", slug: "cookware-sets" },
          { id: "home-and-kitchen-cookware-dutch-ovens", name: "Dutch Ovens", slug: "dutch-ovens" },
          { id: "home-and-kitchen-cookware-skillets-and-griddles", name: "Skillets & Griddles", slug: "skillets-and-griddles" },
          { id: "home-and-kitchen-cookware-pressure-cookers", name: "Pressure Cookers", slug: "pressure-cookers" },
          { id: "home-and-kitchen-cookware-woks", name: "Woks", slug: "woks" },
          { id: "home-and-kitchen-cookware-roasting-pans", name: "Roasting Pans", slug: "roasting-pans" },
          { id: "home-and-kitchen-cookware-grill-pans", name: "Grill Pans", slug: "grill-pans" },
          { id: "home-and-kitchen-cookware-steamers", name: "Steamers", slug: "steamers" }
        ],
      },
      {
        id: "home-and-kitchen-kitchen-appliances",
        name: "Kitchen Appliances",
        slug: "kitchen-appliances",
        children: [
          { id: "home-and-kitchen-kitchen-appliances-coffee-makers", name: "Coffee Makers", slug: "coffee-makers" },
          { id: "home-and-kitchen-kitchen-appliances-blenders", name: "Blenders", slug: "blenders" },
          { id: "home-and-kitchen-kitchen-appliances-toasters", name: "Toasters", slug: "toasters" },
          { id: "home-and-kitchen-kitchen-appliances-air-fryers", name: "Air Fryers", slug: "air-fryers" },
          { id: "home-and-kitchen-kitchen-appliances-microwaves", name: "Microwaves", slug: "microwaves" },
          { id: "home-and-kitchen-kitchen-appliances-stand-mixers", name: "Stand Mixers", slug: "stand-mixers" },
          { id: "home-and-kitchen-kitchen-appliances-slow-cookers", name: "Slow Cookers", slug: "slow-cookers" },
          { id: "home-and-kitchen-kitchen-appliances-food-processors", name: "Food Processors", slug: "food-processors" },
          { id: "home-and-kitchen-kitchen-appliances-electric-kettles", name: "Electric Kettles", slug: "electric-kettles" },
          { id: "home-and-kitchen-kitchen-appliances-espresso-machines", name: "Espresso Machines", slug: "espresso-machines" },
          { id: "home-and-kitchen-kitchen-appliances-rice-cookers", name: "Rice Cookers", slug: "rice-cookers" },
          { id: "home-and-kitchen-kitchen-appliances-juicers", name: "Juicers", slug: "juicers" },
          { id: "home-and-kitchen-kitchen-appliances-toaster-ovens", name: "Toaster Ovens", slug: "toaster-ovens" }
        ],
      },
      {
        id: "home-and-kitchen-bakeware",
        name: "Bakeware",
        slug: "bakeware",
        children: [
          { id: "home-and-kitchen-bakeware-baking-sheets", name: "Baking Sheets", slug: "baking-sheets" },
          { id: "home-and-kitchen-bakeware-cake-pans", name: "Cake Pans", slug: "cake-pans" },
          { id: "home-and-kitchen-bakeware-muffin-pans", name: "Muffin Pans", slug: "muffin-pans" },
          { id: "home-and-kitchen-bakeware-cooling-racks", name: "Cooling Racks", slug: "cooling-racks" },
          { id: "home-and-kitchen-bakeware-rolling-pins", name: "Rolling Pins", slug: "rolling-pins" },
          { id: "home-and-kitchen-bakeware-pie-dishes", name: "Pie Dishes", slug: "pie-dishes" },
          { id: "home-and-kitchen-bakeware-bread-pans", name: "Bread Pans", slug: "bread-pans" },
          { id: "home-and-kitchen-bakeware-baking-mats", name: "Baking Mats", slug: "baking-mats" },
          { id: "home-and-kitchen-bakeware-decorating-tools", name: "Decorating Tools", slug: "decorating-tools" }
        ],
      },
      {
        id: "home-and-kitchen-cutlery-and-knives",
        name: "Cutlery & Knives",
        slug: "cutlery-and-knives",
        children: [
          { id: "home-and-kitchen-cutlery-and-knives-chef-knives", name: "Chef Knives", slug: "chef-knives" },
          { id: "home-and-kitchen-cutlery-and-knives-knife-sets", name: "Knife Sets", slug: "knife-sets" },
          { id: "home-and-kitchen-cutlery-and-knives-cutting-boards", name: "Cutting Boards", slug: "cutting-boards" },
          { id: "home-and-kitchen-cutlery-and-knives-knife-sharpeners", name: "Knife Sharpeners", slug: "knife-sharpeners" },
          { id: "home-and-kitchen-cutlery-and-knives-kitchen-shears", name: "Kitchen Shears", slug: "kitchen-shears" },
          { id: "home-and-kitchen-cutlery-and-knives-steak-knives", name: "Steak Knives", slug: "steak-knives" },
          { id: "home-and-kitchen-cutlery-and-knives-paring-knives", name: "Paring Knives", slug: "paring-knives" }
        ],
      },
      {
        id: "home-and-kitchen-dinnerware-and-tableware",
        name: "Dinnerware & Tableware",
        slug: "dinnerware-and-tableware",
        children: [
          { id: "home-and-kitchen-dinnerware-and-tableware-plates", name: "Plates", slug: "plates" },
          { id: "home-and-kitchen-dinnerware-and-tableware-bowls", name: "Bowls", slug: "bowls" },
          { id: "home-and-kitchen-dinnerware-and-tableware-glassware", name: "Glassware", slug: "glassware" },
          { id: "home-and-kitchen-dinnerware-and-tableware-flatware-sets", name: "Flatware Sets", slug: "flatware-sets" },
          { id: "home-and-kitchen-dinnerware-and-tableware-serveware", name: "Serveware", slug: "serveware" },
          { id: "home-and-kitchen-dinnerware-and-tableware-mugs-and-cups", name: "Mugs & Cups", slug: "mugs-and-cups" },
          { id: "home-and-kitchen-dinnerware-and-tableware-placemats-and-table-linens", name: "Placemats & Table Linens", slug: "placemats-and-table-linens" },
          { id: "home-and-kitchen-dinnerware-and-tableware-wine-glasses", name: "Wine Glasses", slug: "wine-glasses" },
          { id: "home-and-kitchen-dinnerware-and-tableware-napkins-and-napkin-rings", name: "Napkins & Napkin Rings", slug: "napkins-and-napkin-rings" }
        ],
      },
      {
        id: "home-and-kitchen-kitchen-storage",
        name: "Kitchen Storage",
        slug: "kitchen-storage",
        children: [
          { id: "home-and-kitchen-kitchen-storage-food-storage-containers", name: "Food Storage Containers", slug: "food-storage-containers" },
          { id: "home-and-kitchen-kitchen-storage-pantry-organizers", name: "Pantry Organizers", slug: "pantry-organizers" },
          { id: "home-and-kitchen-kitchen-storage-spice-racks", name: "Spice Racks", slug: "spice-racks" },
          { id: "home-and-kitchen-kitchen-storage-kitchen-canisters", name: "Kitchen Canisters", slug: "kitchen-canisters" },
          { id: "home-and-kitchen-kitchen-storage-drawer-organizers", name: "Drawer Organizers", slug: "drawer-organizers" },
          { id: "home-and-kitchen-kitchen-storage-wine-racks", name: "Wine Racks", slug: "wine-racks" },
          { id: "home-and-kitchen-kitchen-storage-lazy-susans", name: "Lazy Susans", slug: "lazy-susans" }
        ],
      },
      {
        id: "home-and-kitchen-home-d-cor",
        name: "Home Décor",
        slug: "home-d-cor",
        children: [
          { id: "home-and-kitchen-home-d-cor-wall-art", name: "Wall Art", slug: "wall-art" },
          { id: "home-and-kitchen-home-d-cor-decorative-pillows", name: "Decorative Pillows", slug: "decorative-pillows" },
          { id: "home-and-kitchen-home-d-cor-candles-and-holders", name: "Candles & Holders", slug: "candles-and-holders" },
          { id: "home-and-kitchen-home-d-cor-mirrors", name: "Mirrors", slug: "mirrors" },
          { id: "home-and-kitchen-home-d-cor-vases", name: "Vases", slug: "vases" },
          { id: "home-and-kitchen-home-d-cor-area-rugs", name: "Area Rugs", slug: "area-rugs" },
          { id: "home-and-kitchen-home-d-cor-curtains-and-drapes", name: "Curtains & Drapes", slug: "curtains-and-drapes" },
          { id: "home-and-kitchen-home-d-cor-picture-frames", name: "Picture Frames", slug: "picture-frames" },
          { id: "home-and-kitchen-home-d-cor-wall-clocks", name: "Wall Clocks", slug: "wall-clocks" },
          { id: "home-and-kitchen-home-d-cor-decorative-trays", name: "Decorative Trays", slug: "decorative-trays" }
        ],
      },
      {
        id: "home-and-kitchen-cleaning-supplies",
        name: "Cleaning Supplies",
        slug: "cleaning-supplies",
        children: [
          { id: "home-and-kitchen-cleaning-supplies-vacuum-cleaners", name: "Vacuum Cleaners", slug: "vacuum-cleaners" },
          { id: "home-and-kitchen-cleaning-supplies-mops-and-brooms", name: "Mops & Brooms", slug: "mops-and-brooms" },
          { id: "home-and-kitchen-cleaning-supplies-cleaning-chemicals", name: "Cleaning Chemicals", slug: "cleaning-chemicals" },
          { id: "home-and-kitchen-cleaning-supplies-laundry-supplies", name: "Laundry Supplies", slug: "laundry-supplies" },
          { id: "home-and-kitchen-cleaning-supplies-trash-cans", name: "Trash Cans", slug: "trash-cans" },
          { id: "home-and-kitchen-cleaning-supplies-air-fresheners", name: "Air Fresheners", slug: "air-fresheners" },
          { id: "home-and-kitchen-cleaning-supplies-steam-cleaners", name: "Steam Cleaners", slug: "steam-cleaners" },
          { id: "home-and-kitchen-cleaning-supplies-cleaning-caddies", name: "Cleaning Caddies", slug: "cleaning-caddies" }
        ],
      },
      {
        id: "home-and-kitchen-small-kitchen-tools",
        name: "Small Kitchen Tools",
        slug: "small-kitchen-tools",
        children: [
          { id: "home-and-kitchen-small-kitchen-tools-measuring-cups", name: "Measuring Cups", slug: "measuring-cups" },
          { id: "home-and-kitchen-small-kitchen-tools-kitchen-utensils", name: "Kitchen Utensils", slug: "kitchen-utensils" },
          { id: "home-and-kitchen-small-kitchen-tools-can-openers", name: "Can Openers", slug: "can-openers" },
          { id: "home-and-kitchen-small-kitchen-tools-graters-and-peelers", name: "Graters & Peelers", slug: "graters-and-peelers" },
          { id: "home-and-kitchen-small-kitchen-tools-kitchen-scales", name: "Kitchen Scales", slug: "kitchen-scales" },
          { id: "home-and-kitchen-small-kitchen-tools-mixing-bowls", name: "Mixing Bowls", slug: "mixing-bowls" },
          { id: "home-and-kitchen-small-kitchen-tools-salad-spinners", name: "Salad Spinners", slug: "salad-spinners" },
          { id: "home-and-kitchen-small-kitchen-tools-funnels-and-strainers", name: "Funnels & Strainers", slug: "funnels-and-strainers" }
        ],
      }
    ],
  },
  {
    id: "furniture",
    name: "Furniture",
    slug: "furniture",
    icon: Sofa,
    image: "https://picsum.photos/seed/furniture/800/500",
    description: "Stylish, comfortable furniture for every room in the house.",
    featured: true,
    children: [
      {
        id: "furniture-living-room-furniture",
        name: "Living Room Furniture",
        slug: "living-room-furniture",
        children: [
          { id: "furniture-living-room-furniture-sofas-and-couches", name: "Sofas & Couches", slug: "sofas-and-couches" },
          { id: "furniture-living-room-furniture-sectionals", name: "Sectionals", slug: "sectionals" },
          { id: "furniture-living-room-furniture-recliners", name: "Recliners", slug: "recliners" },
          { id: "furniture-living-room-furniture-coffee-tables", name: "Coffee Tables", slug: "coffee-tables" },
          { id: "furniture-living-room-furniture-tv-stands", name: "TV Stands", slug: "tv-stands" },
          { id: "furniture-living-room-furniture-accent-chairs", name: "Accent Chairs", slug: "accent-chairs" },
          { id: "furniture-living-room-furniture-bookcases", name: "Bookcases", slug: "bookcases" },
          { id: "furniture-living-room-furniture-ottomans", name: "Ottomans", slug: "ottomans" },
          { id: "furniture-living-room-furniture-entertainment-centers", name: "Entertainment Centers", slug: "entertainment-centers" },
          { id: "furniture-living-room-furniture-console-tables", name: "Console Tables", slug: "console-tables" },
          { id: "furniture-living-room-furniture-end-tables", name: "End Tables", slug: "end-tables" }
        ],
      },
      {
        id: "furniture-bedroom-furniture",
        name: "Bedroom Furniture",
        slug: "bedroom-furniture",
        children: [
          { id: "furniture-bedroom-furniture-beds-and-bed-frames", name: "Beds & Bed Frames", slug: "beds-and-bed-frames" },
          { id: "furniture-bedroom-furniture-mattresses", name: "Mattresses", slug: "mattresses" },
          { id: "furniture-bedroom-furniture-dressers", name: "Dressers", slug: "dressers" },
          { id: "furniture-bedroom-furniture-nightstands", name: "Nightstands", slug: "nightstands" },
          { id: "furniture-bedroom-furniture-armoires-and-wardrobes", name: "Armoires & Wardrobes", slug: "armoires-and-wardrobes" },
          { id: "furniture-bedroom-furniture-bedroom-sets", name: "Bedroom Sets", slug: "bedroom-sets" },
          { id: "furniture-bedroom-furniture-vanities", name: "Vanities", slug: "vanities" },
          { id: "furniture-bedroom-furniture-bedroom-benches", name: "Bedroom Benches", slug: "bedroom-benches" }
        ],
      },
      {
        id: "furniture-dining-room-furniture",
        name: "Dining Room Furniture",
        slug: "dining-room-furniture",
        children: [
          { id: "furniture-dining-room-furniture-dining-tables", name: "Dining Tables", slug: "dining-tables" },
          { id: "furniture-dining-room-furniture-dining-chairs", name: "Dining Chairs", slug: "dining-chairs" },
          { id: "furniture-dining-room-furniture-bar-stools", name: "Bar Stools", slug: "bar-stools" },
          { id: "furniture-dining-room-furniture-buffets-and-sideboards", name: "Buffets & Sideboards", slug: "buffets-and-sideboards" },
          { id: "furniture-dining-room-furniture-dining-sets", name: "Dining Sets", slug: "dining-sets" },
          { id: "furniture-dining-room-furniture-kitchen-islands", name: "Kitchen Islands", slug: "kitchen-islands" },
          { id: "furniture-dining-room-furniture-china-cabinets", name: "China Cabinets", slug: "china-cabinets" }
        ],
      },
      {
        id: "furniture-home-office-furniture",
        name: "Home Office Furniture",
        slug: "home-office-furniture",
        children: [
          { id: "furniture-home-office-furniture-desks", name: "Desks", slug: "desks" },
          { id: "furniture-home-office-furniture-office-chairs", name: "Office Chairs", slug: "office-chairs" },
          { id: "furniture-home-office-furniture-filing-cabinets", name: "Filing Cabinets", slug: "filing-cabinets" },
          { id: "furniture-home-office-furniture-bookshelves", name: "Bookshelves", slug: "bookshelves" },
          { id: "furniture-home-office-furniture-standing-desks", name: "Standing Desks", slug: "standing-desks" },
          { id: "furniture-home-office-furniture-office-storage", name: "Office Storage", slug: "office-storage" },
          { id: "furniture-home-office-furniture-credenzas", name: "Credenzas", slug: "credenzas" }
        ],
      },
      {
        id: "furniture-outdoor-furniture",
        name: "Outdoor Furniture",
        slug: "outdoor-furniture",
        children: [
          { id: "furniture-outdoor-furniture-patio-sets", name: "Patio Sets", slug: "patio-sets" },
          { id: "furniture-outdoor-furniture-outdoor-sofas", name: "Outdoor Sofas", slug: "outdoor-sofas" },
          { id: "furniture-outdoor-furniture-patio-umbrellas", name: "Patio Umbrellas", slug: "patio-umbrellas" },
          { id: "furniture-outdoor-furniture-outdoor-dining-sets", name: "Outdoor Dining Sets", slug: "outdoor-dining-sets" },
          { id: "furniture-outdoor-furniture-hammocks", name: "Hammocks", slug: "hammocks" },
          { id: "furniture-outdoor-furniture-outdoor-storage-boxes", name: "Outdoor Storage Boxes", slug: "outdoor-storage-boxes" },
          { id: "furniture-outdoor-furniture-adirondack-chairs", name: "Adirondack Chairs", slug: "adirondack-chairs" }
        ],
      },
      {
        id: "furniture-storage-and-organization",
        name: "Storage & Organization",
        slug: "storage-and-organization",
        children: [
          { id: "furniture-storage-and-organization-shelving-units", name: "Shelving Units", slug: "shelving-units" },
          { id: "furniture-storage-and-organization-storage-cabinets", name: "Storage Cabinets", slug: "storage-cabinets" },
          { id: "furniture-storage-and-organization-closet-organizers", name: "Closet Organizers", slug: "closet-organizers" },
          { id: "furniture-storage-and-organization-shoe-racks", name: "Shoe Racks", slug: "shoe-racks" },
          { id: "furniture-storage-and-organization-entryway-furniture", name: "Entryway Furniture", slug: "entryway-furniture" },
          { id: "furniture-storage-and-organization-coat-racks", name: "Coat Racks", slug: "coat-racks" }
        ],
      },
      {
        id: "furniture-kids-furniture",
        name: "Kids' Furniture",
        slug: "kids-furniture",
        children: [
          { id: "furniture-kids-furniture-kids-beds", name: "Kids Beds", slug: "kids-beds" },
          { id: "furniture-kids-furniture-toy-storage", name: "Toy Storage", slug: "toy-storage" },
          { id: "furniture-kids-furniture-kids-desks", name: "Kids Desks", slug: "kids-desks" },
          { id: "furniture-kids-furniture-bunk-beds", name: "Bunk Beds", slug: "bunk-beds" },
          { id: "furniture-kids-furniture-kids-bookshelves", name: "Kids Bookshelves", slug: "kids-bookshelves" },
          { id: "furniture-kids-furniture-kids-table-and-chair-sets", name: "Kids Table & Chair Sets", slug: "kids-table-and-chair-sets" }
        ],
      }
    ],
  },
  {
    id: "major-appliances",
    name: "Major Appliances",
    slug: "major-appliances",
    icon: Refrigerator,
    image: "https://picsum.photos/seed/major-appliances/800/500",
    description: "Kitchen and laundry appliances built for everyday performance.",
    featured: false,
    children: [
      {
        id: "major-appliances-refrigeration",
        name: "Refrigeration",
        slug: "refrigeration",
        children: [
          { id: "major-appliances-refrigeration-refrigerators", name: "Refrigerators", slug: "refrigerators" },
          { id: "major-appliances-refrigeration-freezers", name: "Freezers", slug: "freezers" },
          { id: "major-appliances-refrigeration-mini-fridges", name: "Mini Fridges", slug: "mini-fridges" },
          { id: "major-appliances-refrigeration-wine-coolers", name: "Wine Coolers", slug: "wine-coolers" },
          { id: "major-appliances-refrigeration-ice-makers", name: "Ice Makers", slug: "ice-makers" },
          { id: "major-appliances-refrigeration-beverage-coolers", name: "Beverage Coolers", slug: "beverage-coolers" },
          { id: "major-appliances-refrigeration-refrigerator-water-filters", name: "Refrigerator Water Filters", slug: "refrigerator-water-filters" }
        ],
      },
      {
        id: "major-appliances-laundry",
        name: "Laundry",
        slug: "laundry",
        children: [
          { id: "major-appliances-laundry-washing-machines", name: "Washing Machines", slug: "washing-machines" },
          { id: "major-appliances-laundry-dryers", name: "Dryers", slug: "dryers" },
          { id: "major-appliances-laundry-washer-and-dryer-sets", name: "Washer & Dryer Sets", slug: "washer-and-dryer-sets" },
          { id: "major-appliances-laundry-portable-washers", name: "Portable Washers", slug: "portable-washers" },
          { id: "major-appliances-laundry-laundry-pedestals", name: "Laundry Pedestals", slug: "laundry-pedestals" },
          { id: "major-appliances-laundry-ironing-centers", name: "Ironing Centers", slug: "ironing-centers" }
        ],
      },
      {
        id: "major-appliances-cooking-appliances",
        name: "Cooking Appliances",
        slug: "cooking-appliances",
        children: [
          { id: "major-appliances-cooking-appliances-ranges-and-stoves", name: "Ranges & Stoves", slug: "ranges-and-stoves" },
          { id: "major-appliances-cooking-appliances-wall-ovens", name: "Wall Ovens", slug: "wall-ovens" },
          { id: "major-appliances-cooking-appliances-cooktops", name: "Cooktops", slug: "cooktops" },
          { id: "major-appliances-cooking-appliances-range-hoods", name: "Range Hoods", slug: "range-hoods" },
          { id: "major-appliances-cooking-appliances-microwave-ovens", name: "Microwave Ovens", slug: "microwave-ovens" },
          { id: "major-appliances-cooking-appliances-warming-drawers", name: "Warming Drawers", slug: "warming-drawers" }
        ],
      },
      {
        id: "major-appliances-dishwashers",
        name: "Dishwashers",
        slug: "dishwashers",
        children: [
          { id: "major-appliances-dishwashers-built-in-dishwashers", name: "Built-In Dishwashers", slug: "built-in-dishwashers" },
          { id: "major-appliances-dishwashers-portable-dishwashers", name: "Portable Dishwashers", slug: "portable-dishwashers" },
          { id: "major-appliances-dishwashers-countertop-dishwashers", name: "Countertop Dishwashers", slug: "countertop-dishwashers" },
          { id: "major-appliances-dishwashers-dishwasher-parts-and-accessories", name: "Dishwasher Parts & Accessories", slug: "dishwasher-parts-and-accessories" }
        ],
      },
      {
        id: "major-appliances-climate-control",
        name: "Climate Control",
        slug: "climate-control",
        children: [
          { id: "major-appliances-climate-control-air-conditioners", name: "Air Conditioners", slug: "air-conditioners" },
          { id: "major-appliances-climate-control-space-heaters", name: "Space Heaters", slug: "space-heaters" },
          { id: "major-appliances-climate-control-dehumidifiers", name: "Dehumidifiers", slug: "dehumidifiers" },
          { id: "major-appliances-climate-control-humidifiers", name: "Humidifiers", slug: "humidifiers" },
          { id: "major-appliances-climate-control-air-purifiers", name: "Air Purifiers", slug: "air-purifiers" },
          { id: "major-appliances-climate-control-ceiling-fans", name: "Ceiling Fans", slug: "ceiling-fans" },
          { id: "major-appliances-climate-control-portable-fans", name: "Portable Fans", slug: "portable-fans" },
          { id: "major-appliances-climate-control-hvac-filters", name: "HVAC Filters", slug: "hvac-filters" }
        ],
      },
      {
        id: "major-appliances-small-appliances",
        name: "Small Appliances",
        slug: "small-appliances",
        children: [
          { id: "major-appliances-small-appliances-vacuum-cleaners", name: "Vacuum Cleaners", slug: "vacuum-cleaners" },
          { id: "major-appliances-small-appliances-sewing-machines", name: "Sewing Machines", slug: "sewing-machines" },
          { id: "major-appliances-small-appliances-water-coolers", name: "Water Coolers", slug: "water-coolers" },
          { id: "major-appliances-small-appliances-garbage-disposals", name: "Garbage Disposals", slug: "garbage-disposals" },
          { id: "major-appliances-small-appliances-water-softeners", name: "Water Softeners", slug: "water-softeners" },
          { id: "major-appliances-small-appliances-trash-compactors", name: "Trash Compactors", slug: "trash-compactors" }
        ],
      }
    ],
  },
  {
    id: "bedding-and-bath",
    name: "Bedding & Bath",
    slug: "bedding-and-bath",
    icon: BedDouble,
    image: "https://picsum.photos/seed/bedding-and-bath/800/500",
    description: "Soft, cozy bedding and bath essentials for a better home.",
    featured: false,
    children: [
      {
        id: "bedding-and-bath-bedding",
        name: "Bedding",
        slug: "bedding",
        children: [
          { id: "bedding-and-bath-bedding-comforters-and-sets", name: "Comforters & Sets", slug: "comforters-and-sets" },
          { id: "bedding-and-bath-bedding-bed-sheets", name: "Bed Sheets", slug: "bed-sheets" },
          { id: "bedding-and-bath-bedding-duvet-covers", name: "Duvet Covers", slug: "duvet-covers" },
          { id: "bedding-and-bath-bedding-quilts-and-bedspreads", name: "Quilts & Bedspreads", slug: "quilts-and-bedspreads" },
          { id: "bedding-and-bath-bedding-pillows", name: "Pillows", slug: "pillows" },
          { id: "bedding-and-bath-bedding-mattress-protectors", name: "Mattress Protectors", slug: "mattress-protectors" },
          { id: "bedding-and-bath-bedding-blankets-and-throws", name: "Blankets & Throws", slug: "blankets-and-throws" },
          { id: "bedding-and-bath-bedding-bed-skirts", name: "Bed Skirts", slug: "bed-skirts" },
          { id: "bedding-and-bath-bedding-pillow-shams", name: "Pillow Shams", slug: "pillow-shams" }
        ],
      },
      {
        id: "bedding-and-bath-bath",
        name: "Bath",
        slug: "bath",
        children: [
          { id: "bedding-and-bath-bath-towels", name: "Towels", slug: "towels" },
          { id: "bedding-and-bath-bath-bath-mats", name: "Bath Mats", slug: "bath-mats" },
          { id: "bedding-and-bath-bath-shower-curtains", name: "Shower Curtains", slug: "shower-curtains" },
          { id: "bedding-and-bath-bath-bathroom-accessories", name: "Bathroom Accessories", slug: "bathroom-accessories" },
          { id: "bedding-and-bath-bath-bathrobes", name: "Bathrobes", slug: "bathrobes" },
          { id: "bedding-and-bath-bath-shower-caddies", name: "Shower Caddies", slug: "shower-caddies" },
          { id: "bedding-and-bath-bath-bath-rugs", name: "Bath Rugs", slug: "bath-rugs" },
          { id: "bedding-and-bath-bath-washcloths", name: "Washcloths", slug: "washcloths" }
        ],
      },
      {
        id: "bedding-and-bath-kids-bedding",
        name: "Kids Bedding",
        slug: "kids-bedding",
        children: [
          { id: "bedding-and-bath-kids-bedding-kids-comforter-sets", name: "Kids Comforter Sets", slug: "kids-comforter-sets" },
          { id: "bedding-and-bath-kids-bedding-crib-bedding", name: "Crib Bedding", slug: "crib-bedding" },
          { id: "bedding-and-bath-kids-bedding-kids-sheets", name: "Kids Sheets", slug: "kids-sheets" },
          { id: "bedding-and-bath-kids-bedding-sleeping-bags-for-kids", name: "Sleeping Bags for Kids", slug: "sleeping-bags-for-kids" },
          { id: "bedding-and-bath-kids-bedding-nap-mats", name: "Nap Mats", slug: "nap-mats" }
        ],
      },
      {
        id: "bedding-and-bath-mattresses-and-support",
        name: "Mattresses & Support",
        slug: "mattresses-and-support",
        children: [
          { id: "bedding-and-bath-mattresses-and-support-memory-foam-mattresses", name: "Memory Foam Mattresses", slug: "memory-foam-mattresses" },
          { id: "bedding-and-bath-mattresses-and-support-innerspring-mattresses", name: "Innerspring Mattresses", slug: "innerspring-mattresses" },
          { id: "bedding-and-bath-mattresses-and-support-mattress-toppers", name: "Mattress Toppers", slug: "mattress-toppers" },
          { id: "bedding-and-bath-mattresses-and-support-adjustable-bed-bases", name: "Adjustable Bed Bases", slug: "adjustable-bed-bases" },
          { id: "bedding-and-bath-mattresses-and-support-bed-pillows", name: "Bed Pillows", slug: "bed-pillows" },
          { id: "bedding-and-bath-mattresses-and-support-body-pillows", name: "Body Pillows", slug: "body-pillows" },
          { id: "bedding-and-bath-mattresses-and-support-mattress-foundations", name: "Mattress Foundations", slug: "mattress-foundations" }
        ],
      }
    ],
  },
  {
    id: "home-improvement-and-tools",
    name: "Home Improvement & Tools",
    slug: "home-improvement-and-tools",
    icon: Hammer,
    image: "https://picsum.photos/seed/home-improvement-and-tools/800/500",
    description: "Power tools, hardware, and supplies for every project.",
    featured: true,
    children: [
      {
        id: "home-improvement-and-tools-power-tools",
        name: "Power Tools",
        slug: "power-tools",
        children: [
          { id: "home-improvement-and-tools-power-tools-drills", name: "Drills", slug: "drills" },
          { id: "home-improvement-and-tools-power-tools-circular-saws", name: "Circular Saws", slug: "circular-saws" },
          { id: "home-improvement-and-tools-power-tools-sanders", name: "Sanders", slug: "sanders" },
          { id: "home-improvement-and-tools-power-tools-angle-grinders", name: "Angle Grinders", slug: "angle-grinders" },
          { id: "home-improvement-and-tools-power-tools-nail-guns", name: "Nail Guns", slug: "nail-guns" },
          { id: "home-improvement-and-tools-power-tools-rotary-tools", name: "Rotary Tools", slug: "rotary-tools" },
          { id: "home-improvement-and-tools-power-tools-impact-drivers", name: "Impact Drivers", slug: "impact-drivers" },
          { id: "home-improvement-and-tools-power-tools-reciprocating-saws", name: "Reciprocating Saws", slug: "reciprocating-saws" },
          { id: "home-improvement-and-tools-power-tools-table-saws", name: "Table Saws", slug: "table-saws" },
          { id: "home-improvement-and-tools-power-tools-miter-saws", name: "Miter Saws", slug: "miter-saws" },
          { id: "home-improvement-and-tools-power-tools-heat-guns", name: "Heat Guns", slug: "heat-guns" }
        ],
      },
      {
        id: "home-improvement-and-tools-hand-tools",
        name: "Hand Tools",
        slug: "hand-tools",
        children: [
          { id: "home-improvement-and-tools-hand-tools-wrenches", name: "Wrenches", slug: "wrenches" },
          { id: "home-improvement-and-tools-hand-tools-screwdrivers", name: "Screwdrivers", slug: "screwdrivers" },
          { id: "home-improvement-and-tools-hand-tools-hammers", name: "Hammers", slug: "hammers" },
          { id: "home-improvement-and-tools-hand-tools-pliers", name: "Pliers", slug: "pliers" },
          { id: "home-improvement-and-tools-hand-tools-tool-sets", name: "Tool Sets", slug: "tool-sets" },
          { id: "home-improvement-and-tools-hand-tools-measuring-tools", name: "Measuring Tools", slug: "measuring-tools" },
          { id: "home-improvement-and-tools-hand-tools-levels", name: "Levels", slug: "levels" },
          { id: "home-improvement-and-tools-hand-tools-utility-knives", name: "Utility Knives", slug: "utility-knives" },
          { id: "home-improvement-and-tools-hand-tools-chisels", name: "Chisels", slug: "chisels" },
          { id: "home-improvement-and-tools-hand-tools-hand-saws", name: "Hand Saws", slug: "hand-saws" }
        ],
      },
      {
        id: "home-improvement-and-tools-building-materials",
        name: "Building Materials",
        slug: "building-materials",
        children: [
          { id: "home-improvement-and-tools-building-materials-lumber", name: "Lumber", slug: "lumber" },
          { id: "home-improvement-and-tools-building-materials-drywall", name: "Drywall", slug: "drywall" },
          { id: "home-improvement-and-tools-building-materials-insulation", name: "Insulation", slug: "insulation" },
          { id: "home-improvement-and-tools-building-materials-roofing-materials", name: "Roofing Materials", slug: "roofing-materials" },
          { id: "home-improvement-and-tools-building-materials-concrete-and-cement", name: "Concrete & Cement", slug: "concrete-and-cement" },
          { id: "home-improvement-and-tools-building-materials-plywood-and-sheet-goods", name: "Plywood & Sheet Goods", slug: "plywood-and-sheet-goods" },
          { id: "home-improvement-and-tools-building-materials-weatherstripping", name: "Weatherstripping", slug: "weatherstripping" }
        ],
      },
      {
        id: "home-improvement-and-tools-plumbing",
        name: "Plumbing",
        slug: "plumbing",
        children: [
          { id: "home-improvement-and-tools-plumbing-faucets", name: "Faucets", slug: "faucets" },
          { id: "home-improvement-and-tools-plumbing-pipes-and-fittings", name: "Pipes & Fittings", slug: "pipes-and-fittings" },
          { id: "home-improvement-and-tools-plumbing-water-heaters", name: "Water Heaters", slug: "water-heaters" },
          { id: "home-improvement-and-tools-plumbing-toilets", name: "Toilets", slug: "toilets" },
          { id: "home-improvement-and-tools-plumbing-sump-pumps", name: "Sump Pumps", slug: "sump-pumps" },
          { id: "home-improvement-and-tools-plumbing-drain-cleaning-tools", name: "Drain Cleaning Tools", slug: "drain-cleaning-tools" },
          { id: "home-improvement-and-tools-plumbing-water-filtration-systems", name: "Water Filtration Systems", slug: "water-filtration-systems" }
        ],
      },
      {
        id: "home-improvement-and-tools-electrical",
        name: "Electrical",
        slug: "electrical",
        children: [
          { id: "home-improvement-and-tools-electrical-wiring-and-cable", name: "Wiring & Cable", slug: "wiring-and-cable" },
          { id: "home-improvement-and-tools-electrical-circuit-breakers", name: "Circuit Breakers", slug: "circuit-breakers" },
          { id: "home-improvement-and-tools-electrical-light-switches-and-outlets", name: "Light Switches & Outlets", slug: "light-switches-and-outlets" },
          { id: "home-improvement-and-tools-electrical-generators", name: "Generators", slug: "generators" },
          { id: "home-improvement-and-tools-electrical-extension-cords", name: "Extension Cords", slug: "extension-cords" },
          { id: "home-improvement-and-tools-electrical-voltage-testers", name: "Voltage Testers", slug: "voltage-testers" },
          { id: "home-improvement-and-tools-electrical-conduit-and-fittings", name: "Conduit & Fittings", slug: "conduit-and-fittings" }
        ],
      },
      {
        id: "home-improvement-and-tools-paint-and-wall-treatments",
        name: "Paint & Wall Treatments",
        slug: "paint-and-wall-treatments",
        children: [
          { id: "home-improvement-and-tools-paint-and-wall-treatments-interior-paint", name: "Interior Paint", slug: "interior-paint" },
          { id: "home-improvement-and-tools-paint-and-wall-treatments-exterior-paint", name: "Exterior Paint", slug: "exterior-paint" },
          { id: "home-improvement-and-tools-paint-and-wall-treatments-paint-brushes-and-rollers", name: "Paint Brushes & Rollers", slug: "paint-brushes-and-rollers" },
          { id: "home-improvement-and-tools-paint-and-wall-treatments-wallpaper", name: "Wallpaper", slug: "wallpaper" },
          { id: "home-improvement-and-tools-paint-and-wall-treatments-primers", name: "Primers", slug: "primers" },
          { id: "home-improvement-and-tools-paint-and-wall-treatments-painters-tape", name: "Painter's Tape", slug: "painters-tape" },
          { id: "home-improvement-and-tools-paint-and-wall-treatments-paint-sprayers", name: "Paint Sprayers", slug: "paint-sprayers" },
          { id: "home-improvement-and-tools-paint-and-wall-treatments-drop-cloths", name: "Drop Cloths", slug: "drop-cloths" }
        ],
      },
      {
        id: "home-improvement-and-tools-hardware",
        name: "Hardware",
        slug: "hardware",
        children: [
          { id: "home-improvement-and-tools-hardware-screws-and-fasteners", name: "Screws & Fasteners", slug: "screws-and-fasteners" },
          { id: "home-improvement-and-tools-hardware-hinges", name: "Hinges", slug: "hinges" },
          { id: "home-improvement-and-tools-hardware-locks-and-deadbolts", name: "Locks & Deadbolts", slug: "locks-and-deadbolts" },
          { id: "home-improvement-and-tools-hardware-cabinet-hardware", name: "Cabinet Hardware", slug: "cabinet-hardware" },
          { id: "home-improvement-and-tools-hardware-casters-and-wheels", name: "Casters & Wheels", slug: "casters-and-wheels" },
          { id: "home-improvement-and-tools-hardware-chain-and-rope", name: "Chain & Rope", slug: "chain-and-rope" }
        ],
      },
      {
        id: "home-improvement-and-tools-safety-equipment",
        name: "Safety Equipment",
        slug: "safety-equipment",
        children: [
          { id: "home-improvement-and-tools-safety-equipment-work-gloves", name: "Work Gloves", slug: "work-gloves" },
          { id: "home-improvement-and-tools-safety-equipment-safety-glasses", name: "Safety Glasses", slug: "safety-glasses" },
          { id: "home-improvement-and-tools-safety-equipment-respirators", name: "Respirators", slug: "respirators" },
          { id: "home-improvement-and-tools-safety-equipment-hard-hats", name: "Hard Hats", slug: "hard-hats" },
          { id: "home-improvement-and-tools-safety-equipment-first-aid-kits", name: "First Aid Kits", slug: "first-aid-kits" },
          { id: "home-improvement-and-tools-safety-equipment-high-visibility-apparel", name: "High-Visibility Apparel", slug: "high-visibility-apparel" },
          { id: "home-improvement-and-tools-safety-equipment-ear-protection", name: "Ear Protection", slug: "ear-protection" }
        ],
      },
      {
        id: "home-improvement-and-tools-ladders-and-scaffolding",
        name: "Ladders & Scaffolding",
        slug: "ladders-and-scaffolding",
        children: [
          { id: "home-improvement-and-tools-ladders-and-scaffolding-step-ladders", name: "Step Ladders", slug: "step-ladders" },
          { id: "home-improvement-and-tools-ladders-and-scaffolding-extension-ladders", name: "Extension Ladders", slug: "extension-ladders" },
          { id: "home-improvement-and-tools-ladders-and-scaffolding-scaffolding-towers", name: "Scaffolding Towers", slug: "scaffolding-towers" },
          { id: "home-improvement-and-tools-ladders-and-scaffolding-ladder-accessories", name: "Ladder Accessories", slug: "ladder-accessories" },
          { id: "home-improvement-and-tools-ladders-and-scaffolding-attic-ladders", name: "Attic Ladders", slug: "attic-ladders" }
        ],
      }
    ],
  },
  {
    id: "automotive-and-powersports",
    name: "Automotive & Powersports",
    slug: "automotive-and-powersports",
    icon: Car,
    image: "https://picsum.photos/seed/automotive-and-powersports/800/500",
    description: "Parts, accessories, and gear for cars, trucks, and powersports.",
    featured: true,
    children: [
      {
        id: "automotive-and-powersports-replacement-parts",
        name: "Replacement Parts",
        slug: "replacement-parts",
        children: [
          { id: "automotive-and-powersports-replacement-parts-brakes", name: "Brakes", slug: "brakes" },
          { id: "automotive-and-powersports-replacement-parts-batteries", name: "Batteries", slug: "batteries" },
          { id: "automotive-and-powersports-replacement-parts-filters", name: "Filters", slug: "filters" },
          { id: "automotive-and-powersports-replacement-parts-belts-and-hoses", name: "Belts & Hoses", slug: "belts-and-hoses" },
          { id: "automotive-and-powersports-replacement-parts-suspension-parts", name: "Suspension Parts", slug: "suspension-parts" },
          { id: "automotive-and-powersports-replacement-parts-engines-and-components", name: "Engines & Components", slug: "engines-and-components" },
          { id: "automotive-and-powersports-replacement-parts-exhaust-systems", name: "Exhaust Systems", slug: "exhaust-systems" },
          { id: "automotive-and-powersports-replacement-parts-ignition-parts", name: "Ignition Parts", slug: "ignition-parts" },
          { id: "automotive-and-powersports-replacement-parts-cooling-system-parts", name: "Cooling System Parts", slug: "cooling-system-parts" },
          { id: "automotive-and-powersports-replacement-parts-transmission-parts", name: "Transmission Parts", slug: "transmission-parts" },
          { id: "automotive-and-powersports-replacement-parts-sensors", name: "Sensors", slug: "sensors" }
        ],
      },
      {
        id: "automotive-and-powersports-car-electronics",
        name: "Car Electronics",
        slug: "car-electronics",
        children: [
          { id: "automotive-and-powersports-car-electronics-car-stereos", name: "Car Stereos", slug: "car-stereos" },
          { id: "automotive-and-powersports-car-electronics-dash-cams", name: "Dash Cams", slug: "dash-cams" },
          { id: "automotive-and-powersports-car-electronics-gps-units", name: "GPS Units", slug: "gps-units" },
          { id: "automotive-and-powersports-car-electronics-backup-cameras", name: "Backup Cameras", slug: "backup-cameras" },
          { id: "automotive-and-powersports-car-electronics-car-alarms", name: "Car Alarms", slug: "car-alarms" },
          { id: "automotive-and-powersports-car-electronics-amplifiers-and-speakers", name: "Amplifiers & Speakers", slug: "amplifiers-and-speakers" },
          { id: "automotive-and-powersports-car-electronics-cb-radios", name: "CB Radios", slug: "cb-radios" }
        ],
      },
      {
        id: "automotive-and-powersports-tires-and-wheels",
        name: "Tires & Wheels",
        slug: "tires-and-wheels",
        children: [
          { id: "automotive-and-powersports-tires-and-wheels-all-season-tires", name: "All-Season Tires", slug: "all-season-tires" },
          { id: "automotive-and-powersports-tires-and-wheels-winter-tires", name: "Winter Tires", slug: "winter-tires" },
          { id: "automotive-and-powersports-tires-and-wheels-performance-tires", name: "Performance Tires", slug: "performance-tires" },
          { id: "automotive-and-powersports-tires-and-wheels-wheels-and-rims", name: "Wheels & Rims", slug: "wheels-and-rims" },
          { id: "automotive-and-powersports-tires-and-wheels-tire-accessories", name: "Tire Accessories", slug: "tire-accessories" },
          { id: "automotive-and-powersports-tires-and-wheels-tire-pressure-monitors", name: "Tire Pressure Monitors", slug: "tire-pressure-monitors" },
          { id: "automotive-and-powersports-tires-and-wheels-wheel-locks", name: "Wheel Locks", slug: "wheel-locks" }
        ],
      },
      {
        id: "automotive-and-powersports-interior-accessories",
        name: "Interior Accessories",
        slug: "interior-accessories",
        children: [
          { id: "automotive-and-powersports-interior-accessories-seat-covers", name: "Seat Covers", slug: "seat-covers" },
          { id: "automotive-and-powersports-interior-accessories-floor-mats", name: "Floor Mats", slug: "floor-mats" },
          { id: "automotive-and-powersports-interior-accessories-steering-wheel-covers", name: "Steering Wheel Covers", slug: "steering-wheel-covers" },
          { id: "automotive-and-powersports-interior-accessories-car-organizers", name: "Car Organizers", slug: "car-organizers" },
          { id: "automotive-and-powersports-interior-accessories-sun-shades", name: "Sun Shades", slug: "sun-shades" },
          { id: "automotive-and-powersports-interior-accessories-seat-cushions", name: "Seat Cushions", slug: "seat-cushions" },
          { id: "automotive-and-powersports-interior-accessories-dash-cameras-mounts", name: "Dash Cameras Mounts", slug: "dash-cameras-mounts" }
        ],
      },
      {
        id: "automotive-and-powersports-exterior-accessories",
        name: "Exterior Accessories",
        slug: "exterior-accessories",
        children: [
          { id: "automotive-and-powersports-exterior-accessories-car-covers", name: "Car Covers", slug: "car-covers" },
          { id: "automotive-and-powersports-exterior-accessories-roof-racks", name: "Roof Racks", slug: "roof-racks" },
          { id: "automotive-and-powersports-exterior-accessories-mud-flaps", name: "Mud Flaps", slug: "mud-flaps" },
          { id: "automotive-and-powersports-exterior-accessories-bike-racks", name: "Bike Racks", slug: "bike-racks" },
          { id: "automotive-and-powersports-exterior-accessories-running-boards", name: "Running Boards", slug: "running-boards" },
          { id: "automotive-and-powersports-exterior-accessories-bumper-guards", name: "Bumper Guards", slug: "bumper-guards" },
          { id: "automotive-and-powersports-exterior-accessories-cargo-carriers", name: "Cargo Carriers", slug: "cargo-carriers" }
        ],
      },
      {
        id: "automotive-and-powersports-tools-and-equipment",
        name: "Tools & Equipment",
        slug: "tools-and-equipment",
        children: [
          { id: "automotive-and-powersports-tools-and-equipment-jacks-and-lifts", name: "Jacks & Lifts", slug: "jacks-and-lifts" },
          { id: "automotive-and-powersports-tools-and-equipment-diagnostic-tools", name: "Diagnostic Tools", slug: "diagnostic-tools" },
          { id: "automotive-and-powersports-tools-and-equipment-car-care-kits", name: "Car Care Kits", slug: "car-care-kits" },
          { id: "automotive-and-powersports-tools-and-equipment-battery-chargers", name: "Battery Chargers", slug: "battery-chargers" },
          { id: "automotive-and-powersports-tools-and-equipment-oil-filters-and-funnels", name: "Oil Filters & Funnels", slug: "oil-filters-and-funnels" },
          { id: "automotive-and-powersports-tools-and-equipment-torque-wrenches", name: "Torque Wrenches", slug: "torque-wrenches" }
        ],
      },
      {
        id: "automotive-and-powersports-motorcycle-and-powersports",
        name: "Motorcycle & Powersports",
        slug: "motorcycle-and-powersports",
        children: [
          { id: "automotive-and-powersports-motorcycle-and-powersports-motorcycle-parts", name: "Motorcycle Parts", slug: "motorcycle-parts" },
          { id: "automotive-and-powersports-motorcycle-and-powersports-motorcycle-helmets", name: "Motorcycle Helmets", slug: "motorcycle-helmets" },
          { id: "automotive-and-powersports-motorcycle-and-powersports-riding-gear", name: "Riding Gear", slug: "riding-gear" },
          { id: "automotive-and-powersports-motorcycle-and-powersports-atv-and-utv-parts", name: "ATV & UTV Parts", slug: "atv-and-utv-parts" },
          { id: "automotive-and-powersports-motorcycle-and-powersports-snowmobile-parts", name: "Snowmobile Parts", slug: "snowmobile-parts" },
          { id: "automotive-and-powersports-motorcycle-and-powersports-motorcycle-accessories", name: "Motorcycle Accessories", slug: "motorcycle-accessories" },
          { id: "automotive-and-powersports-motorcycle-and-powersports-motorcycle-luggage", name: "Motorcycle Luggage", slug: "motorcycle-luggage" }
        ],
      },
      {
        id: "automotive-and-powersports-car-care",
        name: "Car Care",
        slug: "car-care",
        children: [
          { id: "automotive-and-powersports-car-care-car-wash-and-wax", name: "Car Wash & Wax", slug: "car-wash-and-wax" },
          { id: "automotive-and-powersports-car-care-detailing-supplies", name: "Detailing Supplies", slug: "detailing-supplies" },
          { id: "automotive-and-powersports-car-care-air-fresheners", name: "Air Fresheners", slug: "air-fresheners" },
          { id: "automotive-and-powersports-car-care-touch-up-paint", name: "Touch-Up Paint", slug: "touch-up-paint" },
          { id: "automotive-and-powersports-car-care-microfiber-towels", name: "Microfiber Towels", slug: "microfiber-towels" },
          { id: "automotive-and-powersports-car-care-ceramic-coatings", name: "Ceramic Coatings", slug: "ceramic-coatings" }
        ],
      }
    ],
  },
  {
    id: "mens-clothing",
    name: "Men's Clothing",
    slug: "mens-clothing",
    icon: Shirt,
    image: "https://picsum.photos/seed/mens-clothing/800/500",
    description: "Everyday essentials to statement pieces for men.",
    featured: true,
    children: [
      {
        id: "mens-clothing-tops",
        name: "Tops",
        slug: "tops",
        children: [
          { id: "mens-clothing-tops-t-shirts", name: "T-Shirts", slug: "t-shirts" },
          { id: "mens-clothing-tops-dress-shirts", name: "Dress Shirts", slug: "dress-shirts" },
          { id: "mens-clothing-tops-casual-button-downs", name: "Casual Button-Downs", slug: "casual-button-downs" },
          { id: "mens-clothing-tops-sweaters", name: "Sweaters", slug: "sweaters" },
          { id: "mens-clothing-tops-hoodies-and-sweatshirts", name: "Hoodies & Sweatshirts", slug: "hoodies-and-sweatshirts" },
          { id: "mens-clothing-tops-polo-shirts", name: "Polo Shirts", slug: "polo-shirts" },
          { id: "mens-clothing-tops-tank-tops", name: "Tank Tops", slug: "tank-tops" },
          { id: "mens-clothing-tops-henleys", name: "Henleys", slug: "henleys" }
        ],
      },
      {
        id: "mens-clothing-bottoms",
        name: "Bottoms",
        slug: "bottoms",
        children: [
          { id: "mens-clothing-bottoms-jeans", name: "Jeans", slug: "jeans" },
          { id: "mens-clothing-bottoms-chinos", name: "Chinos", slug: "chinos" },
          { id: "mens-clothing-bottoms-dress-pants", name: "Dress Pants", slug: "dress-pants" },
          { id: "mens-clothing-bottoms-shorts", name: "Shorts", slug: "shorts" },
          { id: "mens-clothing-bottoms-joggers", name: "Joggers", slug: "joggers" },
          { id: "mens-clothing-bottoms-cargo-pants", name: "Cargo Pants", slug: "cargo-pants" },
          { id: "mens-clothing-bottoms-sweatpants", name: "Sweatpants", slug: "sweatpants" }
        ],
      },
      {
        id: "mens-clothing-outerwear",
        name: "Outerwear",
        slug: "outerwear",
        children: [
          { id: "mens-clothing-outerwear-jackets", name: "Jackets", slug: "jackets" },
          { id: "mens-clothing-outerwear-coats", name: "Coats", slug: "coats" },
          { id: "mens-clothing-outerwear-vests", name: "Vests", slug: "vests" },
          { id: "mens-clothing-outerwear-blazers", name: "Blazers", slug: "blazers" },
          { id: "mens-clothing-outerwear-raincoats", name: "Raincoats", slug: "raincoats" },
          { id: "mens-clothing-outerwear-parkas", name: "Parkas", slug: "parkas" }
        ],
      },
      {
        id: "mens-clothing-suits-and-formal",
        name: "Suits & Formal",
        slug: "suits-and-formal",
        children: [
          { id: "mens-clothing-suits-and-formal-suits", name: "Suits", slug: "suits" },
          { id: "mens-clothing-suits-and-formal-suit-separates", name: "Suit Separates", slug: "suit-separates" },
          { id: "mens-clothing-suits-and-formal-tuxedos", name: "Tuxedos", slug: "tuxedos" },
          { id: "mens-clothing-suits-and-formal-dress-vests", name: "Dress Vests", slug: "dress-vests" },
          { id: "mens-clothing-suits-and-formal-suit-accessories", name: "Suit Accessories", slug: "suit-accessories" },
          { id: "mens-clothing-suits-and-formal-formal-shirts", name: "Formal Shirts", slug: "formal-shirts" }
        ],
      },
      {
        id: "mens-clothing-activewear",
        name: "Activewear",
        slug: "activewear",
        children: [
          { id: "mens-clothing-activewear-athletic-t-shirts", name: "Athletic T-Shirts", slug: "athletic-t-shirts" },
          { id: "mens-clothing-activewear-track-pants", name: "Track Pants", slug: "track-pants" },
          { id: "mens-clothing-activewear-compression-wear", name: "Compression Wear", slug: "compression-wear" },
          { id: "mens-clothing-activewear-gym-shorts", name: "Gym Shorts", slug: "gym-shorts" },
          { id: "mens-clothing-activewear-athletic-jackets", name: "Athletic Jackets", slug: "athletic-jackets" },
          { id: "mens-clothing-activewear-base-layers", name: "Base Layers", slug: "base-layers" }
        ],
      },
      {
        id: "mens-clothing-underwear-and-sleepwear",
        name: "Underwear & Sleepwear",
        slug: "underwear-and-sleepwear",
        children: [
          { id: "mens-clothing-underwear-and-sleepwear-boxers-and-briefs", name: "Boxers & Briefs", slug: "boxers-and-briefs" },
          { id: "mens-clothing-underwear-and-sleepwear-undershirts", name: "Undershirts", slug: "undershirts" },
          { id: "mens-clothing-underwear-and-sleepwear-pajamas", name: "Pajamas", slug: "pajamas" },
          { id: "mens-clothing-underwear-and-sleepwear-robes", name: "Robes", slug: "robes" },
          { id: "mens-clothing-underwear-and-sleepwear-thermal-underwear", name: "Thermal Underwear", slug: "thermal-underwear" },
          { id: "mens-clothing-underwear-and-sleepwear-socks", name: "Socks", slug: "socks" }
        ],
      },
      {
        id: "mens-clothing-accessories",
        name: "Accessories",
        slug: "accessories",
        children: [
          { id: "mens-clothing-accessories-belts", name: "Belts", slug: "belts" },
          { id: "mens-clothing-accessories-hats", name: "Hats", slug: "hats" },
          { id: "mens-clothing-accessories-ties", name: "Ties", slug: "ties" },
          { id: "mens-clothing-accessories-wallets", name: "Wallets", slug: "wallets" },
          { id: "mens-clothing-accessories-sunglasses", name: "Sunglasses", slug: "sunglasses" },
          { id: "mens-clothing-accessories-gloves", name: "Gloves", slug: "gloves" },
          { id: "mens-clothing-accessories-pocket-squares", name: "Pocket Squares", slug: "pocket-squares" }
        ],
      }
    ],
  },
  {
    id: "womens-clothing",
    name: "Women's Clothing",
    slug: "womens-clothing",
    icon: Shirt,
    image: "https://picsum.photos/seed/womens-clothing/800/500",
    description: "Trend-forward styles and everyday essentials for women.",
    featured: true,
    children: [
      {
        id: "womens-clothing-tops",
        name: "Tops",
        slug: "tops",
        children: [
          { id: "womens-clothing-tops-blouses", name: "Blouses", slug: "blouses" },
          { id: "womens-clothing-tops-t-shirts", name: "T-Shirts", slug: "t-shirts" },
          { id: "womens-clothing-tops-tank-tops", name: "Tank Tops", slug: "tank-tops" },
          { id: "womens-clothing-tops-sweaters", name: "Sweaters", slug: "sweaters" },
          { id: "womens-clothing-tops-tunics", name: "Tunics", slug: "tunics" },
          { id: "womens-clothing-tops-bodysuits", name: "Bodysuits", slug: "bodysuits" },
          { id: "womens-clothing-tops-cardigans", name: "Cardigans", slug: "cardigans" },
          { id: "womens-clothing-tops-camisoles", name: "Camisoles", slug: "camisoles" }
        ],
      },
      {
        id: "womens-clothing-dresses",
        name: "Dresses",
        slug: "dresses",
        children: [
          { id: "womens-clothing-dresses-casual-dresses", name: "Casual Dresses", slug: "casual-dresses" },
          { id: "womens-clothing-dresses-cocktail-dresses", name: "Cocktail Dresses", slug: "cocktail-dresses" },
          { id: "womens-clothing-dresses-maxi-dresses", name: "Maxi Dresses", slug: "maxi-dresses" },
          { id: "womens-clothing-dresses-formal-dresses", name: "Formal Dresses", slug: "formal-dresses" },
          { id: "womens-clothing-dresses-sundresses", name: "Sundresses", slug: "sundresses" },
          { id: "womens-clothing-dresses-wrap-dresses", name: "Wrap Dresses", slug: "wrap-dresses" },
          { id: "womens-clothing-dresses-wedding-guest-dresses", name: "Wedding Guest Dresses", slug: "wedding-guest-dresses" }
        ],
      },
      {
        id: "womens-clothing-bottoms",
        name: "Bottoms",
        slug: "bottoms",
        children: [
          { id: "womens-clothing-bottoms-jeans", name: "Jeans", slug: "jeans" },
          { id: "womens-clothing-bottoms-leggings", name: "Leggings", slug: "leggings" },
          { id: "womens-clothing-bottoms-skirts", name: "Skirts", slug: "skirts" },
          { id: "womens-clothing-bottoms-shorts", name: "Shorts", slug: "shorts" },
          { id: "womens-clothing-bottoms-dress-pants", name: "Dress Pants", slug: "dress-pants" },
          { id: "womens-clothing-bottoms-capris", name: "Capris", slug: "capris" },
          { id: "womens-clothing-bottoms-joggers", name: "Joggers", slug: "joggers" }
        ],
      },
      {
        id: "womens-clothing-outerwear",
        name: "Outerwear",
        slug: "outerwear",
        children: [
          { id: "womens-clothing-outerwear-jackets", name: "Jackets", slug: "jackets" },
          { id: "womens-clothing-outerwear-coats", name: "Coats", slug: "coats" },
          { id: "womens-clothing-outerwear-blazers", name: "Blazers", slug: "blazers" },
          { id: "womens-clothing-outerwear-vests", name: "Vests", slug: "vests" },
          { id: "womens-clothing-outerwear-raincoats", name: "Raincoats", slug: "raincoats" },
          { id: "womens-clothing-outerwear-ponchos-and-capes", name: "Ponchos & Capes", slug: "ponchos-and-capes" }
        ],
      },
      {
        id: "womens-clothing-activewear",
        name: "Activewear",
        slug: "activewear",
        children: [
          { id: "womens-clothing-activewear-sports-bras", name: "Sports Bras", slug: "sports-bras" },
          { id: "womens-clothing-activewear-leggings", name: "Leggings", slug: "leggings" },
          { id: "womens-clothing-activewear-athletic-tops", name: "Athletic Tops", slug: "athletic-tops" },
          { id: "womens-clothing-activewear-track-suits", name: "Track Suits", slug: "track-suits" },
          { id: "womens-clothing-activewear-yoga-pants", name: "Yoga Pants", slug: "yoga-pants" },
          { id: "womens-clothing-activewear-running-shorts", name: "Running Shorts", slug: "running-shorts" }
        ],
      },
      {
        id: "womens-clothing-intimates-and-sleepwear",
        name: "Intimates & Sleepwear",
        slug: "intimates-and-sleepwear",
        children: [
          { id: "womens-clothing-intimates-and-sleepwear-bras", name: "Bras", slug: "bras" },
          { id: "womens-clothing-intimates-and-sleepwear-panties", name: "Panties", slug: "panties" },
          { id: "womens-clothing-intimates-and-sleepwear-shapewear", name: "Shapewear", slug: "shapewear" },
          { id: "womens-clothing-intimates-and-sleepwear-pajamas-and-robes", name: "Pajamas & Robes", slug: "pajamas-and-robes" },
          { id: "womens-clothing-intimates-and-sleepwear-camisoles", name: "Camisoles", slug: "camisoles" },
          { id: "womens-clothing-intimates-and-sleepwear-slips", name: "Slips", slug: "slips" }
        ],
      },
      {
        id: "womens-clothing-accessories",
        name: "Accessories",
        slug: "accessories",
        children: [
          { id: "womens-clothing-accessories-handbags", name: "Handbags", slug: "handbags" },
          { id: "womens-clothing-accessories-scarves", name: "Scarves", slug: "scarves" },
          { id: "womens-clothing-accessories-belts", name: "Belts", slug: "belts" },
          { id: "womens-clothing-accessories-sunglasses", name: "Sunglasses", slug: "sunglasses" },
          { id: "womens-clothing-accessories-hair-accessories", name: "Hair Accessories", slug: "hair-accessories" },
          { id: "womens-clothing-accessories-gloves", name: "Gloves", slug: "gloves" },
          { id: "womens-clothing-accessories-hats", name: "Hats", slug: "hats" }
        ],
      },
      {
        id: "womens-clothing-maternity",
        name: "Maternity",
        slug: "maternity",
        children: [
          { id: "womens-clothing-maternity-maternity-tops", name: "Maternity Tops", slug: "maternity-tops" },
          { id: "womens-clothing-maternity-maternity-dresses", name: "Maternity Dresses", slug: "maternity-dresses" },
          { id: "womens-clothing-maternity-maternity-bottoms", name: "Maternity Bottoms", slug: "maternity-bottoms" },
          { id: "womens-clothing-maternity-nursing-wear", name: "Nursing Wear", slug: "nursing-wear" },
          { id: "womens-clothing-maternity-maternity-activewear", name: "Maternity Activewear", slug: "maternity-activewear" },
          { id: "womens-clothing-maternity-maternity-underwear", name: "Maternity Underwear", slug: "maternity-underwear" }
        ],
      }
    ],
  },
  {
    id: "kids-and-baby",
    name: "Kids' & Baby",
    slug: "kids-and-baby",
    icon: Baby,
    image: "https://picsum.photos/seed/kids-and-baby/800/500",
    description: "Clothing, gear, and essentials for babies and kids.",
    featured: true,
    children: [
      {
        id: "kids-and-baby-baby-clothing",
        name: "Baby Clothing",
        slug: "baby-clothing",
        children: [
          { id: "kids-and-baby-baby-clothing-bodysuits", name: "Bodysuits", slug: "bodysuits" },
          { id: "kids-and-baby-baby-clothing-sleepers", name: "Sleepers", slug: "sleepers" },
          { id: "kids-and-baby-baby-clothing-baby-outfit-sets", name: "Baby Outfit Sets", slug: "baby-outfit-sets" },
          { id: "kids-and-baby-baby-clothing-baby-outerwear", name: "Baby Outerwear", slug: "baby-outerwear" },
          { id: "kids-and-baby-baby-clothing-socks-and-booties", name: "Socks & Booties", slug: "socks-and-booties" },
          { id: "kids-and-baby-baby-clothing-baby-hats", name: "Baby Hats", slug: "baby-hats" },
          { id: "kids-and-baby-baby-clothing-baby-mittens", name: "Baby Mittens", slug: "baby-mittens" }
        ],
      },
      {
        id: "kids-and-baby-baby-gear",
        name: "Baby Gear",
        slug: "baby-gear",
        children: [
          { id: "kids-and-baby-baby-gear-strollers", name: "Strollers", slug: "strollers" },
          { id: "kids-and-baby-baby-gear-car-seats", name: "Car Seats", slug: "car-seats" },
          { id: "kids-and-baby-baby-gear-baby-carriers", name: "Baby Carriers", slug: "baby-carriers" },
          { id: "kids-and-baby-baby-gear-diaper-bags", name: "Diaper Bags", slug: "diaper-bags" },
          { id: "kids-and-baby-baby-gear-high-chairs", name: "High Chairs", slug: "high-chairs" },
          { id: "kids-and-baby-baby-gear-baby-swings-and-bouncers", name: "Baby Swings & Bouncers", slug: "baby-swings-and-bouncers" },
          { id: "kids-and-baby-baby-gear-baby-walkers", name: "Baby Walkers", slug: "baby-walkers" },
          { id: "kids-and-baby-baby-gear-playards", name: "Playards", slug: "playards" }
        ],
      },
      {
        id: "kids-and-baby-nursery",
        name: "Nursery",
        slug: "nursery",
        children: [
          { id: "kids-and-baby-nursery-cribs", name: "Cribs", slug: "cribs" },
          { id: "kids-and-baby-nursery-changing-tables", name: "Changing Tables", slug: "changing-tables" },
          { id: "kids-and-baby-nursery-crib-bedding", name: "Crib Bedding", slug: "crib-bedding" },
          { id: "kids-and-baby-nursery-baby-monitors", name: "Baby Monitors", slug: "baby-monitors" },
          { id: "kids-and-baby-nursery-nursery-d-cor", name: "Nursery Décor", slug: "nursery-d-cor" },
          { id: "kids-and-baby-nursery-nursery-gliders", name: "Nursery Gliders", slug: "nursery-gliders" },
          { id: "kids-and-baby-nursery-crib-mattresses", name: "Crib Mattresses", slug: "crib-mattresses" }
        ],
      },
      {
        id: "kids-and-baby-feeding",
        name: "Feeding",
        slug: "feeding",
        children: [
          { id: "kids-and-baby-feeding-bottles", name: "Bottles", slug: "bottles" },
          { id: "kids-and-baby-feeding-breast-pumps", name: "Breast Pumps", slug: "breast-pumps" },
          { id: "kids-and-baby-feeding-baby-food-makers", name: "Baby Food Makers", slug: "baby-food-makers" },
          { id: "kids-and-baby-feeding-bibs-and-burp-cloths", name: "Bibs & Burp Cloths", slug: "bibs-and-burp-cloths" },
          { id: "kids-and-baby-feeding-sippy-cups", name: "Sippy Cups", slug: "sippy-cups" },
          { id: "kids-and-baby-feeding-high-chair-accessories", name: "High Chair Accessories", slug: "high-chair-accessories" },
          { id: "kids-and-baby-feeding-formula-dispensers", name: "Formula Dispensers", slug: "formula-dispensers" }
        ],
      },
      {
        id: "kids-and-baby-diapering",
        name: "Diapering",
        slug: "diapering",
        children: [
          { id: "kids-and-baby-diapering-diapers", name: "Diapers", slug: "diapers" },
          { id: "kids-and-baby-diapering-baby-wipes", name: "Baby Wipes", slug: "baby-wipes" },
          { id: "kids-and-baby-diapering-diaper-pails", name: "Diaper Pails", slug: "diaper-pails" },
          { id: "kids-and-baby-diapering-changing-pads", name: "Changing Pads", slug: "changing-pads" },
          { id: "kids-and-baby-diapering-diaper-rash-cream", name: "Diaper Rash Cream", slug: "diaper-rash-cream" },
          { id: "kids-and-baby-diapering-cloth-diapers", name: "Cloth Diapers", slug: "cloth-diapers" }
        ],
      },
      {
        id: "kids-and-baby-kids-clothing",
        name: "Kids' Clothing",
        slug: "kids-clothing",
        children: [
          { id: "kids-and-baby-kids-clothing-boys-clothing", name: "Boys' Clothing", slug: "boys-clothing" },
          { id: "kids-and-baby-kids-clothing-girls-clothing", name: "Girls' Clothing", slug: "girls-clothing" },
          { id: "kids-and-baby-kids-clothing-school-uniforms", name: "School Uniforms", slug: "school-uniforms" },
          { id: "kids-and-baby-kids-clothing-kids-outerwear", name: "Kids' Outerwear", slug: "kids-outerwear" },
          { id: "kids-and-baby-kids-clothing-kids-sleepwear", name: "Kids' Sleepwear", slug: "kids-sleepwear" },
          { id: "kids-and-baby-kids-clothing-kids-swimwear", name: "Kids' Swimwear", slug: "kids-swimwear" }
        ],
      },
      {
        id: "kids-and-baby-toys-for-babies",
        name: "Toys for Babies",
        slug: "toys-for-babies",
        children: [
          { id: "kids-and-baby-toys-for-babies-rattles-and-teethers", name: "Rattles & Teethers", slug: "rattles-and-teethers" },
          { id: "kids-and-baby-toys-for-babies-baby-gyms", name: "Baby Gyms", slug: "baby-gyms" },
          { id: "kids-and-baby-toys-for-babies-stacking-toys", name: "Stacking Toys", slug: "stacking-toys" },
          { id: "kids-and-baby-toys-for-babies-soft-toys-for-infants", name: "Soft Toys for Infants", slug: "soft-toys-for-infants" },
          { id: "kids-and-baby-toys-for-babies-bath-toys", name: "Bath Toys", slug: "bath-toys" }
        ],
      },
      {
        id: "kids-and-baby-safety",
        name: "Safety",
        slug: "safety",
        children: [
          { id: "kids-and-baby-safety-baby-gates", name: "Baby Gates", slug: "baby-gates" },
          { id: "kids-and-baby-safety-outlet-covers", name: "Outlet Covers", slug: "outlet-covers" },
          { id: "kids-and-baby-safety-cabinet-locks", name: "Cabinet Locks", slug: "cabinet-locks" },
          { id: "kids-and-baby-safety-baby-monitors", name: "Baby Monitors", slug: "baby-monitors" },
          { id: "kids-and-baby-safety-corner-and-edge-guards", name: "Corner & Edge Guards", slug: "corner-and-edge-guards" },
          { id: "kids-and-baby-safety-baby-proofing-kits", name: "Baby Proofing Kits", slug: "baby-proofing-kits" }
        ],
      }
    ],
  },
  {
    id: "shoes",
    name: "Shoes",
    slug: "shoes",
    icon: Footprints,
    image: "https://picsum.photos/seed/shoes/800/500",
    description: "Footwear for every occasion, from sneakers to formal wear.",
    featured: false,
    children: [
      {
        id: "shoes-mens-shoes",
        name: "Men's Shoes",
        slug: "mens-shoes",
        children: [
          { id: "shoes-mens-shoes-sneakers", name: "Sneakers", slug: "sneakers" },
          { id: "shoes-mens-shoes-dress-shoes", name: "Dress Shoes", slug: "dress-shoes" },
          { id: "shoes-mens-shoes-boots", name: "Boots", slug: "boots" },
          { id: "shoes-mens-shoes-sandals", name: "Sandals", slug: "sandals" },
          { id: "shoes-mens-shoes-loafers", name: "Loafers", slug: "loafers" },
          { id: "shoes-mens-shoes-athletic-shoes", name: "Athletic Shoes", slug: "athletic-shoes" },
          { id: "shoes-mens-shoes-slippers", name: "Slippers", slug: "slippers" },
          { id: "shoes-mens-shoes-work-boots", name: "Work Boots", slug: "work-boots" }
        ],
      },
      {
        id: "shoes-womens-shoes",
        name: "Women's Shoes",
        slug: "womens-shoes",
        children: [
          { id: "shoes-womens-shoes-heels", name: "Heels", slug: "heels" },
          { id: "shoes-womens-shoes-flats", name: "Flats", slug: "flats" },
          { id: "shoes-womens-shoes-sneakers", name: "Sneakers", slug: "sneakers" },
          { id: "shoes-womens-shoes-boots", name: "Boots", slug: "boots" },
          { id: "shoes-womens-shoes-sandals", name: "Sandals", slug: "sandals" },
          { id: "shoes-womens-shoes-wedges", name: "Wedges", slug: "wedges" },
          { id: "shoes-womens-shoes-slippers", name: "Slippers", slug: "slippers" },
          { id: "shoes-womens-shoes-espadrilles", name: "Espadrilles", slug: "espadrilles" }
        ],
      },
      {
        id: "shoes-kids-shoes",
        name: "Kids' Shoes",
        slug: "kids-shoes",
        children: [
          { id: "shoes-kids-shoes-boys-shoes", name: "Boys' Shoes", slug: "boys-shoes" },
          { id: "shoes-kids-shoes-girls-shoes", name: "Girls' Shoes", slug: "girls-shoes" },
          { id: "shoes-kids-shoes-infant-shoes", name: "Infant Shoes", slug: "infant-shoes" },
          { id: "shoes-kids-shoes-school-shoes", name: "School Shoes", slug: "school-shoes" },
          { id: "shoes-kids-shoes-light-up-shoes", name: "Light-Up Shoes", slug: "light-up-shoes" },
          { id: "shoes-kids-shoes-rain-boots-for-kids", name: "Rain Boots for Kids", slug: "rain-boots-for-kids" }
        ],
      },
      {
        id: "shoes-athletic-shoes",
        name: "Athletic Shoes",
        slug: "athletic-shoes",
        children: [
          { id: "shoes-athletic-shoes-running-shoes", name: "Running Shoes", slug: "running-shoes" },
          { id: "shoes-athletic-shoes-basketball-shoes", name: "Basketball Shoes", slug: "basketball-shoes" },
          { id: "shoes-athletic-shoes-training-shoes", name: "Training Shoes", slug: "training-shoes" },
          { id: "shoes-athletic-shoes-soccer-cleats", name: "Soccer Cleats", slug: "soccer-cleats" },
          { id: "shoes-athletic-shoes-hiking-shoes", name: "Hiking Shoes", slug: "hiking-shoes" },
          { id: "shoes-athletic-shoes-tennis-shoes", name: "Tennis Shoes", slug: "tennis-shoes" },
          { id: "shoes-athletic-shoes-golf-shoes", name: "Golf Shoes", slug: "golf-shoes" }
        ],
      },
      {
        id: "shoes-shoe-care-and-accessories",
        name: "Shoe Care & Accessories",
        slug: "shoe-care-and-accessories",
        children: [
          { id: "shoes-shoe-care-and-accessories-shoe-care-kits", name: "Shoe Care Kits", slug: "shoe-care-kits" },
          { id: "shoes-shoe-care-and-accessories-insoles", name: "Insoles", slug: "insoles" },
          { id: "shoes-shoe-care-and-accessories-shoe-laces", name: "Shoe Laces", slug: "shoe-laces" },
          { id: "shoes-shoe-care-and-accessories-shoe-trees", name: "Shoe Trees", slug: "shoe-trees" },
          { id: "shoes-shoe-care-and-accessories-shoe-storage", name: "Shoe Storage", slug: "shoe-storage" },
          { id: "shoes-shoe-care-and-accessories-shoe-horns", name: "Shoe Horns", slug: "shoe-horns" }
        ],
      }
    ],
  },
  {
    id: "jewelry-and-watches",
    name: "Jewelry & Watches",
    slug: "jewelry-and-watches",
    icon: Watch,
    image: "https://picsum.photos/seed/jewelry-and-watches/800/500",
    description: "Fine jewelry, fashion pieces, and watches for every style.",
    featured: false,
    children: [
      {
        id: "jewelry-and-watches-fine-jewelry",
        name: "Fine Jewelry",
        slug: "fine-jewelry",
        children: [
          { id: "jewelry-and-watches-fine-jewelry-necklaces", name: "Necklaces", slug: "necklaces" },
          { id: "jewelry-and-watches-fine-jewelry-earrings", name: "Earrings", slug: "earrings" },
          { id: "jewelry-and-watches-fine-jewelry-bracelets", name: "Bracelets", slug: "bracelets" },
          { id: "jewelry-and-watches-fine-jewelry-rings", name: "Rings", slug: "rings" },
          { id: "jewelry-and-watches-fine-jewelry-jewelry-sets", name: "Jewelry Sets", slug: "jewelry-sets" },
          { id: "jewelry-and-watches-fine-jewelry-anklets", name: "Anklets", slug: "anklets" },
          { id: "jewelry-and-watches-fine-jewelry-pendants", name: "Pendants", slug: "pendants" }
        ],
      },
      {
        id: "jewelry-and-watches-fashion-jewelry",
        name: "Fashion Jewelry",
        slug: "fashion-jewelry",
        children: [
          { id: "jewelry-and-watches-fashion-jewelry-costume-necklaces", name: "Costume Necklaces", slug: "costume-necklaces" },
          { id: "jewelry-and-watches-fashion-jewelry-statement-earrings", name: "Statement Earrings", slug: "statement-earrings" },
          { id: "jewelry-and-watches-fashion-jewelry-layered-bracelets", name: "Layered Bracelets", slug: "layered-bracelets" },
          { id: "jewelry-and-watches-fashion-jewelry-body-jewelry", name: "Body Jewelry", slug: "body-jewelry" },
          { id: "jewelry-and-watches-fashion-jewelry-brooches-and-pins", name: "Brooches & Pins", slug: "brooches-and-pins" },
          { id: "jewelry-and-watches-fashion-jewelry-charm-bracelets", name: "Charm Bracelets", slug: "charm-bracelets" }
        ],
      },
      {
        id: "jewelry-and-watches-watches",
        name: "Watches",
        slug: "watches",
        children: [
          { id: "jewelry-and-watches-watches-mens-watches", name: "Men's Watches", slug: "mens-watches" },
          { id: "jewelry-and-watches-watches-womens-watches", name: "Women's Watches", slug: "womens-watches" },
          { id: "jewelry-and-watches-watches-smartwatches", name: "Smartwatches", slug: "smartwatches" },
          { id: "jewelry-and-watches-watches-luxury-watches", name: "Luxury Watches", slug: "luxury-watches" },
          { id: "jewelry-and-watches-watches-watch-bands", name: "Watch Bands", slug: "watch-bands" },
          { id: "jewelry-and-watches-watches-pocket-watches", name: "Pocket Watches", slug: "pocket-watches" },
          { id: "jewelry-and-watches-watches-kids-watches", name: "Kids' Watches", slug: "kids-watches" }
        ],
      },
      {
        id: "jewelry-and-watches-engagement-and-wedding",
        name: "Engagement & Wedding",
        slug: "engagement-and-wedding",
        children: [
          { id: "jewelry-and-watches-engagement-and-wedding-engagement-rings", name: "Engagement Rings", slug: "engagement-rings" },
          { id: "jewelry-and-watches-engagement-and-wedding-wedding-bands", name: "Wedding Bands", slug: "wedding-bands" },
          { id: "jewelry-and-watches-engagement-and-wedding-bridal-sets", name: "Bridal Sets", slug: "bridal-sets" },
          { id: "jewelry-and-watches-engagement-and-wedding-anniversary-rings", name: "Anniversary Rings", slug: "anniversary-rings" },
          { id: "jewelry-and-watches-engagement-and-wedding-promise-rings", name: "Promise Rings", slug: "promise-rings" }
        ],
      },
      {
        id: "jewelry-and-watches-jewelry-care",
        name: "Jewelry Care",
        slug: "jewelry-care",
        children: [
          { id: "jewelry-and-watches-jewelry-care-jewelry-boxes", name: "Jewelry Boxes", slug: "jewelry-boxes" },
          { id: "jewelry-and-watches-jewelry-care-jewelry-cleaning-supplies", name: "Jewelry Cleaning Supplies", slug: "jewelry-cleaning-supplies" },
          { id: "jewelry-and-watches-jewelry-care-jewelry-organizers", name: "Jewelry Organizers", slug: "jewelry-organizers" },
          { id: "jewelry-and-watches-jewelry-care-jewelry-repair-kits", name: "Jewelry Repair Kits", slug: "jewelry-repair-kits" },
          { id: "jewelry-and-watches-jewelry-care-ring-sizers", name: "Ring Sizers", slug: "ring-sizers" }
        ],
      }
    ],
  },
  {
    id: "health-and-beauty",
    name: "Health & Beauty",
    slug: "health-and-beauty",
    icon: Sparkles,
    image: "https://picsum.photos/seed/health-and-beauty/800/500",
    description: "Skincare, makeup, wellness, and personal care essentials.",
    featured: true,
    children: [
      {
        id: "health-and-beauty-skincare",
        name: "Skincare",
        slug: "skincare",
        children: [
          { id: "health-and-beauty-skincare-moisturizers", name: "Moisturizers", slug: "moisturizers" },
          { id: "health-and-beauty-skincare-facial-cleansers", name: "Facial Cleansers", slug: "facial-cleansers" },
          { id: "health-and-beauty-skincare-serums", name: "Serums", slug: "serums" },
          { id: "health-and-beauty-skincare-sunscreen", name: "Sunscreen", slug: "sunscreen" },
          { id: "health-and-beauty-skincare-anti-aging-treatments", name: "Anti-Aging Treatments", slug: "anti-aging-treatments" },
          { id: "health-and-beauty-skincare-face-masks", name: "Face Masks", slug: "face-masks" },
          { id: "health-and-beauty-skincare-eye-creams", name: "Eye Creams", slug: "eye-creams" },
          { id: "health-and-beauty-skincare-toners", name: "Toners", slug: "toners" },
          { id: "health-and-beauty-skincare-exfoliators", name: "Exfoliators", slug: "exfoliators" }
        ],
      },
      {
        id: "health-and-beauty-makeup",
        name: "Makeup",
        slug: "makeup",
        children: [
          { id: "health-and-beauty-makeup-foundation", name: "Foundation", slug: "foundation" },
          { id: "health-and-beauty-makeup-lipstick", name: "Lipstick", slug: "lipstick" },
          { id: "health-and-beauty-makeup-mascara", name: "Mascara", slug: "mascara" },
          { id: "health-and-beauty-makeup-eyeshadow", name: "Eyeshadow", slug: "eyeshadow" },
          { id: "health-and-beauty-makeup-concealer", name: "Concealer", slug: "concealer" },
          { id: "health-and-beauty-makeup-makeup-brushes", name: "Makeup Brushes", slug: "makeup-brushes" },
          { id: "health-and-beauty-makeup-blush", name: "Blush", slug: "blush" },
          { id: "health-and-beauty-makeup-setting-sprays", name: "Setting Sprays", slug: "setting-sprays" },
          { id: "health-and-beauty-makeup-makeup-removers", name: "Makeup Removers", slug: "makeup-removers" }
        ],
      },
      {
        id: "health-and-beauty-hair-care",
        name: "Hair Care",
        slug: "hair-care",
        children: [
          { id: "health-and-beauty-hair-care-shampoo-and-conditioner", name: "Shampoo & Conditioner", slug: "shampoo-and-conditioner" },
          { id: "health-and-beauty-hair-care-hair-styling-tools", name: "Hair Styling Tools", slug: "hair-styling-tools" },
          { id: "health-and-beauty-hair-care-hair-color", name: "Hair Color", slug: "hair-color" },
          { id: "health-and-beauty-hair-care-hair-treatments", name: "Hair Treatments", slug: "hair-treatments" },
          { id: "health-and-beauty-hair-care-brushes-and-combs", name: "Brushes & Combs", slug: "brushes-and-combs" },
          { id: "health-and-beauty-hair-care-hair-extensions", name: "Hair Extensions", slug: "hair-extensions" },
          { id: "health-and-beauty-hair-care-scalp-care", name: "Scalp Care", slug: "scalp-care" },
          { id: "health-and-beauty-hair-care-hair-accessories", name: "Hair Accessories", slug: "hair-accessories" }
        ],
      },
      {
        id: "health-and-beauty-personal-care",
        name: "Personal Care",
        slug: "personal-care",
        children: [
          { id: "health-and-beauty-personal-care-deodorant", name: "Deodorant", slug: "deodorant" },
          { id: "health-and-beauty-personal-care-oral-care", name: "Oral Care", slug: "oral-care" },
          { id: "health-and-beauty-personal-care-shaving-and-grooming", name: "Shaving & Grooming", slug: "shaving-and-grooming" },
          { id: "health-and-beauty-personal-care-bath-and-body", name: "Bath & Body", slug: "bath-and-body" },
          { id: "health-and-beauty-personal-care-feminine-care", name: "Feminine Care", slug: "feminine-care" },
          { id: "health-and-beauty-personal-care-foot-care", name: "Foot Care", slug: "foot-care" },
          { id: "health-and-beauty-personal-care-hand-sanitizer", name: "Hand Sanitizer", slug: "hand-sanitizer" },
          { id: "health-and-beauty-personal-care-cotton-swabs-and-balls", name: "Cotton Swabs & Balls", slug: "cotton-swabs-and-balls" }
        ],
      },
      {
        id: "health-and-beauty-vitamins-and-supplements",
        name: "Vitamins & Supplements",
        slug: "vitamins-and-supplements",
        children: [
          { id: "health-and-beauty-vitamins-and-supplements-multivitamins", name: "Multivitamins", slug: "multivitamins" },
          { id: "health-and-beauty-vitamins-and-supplements-protein-supplements", name: "Protein Supplements", slug: "protein-supplements" },
          { id: "health-and-beauty-vitamins-and-supplements-herbal-supplements", name: "Herbal Supplements", slug: "herbal-supplements" },
          { id: "health-and-beauty-vitamins-and-supplements-weight-management", name: "Weight Management", slug: "weight-management" },
          { id: "health-and-beauty-vitamins-and-supplements-probiotics", name: "Probiotics", slug: "probiotics" },
          { id: "health-and-beauty-vitamins-and-supplements-sports-nutrition", name: "Sports Nutrition", slug: "sports-nutrition" },
          { id: "health-and-beauty-vitamins-and-supplements-omega-3-and-fish-oil", name: "Omega-3 & Fish Oil", slug: "omega-3-and-fish-oil" }
        ],
      },
      {
        id: "health-and-beauty-medical-supplies",
        name: "Medical Supplies",
        slug: "medical-supplies",
        children: [
          { id: "health-and-beauty-medical-supplies-first-aid", name: "First Aid", slug: "first-aid" },
          { id: "health-and-beauty-medical-supplies-mobility-aids", name: "Mobility Aids", slug: "mobility-aids" },
          { id: "health-and-beauty-medical-supplies-blood-pressure-monitors", name: "Blood Pressure Monitors", slug: "blood-pressure-monitors" },
          { id: "health-and-beauty-medical-supplies-thermometers", name: "Thermometers", slug: "thermometers" },
          { id: "health-and-beauty-medical-supplies-braces-and-supports", name: "Braces & Supports", slug: "braces-and-supports" },
          { id: "health-and-beauty-medical-supplies-compression-wear", name: "Compression Wear", slug: "compression-wear" },
          { id: "health-and-beauty-medical-supplies-pill-organizers", name: "Pill Organizers", slug: "pill-organizers" }
        ],
      },
      {
        id: "health-and-beauty-fragrance",
        name: "Fragrance",
        slug: "fragrance",
        children: [
          { id: "health-and-beauty-fragrance-womens-perfume", name: "Women's Perfume", slug: "womens-perfume" },
          { id: "health-and-beauty-fragrance-mens-cologne", name: "Men's Cologne", slug: "mens-cologne" },
          { id: "health-and-beauty-fragrance-fragrance-gift-sets", name: "Fragrance Gift Sets", slug: "fragrance-gift-sets" },
          { id: "health-and-beauty-fragrance-body-sprays", name: "Body Sprays", slug: "body-sprays" },
          { id: "health-and-beauty-fragrance-solid-perfumes", name: "Solid Perfumes", slug: "solid-perfumes" }
        ],
      },
      {
        id: "health-and-beauty-wellness-and-relaxation",
        name: "Wellness & Relaxation",
        slug: "wellness-and-relaxation",
        children: [
          { id: "health-and-beauty-wellness-and-relaxation-massage-tools", name: "Massage Tools", slug: "massage-tools" },
          { id: "health-and-beauty-wellness-and-relaxation-aromatherapy", name: "Aromatherapy", slug: "aromatherapy" },
          { id: "health-and-beauty-wellness-and-relaxation-sleep-aids", name: "Sleep Aids", slug: "sleep-aids" },
          { id: "health-and-beauty-wellness-and-relaxation-heating-pads", name: "Heating Pads", slug: "heating-pads" },
          { id: "health-and-beauty-wellness-and-relaxation-essential-oil-diffusers", name: "Essential Oil Diffusers", slug: "essential-oil-diffusers" }
        ],
      }
    ],
  },
  {
    id: "sporting-goods-and-outdoors",
    name: "Sporting Goods & Outdoors",
    slug: "sporting-goods-and-outdoors",
    icon: Dumbbell,
    image: "https://picsum.photos/seed/sporting-goods-and-outdoors/800/500",
    description: "Gear and equipment for sports, fitness, and outdoor adventure.",
    featured: true,
    children: [
      {
        id: "sporting-goods-and-outdoors-exercise-and-fitness",
        name: "Exercise & Fitness",
        slug: "exercise-and-fitness",
        children: [
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-treadmills", name: "Treadmills", slug: "treadmills" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-dumbbells", name: "Dumbbells", slug: "dumbbells" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-yoga-mats", name: "Yoga Mats", slug: "yoga-mats" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-exercise-bikes", name: "Exercise Bikes", slug: "exercise-bikes" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-resistance-bands", name: "Resistance Bands", slug: "resistance-bands" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-weight-benches", name: "Weight Benches", slug: "weight-benches" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-ellipticals", name: "Ellipticals", slug: "ellipticals" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-kettlebells", name: "Kettlebells", slug: "kettlebells" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-foam-rollers", name: "Foam Rollers", slug: "foam-rollers" },
          { id: "sporting-goods-and-outdoors-exercise-and-fitness-jump-ropes", name: "Jump Ropes", slug: "jump-ropes" }
        ],
      },
      {
        id: "sporting-goods-and-outdoors-team-sports",
        name: "Team Sports",
        slug: "team-sports",
        children: [
          { id: "sporting-goods-and-outdoors-team-sports-basketball-gear", name: "Basketball Gear", slug: "basketball-gear" },
          { id: "sporting-goods-and-outdoors-team-sports-soccer-gear", name: "Soccer Gear", slug: "soccer-gear" },
          { id: "sporting-goods-and-outdoors-team-sports-football-gear", name: "Football Gear", slug: "football-gear" },
          { id: "sporting-goods-and-outdoors-team-sports-baseball-and-softball-gear", name: "Baseball & Softball Gear", slug: "baseball-and-softball-gear" },
          { id: "sporting-goods-and-outdoors-team-sports-volleyball-gear", name: "Volleyball Gear", slug: "volleyball-gear" },
          { id: "sporting-goods-and-outdoors-team-sports-hockey-gear", name: "Hockey Gear", slug: "hockey-gear" },
          { id: "sporting-goods-and-outdoors-team-sports-lacrosse-gear", name: "Lacrosse Gear", slug: "lacrosse-gear" }
        ],
      },
      {
        id: "sporting-goods-and-outdoors-outdoor-recreation",
        name: "Outdoor Recreation",
        slug: "outdoor-recreation",
        children: [
          { id: "sporting-goods-and-outdoors-outdoor-recreation-camping-gear", name: "Camping Gear", slug: "camping-gear" },
          { id: "sporting-goods-and-outdoors-outdoor-recreation-hiking-equipment", name: "Hiking Equipment", slug: "hiking-equipment" },
          { id: "sporting-goods-and-outdoors-outdoor-recreation-tents", name: "Tents", slug: "tents" },
          { id: "sporting-goods-and-outdoors-outdoor-recreation-sleeping-bags", name: "Sleeping Bags", slug: "sleeping-bags" },
          { id: "sporting-goods-and-outdoors-outdoor-recreation-backpacks", name: "Backpacks", slug: "backpacks" },
          { id: "sporting-goods-and-outdoors-outdoor-recreation-camping-cookware", name: "Camping Cookware", slug: "camping-cookware" },
          { id: "sporting-goods-and-outdoors-outdoor-recreation-camping-furniture", name: "Camping Furniture", slug: "camping-furniture" },
          { id: "sporting-goods-and-outdoors-outdoor-recreation-headlamps-and-lanterns", name: "Headlamps & Lanterns", slug: "headlamps-and-lanterns" }
        ],
      },
      {
        id: "sporting-goods-and-outdoors-cycling",
        name: "Cycling",
        slug: "cycling",
        children: [
          { id: "sporting-goods-and-outdoors-cycling-mountain-bikes", name: "Mountain Bikes", slug: "mountain-bikes" },
          { id: "sporting-goods-and-outdoors-cycling-road-bikes", name: "Road Bikes", slug: "road-bikes" },
          { id: "sporting-goods-and-outdoors-cycling-bike-helmets", name: "Bike Helmets", slug: "bike-helmets" },
          { id: "sporting-goods-and-outdoors-cycling-bike-accessories", name: "Bike Accessories", slug: "bike-accessories" },
          { id: "sporting-goods-and-outdoors-cycling-electric-bikes", name: "Electric Bikes", slug: "electric-bikes" },
          { id: "sporting-goods-and-outdoors-cycling-bike-repair-tools", name: "Bike Repair Tools", slug: "bike-repair-tools" },
          { id: "sporting-goods-and-outdoors-cycling-bike-lights", name: "Bike Lights", slug: "bike-lights" },
          { id: "sporting-goods-and-outdoors-cycling-bike-locks", name: "Bike Locks", slug: "bike-locks" }
        ],
      },
      {
        id: "sporting-goods-and-outdoors-water-sports",
        name: "Water Sports",
        slug: "water-sports",
        children: [
          { id: "sporting-goods-and-outdoors-water-sports-kayaks", name: "Kayaks", slug: "kayaks" },
          { id: "sporting-goods-and-outdoors-water-sports-paddleboards", name: "Paddleboards", slug: "paddleboards" },
          { id: "sporting-goods-and-outdoors-water-sports-life-jackets", name: "Life Jackets", slug: "life-jackets" },
          { id: "sporting-goods-and-outdoors-water-sports-swim-gear", name: "Swim Gear", slug: "swim-gear" },
          { id: "sporting-goods-and-outdoors-water-sports-fishing-gear", name: "Fishing Gear", slug: "fishing-gear" },
          { id: "sporting-goods-and-outdoors-water-sports-snorkeling-gear", name: "Snorkeling Gear", slug: "snorkeling-gear" },
          { id: "sporting-goods-and-outdoors-water-sports-wetsuits", name: "Wetsuits", slug: "wetsuits" },
          { id: "sporting-goods-and-outdoors-water-sports-fishing-rods-and-reels", name: "Fishing Rods & Reels", slug: "fishing-rods-and-reels" }
        ],
      },
      {
        id: "sporting-goods-and-outdoors-golf",
        name: "Golf",
        slug: "golf",
        children: [
          { id: "sporting-goods-and-outdoors-golf-golf-clubs", name: "Golf Clubs", slug: "golf-clubs" },
          { id: "sporting-goods-and-outdoors-golf-golf-balls", name: "Golf Balls", slug: "golf-balls" },
          { id: "sporting-goods-and-outdoors-golf-golf-bags", name: "Golf Bags", slug: "golf-bags" },
          { id: "sporting-goods-and-outdoors-golf-golf-apparel", name: "Golf Apparel", slug: "golf-apparel" },
          { id: "sporting-goods-and-outdoors-golf-golf-shoes", name: "Golf Shoes", slug: "golf-shoes" },
          { id: "sporting-goods-and-outdoors-golf-golf-accessories", name: "Golf Accessories", slug: "golf-accessories" },
          { id: "sporting-goods-and-outdoors-golf-golf-gloves", name: "Golf Gloves", slug: "golf-gloves" },
          { id: "sporting-goods-and-outdoors-golf-golf-rangefinders", name: "Golf Rangefinders", slug: "golf-rangefinders" }
        ],
      },
      {
        id: "sporting-goods-and-outdoors-winter-sports",
        name: "Winter Sports",
        slug: "winter-sports",
        children: [
          { id: "sporting-goods-and-outdoors-winter-sports-skis", name: "Skis", slug: "skis" },
          { id: "sporting-goods-and-outdoors-winter-sports-snowboards", name: "Snowboards", slug: "snowboards" },
          { id: "sporting-goods-and-outdoors-winter-sports-winter-sports-apparel", name: "Winter Sports Apparel", slug: "winter-sports-apparel" },
          { id: "sporting-goods-and-outdoors-winter-sports-ice-skates", name: "Ice Skates", slug: "ice-skates" },
          { id: "sporting-goods-and-outdoors-winter-sports-snow-sleds", name: "Snow Sleds", slug: "snow-sleds" },
          { id: "sporting-goods-and-outdoors-winter-sports-ski-goggles", name: "Ski Goggles", slug: "ski-goggles" },
          { id: "sporting-goods-and-outdoors-winter-sports-snowshoes", name: "Snowshoes", slug: "snowshoes" }
        ],
      },
      {
        id: "sporting-goods-and-outdoors-hunting",
        name: "Hunting",
        slug: "hunting",
        children: [
          { id: "sporting-goods-and-outdoors-hunting-hunting-bows", name: "Hunting Bows", slug: "hunting-bows" },
          { id: "sporting-goods-and-outdoors-hunting-hunting-optics", name: "Hunting Optics", slug: "hunting-optics" },
          { id: "sporting-goods-and-outdoors-hunting-hunting-apparel", name: "Hunting Apparel", slug: "hunting-apparel" },
          { id: "sporting-goods-and-outdoors-hunting-game-cameras", name: "Game Cameras", slug: "game-cameras" },
          { id: "sporting-goods-and-outdoors-hunting-hunting-blinds", name: "Hunting Blinds", slug: "hunting-blinds" },
          { id: "sporting-goods-and-outdoors-hunting-hunting-backpacks", name: "Hunting Backpacks", slug: "hunting-backpacks" }
        ],
      }
    ],
  },
  {
    id: "toys-games-and-hobbies",
    name: "Toys, Games & Hobbies",
    slug: "toys-games-and-hobbies",
    icon: Puzzle,
    image: "https://picsum.photos/seed/toys-games-and-hobbies/800/500",
    description: "Toys, games, and hobby supplies for kids and collectors alike.",
    featured: true,
    children: [
      {
        id: "toys-games-and-hobbies-building-toys",
        name: "Building Toys",
        slug: "building-toys",
        children: [
          { id: "toys-games-and-hobbies-building-toys-building-blocks", name: "Building Blocks", slug: "building-blocks" },
          { id: "toys-games-and-hobbies-building-toys-construction-sets", name: "Construction Sets", slug: "construction-sets" },
          { id: "toys-games-and-hobbies-building-toys-model-kits", name: "Model Kits", slug: "model-kits" },
          { id: "toys-games-and-hobbies-building-toys-magnetic-building-tiles", name: "Magnetic Building Tiles", slug: "magnetic-building-tiles" },
          { id: "toys-games-and-hobbies-building-toys-marble-runs", name: "Marble Runs", slug: "marble-runs" }
        ],
      },
      {
        id: "toys-games-and-hobbies-dolls-and-action-figures",
        name: "Dolls & Action Figures",
        slug: "dolls-and-action-figures",
        children: [
          { id: "toys-games-and-hobbies-dolls-and-action-figures-fashion-dolls", name: "Fashion Dolls", slug: "fashion-dolls" },
          { id: "toys-games-and-hobbies-dolls-and-action-figures-action-figures", name: "Action Figures", slug: "action-figures" },
          { id: "toys-games-and-hobbies-dolls-and-action-figures-playsets", name: "Playsets", slug: "playsets" },
          { id: "toys-games-and-hobbies-dolls-and-action-figures-plush-toys", name: "Plush Toys", slug: "plush-toys" },
          { id: "toys-games-and-hobbies-dolls-and-action-figures-collectible-figures", name: "Collectible Figures", slug: "collectible-figures" },
          { id: "toys-games-and-hobbies-dolls-and-action-figures-doll-accessories", name: "Doll Accessories", slug: "doll-accessories" }
        ],
      },
      {
        id: "toys-games-and-hobbies-games-and-puzzles",
        name: "Games & Puzzles",
        slug: "games-and-puzzles",
        children: [
          { id: "toys-games-and-hobbies-games-and-puzzles-board-games", name: "Board Games", slug: "board-games" },
          { id: "toys-games-and-hobbies-games-and-puzzles-card-games", name: "Card Games", slug: "card-games" },
          { id: "toys-games-and-hobbies-games-and-puzzles-jigsaw-puzzles", name: "Jigsaw Puzzles", slug: "jigsaw-puzzles" },
          { id: "toys-games-and-hobbies-games-and-puzzles-trivia-games", name: "Trivia Games", slug: "trivia-games" },
          { id: "toys-games-and-hobbies-games-and-puzzles-party-games", name: "Party Games", slug: "party-games" },
          { id: "toys-games-and-hobbies-games-and-puzzles-3d-puzzles", name: "3D Puzzles", slug: "3d-puzzles" }
        ],
      },
      {
        id: "toys-games-and-hobbies-outdoor-play",
        name: "Outdoor Play",
        slug: "outdoor-play",
        children: [
          { id: "toys-games-and-hobbies-outdoor-play-ride-on-toys", name: "Ride-On Toys", slug: "ride-on-toys" },
          { id: "toys-games-and-hobbies-outdoor-play-water-toys", name: "Water Toys", slug: "water-toys" },
          { id: "toys-games-and-hobbies-outdoor-play-playground-sets", name: "Playground Sets", slug: "playground-sets" },
          { id: "toys-games-and-hobbies-outdoor-play-sports-toys", name: "Sports Toys", slug: "sports-toys" },
          { id: "toys-games-and-hobbies-outdoor-play-trampolines", name: "Trampolines", slug: "trampolines" },
          { id: "toys-games-and-hobbies-outdoor-play-sandbox-toys", name: "Sandbox Toys", slug: "sandbox-toys" }
        ],
      },
      {
        id: "toys-games-and-hobbies-educational-toys",
        name: "Educational Toys",
        slug: "educational-toys",
        children: [
          { id: "toys-games-and-hobbies-educational-toys-stem-toys", name: "STEM Toys", slug: "stem-toys" },
          { id: "toys-games-and-hobbies-educational-toys-learning-tablets", name: "Learning Tablets", slug: "learning-tablets" },
          { id: "toys-games-and-hobbies-educational-toys-musical-toys", name: "Musical Toys", slug: "musical-toys" },
          { id: "toys-games-and-hobbies-educational-toys-flash-cards", name: "Flash Cards", slug: "flash-cards" },
          { id: "toys-games-and-hobbies-educational-toys-coding-toys", name: "Coding Toys", slug: "coding-toys" },
          { id: "toys-games-and-hobbies-educational-toys-science-kits", name: "Science Kits", slug: "science-kits" }
        ],
      },
      {
        id: "toys-games-and-hobbies-remote-control-and-vehicles",
        name: "Remote Control & Vehicles",
        slug: "remote-control-and-vehicles",
        children: [
          { id: "toys-games-and-hobbies-remote-control-and-vehicles-rc-cars", name: "RC Cars", slug: "rc-cars" },
          { id: "toys-games-and-hobbies-remote-control-and-vehicles-rc-drones", name: "RC Drones", slug: "rc-drones" },
          { id: "toys-games-and-hobbies-remote-control-and-vehicles-rc-boats", name: "RC Boats", slug: "rc-boats" },
          { id: "toys-games-and-hobbies-remote-control-and-vehicles-die-cast-vehicles", name: "Die-Cast Vehicles", slug: "die-cast-vehicles" },
          { id: "toys-games-and-hobbies-remote-control-and-vehicles-rc-trucks", name: "RC Trucks", slug: "rc-trucks" },
          { id: "toys-games-and-hobbies-remote-control-and-vehicles-rc-helicopters", name: "RC Helicopters", slug: "rc-helicopters" }
        ],
      },
      {
        id: "toys-games-and-hobbies-arts-and-crafts-for-kids",
        name: "Arts & Crafts for Kids",
        slug: "arts-and-crafts-for-kids",
        children: [
          { id: "toys-games-and-hobbies-arts-and-crafts-for-kids-craft-kits", name: "Craft Kits", slug: "craft-kits" },
          { id: "toys-games-and-hobbies-arts-and-crafts-for-kids-coloring-books", name: "Coloring Books", slug: "coloring-books" },
          { id: "toys-games-and-hobbies-arts-and-crafts-for-kids-play-doh-and-modeling-compound", name: "Play-Doh & Modeling Compound", slug: "play-doh-and-modeling-compound" },
          { id: "toys-games-and-hobbies-arts-and-crafts-for-kids-sticker-sets", name: "Sticker Sets", slug: "sticker-sets" },
          { id: "toys-games-and-hobbies-arts-and-crafts-for-kids-kids-paint-sets", name: "Kids' Paint Sets", slug: "kids-paint-sets" }
        ],
      },
      {
        id: "toys-games-and-hobbies-hobbies",
        name: "Hobbies",
        slug: "hobbies",
        children: [
          { id: "toys-games-and-hobbies-hobbies-model-trains", name: "Model Trains", slug: "model-trains" },
          { id: "toys-games-and-hobbies-hobbies-rc-hobby-parts", name: "RC Hobby Parts", slug: "rc-hobby-parts" },
          { id: "toys-games-and-hobbies-hobbies-puzzles-for-adults", name: "Puzzles for Adults", slug: "puzzles-for-adults" },
          { id: "toys-games-and-hobbies-hobbies-collectible-card-games", name: "Collectible Card Games", slug: "collectible-card-games" },
          { id: "toys-games-and-hobbies-hobbies-diecast-collectibles", name: "Diecast Collectibles", slug: "diecast-collectibles" }
        ],
      }
    ],
  },
  {
    id: "pet-supplies",
    name: "Pet Supplies",
    slug: "pet-supplies",
    icon: PawPrint,
    image: "https://picsum.photos/seed/pet-supplies/800/500",
    description: "Food, toys, and gear to keep every pet happy and healthy.",
    featured: false,
    children: [
      {
        id: "pet-supplies-dog-supplies",
        name: "Dog Supplies",
        slug: "dog-supplies",
        children: [
          { id: "pet-supplies-dog-supplies-dog-food", name: "Dog Food", slug: "dog-food" },
          { id: "pet-supplies-dog-supplies-dog-toys", name: "Dog Toys", slug: "dog-toys" },
          { id: "pet-supplies-dog-supplies-dog-beds", name: "Dog Beds", slug: "dog-beds" },
          { id: "pet-supplies-dog-supplies-dog-collars-and-leashes", name: "Dog Collars & Leashes", slug: "dog-collars-and-leashes" },
          { id: "pet-supplies-dog-supplies-dog-crates", name: "Dog Crates", slug: "dog-crates" },
          { id: "pet-supplies-dog-supplies-dog-grooming-supplies", name: "Dog Grooming Supplies", slug: "dog-grooming-supplies" },
          { id: "pet-supplies-dog-supplies-dog-apparel", name: "Dog Apparel", slug: "dog-apparel" },
          { id: "pet-supplies-dog-supplies-dog-treats", name: "Dog Treats", slug: "dog-treats" },
          { id: "pet-supplies-dog-supplies-dog-bowls-and-feeders", name: "Dog Bowls & Feeders", slug: "dog-bowls-and-feeders" }
        ],
      },
      {
        id: "pet-supplies-cat-supplies",
        name: "Cat Supplies",
        slug: "cat-supplies",
        children: [
          { id: "pet-supplies-cat-supplies-cat-food", name: "Cat Food", slug: "cat-food" },
          { id: "pet-supplies-cat-supplies-cat-litter", name: "Cat Litter", slug: "cat-litter" },
          { id: "pet-supplies-cat-supplies-cat-toys", name: "Cat Toys", slug: "cat-toys" },
          { id: "pet-supplies-cat-supplies-cat-trees-and-scratchers", name: "Cat Trees & Scratchers", slug: "cat-trees-and-scratchers" },
          { id: "pet-supplies-cat-supplies-cat-carriers", name: "Cat Carriers", slug: "cat-carriers" },
          { id: "pet-supplies-cat-supplies-cat-treats", name: "Cat Treats", slug: "cat-treats" },
          { id: "pet-supplies-cat-supplies-cat-bowls-and-feeders", name: "Cat Bowls & Feeders", slug: "cat-bowls-and-feeders" }
        ],
      },
      {
        id: "pet-supplies-fish-and-aquatic",
        name: "Fish & Aquatic",
        slug: "fish-and-aquatic",
        children: [
          { id: "pet-supplies-fish-and-aquatic-aquariums", name: "Aquariums", slug: "aquariums" },
          { id: "pet-supplies-fish-and-aquatic-fish-food", name: "Fish Food", slug: "fish-food" },
          { id: "pet-supplies-fish-and-aquatic-aquarium-filters", name: "Aquarium Filters", slug: "aquarium-filters" },
          { id: "pet-supplies-fish-and-aquatic-aquarium-decor", name: "Aquarium Decor", slug: "aquarium-decor" },
          { id: "pet-supplies-fish-and-aquatic-aquarium-lighting", name: "Aquarium Lighting", slug: "aquarium-lighting" },
          { id: "pet-supplies-fish-and-aquatic-aquarium-heaters", name: "Aquarium Heaters", slug: "aquarium-heaters" }
        ],
      },
      {
        id: "pet-supplies-small-animal-supplies",
        name: "Small Animal Supplies",
        slug: "small-animal-supplies",
        children: [
          { id: "pet-supplies-small-animal-supplies-hamster-cages", name: "Hamster Cages", slug: "hamster-cages" },
          { id: "pet-supplies-small-animal-supplies-rabbit-supplies", name: "Rabbit Supplies", slug: "rabbit-supplies" },
          { id: "pet-supplies-small-animal-supplies-small-pet-food", name: "Small Pet Food", slug: "small-pet-food" },
          { id: "pet-supplies-small-animal-supplies-bedding-and-litter", name: "Bedding & Litter", slug: "bedding-and-litter" },
          { id: "pet-supplies-small-animal-supplies-small-pet-toys", name: "Small Pet Toys", slug: "small-pet-toys" },
          { id: "pet-supplies-small-animal-supplies-small-pet-habitats", name: "Small Pet Habitats", slug: "small-pet-habitats" }
        ],
      },
      {
        id: "pet-supplies-bird-supplies",
        name: "Bird Supplies",
        slug: "bird-supplies",
        children: [
          { id: "pet-supplies-bird-supplies-bird-cages", name: "Bird Cages", slug: "bird-cages" },
          { id: "pet-supplies-bird-supplies-bird-food", name: "Bird Food", slug: "bird-food" },
          { id: "pet-supplies-bird-supplies-bird-toys", name: "Bird Toys", slug: "bird-toys" },
          { id: "pet-supplies-bird-supplies-bird-feeders", name: "Bird Feeders", slug: "bird-feeders" },
          { id: "pet-supplies-bird-supplies-bird-perches", name: "Bird Perches", slug: "bird-perches" },
          { id: "pet-supplies-bird-supplies-bird-baths", name: "Bird Baths", slug: "bird-baths" }
        ],
      },
      {
        id: "pet-supplies-reptile-supplies",
        name: "Reptile Supplies",
        slug: "reptile-supplies",
        children: [
          { id: "pet-supplies-reptile-supplies-terrariums", name: "Terrariums", slug: "terrariums" },
          { id: "pet-supplies-reptile-supplies-reptile-food", name: "Reptile Food", slug: "reptile-food" },
          { id: "pet-supplies-reptile-supplies-heating-and-lighting", name: "Heating & Lighting", slug: "heating-and-lighting" },
          { id: "pet-supplies-reptile-supplies-reptile-substrate", name: "Reptile Substrate", slug: "reptile-substrate" },
          { id: "pet-supplies-reptile-supplies-reptile-decor", name: "Reptile Decor", slug: "reptile-decor" }
        ],
      },
      {
        id: "pet-supplies-pet-health",
        name: "Pet Health",
        slug: "pet-health",
        children: [
          { id: "pet-supplies-pet-health-flea-and-tick-control", name: "Flea & Tick Control", slug: "flea-and-tick-control" },
          { id: "pet-supplies-pet-health-pet-vitamins", name: "Pet Vitamins", slug: "pet-vitamins" },
          { id: "pet-supplies-pet-health-grooming-supplies", name: "Grooming Supplies", slug: "grooming-supplies" },
          { id: "pet-supplies-pet-health-pet-dental-care", name: "Pet Dental Care", slug: "pet-dental-care" },
          { id: "pet-supplies-pet-health-pet-first-aid", name: "Pet First Aid", slug: "pet-first-aid" }
        ],
      }
    ],
  },
  {
    id: "books-movies-and-music",
    name: "Books, Movies & Music",
    slug: "books-movies-and-music",
    icon: BookOpen,
    image: "https://picsum.photos/seed/books-movies-and-music/800/500",
    description: "Bestsellers, films, and music across every genre.",
    featured: false,
    children: [
      {
        id: "books-movies-and-music-books",
        name: "Books",
        slug: "books",
        children: [
          { id: "books-movies-and-music-books-fiction", name: "Fiction", slug: "fiction" },
          { id: "books-movies-and-music-books-non-fiction", name: "Non-Fiction", slug: "non-fiction" },
          { id: "books-movies-and-music-books-childrens-books", name: "Children's Books", slug: "childrens-books" },
          { id: "books-movies-and-music-books-textbooks", name: "Textbooks", slug: "textbooks" },
          { id: "books-movies-and-music-books-cookbooks", name: "Cookbooks", slug: "cookbooks" },
          { id: "books-movies-and-music-books-comics-and-graphic-novels", name: "Comics & Graphic Novels", slug: "comics-and-graphic-novels" },
          { id: "books-movies-and-music-books-self-help-books", name: "Self-Help Books", slug: "self-help-books" },
          { id: "books-movies-and-music-books-biographies", name: "Biographies", slug: "biographies" },
          { id: "books-movies-and-music-books-young-adult-books", name: "Young Adult Books", slug: "young-adult-books" },
          { id: "books-movies-and-music-books-poetry", name: "Poetry", slug: "poetry" }
        ],
      },
      {
        id: "books-movies-and-music-movies",
        name: "Movies",
        slug: "movies",
        children: [
          { id: "books-movies-and-music-movies-blu-ray", name: "Blu-ray", slug: "blu-ray" },
          { id: "books-movies-and-music-movies-dvd", name: "DVD", slug: "dvd" },
          { id: "books-movies-and-music-movies-4k-uhd", name: "4K UHD", slug: "4k-uhd" },
          { id: "books-movies-and-music-movies-box-sets", name: "Box Sets", slug: "box-sets" },
          { id: "books-movies-and-music-movies-classic-films", name: "Classic Films", slug: "classic-films" },
          { id: "books-movies-and-music-movies-anime", name: "Anime", slug: "anime" },
          { id: "books-movies-and-music-movies-documentaries", name: "Documentaries", slug: "documentaries" },
          { id: "books-movies-and-music-movies-foreign-films", name: "Foreign Films", slug: "foreign-films" }
        ],
      },
      {
        id: "books-movies-and-music-music",
        name: "Music",
        slug: "music",
        children: [
          { id: "books-movies-and-music-music-vinyl-records", name: "Vinyl Records", slug: "vinyl-records" },
          { id: "books-movies-and-music-music-cds", name: "CDs", slug: "cds" },
          { id: "books-movies-and-music-music-cassette-tapes", name: "Cassette Tapes", slug: "cassette-tapes" },
          { id: "books-movies-and-music-music-music-merchandise", name: "Music Merchandise", slug: "music-merchandise" },
          { id: "books-movies-and-music-music-music-box-sets", name: "Music Box Sets", slug: "music-box-sets" },
          { id: "books-movies-and-music-music-sheet-music", name: "Sheet Music", slug: "sheet-music" }
        ],
      },
      {
        id: "books-movies-and-music-magazines",
        name: "Magazines",
        slug: "magazines",
        children: [
          { id: "books-movies-and-music-magazines-magazine-subscriptions", name: "Magazine Subscriptions", slug: "magazine-subscriptions" },
          { id: "books-movies-and-music-magazines-back-issues", name: "Back Issues", slug: "back-issues" },
          { id: "books-movies-and-music-magazines-digital-magazine-subscriptions", name: "Digital Magazine Subscriptions", slug: "digital-magazine-subscriptions" }
        ],
      },
      {
        id: "books-movies-and-music-e-readers-and-audiobooks",
        name: "E-Readers & Audiobooks",
        slug: "e-readers-and-audiobooks",
        children: [
          { id: "books-movies-and-music-e-readers-and-audiobooks-e-readers", name: "E-Readers", slug: "e-readers" },
          { id: "books-movies-and-music-e-readers-and-audiobooks-audiobook-devices", name: "Audiobook Devices", slug: "audiobook-devices" },
          { id: "books-movies-and-music-e-readers-and-audiobooks-audiobook-subscriptions", name: "Audiobook Subscriptions", slug: "audiobook-subscriptions" },
          { id: "books-movies-and-music-e-readers-and-audiobooks-e-reader-cases", name: "E-Reader Cases", slug: "e-reader-cases" }
        ],
      }
    ],
  },
  {
    id: "musical-instruments-and-gear",
    name: "Musical Instruments & Gear",
    slug: "musical-instruments-and-gear",
    icon: Music,
    image: "https://picsum.photos/seed/musical-instruments-and-gear/800/500",
    description: "Instruments and studio gear for musicians of every level.",
    featured: false,
    children: [
      {
        id: "musical-instruments-and-gear-guitars-and-bass",
        name: "Guitars & Bass",
        slug: "guitars-and-bass",
        children: [
          { id: "musical-instruments-and-gear-guitars-and-bass-acoustic-guitars", name: "Acoustic Guitars", slug: "acoustic-guitars" },
          { id: "musical-instruments-and-gear-guitars-and-bass-electric-guitars", name: "Electric Guitars", slug: "electric-guitars" },
          { id: "musical-instruments-and-gear-guitars-and-bass-bass-guitars", name: "Bass Guitars", slug: "bass-guitars" },
          { id: "musical-instruments-and-gear-guitars-and-bass-guitar-amps", name: "Guitar Amps", slug: "guitar-amps" },
          { id: "musical-instruments-and-gear-guitars-and-bass-guitar-accessories", name: "Guitar Accessories", slug: "guitar-accessories" },
          { id: "musical-instruments-and-gear-guitars-and-bass-guitar-pedals", name: "Guitar Pedals", slug: "guitar-pedals" },
          { id: "musical-instruments-and-gear-guitars-and-bass-guitar-strings", name: "Guitar Strings", slug: "guitar-strings" },
          { id: "musical-instruments-and-gear-guitars-and-bass-guitar-cases", name: "Guitar Cases", slug: "guitar-cases" }
        ],
      },
      {
        id: "musical-instruments-and-gear-keyboards-and-pianos",
        name: "Keyboards & Pianos",
        slug: "keyboards-and-pianos",
        children: [
          { id: "musical-instruments-and-gear-keyboards-and-pianos-digital-pianos", name: "Digital Pianos", slug: "digital-pianos" },
          { id: "musical-instruments-and-gear-keyboards-and-pianos-keyboards", name: "Keyboards", slug: "keyboards" },
          { id: "musical-instruments-and-gear-keyboards-and-pianos-synthesizers", name: "Synthesizers", slug: "synthesizers" },
          { id: "musical-instruments-and-gear-keyboards-and-pianos-piano-accessories", name: "Piano Accessories", slug: "piano-accessories" },
          { id: "musical-instruments-and-gear-keyboards-and-pianos-midi-controllers", name: "MIDI Controllers", slug: "midi-controllers" },
          { id: "musical-instruments-and-gear-keyboards-and-pianos-piano-benches", name: "Piano Benches", slug: "piano-benches" }
        ],
      },
      {
        id: "musical-instruments-and-gear-percussion",
        name: "Percussion",
        slug: "percussion",
        children: [
          { id: "musical-instruments-and-gear-percussion-drum-sets", name: "Drum Sets", slug: "drum-sets" },
          { id: "musical-instruments-and-gear-percussion-cymbals", name: "Cymbals", slug: "cymbals" },
          { id: "musical-instruments-and-gear-percussion-electronic-drums", name: "Electronic Drums", slug: "electronic-drums" },
          { id: "musical-instruments-and-gear-percussion-hand-percussion", name: "Hand Percussion", slug: "hand-percussion" },
          { id: "musical-instruments-and-gear-percussion-drum-accessories", name: "Drum Accessories", slug: "drum-accessories" },
          { id: "musical-instruments-and-gear-percussion-drumsticks", name: "Drumsticks", slug: "drumsticks" },
          { id: "musical-instruments-and-gear-percussion-drum-heads", name: "Drum Heads", slug: "drum-heads" }
        ],
      },
      {
        id: "musical-instruments-and-gear-band-and-orchestra",
        name: "Band & Orchestra",
        slug: "band-and-orchestra",
        children: [
          { id: "musical-instruments-and-gear-band-and-orchestra-wind-instruments", name: "Wind Instruments", slug: "wind-instruments" },
          { id: "musical-instruments-and-gear-band-and-orchestra-string-instruments", name: "String Instruments", slug: "string-instruments" },
          { id: "musical-instruments-and-gear-band-and-orchestra-brass-instruments", name: "Brass Instruments", slug: "brass-instruments" },
          { id: "musical-instruments-and-gear-band-and-orchestra-orchestra-accessories", name: "Orchestra Accessories", slug: "orchestra-accessories" },
          { id: "musical-instruments-and-gear-band-and-orchestra-instrument-reeds", name: "Instrument Reeds", slug: "instrument-reeds" },
          { id: "musical-instruments-and-gear-band-and-orchestra-rosin", name: "Rosin", slug: "rosin" }
        ],
      },
      {
        id: "musical-instruments-and-gear-dj-and-studio-equipment",
        name: "DJ & Studio Equipment",
        slug: "dj-and-studio-equipment",
        children: [
          { id: "musical-instruments-and-gear-dj-and-studio-equipment-dj-controllers", name: "DJ Controllers", slug: "dj-controllers" },
          { id: "musical-instruments-and-gear-dj-and-studio-equipment-studio-monitors", name: "Studio Monitors", slug: "studio-monitors" },
          { id: "musical-instruments-and-gear-dj-and-studio-equipment-audio-interfaces", name: "Audio Interfaces", slug: "audio-interfaces" },
          { id: "musical-instruments-and-gear-dj-and-studio-equipment-studio-microphones", name: "Studio Microphones", slug: "studio-microphones" },
          { id: "musical-instruments-and-gear-dj-and-studio-equipment-mixers", name: "Mixers", slug: "mixers" },
          { id: "musical-instruments-and-gear-dj-and-studio-equipment-studio-headphones", name: "Studio Headphones", slug: "studio-headphones" },
          { id: "musical-instruments-and-gear-dj-and-studio-equipment-turntables-for-djs", name: "Turntables for DJs", slug: "turntables-for-djs" }
        ],
      },
      {
        id: "musical-instruments-and-gear-accessories",
        name: "Accessories",
        slug: "accessories",
        children: [
          { id: "musical-instruments-and-gear-accessories-instrument-cases", name: "Instrument Cases", slug: "instrument-cases" },
          { id: "musical-instruments-and-gear-accessories-straps", name: "Straps", slug: "straps" },
          { id: "musical-instruments-and-gear-accessories-tuners", name: "Tuners", slug: "tuners" },
          { id: "musical-instruments-and-gear-accessories-sheet-music-stands", name: "Sheet Music Stands", slug: "sheet-music-stands" },
          { id: "musical-instruments-and-gear-accessories-metronomes", name: "Metronomes", slug: "metronomes" },
          { id: "musical-instruments-and-gear-accessories-music-stands", name: "Music Stands", slug: "music-stands" }
        ],
      }
    ],
  },
  {
    id: "office-and-school-supplies",
    name: "Office & School Supplies",
    slug: "office-and-school-supplies",
    icon: Briefcase,
    image: "https://picsum.photos/seed/office-and-school-supplies/800/500",
    description: "Everything for the office, classroom, and home workspace.",
    featured: false,
    children: [
      {
        id: "office-and-school-supplies-writing-supplies",
        name: "Writing Supplies",
        slug: "writing-supplies",
        children: [
          { id: "office-and-school-supplies-writing-supplies-pens", name: "Pens", slug: "pens" },
          { id: "office-and-school-supplies-writing-supplies-pencils", name: "Pencils", slug: "pencils" },
          { id: "office-and-school-supplies-writing-supplies-markers-and-highlighters", name: "Markers & Highlighters", slug: "markers-and-highlighters" },
          { id: "office-and-school-supplies-writing-supplies-notebooks", name: "Notebooks", slug: "notebooks" },
          { id: "office-and-school-supplies-writing-supplies-notepads", name: "Notepads", slug: "notepads" },
          { id: "office-and-school-supplies-writing-supplies-erasers", name: "Erasers", slug: "erasers" }
        ],
      },
      {
        id: "office-and-school-supplies-office-furniture",
        name: "Office Furniture",
        slug: "office-furniture",
        children: [
          { id: "office-and-school-supplies-office-furniture-desks", name: "Desks", slug: "desks" },
          { id: "office-and-school-supplies-office-furniture-office-chairs", name: "Office Chairs", slug: "office-chairs" },
          { id: "office-and-school-supplies-office-furniture-filing-cabinets", name: "Filing Cabinets", slug: "filing-cabinets" },
          { id: "office-and-school-supplies-office-furniture-bookcases", name: "Bookcases", slug: "bookcases" },
          { id: "office-and-school-supplies-office-furniture-conference-tables", name: "Conference Tables", slug: "conference-tables" },
          { id: "office-and-school-supplies-office-furniture-room-dividers", name: "Room Dividers", slug: "room-dividers" }
        ],
      },
      {
        id: "office-and-school-supplies-paper-products",
        name: "Paper Products",
        slug: "paper-products",
        children: [
          { id: "office-and-school-supplies-paper-products-printer-paper", name: "Printer Paper", slug: "printer-paper" },
          { id: "office-and-school-supplies-paper-products-sticky-notes", name: "Sticky Notes", slug: "sticky-notes" },
          { id: "office-and-school-supplies-paper-products-envelopes", name: "Envelopes", slug: "envelopes" },
          { id: "office-and-school-supplies-paper-products-cardstock", name: "Cardstock", slug: "cardstock" },
          { id: "office-and-school-supplies-paper-products-notepads-and-legal-pads", name: "Notepads & Legal Pads", slug: "notepads-and-legal-pads" },
          { id: "office-and-school-supplies-paper-products-index-cards", name: "Index Cards", slug: "index-cards" }
        ],
      },
      {
        id: "office-and-school-supplies-office-electronics",
        name: "Office Electronics",
        slug: "office-electronics",
        children: [
          { id: "office-and-school-supplies-office-electronics-calculators", name: "Calculators", slug: "calculators" },
          { id: "office-and-school-supplies-office-electronics-label-makers", name: "Label Makers", slug: "label-makers" },
          { id: "office-and-school-supplies-office-electronics-paper-shredders", name: "Paper Shredders", slug: "paper-shredders" },
          { id: "office-and-school-supplies-office-electronics-laminators", name: "Laminators", slug: "laminators" },
          { id: "office-and-school-supplies-office-electronics-postage-scales", name: "Postage Scales", slug: "postage-scales" },
          { id: "office-and-school-supplies-office-electronics-time-clocks", name: "Time Clocks", slug: "time-clocks" }
        ],
      },
      {
        id: "office-and-school-supplies-school-supplies",
        name: "School Supplies",
        slug: "school-supplies",
        children: [
          { id: "office-and-school-supplies-school-supplies-backpacks", name: "Backpacks", slug: "backpacks" },
          { id: "office-and-school-supplies-school-supplies-lunch-boxes", name: "Lunch Boxes", slug: "lunch-boxes" },
          { id: "office-and-school-supplies-school-supplies-binders", name: "Binders", slug: "binders" },
          { id: "office-and-school-supplies-school-supplies-art-supplies-for-school", name: "Art Supplies for School", slug: "art-supplies-for-school" },
          { id: "office-and-school-supplies-school-supplies-pencil-cases", name: "Pencil Cases", slug: "pencil-cases" },
          { id: "office-and-school-supplies-school-supplies-rulers-and-protractors", name: "Rulers & Protractors", slug: "rulers-and-protractors" }
        ],
      },
      {
        id: "office-and-school-supplies-organization",
        name: "Organization",
        slug: "organization",
        children: [
          { id: "office-and-school-supplies-organization-desk-organizers", name: "Desk Organizers", slug: "desk-organizers" },
          { id: "office-and-school-supplies-organization-file-folders", name: "File Folders", slug: "file-folders" },
          { id: "office-and-school-supplies-organization-storage-boxes", name: "Storage Boxes", slug: "storage-boxes" },
          { id: "office-and-school-supplies-organization-bulletin-boards", name: "Bulletin Boards", slug: "bulletin-boards" },
          { id: "office-and-school-supplies-organization-whiteboards", name: "Whiteboards", slug: "whiteboards" },
          { id: "office-and-school-supplies-organization-planners-and-calendars", name: "Planners & Calendars", slug: "planners-and-calendars" }
        ],
      }
    ],
  },
  {
    id: "arts-crafts-and-sewing",
    name: "Arts, Crafts & Sewing",
    slug: "arts-crafts-and-sewing",
    icon: Palette,
    image: "https://picsum.photos/seed/arts-crafts-and-sewing/800/500",
    description: "Supplies for painting, sewing, and every creative project.",
    featured: false,
    children: [
      {
        id: "arts-crafts-and-sewing-painting-and-drawing",
        name: "Painting & Drawing",
        slug: "painting-and-drawing",
        children: [
          { id: "arts-crafts-and-sewing-painting-and-drawing-paints", name: "Paints", slug: "paints" },
          { id: "arts-crafts-and-sewing-painting-and-drawing-paint-brushes", name: "Paint Brushes", slug: "paint-brushes" },
          { id: "arts-crafts-and-sewing-painting-and-drawing-canvases", name: "Canvases", slug: "canvases" },
          { id: "arts-crafts-and-sewing-painting-and-drawing-drawing-pads", name: "Drawing Pads", slug: "drawing-pads" },
          { id: "arts-crafts-and-sewing-painting-and-drawing-colored-pencils", name: "Colored Pencils", slug: "colored-pencils" },
          { id: "arts-crafts-and-sewing-painting-and-drawing-markers", name: "Markers", slug: "markers" },
          { id: "arts-crafts-and-sewing-painting-and-drawing-easels", name: "Easels", slug: "easels" },
          { id: "arts-crafts-and-sewing-painting-and-drawing-palette-knives", name: "Palette Knives", slug: "palette-knives" }
        ],
      },
      {
        id: "arts-crafts-and-sewing-sewing",
        name: "Sewing",
        slug: "sewing",
        children: [
          { id: "arts-crafts-and-sewing-sewing-sewing-machines", name: "Sewing Machines", slug: "sewing-machines" },
          { id: "arts-crafts-and-sewing-sewing-fabric", name: "Fabric", slug: "fabric" },
          { id: "arts-crafts-and-sewing-sewing-thread", name: "Thread", slug: "thread" },
          { id: "arts-crafts-and-sewing-sewing-sewing-patterns", name: "Sewing Patterns", slug: "sewing-patterns" },
          { id: "arts-crafts-and-sewing-sewing-sewing-notions", name: "Sewing Notions", slug: "sewing-notions" },
          { id: "arts-crafts-and-sewing-sewing-sewing-machine-accessories", name: "Sewing Machine Accessories", slug: "sewing-machine-accessories" },
          { id: "arts-crafts-and-sewing-sewing-pins-and-needles", name: "Pins & Needles", slug: "pins-and-needles" },
          { id: "arts-crafts-and-sewing-sewing-fabric-scissors", name: "Fabric Scissors", slug: "fabric-scissors" }
        ],
      },
      {
        id: "arts-crafts-and-sewing-knitting-and-crochet",
        name: "Knitting & Crochet",
        slug: "knitting-and-crochet",
        children: [
          { id: "arts-crafts-and-sewing-knitting-and-crochet-yarn", name: "Yarn", slug: "yarn" },
          { id: "arts-crafts-and-sewing-knitting-and-crochet-knitting-needles", name: "Knitting Needles", slug: "knitting-needles" },
          { id: "arts-crafts-and-sewing-knitting-and-crochet-crochet-hooks", name: "Crochet Hooks", slug: "crochet-hooks" },
          { id: "arts-crafts-and-sewing-knitting-and-crochet-knitting-patterns", name: "Knitting Patterns", slug: "knitting-patterns" },
          { id: "arts-crafts-and-sewing-knitting-and-crochet-stitch-markers", name: "Stitch Markers", slug: "stitch-markers" },
          { id: "arts-crafts-and-sewing-knitting-and-crochet-yarn-bowls", name: "Yarn Bowls", slug: "yarn-bowls" }
        ],
      },
      {
        id: "arts-crafts-and-sewing-scrapbooking",
        name: "Scrapbooking",
        slug: "scrapbooking",
        children: [
          { id: "arts-crafts-and-sewing-scrapbooking-scrapbook-paper", name: "Scrapbook Paper", slug: "scrapbook-paper" },
          { id: "arts-crafts-and-sewing-scrapbooking-stickers", name: "Stickers", slug: "stickers" },
          { id: "arts-crafts-and-sewing-scrapbooking-photo-albums", name: "Photo Albums", slug: "photo-albums" },
          { id: "arts-crafts-and-sewing-scrapbooking-rubber-stamps", name: "Rubber Stamps", slug: "rubber-stamps" },
          { id: "arts-crafts-and-sewing-scrapbooking-die-cutting-machines", name: "Die Cutting Machines", slug: "die-cutting-machines" },
          { id: "arts-crafts-and-sewing-scrapbooking-adhesives-and-glue", name: "Adhesives & Glue", slug: "adhesives-and-glue" }
        ],
      },
      {
        id: "arts-crafts-and-sewing-beading-and-jewelry-making",
        name: "Beading & Jewelry Making",
        slug: "beading-and-jewelry-making",
        children: [
          { id: "arts-crafts-and-sewing-beading-and-jewelry-making-beads", name: "Beads", slug: "beads" },
          { id: "arts-crafts-and-sewing-beading-and-jewelry-making-jewelry-wire", name: "Jewelry Wire", slug: "jewelry-wire" },
          { id: "arts-crafts-and-sewing-beading-and-jewelry-making-jewelry-findings", name: "Jewelry Findings", slug: "jewelry-findings" },
          { id: "arts-crafts-and-sewing-beading-and-jewelry-making-jewelry-tools", name: "Jewelry Tools", slug: "jewelry-tools" },
          { id: "arts-crafts-and-sewing-beading-and-jewelry-making-charms-and-pendants", name: "Charms & Pendants", slug: "charms-and-pendants" },
          { id: "arts-crafts-and-sewing-beading-and-jewelry-making-beading-thread", name: "Beading Thread", slug: "beading-thread" }
        ],
      },
      {
        id: "arts-crafts-and-sewing-party-supplies",
        name: "Party Supplies",
        slug: "party-supplies",
        children: [
          { id: "arts-crafts-and-sewing-party-supplies-balloons", name: "Balloons", slug: "balloons" },
          { id: "arts-crafts-and-sewing-party-supplies-party-decorations", name: "Party Decorations", slug: "party-decorations" },
          { id: "arts-crafts-and-sewing-party-supplies-gift-wrap", name: "Gift Wrap", slug: "gift-wrap" },
          { id: "arts-crafts-and-sewing-party-supplies-greeting-cards", name: "Greeting Cards", slug: "greeting-cards" },
          { id: "arts-crafts-and-sewing-party-supplies-party-favors", name: "Party Favors", slug: "party-favors" },
          { id: "arts-crafts-and-sewing-party-supplies-tablecloths-and-banners", name: "Tablecloths & Banners", slug: "tablecloths-and-banners" }
        ],
      }
    ],
  },
  {
    id: "collectibles-and-fine-art",
    name: "Collectibles & Fine Art",
    slug: "collectibles-and-fine-art",
    icon: Gem,
    image: "https://picsum.photos/seed/collectibles-and-fine-art/800/500",
    description: "Rare finds, fine art, and collectibles for enthusiasts.",
    featured: false,
    children: [
      {
        id: "collectibles-and-fine-art-coins-and-currency",
        name: "Coins & Currency",
        slug: "coins-and-currency",
        children: [
          { id: "collectibles-and-fine-art-coins-and-currency-us-coins", name: "US Coins", slug: "us-coins" },
          { id: "collectibles-and-fine-art-coins-and-currency-world-coins", name: "World Coins", slug: "world-coins" },
          { id: "collectibles-and-fine-art-coins-and-currency-paper-money", name: "Paper Money", slug: "paper-money" },
          { id: "collectibles-and-fine-art-coins-and-currency-bullion-and-precious-metals", name: "Bullion & Precious Metals", slug: "bullion-and-precious-metals" },
          { id: "collectibles-and-fine-art-coins-and-currency-coin-collecting-supplies", name: "Coin Collecting Supplies", slug: "coin-collecting-supplies" },
          { id: "collectibles-and-fine-art-coins-and-currency-coin-albums", name: "Coin Albums", slug: "coin-albums" }
        ],
      },
      {
        id: "collectibles-and-fine-art-sports-memorabilia",
        name: "Sports Memorabilia",
        slug: "sports-memorabilia",
        children: [
          { id: "collectibles-and-fine-art-sports-memorabilia-autographed-items", name: "Autographed Items", slug: "autographed-items" },
          { id: "collectibles-and-fine-art-sports-memorabilia-trading-cards", name: "Trading Cards", slug: "trading-cards" },
          { id: "collectibles-and-fine-art-sports-memorabilia-game-used-gear", name: "Game-Used Gear", slug: "game-used-gear" },
          { id: "collectibles-and-fine-art-sports-memorabilia-sports-photos", name: "Sports Photos", slug: "sports-photos" },
          { id: "collectibles-and-fine-art-sports-memorabilia-bobbleheads", name: "Bobbleheads", slug: "bobbleheads" }
        ],
      },
      {
        id: "collectibles-and-fine-art-fine-art",
        name: "Fine Art",
        slug: "fine-art",
        children: [
          { id: "collectibles-and-fine-art-fine-art-paintings", name: "Paintings", slug: "paintings" },
          { id: "collectibles-and-fine-art-fine-art-sculptures", name: "Sculptures", slug: "sculptures" },
          { id: "collectibles-and-fine-art-fine-art-art-prints", name: "Art Prints", slug: "art-prints" },
          { id: "collectibles-and-fine-art-fine-art-photography-art", name: "Photography Art", slug: "photography-art" },
          { id: "collectibles-and-fine-art-fine-art-original-drawings", name: "Original Drawings", slug: "original-drawings" },
          { id: "collectibles-and-fine-art-fine-art-mixed-media-art", name: "Mixed Media Art", slug: "mixed-media-art" }
        ],
      },
      {
        id: "collectibles-and-fine-art-antiques",
        name: "Antiques",
        slug: "antiques",
        children: [
          { id: "collectibles-and-fine-art-antiques-antique-furniture", name: "Antique Furniture", slug: "antique-furniture" },
          { id: "collectibles-and-fine-art-antiques-vintage-home-decor", name: "Vintage Home Decor", slug: "vintage-home-decor" },
          { id: "collectibles-and-fine-art-antiques-antique-tools", name: "Antique Tools", slug: "antique-tools" },
          { id: "collectibles-and-fine-art-antiques-vintage-ceramics", name: "Vintage Ceramics", slug: "vintage-ceramics" },
          { id: "collectibles-and-fine-art-antiques-antique-clocks", name: "Antique Clocks", slug: "antique-clocks" }
        ],
      },
      {
        id: "collectibles-and-fine-art-stamps",
        name: "Stamps",
        slug: "stamps",
        children: [
          { id: "collectibles-and-fine-art-stamps-us-stamps", name: "US Stamps", slug: "us-stamps" },
          { id: "collectibles-and-fine-art-stamps-world-stamps", name: "World Stamps", slug: "world-stamps" },
          { id: "collectibles-and-fine-art-stamps-stamp-collections", name: "Stamp Collections", slug: "stamp-collections" },
          { id: "collectibles-and-fine-art-stamps-stamp-collecting-supplies", name: "Stamp Collecting Supplies", slug: "stamp-collecting-supplies" },
          { id: "collectibles-and-fine-art-stamps-first-day-covers", name: "First Day Covers", slug: "first-day-covers" }
        ],
      },
      {
        id: "collectibles-and-fine-art-entertainment-memorabilia",
        name: "Entertainment Memorabilia",
        slug: "entertainment-memorabilia",
        children: [
          { id: "collectibles-and-fine-art-entertainment-memorabilia-movie-memorabilia", name: "Movie Memorabilia", slug: "movie-memorabilia" },
          { id: "collectibles-and-fine-art-entertainment-memorabilia-music-memorabilia", name: "Music Memorabilia", slug: "music-memorabilia" },
          { id: "collectibles-and-fine-art-entertainment-memorabilia-autographs", name: "Autographs", slug: "autographs" },
          { id: "collectibles-and-fine-art-entertainment-memorabilia-vintage-posters", name: "Vintage Posters", slug: "vintage-posters" },
          { id: "collectibles-and-fine-art-entertainment-memorabilia-concert-tickets-and-programs", name: "Concert Tickets & Programs", slug: "concert-tickets-and-programs" }
        ],
      }
    ],
  },
  {
    id: "garden-and-outdoor-living",
    name: "Garden & Outdoor Living",
    slug: "garden-and-outdoor-living",
    icon: Trees,
    image: "https://picsum.photos/seed/garden-and-outdoor-living/800/500",
    description: "Everything to grow, garden, and gather outdoors.",
    featured: true,
    children: [
      {
        id: "garden-and-outdoor-living-gardening",
        name: "Gardening",
        slug: "gardening",
        children: [
          { id: "garden-and-outdoor-living-gardening-plants-and-seeds", name: "Plants & Seeds", slug: "plants-and-seeds" },
          { id: "garden-and-outdoor-living-gardening-planters-and-pots", name: "Planters & Pots", slug: "planters-and-pots" },
          { id: "garden-and-outdoor-living-gardening-garden-tools", name: "Garden Tools", slug: "garden-tools" },
          { id: "garden-and-outdoor-living-gardening-soil-and-fertilizer", name: "Soil & Fertilizer", slug: "soil-and-fertilizer" },
          { id: "garden-and-outdoor-living-gardening-watering-equipment", name: "Watering Equipment", slug: "watering-equipment" },
          { id: "garden-and-outdoor-living-gardening-garden-gloves", name: "Garden Gloves", slug: "garden-gloves" },
          { id: "garden-and-outdoor-living-gardening-greenhouses", name: "Greenhouses", slug: "greenhouses" },
          { id: "garden-and-outdoor-living-gardening-trellises", name: "Trellises", slug: "trellises" }
        ],
      },
      {
        id: "garden-and-outdoor-living-lawn-care",
        name: "Lawn Care",
        slug: "lawn-care",
        children: [
          { id: "garden-and-outdoor-living-lawn-care-lawn-mowers", name: "Lawn Mowers", slug: "lawn-mowers" },
          { id: "garden-and-outdoor-living-lawn-care-trimmers-and-edgers", name: "Trimmers & Edgers", slug: "trimmers-and-edgers" },
          { id: "garden-and-outdoor-living-lawn-care-leaf-blowers", name: "Leaf Blowers", slug: "leaf-blowers" },
          { id: "garden-and-outdoor-living-lawn-care-lawn-sprinklers", name: "Lawn Sprinklers", slug: "lawn-sprinklers" },
          { id: "garden-and-outdoor-living-lawn-care-lawn-spreaders", name: "Lawn Spreaders", slug: "lawn-spreaders" },
          { id: "garden-and-outdoor-living-lawn-care-lawn-aerators", name: "Lawn Aerators", slug: "lawn-aerators" }
        ],
      },
      {
        id: "garden-and-outdoor-living-outdoor-cooking",
        name: "Outdoor Cooking",
        slug: "outdoor-cooking",
        children: [
          { id: "garden-and-outdoor-living-outdoor-cooking-grills", name: "Grills", slug: "grills" },
          { id: "garden-and-outdoor-living-outdoor-cooking-smokers", name: "Smokers", slug: "smokers" },
          { id: "garden-and-outdoor-living-outdoor-cooking-grill-accessories", name: "Grill Accessories", slug: "grill-accessories" },
          { id: "garden-and-outdoor-living-outdoor-cooking-outdoor-pizza-ovens", name: "Outdoor Pizza Ovens", slug: "outdoor-pizza-ovens" },
          { id: "garden-and-outdoor-living-outdoor-cooking-grill-covers", name: "Grill Covers", slug: "grill-covers" },
          { id: "garden-and-outdoor-living-outdoor-cooking-charcoal-and-wood-pellets", name: "Charcoal & Wood Pellets", slug: "charcoal-and-wood-pellets" }
        ],
      },
      {
        id: "garden-and-outdoor-living-outdoor-decor",
        name: "Outdoor Decor",
        slug: "outdoor-decor",
        children: [
          { id: "garden-and-outdoor-living-outdoor-decor-garden-statues", name: "Garden Statues", slug: "garden-statues" },
          { id: "garden-and-outdoor-living-outdoor-decor-outdoor-lighting", name: "Outdoor Lighting", slug: "outdoor-lighting" },
          { id: "garden-and-outdoor-living-outdoor-decor-wind-chimes", name: "Wind Chimes", slug: "wind-chimes" },
          { id: "garden-and-outdoor-living-outdoor-decor-flags-and-banners", name: "Flags & Banners", slug: "flags-and-banners" },
          { id: "garden-and-outdoor-living-outdoor-decor-bird-baths", name: "Bird Baths", slug: "bird-baths" },
          { id: "garden-and-outdoor-living-outdoor-decor-garden-flags", name: "Garden Flags", slug: "garden-flags" }
        ],
      },
      {
        id: "garden-and-outdoor-living-pools-and-spas",
        name: "Pools & Spas",
        slug: "pools-and-spas",
        children: [
          { id: "garden-and-outdoor-living-pools-and-spas-above-ground-pools", name: "Above-Ground Pools", slug: "above-ground-pools" },
          { id: "garden-and-outdoor-living-pools-and-spas-pool-accessories", name: "Pool Accessories", slug: "pool-accessories" },
          { id: "garden-and-outdoor-living-pools-and-spas-hot-tubs", name: "Hot Tubs", slug: "hot-tubs" },
          { id: "garden-and-outdoor-living-pools-and-spas-pool-cleaning-supplies", name: "Pool Cleaning Supplies", slug: "pool-cleaning-supplies" },
          { id: "garden-and-outdoor-living-pools-and-spas-pool-toys", name: "Pool Toys", slug: "pool-toys" },
          { id: "garden-and-outdoor-living-pools-and-spas-pool-covers", name: "Pool Covers", slug: "pool-covers" }
        ],
      },
      {
        id: "garden-and-outdoor-living-patio-and-shade",
        name: "Patio & Shade",
        slug: "patio-and-shade",
        children: [
          { id: "garden-and-outdoor-living-patio-and-shade-patio-umbrellas", name: "Patio Umbrellas", slug: "patio-umbrellas" },
          { id: "garden-and-outdoor-living-patio-and-shade-gazebos", name: "Gazebos", slug: "gazebos" },
          { id: "garden-and-outdoor-living-patio-and-shade-awnings", name: "Awnings", slug: "awnings" },
          { id: "garden-and-outdoor-living-patio-and-shade-outdoor-curtains", name: "Outdoor Curtains", slug: "outdoor-curtains" },
          { id: "garden-and-outdoor-living-patio-and-shade-shade-sails", name: "Shade Sails", slug: "shade-sails" },
          { id: "garden-and-outdoor-living-patio-and-shade-pergolas", name: "Pergolas", slug: "pergolas" }
        ],
      }
    ],
  },
  {
    id: "grocery-and-gourmet-food",
    name: "Grocery & Gourmet Food",
    slug: "grocery-and-gourmet-food",
    icon: ShoppingBasket,
    image: "https://picsum.photos/seed/grocery-and-gourmet-food/800/500",
    description: "Pantry staples, snacks, and gourmet foods delivered fresh.",
    featured: false,
    children: [
      {
        id: "grocery-and-gourmet-food-pantry-staples",
        name: "Pantry Staples",
        slug: "pantry-staples",
        children: [
          { id: "grocery-and-gourmet-food-pantry-staples-pasta-and-rice", name: "Pasta & Rice", slug: "pasta-and-rice" },
          { id: "grocery-and-gourmet-food-pantry-staples-canned-goods", name: "Canned Goods", slug: "canned-goods" },
          { id: "grocery-and-gourmet-food-pantry-staples-cooking-oils", name: "Cooking Oils", slug: "cooking-oils" },
          { id: "grocery-and-gourmet-food-pantry-staples-baking-supplies", name: "Baking Supplies", slug: "baking-supplies" },
          { id: "grocery-and-gourmet-food-pantry-staples-spices-and-seasonings", name: "Spices & Seasonings", slug: "spices-and-seasonings" },
          { id: "grocery-and-gourmet-food-pantry-staples-condiments-and-sauces", name: "Condiments & Sauces", slug: "condiments-and-sauces" },
          { id: "grocery-and-gourmet-food-pantry-staples-broths-and-stocks", name: "Broths & Stocks", slug: "broths-and-stocks" }
        ],
      },
      {
        id: "grocery-and-gourmet-food-snacks",
        name: "Snacks",
        slug: "snacks",
        children: [
          { id: "grocery-and-gourmet-food-snacks-chips-and-pretzels", name: "Chips & Pretzels", slug: "chips-and-pretzels" },
          { id: "grocery-and-gourmet-food-snacks-nuts-and-dried-fruit", name: "Nuts & Dried Fruit", slug: "nuts-and-dried-fruit" },
          { id: "grocery-and-gourmet-food-snacks-cookies-and-crackers", name: "Cookies & Crackers", slug: "cookies-and-crackers" },
          { id: "grocery-and-gourmet-food-snacks-candy-and-chocolate", name: "Candy & Chocolate", slug: "candy-and-chocolate" },
          { id: "grocery-and-gourmet-food-snacks-granola-and-snack-bars", name: "Granola & Snack Bars", slug: "granola-and-snack-bars" },
          { id: "grocery-and-gourmet-food-snacks-popcorn", name: "Popcorn", slug: "popcorn" },
          { id: "grocery-and-gourmet-food-snacks-jerky", name: "Jerky", slug: "jerky" }
        ],
      },
      {
        id: "grocery-and-gourmet-food-beverages",
        name: "Beverages",
        slug: "beverages",
        children: [
          { id: "grocery-and-gourmet-food-beverages-coffee", name: "Coffee", slug: "coffee" },
          { id: "grocery-and-gourmet-food-beverages-tea", name: "Tea", slug: "tea" },
          { id: "grocery-and-gourmet-food-beverages-juice", name: "Juice", slug: "juice" },
          { id: "grocery-and-gourmet-food-beverages-sparkling-water", name: "Sparkling Water", slug: "sparkling-water" },
          { id: "grocery-and-gourmet-food-beverages-sports-drinks", name: "Sports Drinks", slug: "sports-drinks" },
          { id: "grocery-and-gourmet-food-beverages-bottled-water", name: "Bottled Water", slug: "bottled-water" },
          { id: "grocery-and-gourmet-food-beverages-energy-drinks", name: "Energy Drinks", slug: "energy-drinks" }
        ],
      },
      {
        id: "grocery-and-gourmet-food-breakfast-foods",
        name: "Breakfast Foods",
        slug: "breakfast-foods",
        children: [
          { id: "grocery-and-gourmet-food-breakfast-foods-cereal", name: "Cereal", slug: "cereal" },
          { id: "grocery-and-gourmet-food-breakfast-foods-oatmeal", name: "Oatmeal", slug: "oatmeal" },
          { id: "grocery-and-gourmet-food-breakfast-foods-pancake-mix", name: "Pancake Mix", slug: "pancake-mix" },
          { id: "grocery-and-gourmet-food-breakfast-foods-breakfast-bars", name: "Breakfast Bars", slug: "breakfast-bars" },
          { id: "grocery-and-gourmet-food-breakfast-foods-syrups-and-toppings", name: "Syrups & Toppings", slug: "syrups-and-toppings" },
          { id: "grocery-and-gourmet-food-breakfast-foods-breakfast-drinks", name: "Breakfast Drinks", slug: "breakfast-drinks" }
        ],
      },
      {
        id: "grocery-and-gourmet-food-specialty-diets",
        name: "Specialty Diets",
        slug: "specialty-diets",
        children: [
          { id: "grocery-and-gourmet-food-specialty-diets-gluten-free-foods", name: "Gluten-Free Foods", slug: "gluten-free-foods" },
          { id: "grocery-and-gourmet-food-specialty-diets-organic-foods", name: "Organic Foods", slug: "organic-foods" },
          { id: "grocery-and-gourmet-food-specialty-diets-keto-friendly-foods", name: "Keto-Friendly Foods", slug: "keto-friendly-foods" },
          { id: "grocery-and-gourmet-food-specialty-diets-vegan-foods", name: "Vegan Foods", slug: "vegan-foods" },
          { id: "grocery-and-gourmet-food-specialty-diets-low-sugar-foods", name: "Low-Sugar Foods", slug: "low-sugar-foods" },
          { id: "grocery-and-gourmet-food-specialty-diets-non-gmo-foods", name: "Non-GMO Foods", slug: "non-gmo-foods" }
        ],
      },
      {
        id: "grocery-and-gourmet-food-gourmet-and-gifts",
        name: "Gourmet & Gifts",
        slug: "gourmet-and-gifts",
        children: [
          { id: "grocery-and-gourmet-food-gourmet-and-gifts-gift-baskets", name: "Gift Baskets", slug: "gift-baskets" },
          { id: "grocery-and-gourmet-food-gourmet-and-gifts-chocolate-and-sweets", name: "Chocolate & Sweets", slug: "chocolate-and-sweets" },
          { id: "grocery-and-gourmet-food-gourmet-and-gifts-specialty-cheeses", name: "Specialty Cheeses", slug: "specialty-cheeses" },
          { id: "grocery-and-gourmet-food-gourmet-and-gifts-gourmet-sauces", name: "Gourmet Sauces", slug: "gourmet-sauces" },
          { id: "grocery-and-gourmet-food-gourmet-and-gifts-olive-oil-and-vinegar", name: "Olive Oil & Vinegar", slug: "olive-oil-and-vinegar" }
        ],
      }
    ],
  },
  {
    id: "luggage-and-travel-gear",
    name: "Luggage & Travel Gear",
    slug: "luggage-and-travel-gear",
    icon: Luggage,
    image: "https://picsum.photos/seed/luggage-and-travel-gear/800/500",
    description: "Luggage, bags, and accessories for every trip.",
    featured: false,
    children: [
      {
        id: "luggage-and-travel-gear-luggage",
        name: "Luggage",
        slug: "luggage",
        children: [
          { id: "luggage-and-travel-gear-luggage-checked-luggage", name: "Checked Luggage", slug: "checked-luggage" },
          { id: "luggage-and-travel-gear-luggage-carry-on-luggage", name: "Carry-On Luggage", slug: "carry-on-luggage" },
          { id: "luggage-and-travel-gear-luggage-luggage-sets", name: "Luggage Sets", slug: "luggage-sets" },
          { id: "luggage-and-travel-gear-luggage-garment-bags", name: "Garment Bags", slug: "garment-bags" },
          { id: "luggage-and-travel-gear-luggage-hardside-luggage", name: "Hardside Luggage", slug: "hardside-luggage" },
          { id: "luggage-and-travel-gear-luggage-softside-luggage", name: "Softside Luggage", slug: "softside-luggage" }
        ],
      },
      {
        id: "luggage-and-travel-gear-backpacks-and-bags",
        name: "Backpacks & Bags",
        slug: "backpacks-and-bags",
        children: [
          { id: "luggage-and-travel-gear-backpacks-and-bags-travel-backpacks", name: "Travel Backpacks", slug: "travel-backpacks" },
          { id: "luggage-and-travel-gear-backpacks-and-bags-duffel-bags", name: "Duffel Bags", slug: "duffel-bags" },
          { id: "luggage-and-travel-gear-backpacks-and-bags-laptop-bags", name: "Laptop Bags", slug: "laptop-bags" },
          { id: "luggage-and-travel-gear-backpacks-and-bags-toiletry-bags", name: "Toiletry Bags", slug: "toiletry-bags" },
          { id: "luggage-and-travel-gear-backpacks-and-bags-fanny-packs", name: "Fanny Packs", slug: "fanny-packs" },
          { id: "luggage-and-travel-gear-backpacks-and-bags-weekender-bags", name: "Weekender Bags", slug: "weekender-bags" }
        ],
      },
      {
        id: "luggage-and-travel-gear-travel-accessories",
        name: "Travel Accessories",
        slug: "travel-accessories",
        children: [
          { id: "luggage-and-travel-gear-travel-accessories-packing-cubes", name: "Packing Cubes", slug: "packing-cubes" },
          { id: "luggage-and-travel-gear-travel-accessories-luggage-tags", name: "Luggage Tags", slug: "luggage-tags" },
          { id: "luggage-and-travel-gear-travel-accessories-travel-pillows", name: "Travel Pillows", slug: "travel-pillows" },
          { id: "luggage-and-travel-gear-travel-accessories-tsa-locks", name: "TSA Locks", slug: "tsa-locks" },
          { id: "luggage-and-travel-gear-travel-accessories-luggage-scales", name: "Luggage Scales", slug: "luggage-scales" },
          { id: "luggage-and-travel-gear-travel-accessories-travel-bottles", name: "Travel Bottles", slug: "travel-bottles" }
        ],
      },
      {
        id: "luggage-and-travel-gear-outdoor-travel-gear",
        name: "Outdoor Travel Gear",
        slug: "outdoor-travel-gear",
        children: [
          { id: "luggage-and-travel-gear-outdoor-travel-gear-travel-adapters", name: "Travel Adapters", slug: "travel-adapters" },
          { id: "luggage-and-travel-gear-outdoor-travel-gear-portable-chargers", name: "Portable Chargers", slug: "portable-chargers" },
          { id: "luggage-and-travel-gear-outdoor-travel-gear-travel-first-aid-kits", name: "Travel First Aid Kits", slug: "travel-first-aid-kits" },
          { id: "luggage-and-travel-gear-outdoor-travel-gear-travel-umbrellas", name: "Travel Umbrellas", slug: "travel-umbrellas" },
          { id: "luggage-and-travel-gear-outdoor-travel-gear-travel-blankets", name: "Travel Blankets", slug: "travel-blankets" }
        ],
      }
    ],
  },
  {
    id: "industrial-and-scientific",
    name: "Industrial & Scientific",
    slug: "industrial-and-scientific",
    icon: FlaskConical,
    image: "https://picsum.photos/seed/industrial-and-scientific/800/500",
    description: "Equipment and supplies for lab, industrial, and business use.",
    featured: false,
    children: [
      {
        id: "industrial-and-scientific-lab-equipment",
        name: "Lab Equipment",
        slug: "lab-equipment",
        children: [
          { id: "industrial-and-scientific-lab-equipment-microscopes", name: "Microscopes", slug: "microscopes" },
          { id: "industrial-and-scientific-lab-equipment-lab-glassware", name: "Lab Glassware", slug: "lab-glassware" },
          { id: "industrial-and-scientific-lab-equipment-scales-and-balances", name: "Scales & Balances", slug: "scales-and-balances" },
          { id: "industrial-and-scientific-lab-equipment-test-tubes", name: "Test Tubes", slug: "test-tubes" },
          { id: "industrial-and-scientific-lab-equipment-lab-safety-equipment", name: "Lab Safety Equipment", slug: "lab-safety-equipment" },
          { id: "industrial-and-scientific-lab-equipment-centrifuges", name: "Centrifuges", slug: "centrifuges" },
          { id: "industrial-and-scientific-lab-equipment-lab-timers", name: "Lab Timers", slug: "lab-timers" }
        ],
      },
      {
        id: "industrial-and-scientific-industrial-equipment",
        name: "Industrial Equipment",
        slug: "industrial-equipment",
        children: [
          { id: "industrial-and-scientific-industrial-equipment-material-handling-equipment", name: "Material Handling Equipment", slug: "material-handling-equipment" },
          { id: "industrial-and-scientific-industrial-equipment-hydraulic-components", name: "Hydraulic Components", slug: "hydraulic-components" },
          { id: "industrial-and-scientific-industrial-equipment-pneumatic-components", name: "Pneumatic Components", slug: "pneumatic-components" },
          { id: "industrial-and-scientific-industrial-equipment-industrial-storage", name: "Industrial Storage", slug: "industrial-storage" },
          { id: "industrial-and-scientific-industrial-equipment-conveyor-parts", name: "Conveyor Parts", slug: "conveyor-parts" },
          { id: "industrial-and-scientific-industrial-equipment-industrial-motors", name: "Industrial Motors", slug: "industrial-motors" }
        ],
      },
      {
        id: "industrial-and-scientific-safety-and-facility-supplies",
        name: "Safety & Facility Supplies",
        slug: "safety-and-facility-supplies",
        children: [
          { id: "industrial-and-scientific-safety-and-facility-supplies-safety-signage", name: "Safety Signage", slug: "safety-signage" },
          { id: "industrial-and-scientific-safety-and-facility-supplies-janitorial-supplies", name: "Janitorial Supplies", slug: "janitorial-supplies" },
          { id: "industrial-and-scientific-safety-and-facility-supplies-personal-protective-equipment", name: "Personal Protective Equipment", slug: "personal-protective-equipment" },
          { id: "industrial-and-scientific-safety-and-facility-supplies-spill-containment", name: "Spill Containment", slug: "spill-containment" },
          { id: "industrial-and-scientific-safety-and-facility-supplies-fire-safety-equipment", name: "Fire Safety Equipment", slug: "fire-safety-equipment" }
        ],
      },
      {
        id: "industrial-and-scientific-fasteners-and-hardware",
        name: "Fasteners & Hardware",
        slug: "fasteners-and-hardware",
        children: [
          { id: "industrial-and-scientific-fasteners-and-hardware-industrial-fasteners", name: "Industrial Fasteners", slug: "industrial-fasteners" },
          { id: "industrial-and-scientific-fasteners-and-hardware-adhesives-and-sealants", name: "Adhesives & Sealants", slug: "adhesives-and-sealants" },
          { id: "industrial-and-scientific-fasteners-and-hardware-abrasives", name: "Abrasives", slug: "abrasives" },
          { id: "industrial-and-scientific-fasteners-and-hardware-industrial-bearings", name: "Industrial Bearings", slug: "industrial-bearings" },
          { id: "industrial-and-scientific-fasteners-and-hardware-industrial-chains", name: "Industrial Chains", slug: "industrial-chains" }
        ],
      },
      {
        id: "industrial-and-scientific-packaging-and-shipping",
        name: "Packaging & Shipping",
        slug: "packaging-and-shipping",
        children: [
          { id: "industrial-and-scientific-packaging-and-shipping-shipping-boxes-and-mailers", name: "Shipping Boxes & Mailers", slug: "shipping-boxes-and-mailers" },
          { id: "industrial-and-scientific-packaging-and-shipping-packing-tape", name: "Packing Tape", slug: "packing-tape" },
          { id: "industrial-and-scientific-packaging-and-shipping-shipping-labels", name: "Shipping Labels", slug: "shipping-labels" },
          { id: "industrial-and-scientific-packaging-and-shipping-pallet-wrap", name: "Pallet Wrap", slug: "pallet-wrap" },
          { id: "industrial-and-scientific-packaging-and-shipping-bubble-wrap-and-cushioning", name: "Bubble Wrap & Cushioning", slug: "bubble-wrap-and-cushioning" },
          { id: "industrial-and-scientific-packaging-and-shipping-packing-peanuts", name: "Packing Peanuts", slug: "packing-peanuts" }
        ],
      }
    ],
  },
  {
    id: "baby-and-wedding-registry-essentials",
    name: "Baby & Wedding Registry Essentials",
    slug: "baby-and-wedding-registry-essentials",
    icon: Gift,
    image: "https://picsum.photos/seed/baby-and-wedding-registry-essentials/800/500",
    description: "Curated gear and gifts for new parents and newlyweds.",
    featured: false,
    children: [
      {
        id: "baby-and-wedding-registry-essentials-registry-building-blocks",
        name: "Registry Building Blocks",
        slug: "registry-building-blocks",
        children: [
          { id: "baby-and-wedding-registry-essentials-registry-building-blocks-baby-registry-starter-kits", name: "Baby Registry Starter Kits", slug: "baby-registry-starter-kits" },
          { id: "baby-and-wedding-registry-essentials-registry-building-blocks-wedding-registry-starter-kits", name: "Wedding Registry Starter Kits", slug: "wedding-registry-starter-kits" },
          { id: "baby-and-wedding-registry-essentials-registry-building-blocks-gift-cards", name: "Gift Cards", slug: "gift-cards" },
          { id: "baby-and-wedding-registry-essentials-registry-building-blocks-universal-registry-items", name: "Universal Registry Items", slug: "universal-registry-items" }
        ],
      },
      {
        id: "baby-and-wedding-registry-essentials-new-parent-essentials",
        name: "New Parent Essentials",
        slug: "new-parent-essentials",
        children: [
          { id: "baby-and-wedding-registry-essentials-new-parent-essentials-baby-care-kits", name: "Baby Care Kits", slug: "baby-care-kits" },
          { id: "baby-and-wedding-registry-essentials-new-parent-essentials-postpartum-recovery-kits", name: "Postpartum Recovery Kits", slug: "postpartum-recovery-kits" },
          { id: "baby-and-wedding-registry-essentials-new-parent-essentials-parenting-books", name: "Parenting Books", slug: "parenting-books" },
          { id: "baby-and-wedding-registry-essentials-new-parent-essentials-baby-sleep-aids", name: "Baby Sleep Aids", slug: "baby-sleep-aids" }
        ],
      },
      {
        id: "baby-and-wedding-registry-essentials-wedding-and-home-essentials",
        name: "Wedding & Home Essentials",
        slug: "wedding-and-home-essentials",
        children: [
          { id: "baby-and-wedding-registry-essentials-wedding-and-home-essentials-cookware-sets", name: "Cookware Sets", slug: "cookware-sets" },
          { id: "baby-and-wedding-registry-essentials-wedding-and-home-essentials-bedding-sets", name: "Bedding Sets", slug: "bedding-sets" },
          { id: "baby-and-wedding-registry-essentials-wedding-and-home-essentials-small-kitchen-appliances", name: "Small Kitchen Appliances", slug: "small-kitchen-appliances" },
          { id: "baby-and-wedding-registry-essentials-wedding-and-home-essentials-bar-and-entertaining-sets", name: "Bar & Entertaining Sets", slug: "bar-and-entertaining-sets" }
        ],
      }
    ],
  },
  {
    id: "seasonal-and-holiday",
    name: "Seasonal & Holiday",
    slug: "seasonal-and-holiday",
    icon: PartyPopper,
    image: "https://picsum.photos/seed/seasonal-and-holiday/800/500",
    description: "Decorations, gifts, and essentials for every holiday and season.",
    featured: false,
    children: [
      {
        id: "seasonal-and-holiday-christmas",
        name: "Christmas",
        slug: "christmas",
        children: [
          { id: "seasonal-and-holiday-christmas-christmas-trees", name: "Christmas Trees", slug: "christmas-trees" },
          { id: "seasonal-and-holiday-christmas-christmas-ornaments", name: "Christmas Ornaments", slug: "christmas-ornaments" },
          { id: "seasonal-and-holiday-christmas-christmas-lights", name: "Christmas Lights", slug: "christmas-lights" },
          { id: "seasonal-and-holiday-christmas-stockings-and-tree-skirts", name: "Stockings & Tree Skirts", slug: "stockings-and-tree-skirts" },
          { id: "seasonal-and-holiday-christmas-holiday-inflatables", name: "Holiday Inflatables", slug: "holiday-inflatables" },
          { id: "seasonal-and-holiday-christmas-nativity-sets", name: "Nativity Sets", slug: "nativity-sets" }
        ],
      },
      {
        id: "seasonal-and-holiday-halloween",
        name: "Halloween",
        slug: "halloween",
        children: [
          { id: "seasonal-and-holiday-halloween-costumes", name: "Costumes", slug: "costumes" },
          { id: "seasonal-and-holiday-halloween-halloween-decorations", name: "Halloween Decorations", slug: "halloween-decorations" },
          { id: "seasonal-and-holiday-halloween-halloween-candy", name: "Halloween Candy", slug: "halloween-candy" },
          { id: "seasonal-and-holiday-halloween-pumpkin-carving-kits", name: "Pumpkin Carving Kits", slug: "pumpkin-carving-kits" },
          { id: "seasonal-and-holiday-halloween-halloween-props", name: "Halloween Props", slug: "halloween-props" }
        ],
      },
      {
        id: "seasonal-and-holiday-easter",
        name: "Easter",
        slug: "easter",
        children: [
          { id: "seasonal-and-holiday-easter-easter-baskets", name: "Easter Baskets", slug: "easter-baskets" },
          { id: "seasonal-and-holiday-easter-easter-egg-decorating", name: "Easter Egg Decorating", slug: "easter-egg-decorating" },
          { id: "seasonal-and-holiday-easter-easter-decorations", name: "Easter Decorations", slug: "easter-decorations" },
          { id: "seasonal-and-holiday-easter-plush-bunnies", name: "Plush Bunnies", slug: "plush-bunnies" }
        ],
      },
      {
        id: "seasonal-and-holiday-fourth-of-july",
        name: "Fourth of July",
        slug: "fourth-of-july",
        children: [
          { id: "seasonal-and-holiday-fourth-of-july-patriotic-decorations", name: "Patriotic Decorations", slug: "patriotic-decorations" },
          { id: "seasonal-and-holiday-fourth-of-july-fireworks-accessories", name: "Fireworks Accessories", slug: "fireworks-accessories" },
          { id: "seasonal-and-holiday-fourth-of-july-outdoor-party-supplies", name: "Outdoor Party Supplies", slug: "outdoor-party-supplies" }
        ],
      },
      {
        id: "seasonal-and-holiday-thanksgiving-and-fall",
        name: "Thanksgiving & Fall",
        slug: "thanksgiving-and-fall",
        children: [
          { id: "seasonal-and-holiday-thanksgiving-and-fall-fall-decor", name: "Fall Decor", slug: "fall-decor" },
          { id: "seasonal-and-holiday-thanksgiving-and-fall-thanksgiving-tableware", name: "Thanksgiving Tableware", slug: "thanksgiving-tableware" },
          { id: "seasonal-and-holiday-thanksgiving-and-fall-harvest-decorations", name: "Harvest Decorations", slug: "harvest-decorations" }
        ],
      },
      {
        id: "seasonal-and-holiday-valentines-day",
        name: "Valentine's Day",
        slug: "valentines-day",
        children: [
          { id: "seasonal-and-holiday-valentines-day-valentines-d-cor", name: "Valentine's Décor", slug: "valentines-d-cor" },
          { id: "seasonal-and-holiday-valentines-day-gift-sets", name: "Gift Sets", slug: "gift-sets" },
          { id: "seasonal-and-holiday-valentines-day-greeting-cards-and-gift-wrap", name: "Greeting Cards & Gift Wrap", slug: "greeting-cards-and-gift-wrap" }
        ],
      }
    ],
  }
];
