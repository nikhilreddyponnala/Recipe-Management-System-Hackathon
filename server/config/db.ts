import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface IIngredient {
  name: string;
  quantity: string;
}

export interface INutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IRecipe {
  _id: string;
  title: string;
  description: string;
  ingredients: IIngredient[];
  instructions: string[];
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Desserts' | 'Vegetarian';
  preparationTime: number; // in minutes
  cookingTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryTags: string[];
  imageUrl: string;
  author: string | { _id: string; name: string; email: string };
  nutrition?: INutrition;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFavorite {
  _id: string;
  user: string;
  recipe: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: IUser[];
  recipes: IRecipe[];
  favorites: IFavorite[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let inMemoryDb: DatabaseSchema = {
  users: [],
  recipes: [],
  favorites: [],
};

let isMongoConnected = false;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromDisk(): DatabaseSchema | null {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to read db.json:', error);
  }
  return null;
}

function saveToDisk() {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write db.json:', error);
  }
}

// Normalizes and stems words for resilient culinary searching
export function stemCulinaryWord(word: string): string {
  let w = word.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!w) return '';

  // Common plurals & suffix stripping
  if (w.endsWith('ies') && w.length > 4) {
    return w.slice(0, -3) + 'y'; // curries -> curry, berries -> berry
  }
  if (w.endsWith('es') && w.length > 4 && (w.endsWith('shes') || w.endsWith('ches') || w.endsWith('xes') || w.endsWith('ses'))) {
    return w.slice(0, -2); // dishes -> dish, sandwiches -> sandwich
  }
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) {
    return w.slice(0, -1); // burgers -> burger, tacos -> taco, pizzas -> pizza
  }
  if (w.endsWith('ing') && w.length > 5) {
    return w.slice(0, -3); // roasted -> roast, baking -> bak
  }
  return w;
}

export async function initDatabase() {
  ensureDataDirectory();

  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB via Mongoose:', mongoUri);
    } catch (err: any) {
      console.log('MongoDB server not reachable, switching seamlessly to persistent storage:', err.message);
      isMongoConnected = false;
    }
  }

  const existing = loadFromDisk();
  await seedDefaultData(existing);
}

async function seedDefaultData(existingDb: DatabaseSchema | null) {
  console.log('Seeding RecipeHub comprehensive culinary catalog...');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const userPasswordHash = await bcrypt.hash('user123', salt);
  const demoPasswordHash = await bcrypt.hash('demo123', salt);

  const adminId = 'user_admin_001';
  const sophiaId = 'user_sophia_002';
  const alexId = 'user_alex_003';

  const defaultUsers: IUser[] = [
    {
      _id: adminId,
      name: 'Chef Marcus Vance',
      email: 'admin@recipehub.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      createdAt: new Date('2026-01-15T10:00:00Z').toISOString(),
    },
    {
      _id: sophiaId,
      name: 'Sophia Laurent',
      email: 'sophia@recipehub.com',
      passwordHash: userPasswordHash,
      role: 'user',
      createdAt: new Date('2026-02-01T14:30:00Z').toISOString(),
    },
    {
      _id: alexId,
      name: 'Alex Chen',
      email: 'demo@recipehub.com',
      passwordHash: demoPasswordHash,
      role: 'user',
      createdAt: new Date('2026-02-10T09:15:00Z').toISOString(),
    },
  ];

  const defaultRecipes: IRecipe[] = [
    // 1. ROYAL HYDERABADI DUM BIRYANI
    {
      _id: 'recipe_hyderabadi_biryani_101',
      title: 'Royal Hyderabadi Chicken Dum Biryani',
      description: 'Slow-cooked royal Awadhi and Hyderabadi dum biryani layered with marinated tender chicken, fragrant aged basmati rice infused with saffron, kewra water, caramelized birista onions, mint, and toasted cashews.',
      ingredients: [
        { name: 'Aged long-grain basmati rice', quantity: '500g (soaked 30 mins)' },
        { name: 'Bone-in chicken thighs & drumsticks', quantity: '750g' },
        { name: 'Birista golden fried onions', quantity: '2 cups' },
        { name: 'Thick whole milk yogurt (dahi)', quantity: '1 cup' },
        { name: 'Kashmir saffron soaked in warm milk', quantity: '1 pinch in 1/4 cup milk' },
        { name: 'Pure desi ghee', quantity: '4 tbsp' },
        { name: 'Fresh mint and coriander leaves', quantity: '1 cup (chopped)' },
        { name: 'Biryani whole spices (shahi jeera, star anise, black cardamom, cloves)', quantity: '2 tbsp' },
        { name: 'Ginger-garlic paste', quantity: '2 tbsp' },
        { name: 'Boiled eggs and roasted cashews', quantity: 'For royal garnish' },
      ],
      instructions: [
        'Marinate chicken with thick yogurt, ginger-garlic paste, red chili, garam masala, half the fried onions, fresh mint, and 2 tbsp ghee for at least 1 hour.',
        'Parboil soaked basmati rice in plenty of salted water with whole spices until 70% cooked (about 6 minutes). Drain carefully.',
        'In a heavy-bottomed handi or Dutch oven, layer the marinated raw chicken at the bottom.',
        'Layer the 70% cooked aromatic rice over the chicken. Sprinkle chopped mint, fresh coriander, remaining golden fried onions, saffron-infused milk, and melted ghee.',
        'Seal the pot rim with dough or a tight foil lid. Cook on high heat for 10 minutes, then lower flame to minimum and cook on dum for 25 minutes.',
        'Rest unopened for 15 minutes. Gently fluff the multi-colored grains and serve steaming hot with chilled cucumber raita and mirchi ka salan.',
      ],
      category: 'Dinner',
      preparationTime: 30,
      cookingTime: 45,
      servings: 6,
      difficulty: 'Medium',
      dietaryTags: ['Indian Classic', 'High-Protein', 'Biryani', 'Halal', 'Spiced Rice'],
      imageUrl: '/src/assets/images/recipe_hyderabadi_dum_biryani_1791614814016.jpg',
      author: adminId,
      nutrition: { calories: 680, protein: 44, carbs: 72, fat: 24 },
      rating: 4.98,
      reviewsCount: 230,
      createdAt: new Date('2026-03-10T12:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T12:00:00Z').toISOString(),
    },

    // 2. MURGH MAKHANI BUTTER CHICKEN & GARLIC NAAN
    {
      _id: 'recipe_butter_chicken_102',
      title: 'Authentic Delhi Murgh Makhani (Butter Chicken) & Garlic Naan',
      description: 'Char-grilled tandoori chicken tikka simmered in a velvety, buttery sauce made with ripe plum tomatoes, cashew paste, aromatic kasuri methi (fenugreek leaves), and fresh cream, served with crisp butter garlic naan.',
      ingredients: [
        { name: 'Boneless chicken thighs', quantity: '600g (cut into bite-sized tikka)' },
        { name: 'Ripe vine plum tomatoes (pureed)', quantity: '600g' },
        { name: 'Unsalted butter (divided)', quantity: '4 tbsp' },
        { name: 'Heavy cooking cream', quantity: '1/2 cup' },
        { name: 'Raw cashew nut paste', quantity: '3 tbsp' },
        { name: 'Kashmiri red chili powder', quantity: '1.5 tbsp' },
        { name: 'Kasuri Methi (dried fenugreek leaves)', quantity: '1.5 tbsp (toasted and crushed)' },
        { name: 'Ginger-garlic paste', quantity: '2 tbsp' },
        { name: 'Garam masala & honey', quantity: '1 tsp / 1 tbsp' },
        { name: 'Fresh garlic butter naan bread', quantity: 'For serving' },
      ],
      instructions: [
        'Marinate chicken tikka with yogurt, lemon juice, chili powder, and ginger-garlic paste. Broil or sear in a smoking hot pan until lightly charred.',
        'In a heavy saucepan, melt 2 tbsp butter. Sauté ginger-garlic paste, then add fresh tomato puree and simmer for 15 minutes until oil separates.',
        'Blend sauce with soaked cashews until satin-smooth. Strain back into the pan for that signature velvety restaurant texture.',
        'Add remaining butter, heavy cream, honey, and Kashmiri chili. Slide in the charred chicken pieces and simmer gently for 8 minutes.',
        'Finish with crushed fragrant kasuri methi and garam masala. Swirl with extra cream and serve with hot charred garlic naan.',
      ],
      category: 'Dinner',
      preparationTime: 20,
      cookingTime: 30,
      servings: 4,
      difficulty: 'Medium',
      dietaryTags: ['Indian Classic', 'High-Protein', 'Curry', 'Butter Chicken', 'Comfort Food'],
      imageUrl: '/src/assets/images/recipe_murgh_butter_chicken_1791614837180.jpg',
      author: alexId,
      nutrition: { calories: 620, protein: 42, carbs: 26, fat: 38 },
      rating: 4.97,
      reviewsCount: 195,
      createdAt: new Date('2026-03-10T10:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T10:30:00Z').toISOString(),
    },

    // 3. SMASH CHEESEBURGER
    {
      _id: 'recipe_smash_cheeseburger_111',
      title: 'Crispy Double Smash Cheeseburger with Golden Fries',
      description: 'Two 100% prime beef patties smashed wafer-thin on a screaming-hot griddle for lace-crispy edges, double melted sharp American cheddar, crisp lettuce, ripe tomatoes, dill pickles, and secret tangy sauce on a butter-toasted brioche bun.',
      ingredients: [
        { name: 'Ground chuck beef (80/20 lean-to-fat)', quantity: '1 lb (divided into 4 balls)' },
        { name: 'Sharp American or cheddar cheese slices', quantity: '4 thick slices' },
        { name: 'Artisan brioche burger buns', quantity: '2 buns (halved)' },
        { name: 'Butterhead crisp lettuce', quantity: '4 leaves' },
        { name: 'Ripe beefsteak tomato', quantity: '1 large (sliced)' },
        { name: 'Dill pickle chips', quantity: '8 slices' },
        { name: 'Secret burger sauce (mayo, ketchup, sweet relish, paprika)', quantity: '4 tbsp' },
        { name: 'Golden french fries', quantity: 'For serving' },
      ],
      instructions: [
        'Preheat a heavy cast-iron skillet or griddle until smoking hot.',
        'Butter the brioche buns and toast on the griddle until golden and crisp. Set aside.',
        'Place loosely shaped beef balls on the dry hot surface. Smash wafer-thin using a heavy flat press to create caramelized crispy lace edges.',
        'Season generously with coarse salt and black pepper. Cook undisturbed for 2 minutes.',
        'Scrape firmly underneath each patty to flip. Immediately drape with cheese and stack patties two high.',
        'Slather secret sauce on both bun halves, layer lettuce, tomato, pickles, the double cheeseburger stack, and serve hot with crispy fries.',
      ],
      category: 'Dinner',
      preparationTime: 15,
      cookingTime: 8,
      servings: 2,
      difficulty: 'Easy',
      dietaryTags: ['Burger', 'Comfort Food', 'High-Protein', 'American Classic', 'Fries'],
      imageUrl: '/src/assets/images/recipe_smash_cheeseburger_1791614086092.jpg',
      author: adminId,
      nutrition: { calories: 740, protein: 44, carbs: 42, fat: 46 },
      rating: 4.96,
      reviewsCount: 182,
      createdAt: new Date('2026-03-09T17:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-09T17:00:00Z').toISOString(),
    },

    // 4. BIRRIA TACOS
    {
      _id: 'recipe_birria_tacos_112',
      title: 'Slow-Braised Beef Birria Quesatacos with Dipping Consomé',
      description: 'Melt-in-your-mouth beef braised for hours in rich guajillo and ancho chile adobo, folded inside chile-dipped corn tortillas with melted Oaxaca cheese, fried crispy, and served with cilantro, onions, lime, and rich hot consommé broth.',
      ingredients: [
        { name: 'Beef chuck roast & short ribs', quantity: '3 lbs (cut into chunks)' },
        { name: 'Dried Guajillo & Ancho chiles', quantity: '6 guajillo / 3 ancho' },
        { name: 'White corn tortillas', quantity: '12 tortillas' },
        { name: 'Oaxaca cheese or Monterey Jack (shredded)', quantity: '2.5 cups' },
        { name: 'Diced white onion & fresh cilantro', quantity: '1 cup each' },
        { name: 'Fresh limes', quantity: '3 whole (wedged)' },
        { name: 'Garlic, Mexican oregano, cumin, clove, bone broth', quantity: 'For adobo consommé' },
      ],
      instructions: [
        'Sear seasoned beef in a Dutch oven until browned on all sides. Remove beef.',
        'Toast dried chiles, then simmer with onions, garlic, spices, and broth. Blend until satin-smooth.',
        'Return beef to pot, pour over the red chile adobo, cover, and braise on low for 3.5 hours until fork-tender.',
        'Shred beef and skim the fragrant reddish chili fat from top of the broth into a shallow bowl.',
        'Dip corn tortillas in the chili fat, place on hot skillet, cover with shredded cheese and juicy beef.',
        'Fold in half and griddle until golden and crisp. Serve piping hot with chopped onions, cilantro, and warm dipping consommé.',
      ],
      category: 'Dinner',
      preparationTime: 25,
      cookingTime: 180,
      servings: 4,
      difficulty: 'Medium',
      dietaryTags: ['Mexican Street Food', 'Tacos', 'High-Protein', 'Gluten-Free'],
      imageUrl: '/src/assets/images/recipe_birria_beef_tacos_1791614101663.jpg',
      author: alexId,
      nutrition: { calories: 650, protein: 46, carbs: 32, fat: 38 },
      rating: 4.96,
      reviewsCount: 154,
      createdAt: new Date('2026-03-09T15:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-09T15:30:00Z').toISOString(),
    },

    // 5. TOKYO RAMEN / NOODLES
    {
      _id: 'recipe_tokyo_ramen_113',
      title: 'Traditional Tokyo Shoyu Ramen with Chashu Pork & Jammy Egg',
      description: 'Springy hand-pulled wavy ramen noodles in an unctuous 12-hour dashi and pork broth flavored with aged shoyu tare, topped with melt-in-mouth rolled chashu pork belly, a jammy marinated soft-boiled egg, scallions, menma, and toasted nori.',
      ingredients: [
        { name: 'Fresh Japanese wavy ramen noodles', quantity: '400g' },
        { name: 'Braised rolled chashu pork belly slices', quantity: '8 slices' },
        { name: 'Ajitsuke Tamago (marinated soft eggs)', quantity: '2 eggs (halved)' },
        { name: 'Rich dashi and pork bone broth', quantity: '6 cups' },
        { name: 'Shoyu tare seasoning (soy, mirin, sake, kombu)', quantity: '1/2 cup' },
        { name: 'Menma seasoned bamboo shoots', quantity: '1/2 cup' },
        { name: 'Fresh scallions & toasted nori squares', quantity: 'For topping' },
      ],
      instructions: [
        'Bring the dashi broth to a rolling simmer. In deep ramen bowls, ladle 2 tbsp shoyu tare and aromatic oil.',
        'Boil fresh ramen noodles for exactly 90 seconds until chewy and springy. Shake dry thoroughly.',
        'Pour hot broth into the bowls, whisk with tare, and fold noodles neatly into the broth.',
        'Top each bowl with two slices of seared chashu pork and half a jammy ajitsuke tamago egg.',
        'Garnish with sliced scallions, menma bamboo shoots, sesame seeds, and tuck a sheet of nori by the rim.',
      ],
      category: 'Dinner',
      preparationTime: 30,
      cookingTime: 25,
      servings: 4,
      difficulty: 'Medium',
      dietaryTags: ['Japanese Classic', 'Ramen', 'Noodles', 'Noodle Soup', 'Comfort Food'],
      imageUrl: '/src/assets/images/recipe_japanese_miso_ramen_1791614118072.jpg',
      author: sophiaId,
      nutrition: { calories: 610, protein: 34, carbs: 68, fat: 22 },
      rating: 4.94,
      reviewsCount: 140,
      createdAt: new Date('2026-03-09T14:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-09T14:00:00Z').toISOString(),
    },

    // 6. HAWAIIAN SALMON POKE BOWL
    {
      _id: 'recipe_salmon_poke_bowl_114',
      title: 'Hawaiian Fresh Salmon Poke Bowl with Sliced Avocado',
      description: 'Sashimi-grade Atlantic salmon cubes tossed in a toasted sesame, tamari, and ginger marinade, served over warm seasoned sushi rice with Hass avocado, shelled edamame, wakame seaweed salad, shaved radishes, cucumber ribbons, and furikake.',
      ingredients: [
        { name: 'Sashimi-grade fresh Atlantic salmon', quantity: '1 lb (diced into cubes)' },
        { name: 'Cooked short-grain sushi rice', quantity: '3 cups' },
        { name: 'Ripe Hass avocado', quantity: '1 large (diced)' },
        { name: 'Shelled edamame beans (steamed)', quantity: '1 cup' },
        { name: 'English cucumber & radishes', quantity: '1 cup (sliced)' },
        { name: 'Wakame seaweed salad', quantity: '1/2 cup' },
        { name: 'Poke dressing (tamari, sesame oil, rice vinegar, ginger)', quantity: '3 tbsp' },
        { name: 'Toasted sesame seeds & furikake', quantity: 'For garnish' },
      ],
      instructions: [
        'Toss diced fresh salmon cubes with poke dressing and scallions in a chilled glass bowl. Marinate 10 mins.',
        'Divide warm sushi rice into four wide ceramic bowls.',
        'Arrange marinated salmon, creamy avocado, edamame, cucumber ribbons, radishes, and seaweed salad in vibrant sections over the rice.',
        'Drizzle with extra sesame oil and a touch of spicy sriracha mayo.',
        'Sprinkle with toasted sesame seeds and furikake seasoning. Serve fresh immediately.',
      ],
      category: 'Lunch',
      preparationTime: 20,
      cookingTime: 0,
      servings: 4,
      difficulty: 'Easy',
      dietaryTags: ['Pescatarian', 'Salmon', 'Poke Bowl', 'High-Protein', 'Healthy Bowl', 'Gluten-Free Option'],
      imageUrl: '/src/assets/images/recipe_fresh_salmon_poke_bowl_1791614130858.jpg',
      author: alexId,
      nutrition: { calories: 510, protein: 36, carbs: 48, fat: 19 },
      rating: 4.93,
      reviewsCount: 118,
      createdAt: new Date('2026-03-09T12:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-09T12:00:00Z').toISOString(),
    },

    // 7. NEAPOLITAN MARGHERITA PIZZA
    {
      _id: 'recipe_margherita_pizza_107',
      title: 'Wood-Fired Neapolitan Margherita Pizza',
      description: 'Artisan Neapolitan pizza featuring naturally leavened slow-fermented dough, sweet San Marzano D.O.P. tomato sauce, melted fresh buffalo mozzarella pearls, and fragrant Genovese basil leaves with charred leopard-spotted crust.',
      ingredients: [
        { name: 'Tipo 00 Wheat Flour', quantity: '500g' },
        { name: 'Filtered lukewarm water', quantity: '325ml' },
        { name: 'San Marzano D.O.P. tomatoes', quantity: '1 can (crushed by hand)' },
        { name: 'Fresh Buffalo Mozzarella', quantity: '250g (torn into chunks)' },
        { name: 'Fresh Genovese basil leaves', quantity: '12 whole leaves' },
        { name: 'Extra virgin olive oil & sea salt', quantity: '2 tbsp / 15g' },
        { name: 'Active dry yeast', quantity: '1.5g' },
      ],
      instructions: [
        'Knead dough until smooth and proof in refrigerator for 24-48 hours. Bring to room temp 3 hours before baking.',
        'Gently stretch dough on a semolina-dusted counter, preserving the airy outer crust ring.',
        'Spoon 3 tablespoons of hand-crushed tomatoes evenly over the center.',
        'Distribute torn fresh buffalo mozzarella evenly across the sauce.',
        'Slide onto a smoking hot baking steel or pizza oven preheated to 500°F (260°C). Bake until crust is blistered and cheese bubbles (about 5-7 minutes).',
        'Top immediately with fresh basil leaves and a swirl of virgin olive oil before slicing.',
      ],
      category: 'Dinner',
      preparationTime: 25,
      cookingTime: 7,
      servings: 4,
      difficulty: 'Medium',
      dietaryTags: ['Vegetarian', 'Italian Classic', 'Pizza', 'Wood-Fired'],
      imageUrl: '/src/assets/images/recipe_neapolitan_margherita_pizza_1791612155925.jpg',
      author: adminId,
      nutrition: { calories: 640, protein: 24, carbs: 78, fat: 22 },
      rating: 4.95,
      reviewsCount: 165,
      createdAt: new Date('2026-03-08T18:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-08T18:00:00Z').toISOString(),
    },

    // 8. HERB-ROASTED FARMHOUSE CHICKEN
    {
      _id: 'recipe_roasted_chicken_108',
      title: 'Skillet Herb-Roasted Farmhouse Chicken & Garlic Potatoes',
      description: 'Crisp golden-skinned whole roast chicken seasoned with smoked paprika, rosemary butter, and cracked pepper, nestled over caramelized Yukon gold potatoes and sweet slow-roasted garlic cloves.',
      ingredients: [
        { name: 'Whole pasture-raised chicken', quantity: '3.5 lbs (1.6 kg)' },
        { name: 'Baby Yukon gold potatoes', quantity: '1.5 lbs (halved)' },
        { name: 'Whole heads of garlic', quantity: '2 heads (halved horizontally)' },
        { name: 'Unsalted butter & fresh rosemary sprigs', quantity: '4 tbsp / 4 sprigs' },
        { name: 'Organic lemon & smoked paprika', quantity: '1 whole / 1 tsp' },
        { name: 'Flaky sea salt & black pepper', quantity: 'To taste' },
      ],
      instructions: [
        'Preheat oven to 425°F (220°C). Pat chicken completely dry with paper towels for crispy skin.',
        'Rub seasoned rosemary butter generously under and over the chicken skin.',
        'Stuff cavity with halved lemon and rosemary sprigs. Truss legs with kitchen twine.',
        'Toss baby potatoes with olive oil and arrange in the bottom of a 12-inch cast iron skillet along with halved garlic.',
        'Place chicken breast-side up on the potatoes and roast for 55 minutes until golden and 165°F (74°C).',
        'Rest for 15 minutes before carving. Serve with caramelized garlic schmaltz potatoes.',
      ],
      category: 'Dinner',
      preparationTime: 20,
      cookingTime: 55,
      servings: 4,
      difficulty: 'Medium',
      dietaryTags: ['Chicken', 'Gluten-Free', 'High-Protein', 'Farm-to-Table', 'Roast'],
      imageUrl: '/src/assets/images/recipe_roasted_herb_chicken_1791612167649.jpg',
      author: adminId,
      nutrition: { calories: 580, protein: 48, carbs: 28, fat: 31 },
      rating: 4.92,
      reviewsCount: 110,
      createdAt: new Date('2026-03-08T12:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-08T12:00:00Z').toISOString(),
    },

    // 9. THAI GREEN COCONUT CURRY
    {
      _id: 'recipe_thai_green_curry_109',
      title: 'Authentic Thai Green Coconut Curry with Jasmine Rice',
      description: 'Fragrant aromatic curry simmered in rich coconut cream infused with fresh green chili paste, lemongrass, galangal, kaffir lime leaves, tender chicken strips, and Thai basil, served alongside steaming fragrant jasmine rice.',
      ingredients: [
        { name: 'Chicken breast or thighs', quantity: '450g (thinly sliced)' },
        { name: 'Authentic Thai green curry paste', quantity: '3 tbsp' },
        { name: 'Pure coconut milk & coconut cream', quantity: '1 can (400ml)' },
        { name: 'Thai eggplants or zucchini', quantity: '1 cup (quartered)' },
        { name: 'Bamboo shoots & kaffir lime leaves', quantity: '1/2 cup / 4 leaves' },
        { name: 'Thai fish sauce & palm sugar', quantity: '2 tbsp / 1 tbsp' },
        { name: 'Fresh Thai sweet basil leaves & jasmine rice', quantity: '1 cup / for serving' },
      ],
      instructions: [
        'Spoon thick coconut cream into a wok over medium-high heat. Fry for 3 minutes until oil cracks.',
        'Stir-fry green curry paste in coconut oil for 2 minutes until intensely fragrant and bright emerald.',
        'Add sliced chicken and toss to coat for 3 minutes.',
        'Pour in remaining coconut milk, stock, and bruised kaffir lime leaves. Simmer 8 minutes with vegetables.',
        'Season with fish sauce and palm sugar, fold in sweet basil, and serve hot with jasmine rice.',
      ],
      category: 'Lunch',
      preparationTime: 15,
      cookingTime: 20,
      servings: 4,
      difficulty: 'Easy',
      dietaryTags: ['Curry', 'Thai Cuisine', 'Dairy-Free', 'Gluten-Free', 'Spicy'],
      imageUrl: '/src/assets/images/recipe_thai_green_coconut_curry_1791612179711.jpg',
      author: alexId,
      nutrition: { calories: 490, protein: 32, carbs: 36, fat: 24 },
      rating: 4.88,
      reviewsCount: 92,
      createdAt: new Date('2026-03-07T14:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-07T14:30:00Z').toISOString(),
    },

    // 10. LEMON RICOTTA PANCAKES
    {
      _id: 'recipe_ricotta_pancakes_110',
      title: 'Cloud-Fluffy Lemon Ricotta Pancakes with Fresh Strawberries',
      description: 'Ultra-light soufflé-style ricotta buttermilk pancakes infused with fresh Meyer lemon zest, topped with macerated wild strawberries, whipped vanilla mascarpone, and warm organic maple syrup.',
      ingredients: [
        { name: 'Whole milk ricotta cheese', quantity: '1 cup' },
        { name: 'All-purpose flour & buttermilk', quantity: '1.5 cups / 3/4 cup' },
        { name: 'Farm-fresh eggs (separated)', quantity: '3 large' },
        { name: 'Fresh Meyer lemon zest & juice', quantity: '1 lemon' },
        { name: 'Pure vanilla bean paste & baking powder', quantity: '1 tsp / 2 tsp' },
        { name: 'Fresh ripe strawberries & pure maple syrup', quantity: '2 cups / for serving' },
      ],
      instructions: [
        'Whisk ricotta, egg yolks, buttermilk, lemon zest, juice, and vanilla until smooth.',
        'In a clean bowl, whip egg whites with sugar until stiff, glossy peaks form.',
        'Fold dry ingredients into the ricotta base, then gently fold whipped egg whites in two batches.',
        'Cook 1/3 cup scoops on a buttered griddle over medium-low heat for 3-4 mins per side until golden.',
        'Stack tall, crown with fresh sliced strawberries, whipped cream, and warm maple syrup.',
      ],
      category: 'Breakfast',
      preparationTime: 15,
      cookingTime: 10,
      servings: 4,
      difficulty: 'Easy',
      dietaryTags: ['Vegetarian', 'Pancakes', 'Brunch Favorite', 'Sweet Breakfast'],
      imageUrl: '/src/assets/images/recipe_ricotta_strawberry_pancakes_1791612189367.jpg',
      author: sophiaId,
      nutrition: { calories: 390, protein: 16, carbs: 54, fat: 12 },
      rating: 4.96,
      reviewsCount: 122,
      createdAt: new Date('2026-03-06T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-06T09:00:00Z').toISOString(),
    },

    // 11. CREAMY TUSCAN FETTUCCINE PASTA
    {
      _id: 'recipe_tuscan_pasta_101',
      title: 'Creamy Tuscan Sun-Dried Tomato Fettuccine Pasta',
      description: 'Silky egg fettuccine tossed in a rich garlic cream sauce with sweet sun-dried tomatoes, tender baby spinach, and aged Parmigiano-Reggiano.',
      ingredients: [
        { name: 'Egg Fettuccine Pasta', quantity: '350g' },
        { name: 'Sun-dried tomatoes in oil', quantity: '1/2 cup (chopped)' },
        { name: 'Fresh baby spinach', quantity: '3 cups' },
        { name: 'Heavy cooking cream', quantity: '1 cup' },
        { name: 'Fresh garlic cloves', quantity: '4 cloves (minced)' },
        { name: 'Parmigiano-Reggiano', quantity: '1/2 cup (freshly grated)' },
        { name: 'Extra virgin olive oil & fresh basil', quantity: 'For cooking and garnish' },
      ],
      instructions: [
        'Boil fettuccine in salted water until al dente, reserving 1/2 cup pasta water.',
        'Sauté garlic and chopped sun-dried tomatoes in olive oil for 2 minutes.',
        'Pour in heavy cream, bring to gentle simmer, and stir in grated Parmigiano until silky.',
        'Fold in baby spinach until gently wilted.',
        'Toss pasta in the sauce with a splash of reserved water. Garnish with cracked pepper and basil.',
      ],
      category: 'Dinner',
      preparationTime: 10,
      cookingTime: 15,
      servings: 4,
      difficulty: 'Easy',
      dietaryTags: ['Vegetarian', 'Pasta', 'Italian Cuisine', 'Comfort Food', 'Creamy'],
      imageUrl: '/src/assets/images/recipe_creamy_tuscan_pasta_1791610418707.jpg',
      author: adminId,
      nutrition: { calories: 560, protein: 18, carbs: 62, fat: 28 },
      rating: 4.89,
      reviewsCount: 104,
      createdAt: new Date('2026-03-01T12:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-01T12:00:00Z').toISOString(),
    },

    // 12. TRIPLE-DECKER CLUB SANDWICH & FRIES
    {
      _id: 'recipe_club_sandwich_115',
      title: 'Artisan Triple-Decker Club Sandwich with Crispy Fries',
      description: 'Classic bistro triple-decker toasted sourdough sandwich layered with sliced roast turkey, crispy applewood smoked bacon, aged cheddar, ripe beefsteak tomatoes, butterhead lettuce, and garlic aioli, served with hot golden seasoned french fries.',
      ingredients: [
        { name: 'Artisan sourdough sandwich bread', quantity: '6 slices (toasted)' },
        { name: 'Smoked turkey breast (thinly sliced)', quantity: '300g' },
        { name: 'Applewood smoked crispy bacon', quantity: '8 strips' },
        { name: 'Sharp cheddar cheese slices', quantity: '4 slices' },
        { name: 'Vine ripe tomatoes & crisp lettuce', quantity: '2 tomatoes / 6 leaves' },
        { name: 'Roasted garlic aioli or mayonnaise', quantity: '4 tbsp' },
        { name: 'Golden crispy french fries', quantity: 'For serving' },
      ],
      instructions: [
        'Lightly toast sourdough slices until golden and crisp. Spread each slice with garlic aioli.',
        'On the first slice, layer lettuce, ripe tomato slices, and smoked turkey.',
        'Add the middle bread slice, then layer with crispy bacon, melted cheddar cheese, and extra lettuce.',
        'Top with the third bread slice. Insert wooden cocktail picks to secure.',
        'Cut diagonally into clean triangular halves. Serve with a basket of piping hot seasoned french fries.',
      ],
      category: 'Lunch',
      preparationTime: 15,
      cookingTime: 5,
      servings: 2,
      difficulty: 'Easy',
      dietaryTags: ['Sandwich', 'Bacon', 'High-Protein', 'Lunch Classic', 'Fries'],
      imageUrl: '/src/assets/images/recipe_crispy_club_sandwich_1791614850697.jpg',
      author: sophiaId,
      nutrition: { calories: 660, protein: 38, carbs: 52, fat: 34 },
      rating: 4.95,
      reviewsCount: 136,
      createdAt: new Date('2026-03-10T11:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T11:00:00Z').toISOString(),
    },

    // 13. MEDITERRANEAN GREEK SALAD WITH FETA
    {
      _id: 'recipe_greek_salad_116',
      title: 'Traditional Mediterranean Greek Village Salad with Feta',
      description: 'Crisp rustic Horiatiki salad with ripe summer vine tomatoes, Persian cucumbers, Kalamata olives, thinly sliced red onion, wild mountain oregano, cold-pressed Greek olive oil, and a generous slab of authentic barrel-aged sheep milk feta cheese.',
      ingredients: [
        { name: 'Ripe vine-ripened tomatoes', quantity: '4 large (cut into wedges)' },
        { name: 'Crisp Persian or English cucumbers', quantity: '2 medium (sliced thick)' },
        { name: 'Authentic Greek Feta cheese', quantity: '200g (slab or cubed)' },
        { name: 'Kalamata olives (pitted)', quantity: '1/2 cup' },
        { name: 'Red onion', quantity: '1 small (thinly sliced into rings)' },
        { name: 'Cold-pressed extra virgin Greek olive oil', quantity: '4 tbsp' },
        { name: 'Red wine vinegar & dried wild oregano', quantity: '1 tbsp / 1.5 tsp' },
        { name: 'Sea salt flakes & caper berries', quantity: 'To taste' },
      ],
      instructions: [
        'In a shallow ceramic salad bowl, combine tomato wedges, sliced cucumber, red onion rings, and Kalamata olives.',
        'Drizzle generously with extra virgin olive oil and red wine vinegar.',
        'Season with flaky sea salt and gently toss once with wooden spoons.',
        'Place the thick block of Greek feta cheese directly on top of the vibrant salad.',
        'Drizzle extra olive oil over the feta, sprinkle with wild dried oregano, and serve with crusty sourdough bread.',
      ],
      category: 'Lunch',
      preparationTime: 12,
      cookingTime: 0,
      servings: 4,
      difficulty: 'Easy',
      dietaryTags: ['Vegetarian', 'Salad', 'Greek Classic', 'Gluten-Free', 'Low Carb', 'Mediterranean'],
      imageUrl: '/src/assets/images/recipe_greek_salad_feta_1791614876200.jpg',
      author: sophiaId,
      nutrition: { calories: 290, protein: 11, carbs: 14, fat: 22 },
      rating: 4.94,
      reviewsCount: 115,
      createdAt: new Date('2026-03-10T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T09:30:00Z').toISOString(),
    },

    // 14. CLASSIC ITALIAN TIRAMISU
    {
      _id: 'recipe_italian_tiramisu_117',
      title: 'Classic Italian Espresso Tiramisu with Dark Cocoa',
      description: 'Traditional authentic Italian dolce made with delicate espresso-soaked Savoiardi ladyfinger biscuits, whipped egg yolk zabaglione cream, rich velvety mascarpone, and a heavy dusting of bittersweet dark Dutch cocoa powder.',
      ingredients: [
        { name: 'Savoiardi Italian ladyfingers', quantity: '24 biscuits' },
        { name: 'Italian mascarpone cheese (chilled)', quantity: '500g (16 oz)' },
        { name: 'Fresh egg yolks & egg whites', quantity: '4 large eggs (separated)' },
        { name: 'Strong freshly brewed espresso coffee', quantity: '1.5 cups (cooled)' },
        { name: 'Granulated sugar', quantity: '1/2 cup (100g)' },
        { name: 'Dark Dutch cocoa powder', quantity: '3 tbsp (for dusting)' },
        { name: 'Marsala wine or dark rum (optional)', quantity: '2 tbsp' },
      ],
      instructions: [
        'Whisk egg yolks and sugar over a double boiler for 6 minutes until pale, thick, and sugar dissolves. Let cool slightly, then gently fold into mascarpone cheese.',
        'In a separate bowl, whip egg whites to soft peaks, then fold gently into the mascarpone cream.',
        'Combine cooled espresso with Marsala wine in a shallow dish.',
        'Quickly dip each ladyfinger into espresso (1 second per side) and arrange in an even layer in a 9x9 glass baking dish.',
        'Spread half the mascarpone cream evenly over the soaked ladyfingers.',
        'Repeat with a second layer of dipped ladyfingers and remaining mascarpone cream. Smooth the top.',
        'Refrigerate for at least 6 hours (preferably overnight). Generously dust with dark cocoa powder right before serving.',
      ],
      category: 'Desserts',
      preparationTime: 25,
      cookingTime: 0,
      servings: 8,
      difficulty: 'Medium',
      dietaryTags: ['Dessert', 'Italian Dolce', 'Tiramisu', 'Vegetarian', 'Coffee'],
      imageUrl: '/src/assets/images/recipe_classic_italian_tiramisu_1791614890399.jpg',
      author: adminId,
      nutrition: { calories: 380, protein: 8, carbs: 36, fat: 24 },
      rating: 4.97,
      reviewsCount: 178,
      createdAt: new Date('2026-03-10T08:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T08:00:00Z').toISOString(),
    },

    // 15. CRISPY PAN-FRIED DUMPLINGS / DIM SUM MOMOS
    {
      _id: 'recipe_panfried_dumplings_118',
      title: 'Golden Crispy Pan-Fried Dumplings (Potstickers & Momos)',
      description: 'Handmade juicy dumplings filled with seasoned pork, scallions, ginger, and cabbage, seared with an ultra-crispy golden lace bottom and steamed tender on top, served with spicy garlic chili soy dipping sauce.',
      ingredients: [
        { name: 'Round dumpling wrappers', quantity: '24 wrappers' },
        { name: 'Ground pork or chicken / minced vegetables', quantity: '350g' },
        { name: 'Napa cabbage (finely minced and salted)', quantity: '1.5 cups' },
        { name: 'Fresh green scallions & ginger', quantity: '3 scallions / 1 tbsp minced ginger' },
        { name: 'Toasted sesame oil & soy sauce', quantity: '1.5 tbsp each' },
        { name: 'Shaoxing rice wine & white pepper', quantity: '1 tbsp / 1/2 tsp' },
        { name: 'Dipping sauce (soy, black vinegar, chili oil, garlic)', quantity: '4 tbsp' },
      ],
      instructions: [
        'Squeeze excess water from minced salted cabbage. Mix thoroughly with meat, scallions, ginger, soy, sesame oil, and white pepper until sticky.',
        'Place 1 tablespoon filling in the center of each wrapper. Wet edges with water, pleat and seal tightly.',
        'Heat 1 tbsp oil in a flat nonstick skillet over medium-high heat. Arrange dumplings flat-side down and sear for 2 minutes until deeply golden.',
        'Pour in 1/3 cup water, immediately cover with a tight lid, and steam on medium heat for 6 minutes.',
        'Remove lid and cook until all liquid evaporates and bottom crisp crunches up. Serve sizzling with spicy chili garlic soy dipping sauce.',
      ],
      category: 'Snacks',
      preparationTime: 25,
      cookingTime: 10,
      servings: 4,
      difficulty: 'Medium',
      dietaryTags: ['Dumplings', 'Momos', 'Dim Sum', 'Asian Street Food', 'Snacks', 'Crispy'],
      imageUrl: '/src/assets/images/recipe_panfried_dumplings_dimsum_1791614903964.jpg',
      author: alexId,
      nutrition: { calories: 340, protein: 18, carbs: 32, fat: 16 },
      rating: 4.96,
      reviewsCount: 162,
      createdAt: new Date('2026-03-10T07:15:00Z').toISOString(),
      updatedAt: new Date('2026-03-10T07:15:00Z').toISOString(),
    },

    // 16. ARTISAN AVOCADO TOAST & POACHED EGG
    {
      _id: 'recipe_avocado_toast_102',
      title: 'Artisan Avocado Sourdough with Runny Poached Egg',
      description: 'Slow-fermented toasted sourdough topped with seasoned smashed Hass avocados, golden runny free-range poached egg, microgreens, and Aleppo chili flakes.',
      ingredients: [
        { name: 'Country Sourdough Bread', quantity: '2 thick slices' },
        { name: 'Ripe Hass Avocados', quantity: '2 medium' },
        { name: 'Farm-fresh free-range eggs', quantity: '2 large' },
        { name: 'Fresh lime juice', quantity: '1 tbsp' },
        { name: 'Fresh cilantro / microgreens', quantity: '1/4 cup' },
        { name: 'Aleppo chili flakes & Maldon sea salt', quantity: '1/2 tsp each' },
      ],
      instructions: [
        'Toast sourdough in a skillet with olive oil until golden and crisp.',
        'Gently mash avocado with lime juice, sea salt, and black pepper, keeping rustic chunks.',
        'Poach eggs in simmering water with a splash of vinegar for 3 minutes until whites set and yolks remain runny.',
        'Spread creamy avocado generously over warm sourdough, top with poached egg, microgreens, and chili flakes.',
      ],
      category: 'Breakfast',
      preparationTime: 10,
      cookingTime: 5,
      servings: 2,
      difficulty: 'Easy',
      dietaryTags: ['Vegetarian', 'Avocado', 'Eggs', 'Healthy Breakfast', 'Toast'],
      imageUrl: '/src/assets/images/recipe_avocado_toast_egg_1791610430848.jpg',
      author: sophiaId,
      nutrition: { calories: 340, protein: 14, carbs: 29, fat: 20 },
      rating: 4.91,
      reviewsCount: 108,
      createdAt: new Date('2026-03-03T08:30:00Z').toISOString(),
      updatedAt: new Date('2026-03-03T08:30:00Z').toISOString(),
    },

    // 17. WILD BERRY CHIA PUDDING PARFAIT
    {
      _id: 'recipe_berry_parfait_103',
      title: 'Wild Berry Chia Pudding & Roasted Honey Granola Parfait',
      description: 'Layers of antioxidant-rich wild blackberry and blueberry puree, probiotic Greek vanilla yogurt, toasted artisan oat granola, and chia seed pudding.',
      ingredients: [
        { name: 'Organic Greek vanilla yogurt', quantity: '2 cups' },
        { name: 'Chia seed pudding (pre-soaked)', quantity: '1 cup' },
        { name: 'Fresh wild blackberries & blueberries', quantity: '1.5 cups' },
        { name: 'Honey-toasted oat granola with pumpkin seeds', quantity: '1 cup' },
        { name: 'Pure maple syrup & garden mint', quantity: '2 tbsp / 4 sprigs' },
      ],
      instructions: [
        'Crush half the berries with 1 tbsp maple syrup to create a juicy compote.',
        'Layer chia pudding, creamy Greek yogurt, berry compote, and crunchy granola in glass tumblers.',
        'Repeat layers and crown with fresh whole berries and garden mint.',
      ],
      category: 'Desserts',
      preparationTime: 15,
      cookingTime: 0,
      servings: 2,
      difficulty: 'Easy',
      dietaryTags: ['Vegetarian', 'Gluten-Free Option', 'Dessert', 'Berries', 'Yogurt'],
      imageUrl: '/src/assets/images/recipe_berry_parfait_dessert_1791610441672.jpg',
      author: sophiaId,
      nutrition: { calories: 310, protein: 12, carbs: 45, fat: 9 },
      rating: 4.87,
      reviewsCount: 72,
      createdAt: new Date('2026-03-04T15:20:00Z').toISOString(),
      updatedAt: new Date('2026-03-04T15:20:00Z').toISOString(),
    },

    // 18. ROASTED MEDITERRANEAN HARVEST SKILLET
    {
      _id: 'recipe_mediterranean_skillet_104',
      title: 'Skillet Roasted Mediterranean Summer Vegetables',
      description: 'Charred zucchini, sweet bell peppers, caramelized red onions, roasted garlic, and blistered cherry tomatoes infused with rosemary and cold-pressed olive oil.',
      ingredients: [
        { name: 'Zucchini & yellow squash', quantity: '2 medium (sliced)' },
        { name: 'Sweet bell peppers (red and yellow)', quantity: '2 whole (sliced)' },
        { name: 'Cherry tomatoes on the vine', quantity: '1.5 cups' },
        { name: 'Red onion & whole garlic head', quantity: '1 onion / 1 head' },
        { name: 'Fresh rosemary and thyme & olive oil', quantity: '3 sprigs / 3 tbsp' },
      ],
      instructions: [
        'Preheat large cast-iron skillet over medium-high heat with olive oil.',
        'Caramelize garlic head, red onions, and sweet peppers until blistered.',
        'Add squash, cherry tomatoes, and herbs. Roast 8-10 minutes until edges take on a sweet golden char.',
        'Season with flaky sea salt and cracked pepper. Serve hot with sourdough bread.',
      ],
      category: 'Vegetarian',
      preparationTime: 15,
      cookingTime: 20,
      servings: 4,
      difficulty: 'Easy',
      dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Low Carb', 'Mediterranean'],
      imageUrl: '/src/assets/images/hero_culinary_spread_1791610397373.jpg',
      author: adminId,
      nutrition: { calories: 220, protein: 6, carbs: 24, fat: 12 },
      rating: 4.93,
      reviewsCount: 94,
      createdAt: new Date('2026-03-05T18:45:00Z').toISOString(),
      updatedAt: new Date('2026-03-05T18:45:00Z').toISOString(),
    },

    // 19. ROYAL FESTIVAL PAYASAM / KHEER
    {
      _id: 'recipe_festival_payasam_119',
      title: 'Royal Festival Dry Fruit Rice Payasam (Kheer)',
      description: 'Traditional aromatic Indian rice pudding slow-simmered in rich cardamom-infused whole milk, loaded with golden fried cashews, almonds, pistachios, raisins, saffron strands, and fragrant rose petals.',
      ingredients: [
        { name: 'Chitti Muthyalu / Basmati short rice', quantity: '1/2 cup (soaked)' },
        { name: 'Whole full cream milk', quantity: '1 liter' },
        { name: 'Sugar or pure jaggery', quantity: '3/4 cup' },
        { name: 'Ghee (clarified butter)', quantity: '3 tbsp' },
        { name: 'Cashews, almonds, pista, sunflower seeds', quantity: '1/2 cup (chopped)' },
        { name: 'Green cardamom powder', quantity: '1 tsp' },
        { name: 'Saffron strands & dried organic rose petals', quantity: 'For royal garnish' },
      ],
      instructions: [
        'In a heavy pan, fry cashews, almonds, pistachios, and raisins in 2 tbsp ghee until golden. Set aside.',
        'Boil whole milk in a thick-bottomed pot. Add rinsed rice and simmer on low heat for 30 minutes, stirring occasionally until rice is soft and milk reduces to a creamy consistency.',
        'Add sugar and crushed cardamom powder, simmering for 5 more minutes until completely dissolved.',
        'Pour remaining ghee, toasted nuts, and saffron strands.',
        'Garnish with dried rose petals. Serve warm or chilled for a divine festive treat.',
      ],
      category: 'Vegetarian',
      preparationTime: 15,
      cookingTime: 35,
      servings: 4,
      difficulty: 'Easy',
      dietaryTags: ['Vegetarian', 'Payasam', 'Kheer', 'Indian Dessert', 'Sweet'],
      imageUrl: '/src/assets/images/recipe_berry_parfait_dessert_1791610441672.jpg',
      author: adminId,
      nutrition: { calories: 340, protein: 9, carbs: 48, fat: 14 },
      rating: 4.96,
      reviewsCount: 150,
      createdAt: new Date('2026-03-09T08:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-09T08:00:00Z').toISOString(),
    },

    // 20. SIZZLING PANEER TIKKA MASALA
    {
      _id: 'recipe_paneer_tikka_120',
      title: 'Sizzling Amritsari Paneer Tikka Masala in Spiced Gravy',
      description: 'Marinated soft cottage cheese cubes grilled with bell peppers and onions, enveloped in a rich, robustly spiced onion-tomato gravy with kasuri methi and cream.',
      ingredients: [
        { name: 'Fresh Paneer (Indian cottage cheese)', quantity: '400g (cubed)' },
        { name: 'Bell peppers & red onions', quantity: '2 peppers / 1 onion (cubed)' },
        { name: 'Hung yogurt & tikka spices', quantity: '1/2 cup / 2 tbsp' },
        { name: 'Tomato & onion masala gravy base', quantity: '2 cups' },
        { name: 'Kasuri methi & fresh cream', quantity: '1 tbsp / 3 tbsp' },
        { name: 'Desi ghee or butter', quantity: '2 tbsp' },
      ],
      instructions: [
        'Marinate paneer and vegetables in spiced yogurt for 30 minutes. Sear on high heat until edges are charred.',
        'Prepare the gravy with sautéed onions, tomatoes, ginger-garlic, and spices until rich and fragrant.',
        'Slide in the grilled paneer tikka cubes and peppers. Simmer gently for 5 minutes.',
        'Finish with kasuri methi and a swirl of cream. Serve with hot roti or butter naan.',
      ],
      category: 'Vegetarian',
      preparationTime: 20,
      cookingTime: 25,
      servings: 4,
      difficulty: 'Medium',
      dietaryTags: ['Vegetarian', 'Paneer', 'Indian Classic', 'High-Protein', 'Curry'],
      imageUrl: '/src/assets/images/recipe_murgh_butter_chicken_1791614837180.jpg',
      author: alexId,
      nutrition: { calories: 510, protein: 26, carbs: 22, fat: 36 },
      rating: 4.93,
      reviewsCount: 112,
      createdAt: new Date('2026-03-08T14:00:00Z').toISOString(),
      updatedAt: new Date('2026-03-08T14:00:00Z').toISOString(),
    },
  ];

  const defaultFavorites: IFavorite[] = [
    {
      _id: 'fav_001',
      user: sophiaId,
      recipe: 'recipe_hyderabadi_biryani_101',
      createdAt: new Date('2026-03-10T14:00:00Z').toISOString(),
    },
    {
      _id: 'fav_002',
      user: sophiaId,
      recipe: 'recipe_smash_cheeseburger_111',
      createdAt: new Date('2026-03-09T18:00:00Z').toISOString(),
    },
    {
      _id: 'fav_003',
      user: adminId,
      recipe: 'recipe_birria_tacos_112',
      createdAt: new Date('2026-03-09T16:00:00Z').toISOString(),
    },
    {
      _id: 'fav_004',
      user: alexId,
      recipe: 'recipe_tokyo_ramen_113',
      createdAt: new Date('2026-03-09T14:30:00Z').toISOString(),
    },
    {
      _id: 'fav_005',
      user: alexId,
      recipe: 'recipe_salmon_poke_bowl_114',
      createdAt: new Date('2026-03-09T13:00:00Z').toISOString(),
    },
  ];

  // Merge with existing user data if present (preserve any user created recipes or registered users)
  let mergedUsers = [...defaultUsers];
  let mergedRecipes = [...defaultRecipes];
  let mergedFavorites = [...defaultFavorites];

  if (existingDb) {
    if (existingDb.users && existingDb.users.length > 0) {
      existingDb.users.forEach((existingUser) => {
        if (!mergedUsers.some((u) => u.email.toLowerCase() === existingUser.email.toLowerCase())) {
          mergedUsers.push(existingUser);
        }
      });
    }

    if (existingDb.recipes && existingDb.recipes.length > 0) {
      existingDb.recipes.forEach((existingRec) => {
        // If it's a custom user-created recipe, keep it!
        if (!mergedRecipes.some((r) => r._id === existingRec._id || r.title.toLowerCase() === existingRec.title.toLowerCase())) {
          mergedRecipes.unshift(existingRec);
        }
      });
    }

    if (existingDb.favorites && existingDb.favorites.length > 0) {
      existingDb.favorites.forEach((existingFav) => {
        if (!mergedFavorites.some((f) => f._id === existingFav._id)) {
          mergedFavorites.push(existingFav);
        }
      });
    }
  }

  inMemoryDb = {
    users: mergedUsers,
    recipes: mergedRecipes,
    favorites: mergedFavorites,
  };

  saveToDisk();
}

// Data access operations with fuzzy multi-keyword search
export const db = {
  isMongo: () => isMongoConnected,

  // Users
  users: {
    find: async (query?: { email?: string; role?: string }) => {
      let list = [...inMemoryDb.users];
      if (query?.email) {
        const e = query.email.toLowerCase();
        list = list.filter((u) => u.email.toLowerCase() === e);
      }
      if (query?.role) {
        list = list.filter((u) => u.role === query.role);
      }
      return list;
    },
    findOne: async (query: { _id?: string; email?: string }) => {
      if (query._id) {
        return inMemoryDb.users.find((u) => u._id === query._id) || null;
      }
      if (query.email) {
        const targetEmail = query.email.toLowerCase();
        return inMemoryDb.users.find((u) => u.email.toLowerCase() === targetEmail) || null;
      }
      return null;
    },
    findById: async (id: string) => {
      return inMemoryDb.users.find((u) => u._id === id) || null;
    },
    create: async (data: Omit<IUser, '_id' | 'createdAt'>) => {
      const newUser: IUser = {
        ...data,
        email: data.email.toLowerCase().trim(),
        _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
      inMemoryDb.users.push(newUser);
      saveToDisk();
      return newUser;
    },
    deleteById: async (id: string) => {
      const index = inMemoryDb.users.findIndex((u) => u._id === id);
      if (index === -1) return false;
      inMemoryDb.users.splice(index, 1);
      inMemoryDb.recipes = inMemoryDb.recipes.filter((r) => {
        const authorId = typeof r.author === 'string' ? r.author : r.author._id;
        return authorId !== id;
      });
      inMemoryDb.favorites = inMemoryDb.favorites.filter((f) => f.user !== id);
      saveToDisk();
      return true;
    },
    count: async () => inMemoryDb.users.length,
  },

  // Recipes with resilient stemming & scoring search
  recipes: {
    find: async (filter?: {
      search?: string;
      category?: string;
      difficulty?: string;
      dietaryTag?: string;
      author?: string;
      maxTime?: number;
      sort?: string;
    }) => {
      let result = [...inMemoryDb.recipes];

      // Multi-keyword flexible search with stemming and scoring
      if (filter?.search && filter.search.trim().length > 0) {
        const rawQ = filter.search.toLowerCase().trim();
        const rawTokens = rawQ.split(/[\s,]+/).filter(Boolean);
        const stemmedTokens = rawTokens.map(stemCulinaryWord).filter(Boolean);

        const scoredResults: { recipe: IRecipe; score: number }[] = [];

        result.forEach((r) => {
          let score = 0;
          const titleLower = r.title.toLowerCase();
          const descLower = r.description.toLowerCase();
          const categoryLower = r.category.toLowerCase();
          const tagsLower = r.dietaryTags.map((t) => t.toLowerCase()).join(' ');
          const ingredientsLower = r.ingredients.map((ing) => `${ing.name} ${ing.quantity}`.toLowerCase()).join(' ');
          const instructionsLower = r.instructions.join(' ').toLowerCase();

          // Full raw query exact match anywhere
          if (titleLower.includes(rawQ)) score += 100;
          else if (tagsLower.includes(rawQ) || categoryLower.includes(rawQ)) score += 60;
          else if (descLower.includes(rawQ)) score += 40;
          else if (ingredientsLower.includes(rawQ)) score += 30;

          // Check token matches (both raw and stemmed)
          for (let i = 0; i < rawTokens.length; i++) {
            const token = rawTokens[i];
            const stemmed = stemmedTokens[i] || token;

            // Match in title
            if (titleLower.includes(token) || (stemmed.length > 2 && titleLower.includes(stemmed))) {
              score += 50;
            }
            // Match in category or dietary tags
            if (categoryLower.includes(token) || tagsLower.includes(token) || (stemmed.length > 2 && (categoryLower.includes(stemmed) || tagsLower.includes(stemmed)))) {
              score += 35;
            }
            // Match in ingredients
            if (ingredientsLower.includes(token) || (stemmed.length > 2 && ingredientsLower.includes(stemmed))) {
              score += 25;
            }
            // Match in description or instructions
            if (descLower.includes(token) || instructionsLower.includes(token) || (stemmed.length > 2 && (descLower.includes(stemmed) || instructionsLower.includes(stemmed)))) {
              score += 15;
            }
          }

          if (score > 0) {
            scoredResults.push({ recipe: r, score });
          }
        });

        // Sort by relevance score
        scoredResults.sort((a, b) => b.score - a.score);
        result = scoredResults.map((s) => s.recipe);
      }

      // Filter by category
      if (filter?.category && filter.category !== 'All') {
        result = result.filter((r) => r.category.toLowerCase() === filter.category!.toLowerCase());
      }

      // Filter by difficulty
      if (filter?.difficulty && filter.difficulty !== 'All') {
        result = result.filter((r) => r.difficulty.toLowerCase() === filter.difficulty!.toLowerCase());
      }

      // Filter by dietary tag
      if (filter?.dietaryTag && filter.dietaryTag !== 'All') {
        result = result.filter((r) =>
          r.dietaryTags.some((tag) => tag.toLowerCase() === filter.dietaryTag!.toLowerCase())
        );
      }

      // Filter by author
      if (filter?.author) {
        result = result.filter((r) => {
          const authorId = typeof r.author === 'string' ? r.author : r.author._id;
          return authorId === filter.author;
        });
      }

      // Filter by total time
      if (filter?.maxTime && filter.maxTime > 0) {
        result = result.filter((r) => r.preparationTime + r.cookingTime <= filter.maxTime!);
      }

      // Populate author
      const populated = result.map((r) => {
        const authorId = typeof r.author === 'string' ? r.author : r.author._id;
        const authorObj = inMemoryDb.users.find((u) => u._id === authorId);
        return {
          ...r,
          author: authorObj
            ? { _id: authorObj._id, name: authorObj.name, email: authorObj.email }
            : { _id: authorId, name: 'Chef Contributor', email: 'contributor@recipehub.com' },
        };
      });

      // Sorting (if not already sorted by search score or if explicitly requested)
      if (!filter?.search || filter?.sort) {
        if (filter?.sort === 'newest') {
          populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (filter?.sort === 'title_asc') {
          populated.sort((a, b) => a.title.localeCompare(b.title));
        } else if (filter?.sort === 'prep_asc') {
          populated.sort((a, b) => a.preparationTime + a.cookingTime - (b.preparationTime + b.cookingTime));
        } else if (filter?.sort === 'popular') {
          populated.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        } else {
          populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }

      return populated;
    },

    findById: async (id: string) => {
      const recipe = inMemoryDb.recipes.find((r) => r._id === id);
      if (!recipe) return null;
      const authorId = typeof recipe.author === 'string' ? recipe.author : recipe.author._id;
      const authorObj = inMemoryDb.users.find((u) => u._id === authorId);
      return {
        ...recipe,
        author: authorObj
          ? { _id: authorObj._id, name: authorObj.name, email: authorObj.email }
          : { _id: authorId, name: 'Chef Contributor', email: 'contributor@recipehub.com' },
      };
    },

    create: async (data: Omit<IRecipe, '_id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newRecipe: IRecipe = {
        ...data,
        _id: 'recipe_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        rating: 5.0,
        reviewsCount: 1,
        createdAt: now,
        updatedAt: now,
      };
      inMemoryDb.recipes.unshift(newRecipe);
      saveToDisk();

      const authorId = typeof newRecipe.author === 'string' ? newRecipe.author : newRecipe.author._id;
      const authorObj = inMemoryDb.users.find((u) => u._id === authorId);
      return {
        ...newRecipe,
        author: authorObj
          ? { _id: authorObj._id, name: authorObj.name, email: authorObj.email }
          : { _id: authorId, name: 'Chef Contributor', email: 'contributor@recipehub.com' },
      };
    },

    updateById: async (id: string, updates: Partial<IRecipe>) => {
      const index = inMemoryDb.recipes.findIndex((r) => r._id === id);
      if (index === -1) return null;
      const existing = inMemoryDb.recipes[index];
      const updated: IRecipe = {
        ...existing,
        ...updates,
        _id: existing._id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      inMemoryDb.recipes[index] = updated;
      saveToDisk();

      const authorId = typeof updated.author === 'string' ? updated.author : updated.author._id;
      const authorObj = inMemoryDb.users.find((u) => u._id === authorId);
      return {
        ...updated,
        author: authorObj
          ? { _id: authorObj._id, name: authorObj.name, email: authorObj.email }
          : { _id: authorId, name: 'Chef Contributor', email: 'contributor@recipehub.com' },
      };
    },

    deleteById: async (id: string) => {
      const index = inMemoryDb.recipes.findIndex((r) => r._id === id);
      if (index === -1) return false;
      inMemoryDb.recipes.splice(index, 1);
      inMemoryDb.favorites = inMemoryDb.favorites.filter((f) => f.recipe !== id);
      saveToDisk();
      return true;
    },

    count: async () => inMemoryDb.recipes.length,
  },

  // Favorites
  favorites: {
    findForUser: async (userId: string) => {
      const userFavs = inMemoryDb.favorites.filter((f) => f.user === userId);
      const recipeIds = new Set(userFavs.map((f) => f.recipe));
      const recipes = inMemoryDb.recipes.filter((r) => recipeIds.has(r._id));

      return recipes.map((r) => {
        const authorId = typeof r.author === 'string' ? r.author : r.author._id;
        const authorObj = inMemoryDb.users.find((u) => u._id === authorId);
        return {
          ...r,
          author: authorObj
            ? { _id: authorObj._id, name: authorObj.name, email: authorObj.email }
            : { _id: authorId, name: 'Chef Contributor', email: 'contributor@recipehub.com' },
        };
      });
    },

    getUserFavoriteIds: async (userId: string): Promise<string[]> => {
      return inMemoryDb.favorites.filter((f) => f.user === userId).map((f) => f.recipe);
    },

    add: async (userId: string, recipeId: string) => {
      const recipe = inMemoryDb.recipes.find((r) => r._id === recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      const existing = inMemoryDb.favorites.find((f) => f.user === userId && f.recipe === recipeId);
      if (existing) {
        return existing;
      }

      const newFav: IFavorite = {
        _id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        user: userId,
        recipe: recipeId,
        createdAt: new Date().toISOString(),
      };
      inMemoryDb.favorites.push(newFav);
      saveToDisk();
      return newFav;
    },

    remove: async (userId: string, recipeId: string) => {
      const index = inMemoryDb.favorites.findIndex((f) => f.user === userId && f.recipe === recipeId);
      if (index === -1) return false;
      inMemoryDb.favorites.splice(index, 1);
      saveToDisk();
      return true;
    },

    isFavorite: async (userId: string, recipeId: string) => {
      return inMemoryDb.favorites.some((f) => f.user === userId && f.recipe === recipeId);
    },

    count: async () => inMemoryDb.favorites.length,
    countByUser: async (userId: string) => inMemoryDb.favorites.filter((f) => f.user === userId).length,
  },
};
