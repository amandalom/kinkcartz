import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Top-level categories, each with an optional list of sub-categories.
// "Bondage Gear" subcategories are defined once and reused nowhere else.
const TAXONOMY: { name: string; slug: string; description: string; children?: { name: string; slug: string }[] }[] = [
  {
    name: "Bondage Gear",
    slug: "bondage-gear",
    description: "Restraints, collars, and rig-ready equipment.",
    children: [
      { name: "Collars", slug: "collars" },
      { name: "Jewelry", slug: "jewelry" },
      { name: "Bondage Leash & Accessories", slug: "leash-accessories" },
      { name: "Bondage Cuffs", slug: "cuffs" },
      { name: "Bondage Furniture", slug: "furniture" },
      { name: "Bondage Kits", slug: "bondage-kits" },
      { name: "Chastity Devices", slug: "chastity-devices" },
      { name: "Gags & Hoods", slug: "gags-hoods" },
      { name: "Body Restraints", slug: "body-restraints" },
    ],
  },
  {
    name: "Impact & Sensation Play",
    slug: "impact-sensation-play",
    description: "Tools for pain, pressure, and sensory intensity.",
    children: [
      { name: "Punishment Tools", slug: "punishment-tools" },
      { name: "Clips & Clamps", slug: "clips-clamps" },
      { name: "CBT", slug: "cbt" },
      { name: "Electro Stimulation", slug: "electro-stimulation" },
      { name: "Impact Toys", slug: "impact-toys" },
      { name: "Medical / Clinical Toys", slug: "medical-clinical-toys" },
      { name: "Nipple Devices", slug: "nipple-devices" },
      { name: "Sensory Play", slug: "sensory-play" },
      { name: "Urethral Inserts", slug: "urethral-inserts" },
      { name: "Sensual Candle Drips", slug: "candle-drips" },
      { name: "Wands & Whips", slug: "wands-whips" },
    ],
  },
  {
    name: "Pleasure Devices",
    slug: "pleasure-devices",
    description: "For sub or Dom — vibration, insertion, and stimulation toys.",
    children: [
      { name: "Strap-Ons", slug: "strap-ons" },
      { name: "Vibrating Toys", slug: "vibrating-toys" },
      { name: "Metal Toys", slug: "metal-toys" },
      { name: "Huge Insertables", slug: "huge-insertables" },
      { name: "Magic Wands", slug: "magic-wands" },
      { name: "Masturbators", slug: "masturbators" },
      { name: "Glass Toys", slug: "glass-toys" },
      { name: "Dildos", slug: "dildos" },
      { name: "Cock Rings", slug: "cock-rings" },
      { name: "Fucking Machines", slug: "fucking-machines" },
      { name: "Cock Cages", slug: "cock-cages" },
      { name: "Anal Toys", slug: "anal-toys" },
    ],
  },
  {
    name: "Fetish Clothing",
    slug: "fetish-clothing",
    description: "Cosplay, harnesses, and lingerie.",
    children: [
      { name: "Cosplay Clothing", slug: "cosplay-clothing" },
      { name: "Panties & Harness", slug: "panties-harness" },
      { name: "Lingerie", slug: "lingerie" },
    ],
  },
];

type ProductSeed = {
  name: string;
  description: string;
  priceCents: number;
  material?: string;
  powerSource?: string;
  featured?: boolean;
  tags?: string; // comma-separated display badges, only meaningful on featured items
};

// Which audience a sub-category's products are tagged for, driving the
// "For Subs / For Doms / Couples Sanctuary" filter pills. A simplification —
// real kink roles are fluid — but good enough for browsing/filtering.
const SUBCATEGORY_AUDIENCE: Record<string, "all" | "sub" | "dom" | "couples"> = {
  collars: "sub",
  cuffs: "sub",
  "gags-hoods": "sub",
  "body-restraints": "sub",
  "chastity-devices": "sub",
  "nipple-devices": "sub",
  "urethral-inserts": "sub",
  "cock-cages": "sub",
  "leash-accessories": "dom",
  "punishment-tools": "dom",
  "wands-whips": "dom",
  "impact-toys": "dom",
  cbt: "dom",
  "electro-stimulation": "dom",
  "clips-clamps": "dom",
  furniture: "couples",
  "bondage-kits": "couples",
  "fucking-machines": "couples",
  "strap-ons": "couples",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Eight sample products per sub-category slug. Generic, non-branded
// descriptions — not copied from any retailer's listings.
const PRODUCTS_BY_SUBCATEGORY: Record<string, ProductSeed[]> = {
  collars: [
    {
      name: "Leather Buckle Collar",
      description: "Adjustable genuine leather collar with O-ring attachment.",
      priceCents: 3200,
      material: "Leather",
      featured: true,
      tags: "Hand-Finished,Adjustable Fit",
    },
    {
      name: "Padded Day Collar",
      description: "Slim, low-profile collar padded for all-day wear under clothing.",
      priceCents: 2600,
      material: "Vegan leather",
    },
    {
      name: "Velvet Choker Collar",
      description: "Plush velvet choker with a delicate O-ring, for subtle everyday wear.",
      priceCents: 2400,
      material: "Velvet",
    },
    {
      name: "Locking Steel Collar",
      description: "Solid stainless collar with a discreet padlock closure.",
      priceCents: 5800,
      material: "Stainless steel",
    },
    {
      name: "Spiked Punk Collar",
      description: "Leather collar lined with blunted metal studs for a harder edge.",
      priceCents: 3600,
      material: "Leather / steel",
    },
    {
      name: "Rolled Leather Collar",
      description: "Rounded rolled-edge leather collar, comfortable for extended wear.",
      priceCents: 2900,
      material: "Leather",
    },
    {
      name: "O-Ring Statement Collar",
      description: "Wide collar with a prominent center O-ring.",
      priceCents: 3400,
      material: "Leather",
    },
    {
      name: "Two-Tone Collar & Leash Set",
      description: "Matching collar and leash in contrast stitching.",
      priceCents: 4200,
      material: "Leather",
    },
  ],
  jewelry: [
    {
      name: "Discreet Slave Bracelet",
      description: "Fine chain bracelet with a hidden O-ring clasp detail.",
      priceCents: 2800,
      material: "Stainless steel",
    },
    {
      name: "Body Chain Harness",
      description: "Layered chain harness that drapes over the torso and shoulders.",
      priceCents: 3400,
      material: "Brass chain",
    },
    {
      name: "Collar Charm Pendant",
      description: "Fine chain necklace with a subtle O-ring pendant.",
      priceCents: 2200,
      material: "Sterling silver",
    },
    {
      name: "Ankle Chain Anklet",
      description: "Delicate anklet with a small padlock charm.",
      priceCents: 1900,
      material: "Stainless steel",
    },
    {
      name: "Layered Waist Chain",
      description: "Triple-layer waist chain that sits low on the hips.",
      priceCents: 3000,
      material: "Brass chain",
    },
    {
      name: "Nipple Chain Set",
      description: "Adjustable chain connecting clip-free magnetic pads.",
      priceCents: 2600,
      material: "Steel / magnet",
    },
    {
      name: "Wrist-to-Collar Connector Chain",
      description: "Fine chain linking a wrist cuff to a collar ring.",
      priceCents: 3200,
      material: "Brass chain",
    },
    {
      name: "Minimalist O-Ring Necklace",
      description: "Slim chain necklace with a small discreet O-ring.",
      priceCents: 1800,
      material: "Sterling silver",
    },
  ],
  "leash-accessories": [
    {
      name: "Braided Leather Leash",
      description: "6ft braided leash with a secure locking clip.",
      priceCents: 2400,
      material: "Leather",
    },
    {
      name: "Chain Link Leash",
      description: "Heavy-gauge chain leash with a padded handle.",
      priceCents: 2900,
      material: "Steel / leather",
    },
    {
      name: "Retractable Tether Leash",
      description: "Coiled leash with a spring-loaded extend-and-lock clip.",
      priceCents: 2600,
      material: "Nylon / steel",
    },
    {
      name: "Rope Leash with Handle",
      description: "Soft-touch rope leash with a padded wrist handle.",
      priceCents: 2100,
      material: "Cotton rope",
    },
    {
      name: "Double-Ended Clip Leash",
      description: "Leash with clips on both ends for hand-to-collar or cross-body use.",
      priceCents: 2300,
      material: "Leather",
    },
    {
      name: "Leash Coupler Clip",
      description: "Connects two leashes or a leash to a harness point.",
      priceCents: 1200,
      material: "Steel",
    },
    {
      name: "Padded Handle Leash",
      description: "Extra-wide padded handle for comfortable extended holds.",
      priceCents: 2500,
      material: "Leather",
    },
    {
      name: "Two-Tone Rope Leash",
      description: "Contrast-braided rope leash with a swivel clip.",
      priceCents: 2200,
      material: "Cotton rope",
    },
  ],
  cuffs: [
    {
      name: "Locking Wrist Cuffs (Pair)",
      description: "Fleece-lined cuffs with a locking buckle and D-ring.",
      priceCents: 3600,
      material: "Leather / fleece",
    },
    {
      name: "Neoprene Ankle Cuffs (Pair)",
      description: "Padded, adjustable ankle cuffs built for extended wear.",
      priceCents: 3000,
      material: "Neoprene",
    },
    {
      name: "Fur-Lined Wrist Cuffs",
      description: "Soft faux-fur lining over a rigid inner cuff.",
      priceCents: 3200,
      material: "Faux fur / leather",
    },
    {
      name: "Steel Bar Cuffs",
      description: "Rigid stainless cuffs linked by a short bar for fixed positioning.",
      priceCents: 4800,
      material: "Stainless steel",
    },
    {
      name: "Under-the-Bed Cuff Set",
      description: "Four soft cuffs that attach via included straps.",
      priceCents: 4000,
      material: "Nylon",
    },
    {
      name: "Locking Thigh Cuffs (Pair)",
      description: "Padded cuffs sized for the thigh, with a locking buckle.",
      priceCents: 4200,
      material: "Leather / fleece",
    },
    {
      name: "Collar-Matching Wrist Cuffs",
      description: "Cuffs designed to pair with a matching leather collar.",
      priceCents: 3400,
      material: "Leather",
    },
    {
      name: "Quick-Release Cuff Set",
      description: "Cuffs with a one-hand quick-release safety clasp.",
      priceCents: 3800,
      material: "Nylon / steel",
    },
  ],
  furniture: [
    {
      name: "Folding Spanking Bench",
      description: "Padded, collapsible bench with multiple restraint points.",
      priceCents: 21900,
      material: "Steel frame / faux leather",
    },
    {
      name: "Door-Anchor Sex Sling",
      description: "Adjustable sling with stirrups, anchors to any standard door.",
      priceCents: 8900,
      material: "Nylon webbing",
    },
    {
      name: "Portable Bondage Chair",
      description: "Collapsible frame with multiple attachment points.",
      priceCents: 18900,
      material: "Steel / faux leather",
    },
    {
      name: "Over-the-Door Restraint Kit",
      description: "Padded straps that anchor over any standard door.",
      priceCents: 5400,
      material: "Nylon webbing",
    },
    {
      name: "Weighted Bondage Wedge",
      description: "Firm foam wedge with a washable cover for positioning support.",
      priceCents: 7900,
      material: "Foam / vinyl",
    },
    {
      name: "Bondage Bed Restraint Frame",
      description: "Lightweight frame that fits under a standard mattress.",
      priceCents: 12900,
      material: "Steel",
    },
    {
      name: "Sex Position Support Pillow",
      description: "Firm wedge pillow with an easy-clean cover.",
      priceCents: 6400,
      material: "Foam / vinyl",
    },
    {
      name: "Suspension Bar with Rigging Points",
      description: "Ceiling-mounted bar with four rated anchor points.",
      priceCents: 16900,
      material: "Steel",
    },
  ],
  "bondage-kits": [
    {
      name: "Beginner Bondage Kit",
      description: "Cuffs, blindfold, and rope in a discreet zip case — everything to start.",
      priceCents: 5400,
      material: "Mixed",
      featured: true,
    },
    {
      name: "Rope & Restraint Kit",
      description: "30m of soft cotton rope plus a printed knot-tying guide.",
      priceCents: 4200,
      material: "Cotton rope",
    },
    {
      name: "Couples Starter Kit",
      description: "Blindfold, cuffs, and feather tickler for two, in a gift box.",
      priceCents: 4800,
      material: "Mixed",
    },
    {
      name: "Travel Bondage Kit",
      description: "Compact zip pouch with cuffs, tape, and a mini flogger.",
      priceCents: 3600,
      material: "Mixed",
    },
    {
      name: "Advanced Rope Kit",
      description: "60m of dyed jute rope with a bag and quick-release shears.",
      priceCents: 5800,
      material: "Jute rope",
    },
    {
      name: "Sensory Deprivation Kit",
      description: "Blindfold, ear plugs, and soft cuffs in one set.",
      priceCents: 4400,
      material: "Mixed",
    },
    {
      name: "Rope Bondage Intro Kit",
      description: "10m rope, guidebook, and safety shears.",
      priceCents: 3200,
      material: "Jute rope",
    },
    {
      name: "Weekend Away Kit",
      description: "Compact travel case with cuffs, blindfold, and a small flogger.",
      priceCents: 5200,
      material: "Mixed",
    },
  ],
  "chastity-devices": [
    {
      name: "Silicone Chastity Belt",
      description: "Adjustable waist and leg straps with a locking silicone shield.",
      priceCents: 6800,
      material: "Silicone / steel",
    },
    {
      name: "Curved Steel Chastity Cage",
      description: "Ergonomic curved cage with three ring sizes included.",
      priceCents: 5900,
      material: "Stainless steel",
    },
    {
      name: "Micro Chastity Cage",
      description: "Compact cage for maximum restriction, three ring sizes.",
      priceCents: 5200,
      material: "Stainless steel",
    },
    {
      name: "Silicone Chastity Cage",
      description: "Flexible, lightweight cage for extended comfortable wear.",
      priceCents: 3400,
      material: "Silicone",
    },
    {
      name: "Locking Chastity Belt",
      description: "Full belt with a locking front shield and rear anchor.",
      priceCents: 7400,
      material: "Steel / leather",
    },
    {
      name: "Hinged Chastity Cage",
      description: "Quick-release hinged design for easier daily wear.",
      priceCents: 6200,
      material: "Stainless steel",
    },
    {
      name: "Chastity Cage Comfort Kit",
      description: "Cage plus three padded ring inserts.",
      priceCents: 6800,
      material: "Silicone / steel",
    },
    {
      name: "Extended Wear Chastity Belt",
      description: "Breathable design rated for multi-day wear.",
      priceCents: 8200,
      material: "Silicone / steel",
    },
  ],
  "gags-hoods": [
    {
      name: "Locking Ball Gag",
      description: "Adjustable strap with a medical-grade silicone ball.",
      priceCents: 2200,
      material: "Silicone / leather",
    },
    {
      name: "Full Face Hood with Blindfold",
      description: "Open-mouth hood in stretch spandex with removable eye panel.",
      priceCents: 3800,
      material: "Spandex",
    },
    {
      name: "Panel Gag",
      description: "Adjustable strap gag with an interchangeable silicone panel.",
      priceCents: 2600,
      material: "Silicone / leather",
    },
    {
      name: "Ring Gag",
      description: "Open-ring gag secured by an adjustable strap.",
      priceCents: 2400,
      material: "Steel / leather",
    },
    {
      name: "Breathable Sensory Hood",
      description: "Lightweight spandex hood with mesh eye panels for airflow.",
      priceCents: 2800,
      material: "Spandex / mesh",
    },
    {
      name: "Inflatable Gag",
      description: "Hand-pump bulb gag with adjustable inflation.",
      priceCents: 2800,
      material: "Silicone / leather",
    },
    {
      name: "Muzzle-Style Gag",
      description: "Structured leather muzzle with adjustable straps.",
      priceCents: 3200,
      material: "Leather",
    },
    {
      name: "Full Hood with Removable Gag",
      description: "Modular hood with a detachable gag panel.",
      priceCents: 4200,
      material: "Spandex / silicone",
    },
  ],
  "body-restraints": [
    {
      name: "Under-Bed Restraint System",
      description: "Four-point cuff system that anchors under any mattress.",
      priceCents: 4600,
      material: "Nylon / neoprene",
    },
    {
      name: "Steel Spreader Bar",
      description: "Adjustable-length bar with locking cuffs at each end.",
      priceCents: 5200,
      material: "Steel / leather",
    },
    {
      name: "Hogtie Restraint Set",
      description: "Adjustable straps connecting wrist and ankle cuffs.",
      priceCents: 4400,
      material: "Nylon / leather",
    },
    {
      name: "Full Body Harness Restraint",
      description: "Adjustable straps crossing the torso with multiple D-rings.",
      priceCents: 6200,
      material: "Leather",
    },
    {
      name: "Telescoping Spreader Bar",
      description: "Extends from 16 to 24 inches with locking cuffs.",
      priceCents: 5600,
      material: "Steel",
    },
    {
      name: "Suspension Cuff Set",
      description: "Reinforced cuffs rated for suspension use.",
      priceCents: 7400,
      material: "Leather / steel",
    },
    {
      name: "Portable Restraint Straps (4-Piece)",
      description: "Anchor-anywhere straps for wrists and ankles.",
      priceCents: 3600,
      material: "Nylon",
    },
    {
      name: "Full-Body Restraint Wrap",
      description: "Stretch wrap that binds arms and torso together.",
      priceCents: 4800,
      material: "Spandex",
    },
  ],
  "punishment-tools": [
    {
      name: "Wooden Paddle",
      description: "Polished maple paddle with a contoured grip.",
      priceCents: 2400,
      material: "Maple wood",
    },
    {
      name: "Double-Layer Leather Strap",
      description: "Firm, flexible strap for a sharp, controlled sting.",
      priceCents: 2900,
      material: "Leather",
    },
    {
      name: "Studded Leather Paddle",
      description: "Firm paddle with a soft stud pattern for textured impact.",
      priceCents: 2700,
      material: "Leather",
    },
    {
      name: "Acrylic Paddle",
      description: "Rigid clear paddle for a sharp, precise sting.",
      priceCents: 2200,
      material: "Acrylic",
    },
    {
      name: "Two-Layer Slapper Paddle",
      description: "Two-layer leather slapper that delivers a dramatic crack.",
      priceCents: 2500,
      material: "Leather",
    },
    {
      name: "Bamboo Cane",
      description: "Traditional thin bamboo cane for precise strikes.",
      priceCents: 1600,
      material: "Bamboo",
    },
    {
      name: "Split-Tail Tawse",
      description: "Leather tawse with a split striking end.",
      priceCents: 3200,
      material: "Leather",
    },
    {
      name: "Weighted Paddle",
      description: "Dense core paddle for a heavier impact.",
      priceCents: 3000,
      material: "Wood / leather",
    },
  ],
  "clips-clamps": [
    {
      name: "Adjustable Nipple Clamps",
      description: "Tension-adjustable clamps linked by a fine chain.",
      priceCents: 1800,
      material: "Steel",
    },
    {
      name: "Tweezer-Style Clamps",
      description: "Sliding-bead tension control for precise intensity.",
      priceCents: 2000,
      material: "Steel / silicone tips",
    },
    {
      name: "Clover Clamps",
      description: "Classic self-tightening clamps that intensify with pull.",
      priceCents: 1600,
      material: "Steel",
    },
    {
      name: "Vibrating Clover Clamps",
      description: "Clover-style clamps with a shared bullet vibrator.",
      priceCents: 2800,
      powerSource: "Battery (2x AAA)",
      material: "Steel / silicone",
    },
    {
      name: "Magnetic Nipple Clamps",
      description: "Adjustable-strength magnetic clamps, no pinching mechanism.",
      priceCents: 1900,
      material: "Steel / magnet",
    },
    {
      name: "Butterfly Clamps",
      description: "Winged clamps with adjustable tension screws.",
      priceCents: 2100,
      material: "Steel",
    },
    {
      name: "Chain-Linked Clamp Set",
      description: "Three clamps linked in a single chain.",
      priceCents: 2400,
      material: "Steel",
    },
    {
      name: "Silicone-Tipped Clamps",
      description: "Softer tips for beginner-friendly intensity.",
      priceCents: 1700,
      material: "Steel / silicone",
    },
  ],
  cbt: [
    {
      name: "Adjustable Ball Stretcher",
      description: "Snap-closure strap, adjustable across four lengths.",
      priceCents: 2100,
      material: "Silicone",
    },
    {
      name: "Weighted Ball Restraint Ring",
      description: "Stainless ring with a detachable weight attachment.",
      priceCents: 3300,
      material: "Stainless steel",
    },
    {
      name: "Parachute Ball Stretcher",
      description: "Adjustable straps with a weight-ready ring.",
      priceCents: 2400,
      material: "Leather / steel",
    },
    {
      name: "Graduated CBT Ring Set",
      description: "Three silicone rings in graduated tension.",
      priceCents: 2200,
      material: "Silicone",
    },
    {
      name: "Textured CBT Ring",
      description: "Blunted texture ring for heightened sensation play.",
      priceCents: 2600,
      material: "Silicone",
    },
    {
      name: "CBT Chain Set",
      description: "Ring and clamp set linked by a fine chain.",
      priceCents: 2800,
      material: "Steel",
    },
    {
      name: "Cock & Ball Harness",
      description: "Adjustable harness for cock and balls together.",
      priceCents: 2600,
      material: "Leather",
    },
    {
      name: "Ridged Ball Ring",
      description: "Ridged silicone ring for added sensation.",
      priceCents: 1900,
      material: "Silicone",
    },
  ],
  "electro-stimulation": [
    {
      name: "Compact E-Stim Power Box",
      description: "Multi-mode stimulation unit with two output channels.",
      priceCents: 7900,
      powerSource: "Rechargeable (USB-C)",
      material: "ABS plastic",
    },
    {
      name: "Conductive Gel Electrode Pads (4-Pack)",
      description: "Adhesive pads compatible with most e-stim units.",
      priceCents: 1400,
      material: "Conductive gel",
    },
    {
      name: "E-Stim Cock Ring",
      description: "Silicone ring wired for electro play, adjustable intensity.",
      priceCents: 4200,
      powerSource: "Battery (replaceable)",
      material: "Silicone",
    },
    {
      name: "Dual-Channel Play Unit",
      description: "Compact unit with eight stimulation patterns.",
      priceCents: 6800,
      powerSource: "Battery (replaceable)",
      material: "ABS plastic",
    },
    {
      name: "Electro Conductive Rope",
      description: "Metal-threaded rope for full-body electro sensation.",
      priceCents: 5400,
      material: "Conductive fiber",
    },
    {
      name: "E-Stim Anal Probe",
      description: "Slim probe wired for electro play.",
      priceCents: 4800,
      powerSource: "Battery (replaceable)",
      material: "Stainless steel",
    },
    {
      name: "Wearable E-Stim Panties",
      description: "Discreet panties with built-in electrodes.",
      priceCents: 5600,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone / fabric",
    },
    {
      name: "Electro Play Starter Kit",
      description: "Power box, pads, and cable in one set.",
      priceCents: 8400,
      material: "Mixed",
    },
  ],
  "impact-toys": [
    {
      name: "Suede Flogger",
      description: "24-tail suede flogger, weighted handle for control.",
      priceCents: 5800,
      material: "Suede / steel",
    },
    {
      name: "Leather Riding Crop",
      description: "Classic crop with a wide slapper tip for a sharp snap.",
      priceCents: 2300,
      material: "Leather",
    },
    {
      name: "Rubber Flogger",
      description: "Firm rubber tails for a sharp, dramatic thud.",
      priceCents: 4400,
      material: "Rubber",
    },
    {
      name: "Beginner Paddle Flogger",
      description: "Combination paddle-and-flogger hybrid for varied sensation.",
      priceCents: 3600,
      material: "Leather",
    },
    {
      name: "Weighted Slapper",
      description: "Dense leather slapper with a reinforced core.",
      priceCents: 2900,
      material: "Leather",
    },
    {
      name: "Heavy Suede Flogger",
      description: "Extra-weight suede tails for deep impact.",
      priceCents: 6400,
      material: "Suede",
    },
    {
      name: "Compact Travel Crop",
      description: "Short crop that fits in a bag.",
      priceCents: 1800,
      material: "Leather",
    },
    {
      name: "Multi-Strand Whip",
      description: "Fine multi-strand whip for a sharper sting.",
      priceCents: 4800,
      material: "Leather",
    },
  ],
  "medical-clinical-toys": [
    {
      name: "Stainless Steel Speculum",
      description: "Adjustable-width speculum, fully autoclavable.",
      priceCents: 4400,
      material: "Stainless steel",
    },
    {
      name: "Graduated Sound Rod Set (5-Piece)",
      description: "Smooth stainless rods in five increasing diameters.",
      priceCents: 5600,
      material: "Stainless steel",
    },
    {
      name: "Clinical Restraint Strap Set",
      description: "Padded straps that mimic clinical positioning.",
      priceCents: 3800,
      material: "Nylon / vinyl",
    },
    {
      name: "Silicone Cleansing Bulb",
      description: "Body-safe bulb for hygiene and clinical-style play.",
      priceCents: 1900,
      material: "Silicone",
    },
    {
      name: "Stainless Dilator Set",
      description: "Graduated set of five smooth dilators.",
      priceCents: 5200,
      material: "Stainless steel",
    },
    {
      name: "Stainless Anal Hook",
      description: "Polished hook with a comfort ball end.",
      priceCents: 3800,
      material: "Stainless steel",
    },
    {
      name: "Clinical Exam Kit",
      description: "Speculum, gloves, and lubricant in a zip case.",
      priceCents: 5800,
      material: "Mixed",
    },
    {
      name: "Catheter-Style Urethral Set",
      description: "Graduated soft-tip set for beginners.",
      priceCents: 4600,
      material: "Silicone",
    },
  ],
  "nipple-devices": [
    {
      name: "Vibrating Nipple Clamps",
      description: "Clamps with a detachable bullet vibrator on each side.",
      priceCents: 3200,
      powerSource: "Battery (2x AAA)",
      material: "Silicone / steel",
    },
    {
      name: "Nipple Suction Cup Set",
      description: "Hand-pump suction cups for gradual, controlled intensity.",
      priceCents: 1900,
      material: "Silicone / acrylic",
    },
    {
      name: "Rolling Nipple Teasers",
      description: "Textured rollers for varied nipple sensation.",
      priceCents: 1700,
      material: "ABS / silicone",
    },
    {
      name: "Nipple Clamp & Weight Set",
      description: "Adjustable clamps with detachable weights.",
      priceCents: 2600,
      material: "Steel",
    },
    {
      name: "Silicone Nipple Pumps",
      description: "Hand-pump pair for gradual suction intensity.",
      priceCents: 2400,
      material: "Silicone",
    },
    {
      name: "Nipple Bondage Rope Set",
      description: "Fine rope designed for decorative nipple ties.",
      priceCents: 2200,
      material: "Cotton rope",
    },
    {
      name: "Adjustable Nipple Press",
      description: "Flat press plates with a tension screw.",
      priceCents: 2600,
      material: "Acrylic / steel",
    },
    {
      name: "Magnetic Nipple Pads",
      description: "No-clamp magnetic discs for gentler intensity.",
      priceCents: 2000,
      material: "Steel / magnet",
    },
  ],
  "sensory-play": [
    {
      name: "Ostrich Feather Tickler",
      description: "Long-handled tickler with a full feather head.",
      priceCents: 1500,
      material: "Feather / wood",
    },
    {
      name: "Satin Blindfold Mask",
      description: "Contoured satin mask that blocks light completely.",
      priceCents: 1200,
      material: "Satin",
    },
    {
      name: "Wartenberg Pinwheel",
      description: "Classic spiked wheel for graduated sensation play.",
      priceCents: 1400,
      material: "Stainless steel",
    },
    {
      name: "Sensation Play Kit",
      description: "Feather, wheel, and ice-play tool in one set.",
      priceCents: 2900,
      material: "Mixed",
    },
    {
      name: "Silicone Sensation Brush",
      description: "Soft-bristled brush for gentle full-body play.",
      priceCents: 1600,
      material: "Silicone",
    },
    {
      name: "Ice & Heat Play Set",
      description: "Reusable wax and cooling tools for temperature play.",
      priceCents: 2400,
      material: "Mixed",
    },
    {
      name: "Textured Sensation Gloves",
      description: "Studded gloves for varied tactile play.",
      priceCents: 1900,
      material: "Rubber",
    },
    {
      name: "Scented Massage Oil Trio",
      description: "Three warming oils in a gift set.",
      priceCents: 2200,
      material: "Oil blend",
    },
  ],
  "urethral-inserts": [
    {
      name: "Graduated Urethral Sound Set",
      description: "Three smooth stainless sounds in increasing diameters.",
      priceCents: 4800,
      material: "Stainless steel",
    },
    {
      name: "Flexible Silicone Urethral Plug",
      description: "Body-safe silicone plug with a flared retention base.",
      priceCents: 2600,
      material: "Silicone",
    },
    {
      name: "Vibrating Urethral Sound",
      description: "Slim sound with a low-intensity built-in vibration.",
      priceCents: 4400,
      powerSource: "Battery (replaceable)",
      material: "Stainless steel",
    },
    {
      name: "Textured Silicone Sound",
      description: "Ribbed silicone insert for beginners.",
      priceCents: 2300,
      material: "Silicone",
    },
    {
      name: "Weighted Urethral Plug",
      description: "Stainless plug with a retention ring.",
      priceCents: 3800,
      material: "Stainless steel",
    },
    {
      name: "Beaded Urethral Sound",
      description: "Graduated beads along a slim stainless shaft.",
      priceCents: 4200,
      material: "Stainless steel",
    },
    {
      name: "Silicone Sound Trainer Set",
      description: "Three soft silicone sounds for progression.",
      priceCents: 3400,
      material: "Silicone",
    },
    {
      name: "Vibrating Urethral Plug",
      description: "Compact plug with gentle internal vibration.",
      priceCents: 4800,
      powerSource: "Battery (replaceable)",
      material: "Silicone",
    },
  ],
  "candle-drips": [
    {
      name: "Low-Temperature Drip Candles (3-Pack)",
      description: "Slow-burning paraffin blend formulated for a gentle drip.",
      priceCents: 1600,
      material: "Paraffin blend",
    },
    {
      name: "Colored Wax Play Candle Set (6-Pack)",
      description: "Assorted colors, low melting point for sensation play.",
      priceCents: 2200,
      material: "Soy wax blend",
    },
    {
      name: "Massage Wax Candle",
      description: "Low-temp candle that melts into warm massage oil.",
      priceCents: 1800,
      material: "Soy wax blend",
    },
    {
      name: "Metallic Drip Candles (4-Pack)",
      description: "Shimmer-finish candles in a low-melt formula.",
      priceCents: 2000,
      material: "Paraffin blend",
    },
    {
      name: "Wax Play Starter Kit",
      description: "Candle, tray, and drip guide for first-timers.",
      priceCents: 2700,
      material: "Mixed",
    },
    {
      name: "Scented Drip Candle Trio",
      description: "Three low-melt scented candles in a gift box.",
      priceCents: 2400,
      material: "Soy wax blend",
    },
    {
      name: "Temperature Play Candle Set",
      description: "Candles calibrated to three heat levels.",
      priceCents: 2600,
      material: "Paraffin blend",
    },
    {
      name: "Massage Candle & Tray Set",
      description: "Candle with a heat-safe drip tray included.",
      priceCents: 2900,
      material: "Soy wax blend",
    },
  ],
  "wands-whips": [
    {
      name: "Braided Leather Signal Whip",
      description: "Long single-tail whip for experienced handlers.",
      priceCents: 6200,
      material: "Leather",
      featured: true,
      tags: "Severe Calibration,Hand-Braided",
    },
    {
      name: "Rattan Cane",
      description: "Classic flexible cane with a looped handle.",
      priceCents: 1800,
      material: "Rattan",
    },
    {
      name: "Suede-Wrapped Cane",
      description: "Flexible cane with a suede-wrapped grip.",
      priceCents: 2400,
      material: "Rattan / suede",
    },
    {
      name: "Deerskin Bullwhip",
      description: "Traditional bullwhip for experienced handlers.",
      priceCents: 7400,
      material: "Deerskin",
    },
    {
      name: "Dressage Whip",
      description: "Long, lightweight whip for precision strikes.",
      priceCents: 2000,
      material: "Fiberglass / leather",
    },
    {
      name: "Leather Slapper Whip",
      description: "Wide flat leather slapper for dramatic sound.",
      priceCents: 2800,
      material: "Leather",
    },
    {
      name: "Riding Whip with Loop End",
      description: "Classic riding-style whip with a looped tip.",
      priceCents: 2200,
      material: "Leather",
    },
    {
      name: "Fiberglass Cane",
      description: "Lightweight flexible cane for consistent strikes.",
      priceCents: 1900,
      material: "Fiberglass",
    },
  ],
  "strap-ons": [
    {
      name: "Adjustable Harness & Dildo Set",
      description: "Three-strap harness with a body-safe silicone dildo included.",
      priceCents: 6400,
      material: "Nylon / silicone",
      featured: true,
    },
    {
      name: "Hollow Strap-On Sheath",
      description: "Wearable hollow extension sheath with a comfort harness.",
      priceCents: 4800,
      material: "Silicone",
    },
    {
      name: "Beginner Strap-On Kit",
      description: "Soft harness with a slim silicone dildo.",
      priceCents: 4600,
      material: "Nylon / silicone",
    },
    {
      name: "Double-Penetration Strap-On",
      description: "Dual-insertion harness for shared wear.",
      priceCents: 7200,
      material: "Silicone",
    },
    {
      name: "Thigh Strap-On Harness",
      description: "Leg-mounted harness for hands-free positioning.",
      priceCents: 5600,
      material: "Neoprene / silicone",
    },
    {
      name: "Vibrating Strap-On Set",
      description: "Harness and dildo with a built-in bullet vibrator.",
      priceCents: 7800,
      material: "Nylon / silicone",
    },
    {
      name: "Adjustable Hollow Strap-On",
      description: "Hollow design that adjusts to fit comfortably.",
      priceCents: 5200,
      material: "Silicone",
    },
    {
      name: "Beginner Comfort Harness",
      description: "Extra-padded harness for first-time wearers.",
      priceCents: 4200,
      material: "Neoprene",
    },
  ],
  "vibrating-toys": [
    {
      name: "Rabbit Dual-Motor Vibrator",
      description: "Dual stimulation with ten independent vibration patterns.",
      priceCents: 5900,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
      featured: true,
      tags: "Whisper-Quiet,Body-Safe",
    },
    {
      name: "Discreet Bullet Vibrator",
      description: "Pocket-sized vibrator with quiet multi-speed motor.",
      priceCents: 2400,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
    {
      name: "Wearable Panty Vibrator",
      description: "Remote-controlled vibrator worn discreetly under clothing.",
      priceCents: 4600,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
    {
      name: "Come-Hither Vibrator",
      description: "Curved tip designed for come-hither motion.",
      priceCents: 3800,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
    {
      name: "App-Controlled Wearable Vibrator",
      description: "Wearable vibrator controlled via smartphone app.",
      priceCents: 8900,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
    {
      name: "Dual-Stim Rabbit Vibrator",
      description: "Rotating shaft with a flexible external arm.",
      priceCents: 6800,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
    {
      name: "Finger Vibrator",
      description: "Wearable fingertip vibrator for precise control.",
      priceCents: 2600,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
    {
      name: "Suction Wave Vibrator",
      description: "Pulse-wave stimulator with air suction technology.",
      priceCents: 7400,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
  ],
  "metal-toys": [
    {
      name: "Polished Steel Wand",
      description: "Weighted stainless wand with a tapered, seamless tip.",
      priceCents: 4200,
      material: "Stainless steel",
    },
    {
      name: "Stainless Steel Anal Plug",
      description: "Mirror-polished plug with a jeweled base.",
      priceCents: 3100,
      material: "Stainless steel",
    },
    {
      name: "Textured Metal Dildo",
      description: "Ribbed stainless dildo for temperature and weight play.",
      priceCents: 4600,
      material: "Stainless steel",
    },
    {
      name: "Metal Ben Wa Balls",
      description: "Weighted stainless balls for internal training.",
      priceCents: 2800,
      material: "Stainless steel",
    },
    {
      name: "Chilled Steel Wand Set",
      description: "Two wands designed for temperature play.",
      priceCents: 5200,
      material: "Stainless steel",
    },
    {
      name: "Stainless Steel Plug Trainer Set",
      description: "Three weighted plugs in graduated sizes.",
      priceCents: 4800,
      material: "Stainless steel",
    },
    {
      name: "Curved Metal Massager",
      description: "Ergonomic curve for precise internal pressure.",
      priceCents: 3800,
      material: "Stainless steel",
    },
    {
      name: "Metal & Leather Paddle",
      description: "Steel-backed paddle with a leather strike face.",
      priceCents: 3400,
      material: "Steel / leather",
    },
  ],
  "huge-insertables": [
    {
      name: "XL Silicone Dildo",
      description: "Extra-large silicone dildo with a firm core and suction base.",
      priceCents: 7200,
      material: "Silicone",
    },
    {
      name: "Graduated Insertable Set",
      description: "Three sizes to progress comfortably toward larger insertables.",
      priceCents: 8400,
      material: "Silicone",
    },
    {
      name: "Colossal Silicone Plug",
      description: "Extra-wide plug for experienced users.",
      priceCents: 6800,
      material: "Silicone",
    },
    {
      name: "Weighted XL Dildo",
      description: "Extra-large dildo with a dense, realistic weight.",
      priceCents: 7900,
      material: "Silicone",
    },
    {
      name: "Progressive Training Set (4-Piece)",
      description: "Four sizes for gradual, comfortable progression.",
      priceCents: 9400,
      material: "Silicone",
    },
    {
      name: "Ribbed XXL Plug",
      description: "Extra-large ribbed plug for advanced users.",
      priceCents: 8200,
      material: "Silicone",
    },
    {
      name: "Weighted Training Balls (Large)",
      description: "Oversized weighted balls for advanced training.",
      priceCents: 6800,
      material: "Silicone",
    },
    {
      name: "Double-Density XL Dildo",
      description: "Firm core with a soft outer layer at extra-large scale.",
      priceCents: 8600,
      material: "Silicone",
    },
  ],
  "magic-wands": [
    {
      name: "Cordless Wand Massager",
      description: "Rechargeable wand with adjustable intensity and a flexible neck.",
      priceCents: 6900,
      powerSource: "Rechargeable (USB-C)",
      material: "ABS / silicone",
      featured: true,
    },
    {
      name: "Plug-In Wand Massager",
      description: "Full-power corded wand for uninterrupted intense sessions.",
      priceCents: 4900,
      powerSource: "Corded (mains)",
      material: "ABS / silicone",
    },
    {
      name: "Mini Wand Massager",
      description: "Compact rechargeable wand for travel.",
      priceCents: 3900,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone / ABS",
    },
    {
      name: "Dual-Head Wand Attachment",
      description: "Flexible attachment that fits standard wands.",
      priceCents: 1800,
      material: "Silicone",
    },
    {
      name: "Whisper Wand Massager",
      description: "Ultra-quiet motor with ten intensity levels.",
      priceCents: 5800,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone / ABS",
    },
    {
      name: "Rechargeable Travel Wand",
      description: "Compact wand with a discreet charging case.",
      priceCents: 4800,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone / ABS",
    },
    {
      name: "Wand Head Attachment Set (3-Piece)",
      description: "Three interchangeable heads for varied sensation.",
      priceCents: 2400,
      material: "Silicone",
    },
    {
      name: "Heavy-Duty Corded Wand",
      description: "Industrial-grade motor for maximum power.",
      priceCents: 5900,
      powerSource: "Corded (mains)",
      material: "ABS",
    },
  ],
  masturbators: [
    {
      name: "Textured Stroker Sleeve",
      description: "Ribbed internal texture in a discreet, washable sleeve.",
      priceCents: 3400,
      material: "TPE",
    },
    {
      name: "Automatic Thrusting Masturbator",
      description: "Hands-free unit with adjustable speed and suction.",
      priceCents: 9800,
      powerSource: "Rechargeable (USB-C)",
      material: "TPE / ABS",
    },
    {
      name: "Warming Stroker Cup",
      description: "Sleeve with a built-in warming function.",
      priceCents: 4200,
      powerSource: "Rechargeable (USB-C)",
      material: "TPE",
    },
    {
      name: "Portable Pocket Stroker",
      description: "Compact, discreet sleeve for travel.",
      priceCents: 2800,
      material: "TPE",
    },
    {
      name: "App-Controlled Masturbator",
      description: "Interactive device syncable with compatible content.",
      priceCents: 11900,
      powerSource: "Rechargeable (USB-C)",
      material: "TPE / ABS",
    },
    {
      name: "Realistic Stroker with Suction Base",
      description: "Hands-free sleeve that mounts to flat surfaces.",
      priceCents: 3800,
      material: "TPE",
    },
    {
      name: "Dual-Entry Stroker",
      description: "Two internal textures in one discreet case.",
      priceCents: 4600,
      material: "TPE",
    },
    {
      name: "Heating & Vibrating Masturbator",
      description: "Combined warmth and vibration functions.",
      priceCents: 8900,
      powerSource: "Rechargeable (USB-C)",
      material: "TPE / ABS",
    },
  ],
  "glass-toys": [
    {
      name: "Hand-Blown Glass Wand",
      description: "Smooth borosilicate glass wand, temperature-play safe.",
      priceCents: 4400,
      material: "Borosilicate glass",
    },
    {
      name: "Ribbed Glass Plug Set",
      description: "Two ribbed glass plugs in graduated sizes.",
      priceCents: 3800,
      material: "Borosilicate glass",
    },
    {
      name: "Spiral Glass Dildo",
      description: "Hand-blown spiral design for varied internal texture.",
      priceCents: 4800,
      material: "Borosilicate glass",
    },
    {
      name: "Weighted Glass Egg Set",
      description: "Three weighted glass eggs for internal training.",
      priceCents: 3600,
      material: "Borosilicate glass",
    },
    {
      name: "Color-Swirl Glass Plug",
      description: "Decorative swirl-pattern plug, temperature-play safe.",
      priceCents: 3400,
      material: "Borosilicate glass",
    },
    {
      name: "Glass Wand with Textured Tip",
      description: "Ridged tip for targeted pressure.",
      priceCents: 4200,
      material: "Borosilicate glass",
    },
    {
      name: "Frosted Glass Plug",
      description: "Matte-finish plug with a smooth interior polish.",
      priceCents: 3600,
      material: "Borosilicate glass",
    },
    {
      name: "Glass Massage Wand Set (2-Piece)",
      description: "Two wands in different curves.",
      priceCents: 5400,
      material: "Borosilicate glass",
    },
  ],
  dildos: [
    {
      name: "Classic Silicone Dildo",
      description: "Body-safe platinum silicone, firm core with a soft outer layer.",
      priceCents: 4500,
      material: "Platinum silicone",
      powerSource: "Manual",
      featured: true,
    },
    {
      name: "Realistic Dual-Density Dildo",
      description: "Firm core, soft outer layer for a lifelike feel, suction base.",
      priceCents: 5200,
      material: "Silicone",
    },
    {
      name: "Curved G-Spot Dildo",
      description: "Gently curved tip for targeted internal pressure.",
      priceCents: 4200,
      material: "Silicone",
    },
    {
      name: "Ribbed Silicone Dildo",
      description: "Textured ridges along the full shaft.",
      priceCents: 4000,
      material: "Silicone",
    },
    {
      name: "Beginner-Friendly Slim Dildo",
      description: "Slim profile with a soft flared base.",
      priceCents: 3200,
      material: "Silicone",
    },
    {
      name: "Double-Ended Dildo",
      description: "Dual-tip design for shared or solo use.",
      priceCents: 5800,
      material: "Silicone",
    },
    {
      name: "Suction Cup Base Dildo",
      description: "Strong suction base for hands-free play.",
      priceCents: 4400,
      material: "Silicone",
    },
    {
      name: "Compact Beginner Dildo",
      description: "Short, slim profile for first-time users.",
      priceCents: 2800,
      material: "Silicone",
    },
  ],
  "cock-rings": [
    {
      name: "Vibrating Silicone Cock Ring",
      description: "Stretchy ring with a built-in bullet vibrator.",
      priceCents: 2200,
      powerSource: "Battery (replaceable)",
      material: "Silicone",
    },
    {
      name: "Adjustable Snap Ring Set (3-Pack)",
      description: "Three adjustable snap rings in graduated tension.",
      priceCents: 1800,
      material: "Silicone",
    },
    {
      name: "Dual Motor Vibrating Ring",
      description: "Ring with separate motors for extra and partner stimulation.",
      priceCents: 2600,
      powerSource: "Battery (replaceable)",
      material: "Silicone",
    },
    {
      name: "Leather Cock Ring",
      description: "Adjustable snap-leather ring, classic style.",
      priceCents: 1600,
      material: "Leather",
    },
    {
      name: "Stainless Steel Cock Ring Set",
      description: "Three weighted steel rings in graduated sizes.",
      priceCents: 3400,
      material: "Stainless steel",
    },
    {
      name: "Textured Silicone Ring Trio",
      description: "Three ribbed rings in graduated tension.",
      priceCents: 2000,
      material: "Silicone",
    },
    {
      name: "Weighted Cock & Ball Ring",
      description: "Combined ring with a detachable weight.",
      priceCents: 2600,
      material: "Stainless steel",
    },
    {
      name: "Vibrating Couples Ring",
      description: "Dual-motor ring designed for shared stimulation.",
      priceCents: 3200,
      powerSource: "Battery (replaceable)",
      material: "Silicone",
    },
  ],
  "fucking-machines": [
    {
      name: "Compact Thrusting Machine",
      description: "Variable-speed thrusting machine with interchangeable attachments.",
      priceCents: 24900,
      powerSource: "Corded (mains)",
      material: "ABS / silicone",
    },
    {
      name: "Portable Thrusting Machine",
      description: "Travel-sized machine with a rechargeable battery pack.",
      priceCents: 15900,
      powerSource: "Rechargeable (USB-C)",
      material: "ABS / silicone",
    },
    {
      name: "Silent Thrusting Machine",
      description: "Whisper-quiet motor with variable speed control.",
      priceCents: 27900,
      powerSource: "Corded (mains)",
      material: "ABS / silicone",
    },
    {
      name: "Travel Thrusting Machine",
      description: "Lightweight, battery-powered thrusting unit.",
      priceCents: 13900,
      powerSource: "Rechargeable (USB-C)",
      material: "ABS / silicone",
    },
    {
      name: "Pro Thrusting Machine with Attachments",
      description: "Includes three interchangeable attachments.",
      priceCents: 32900,
      powerSource: "Corded (mains)",
      material: "ABS / silicone",
    },
    {
      name: "Tabletop Thrusting Machine",
      description: "Compact countertop-mounted unit.",
      priceCents: 18900,
      powerSource: "Corded (mains)",
      material: "ABS / silicone",
    },
    {
      name: "Multi-Angle Thrusting Machine",
      description: "Adjustable mounting angle for varied positions.",
      priceCents: 28900,
      powerSource: "Corded (mains)",
      material: "ABS / silicone",
    },
    {
      name: "Budget Thrusting Machine",
      description: "Entry-level variable-speed unit.",
      priceCents: 11900,
      powerSource: "Rechargeable (USB-C)",
      material: "ABS / silicone",
    },
  ],
  "cock-cages": [
    {
      name: "Silicone Cock Cage",
      description: "Flexible, comfortable cage with an integrated lock ring.",
      priceCents: 3200,
      material: "Silicone",
    },
    {
      name: "Polished Steel Cock Cage",
      description: "Durable steel cage with three interchangeable ring sizes.",
      priceCents: 4800,
      material: "Stainless steel",
    },
    {
      name: "Micro Cock Cage",
      description: "Compact design for maximum restriction.",
      priceCents: 3600,
      material: "Stainless steel",
    },
    {
      name: "Breathable Mesh Cock Cage",
      description: "Perforated design for extended comfortable wear.",
      priceCents: 2900,
      material: "Silicone",
    },
    {
      name: "Locking Titanium Cock Cage",
      description: "Lightweight titanium cage with a discreet lock.",
      priceCents: 6400,
      material: "Titanium",
    },
    {
      name: "Spiked Chastity Cage",
      description: "Cage with blunted internal spikes for heightened awareness.",
      priceCents: 5400,
      material: "Stainless steel",
    },
    {
      name: "Extended Wear Silicone Cage",
      description: "Breathable design for multi-day comfort.",
      priceCents: 3800,
      material: "Silicone",
    },
    {
      name: "Adjustable Ring Cage Set",
      description: "Cage with five interchangeable base rings.",
      priceCents: 5200,
      material: "Stainless steel",
    },
  ],
  "anal-toys": [
    {
      name: "Beginner Anal Plug Trainer Set",
      description: "Three graduated plugs for progressive, comfortable training.",
      priceCents: 3600,
      material: "Silicone",
    },
    {
      name: "Vibrating Anal Beads",
      description: "Graduated beads with a vibrating tip and pull-ring base.",
      priceCents: 3100,
      powerSource: "Battery (replaceable)",
      material: "Silicone",
    },
    {
      name: "Remote-Control Anal Plug",
      description: "Wireless remote with ten vibration patterns.",
      priceCents: 4400,
      powerSource: "Rechargeable (USB-C)",
      material: "Silicone",
    },
    {
      name: "Weighted Anal Training Set",
      description: "Three plugs with increasing weight and size.",
      priceCents: 4200,
      material: "Stainless steel",
    },
    {
      name: "Inflatable Anal Plug",
      description: "Hand-pump plug that inflates for gradual stretch.",
      priceCents: 3800,
      material: "Silicone",
    },
    {
      name: "Graduated Plug Set (4-Piece)",
      description: "Four sizes from beginner to advanced.",
      priceCents: 4800,
      material: "Silicone",
    },
    {
      name: "Curved Prostate Massager",
      description: "Ergonomic curve targeting the P-spot.",
      priceCents: 4200,
      material: "Silicone",
    },
    {
      name: "Glass Anal Beads",
      description: "Graduated beads in polished borosilicate glass.",
      priceCents: 3800,
      material: "Borosilicate glass",
    },
  ],
  "cosplay-clothing": [
    {
      name: "Latex Catsuit",
      description: "Full-coverage latex catsuit with a rear zip closure.",
      priceCents: 12900,
      material: "Latex",
      featured: true,
      tags: "Second-Skin Fit,Hand-Finished",
    },
    {
      name: "Vinyl Maid Costume Set",
      description: "Vinyl dress with matching cuffs and collar accents.",
      priceCents: 6800,
      material: "Vinyl",
    },
    {
      name: "Leather Harness Dress",
      description: "Fitted dress with an integrated body harness.",
      priceCents: 8400,
      material: "Vegan leather",
    },
    {
      name: "Schoolgirl Roleplay Set",
      description: "Pleated skirt, top, and tie in a classic cut.",
      priceCents: 5600,
      material: "Polyester",
    },
    {
      name: "Latex Bodysuit with Front Zip",
      description: "Full-body latex suit with a functional front zip.",
      priceCents: 13900,
      material: "Latex",
    },
    {
      name: "Nurse Roleplay Costume",
      description: "Fitted dress with matching accessories.",
      priceCents: 6200,
      material: "Polyester",
    },
    {
      name: "PVC Bodysuit",
      description: "Glossy PVC suit with a front zip.",
      priceCents: 9800,
      material: "PVC",
    },
    {
      name: "Fantasy Warrior Costume Set",
      description: "Strappy armor-inspired bodysuit set.",
      priceCents: 8800,
      material: "Vinyl / elastic",
    },
  ],
  "panties-harness": [
    {
      name: "O-Ring Panty Harness",
      description: "Adjustable harness panty with a functional O-ring.",
      priceCents: 2800,
      material: "Elastic / metal",
    },
    {
      name: "Strappy Body Harness Set",
      description: "Elastic body harness with adjustable straps and clips.",
      priceCents: 3200,
      material: "Elastic",
    },
    {
      name: "Cage Bra Harness",
      description: "Structured cage-style bra with adjustable straps.",
      priceCents: 3800,
      material: "Elastic / metal",
    },
    {
      name: "Garter Panty Harness Set",
      description: "Panty harness with attached garter straps.",
      priceCents: 3400,
      material: "Elastic / lace",
    },
    {
      name: "Full-Body Cage Harness",
      description: "Elastic straps crossing torso, hips, and thighs.",
      priceCents: 4600,
      material: "Elastic",
    },
    {
      name: "Double Strap Panty Harness",
      description: "Reinforced double straps for a secure fit.",
      priceCents: 3200,
      material: "Elastic",
    },
    {
      name: "Lace-Trimmed O-Ring Panty",
      description: "O-ring panty finished with delicate lace trim.",
      priceCents: 2600,
      material: "Lace / elastic",
    },
    {
      name: "Adjustable Waist Harness",
      description: "Wide waist harness with multiple attachment points.",
      priceCents: 3800,
      material: "Elastic / metal",
    },
  ],
  lingerie: [
    {
      name: "Lace Bodysuit",
      description: "Sheer lace bodysuit with a plunging back and snap closure.",
      priceCents: 4200,
      material: "Lace / spandex",
    },
    {
      name: "Sheer Babydoll Set",
      description: "Flowing sheer babydoll with a matching G-string.",
      priceCents: 3600,
      material: "Chiffon",
    },
    {
      name: "Strappy Bralette Set",
      description: "Minimal strappy bra and panty set.",
      priceCents: 3400,
      material: "Elastic / lace",
    },
    {
      name: "Sheer Robe with Lace Trim",
      description: "Flowing sheer robe with delicate lace edging.",
      priceCents: 3800,
      material: "Chiffon / lace",
    },
    {
      name: "Corset & Garter Set",
      description: "Structured corset with attached garter straps.",
      priceCents: 5800,
      material: "Satin / boning",
    },
    {
      name: "Mesh Teddy",
      description: "Sheer mesh teddy with adjustable straps.",
      priceCents: 3600,
      material: "Mesh",
    },
    {
      name: "Satin Slip Dress",
      description: "Classic satin slip with lace trim.",
      priceCents: 4400,
      material: "Satin / lace",
    },
    {
      name: "Fishnet Bodystocking",
      description: "Full-body fishnet with an open crotch design.",
      priceCents: 2800,
      material: "Nylon mesh",
    },
  ],
};

async function main() {
  for (const [ti, top] of TAXONOMY.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: top.slug },
      update: { name: top.name, description: top.description, sortOrder: ti },
      create: { name: top.name, slug: top.slug, description: top.description, sortOrder: ti },
    });

    for (const [ci, child] of (top.children ?? []).entries()) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id, sortOrder: ci },
        create: { name: child.name, slug: child.slug, parentId: parent.id, sortOrder: ci },
      });
    }
  }

  for (const [categorySlug, products] of Object.entries(PRODUCTS_BY_SUBCATEGORY)) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
    const audience = SUBCATEGORY_AUDIENCE[categorySlug] ?? "all";
    const skuPrefix = categorySlug
      .split("-")
      .map((w) => w.slice(0, 2))
      .join("")
      .toUpperCase()
      .slice(0, 6);

    for (const [i, p] of products.entries()) {
      const slug = slugify(p.name);
      const sku = `${skuPrefix}-${String(i + 1).padStart(3, "0")}`;
      await prisma.product.upsert({
        where: { slug },
        update: { ...p, slug, sku, categoryId: category.id, audience },
        create: { ...p, slug, sku, categoryId: category.id, audience },
      });
    }
  }

  // Genuinely free-to-use photos (Unsplash License — free for commercial
  // use, no attribution required), matched to the handful of sub-categories
  // where real, non-explicit stock photography plausibly exists. Everything
  // else keeps its generated gradient placeholder — see README.
  const STOCK_IMAGES: { slug: string; file: string; alt: string }[] = [
    { slug: "rope-leash-with-handle", file: "stock-rope.jpg", alt: "Soft-touch rope leash" },
    { slug: "ostrich-feather-tickler", file: "stock-feather.jpg", alt: "Ostrich feather tickler" },
    { slug: "massage-wax-candle", file: "stock-candle.jpg", alt: "Massage wax candle" },
    { slug: "lace-bodysuit", file: "stock-lace.jpg", alt: "Lace fabric detail" },
    { slug: "leather-buckle-collar", file: "stock-leather.jpg", alt: "Leather buckle collar" },
  ];

  for (const img of STOCK_IMAGES) {
    const product = await prisma.product.findUnique({ where: { slug: img.slug } });
    if (!product) continue;
    const existing = await prisma.productImage.findFirst({
      where: { productId: product.id, url: `/uploads/${img.file}` },
    });
    if (existing) continue;
    await prisma.productImage.create({
      data: { productId: product.id, url: `/uploads/${img.file}`, alt: img.alt, sortOrder: 0 },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
