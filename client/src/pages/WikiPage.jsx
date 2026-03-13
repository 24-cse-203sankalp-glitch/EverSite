import { Search, BookOpen, ExternalLink, Filter } from 'lucide-react';
import { useState } from 'react';

const wikiArticles = [
  {
    id: 1,
    title: 'Emergency Preparedness Guide',
    category: 'Safety',
    excerpt: 'Complete guide to preparing for natural disasters, power outages, and emergency situations with detailed checklists and procedures.',
    content: `# Emergency Preparedness - Complete Guide

## Essential Supplies Checklist

### Water & Food (3-Day Minimum)
- Water: 1 gallon per person per day (3-day supply minimum, 2-week supply recommended)
- Non-perishable food items: canned goods, dried fruits, nuts, protein bars
- Manual can opener and eating utensils
- Paper plates and cups
- Cooking equipment: portable stove, fuel, matches in waterproof container

### Medical & Hygiene
- First aid kit with bandages, gauze, antiseptic, pain relievers
- Prescription medications (7-day supply minimum)
- Over-the-counter medications: pain relievers, anti-diarrheal, antacids
- Feminine hygiene products
- Personal hygiene items: soap, toothbrush, toothpaste, toilet paper
- Hand sanitizer and disinfecting wipes
- Glasses/contact lenses and solution

### Tools & Equipment
- Battery-powered or hand-crank radio (NOAA Weather Radio)
- Flashlight with extra batteries (LED recommended)
- Multi-tool or Swiss Army knife
- Duct tape and plastic sheeting
- Wrench or pliers to turn off utilities
- Local maps (paper, not digital)
- Whistle to signal for help
- Fire extinguisher (ABC type)

### Communication & Documents
- Cell phone with chargers (car charger and solar charger)
- Portable power bank (20,000+ mAh)
- Emergency contact list (printed)
- Important documents in waterproof container

### Special Items
- Infant formula, bottles, diapers (if applicable)
- Pet food and supplies
- Books, games, puzzles for entertainment
- Cash (ATMs may not work)

## Emergency Plan Development

### Family Communication Plan
1. Designate an out-of-state contact person
2. Ensure all family members have contact information
3. Establish primary and secondary meeting locations
4. Practice communication procedures quarterly

### Evacuation Routes
- Identify multiple routes from home, work, and school
- Know locations of emergency shelters
- Plan for pets (not all shelters accept animals)
- Keep vehicle gas tank at least half full

## During Different Disasters

### Earthquake
- DROP, COVER, and HOLD ON
- Stay away from windows and heavy objects
- If outdoors, move to open area away from buildings

### Hurricane/Tornado
- Monitor weather alerts continuously
- Board up windows or close storm shutters
- Go to lowest level, interior room without windows

### Flood
- Move to higher ground immediately
- Never walk or drive through flood water
- 6 inches of moving water can knock you down

### Fire
- Get out immediately, don't gather belongings
- Crawl low under smoke
- Once out, stay out - never re-enter

### Power Outage
- Use flashlights, not candles (fire risk)
- Keep refrigerator/freezer closed (food safe 4 hours)
- Never use generators indoors (carbon monoxide)`,
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    title: 'Water Purification Methods',
    category: 'Survival',
    excerpt: 'Comprehensive guide to water purification methods, storage techniques, and emergency water sources.',
    content: `# Water Purification & Storage

## Boiling Method (Most Reliable)
1. Filter water through cloth to remove sediment
2. Bring water to rolling boil
3. Boil for 1 minute at sea level
4. Boil for 3 minutes above 6,500 feet elevation
5. Let cool naturally
6. Store in clean, covered container

## Chemical Treatment

### Chlorine Bleach
- Use unscented household bleach (5-6% sodium hypochlorite)
- Add 2 drops per quart (4 drops if cloudy)
- Mix well and let stand 30 minutes
- Should have slight chlorine smell

### Iodine Tablets
- Follow manufacturer instructions
- Typically 1-2 tablets per quart
- Wait 30 minutes (60 minutes if water is cold)
- Not suitable for pregnant women

## Filtration Systems
- Look for 0.1 micron or smaller pore size
- NSF certified for bacteria and protozoa removal
- Types: pump filters, gravity filters, squeeze filters
- Maintain and clean regularly

## Solar Disinfection (SODIS)
1. Use clear plastic (PET) bottles only
2. Fill bottle completely with water
3. Shake vigorously to oxygenate
4. Place in direct sunlight for 6 hours
5. If cloudy, leave for 2 consecutive days

## Emergency Water Sources
- Water heater tank (50+ gallons)
- Toilet tank (not bowl)
- Ice cubes in freezer
- Canned fruits/vegetables (drain liquid)
- Swimming pool (requires treatment)

## Water Storage
- Food-grade plastic containers (HDPE #2 or #4)
- Store in cool, dark place (50-70°F ideal)
- Rotate every 6 months
- Label with date stored
- Store 1 gallon per person per day minimum`,
    lastUpdated: '2024-01-14'
  },
  {
    id: 3,
    title: 'First Aid Essentials',
    category: 'Medical',
    excerpt: 'Essential first aid procedures and life-saving techniques for critical situations.',
    content: `# First Aid & Medical Emergencies

## CPR (Adult)
1. Check responsiveness - tap shoulders
2. Call 911 immediately
3. Check for breathing (no more than 10 seconds)
4. Hand placement: Center of chest, between nipples
5. Compressions: 30 times, 2 inches deep, 100-120 per minute
6. Give 2 rescue breaths (tilt head, lift chin, pinch nose)
7. Continue cycles of 30:2 until help arrives

## Hands-Only CPR (If Untrained)
- Call 911 first
- Push hard and fast in center of chest
- 100-120 compressions per minute
- Don't stop until help arrives

## Choking - Heimlich Maneuver
1. Ask "Are you choking?"
2. Stand behind person
3. Make fist above navel
4. Grasp fist with other hand
5. Give quick, upward thrusts
6. Repeat until object dislodges

## Severe Bleeding Control
1. Call 911 if bleeding is severe
2. Wear gloves if available
3. Have person lie down
4. Apply firm, direct pressure with clean cloth
5. Maintain pressure for 10-15 minutes
6. Elevate wound above heart if possible

## Burns

### First-Degree Burns
- Cool with running water 10-20 minutes
- Apply aloe vera or moisturizer
- Take pain reliever

### Second-Degree Burns
- Cool with running water 10-20 minutes
- Do NOT pop blisters
- Apply antibiotic ointment
- Cover with non-stick bandage

### Third-Degree Burns
- Call 911 immediately
- Do NOT remove stuck clothing
- Cover with clean, dry cloth
- Do NOT apply water or ointments

## Shock Treatment
1. Call 911
2. Lay person down
3. Elevate legs 12 inches
4. Keep person warm with blanket
5. Do NOT give food or water

## Poisoning
- Call Poison Control: 1-800-222-1222
- Have container/substance available
- Do NOT induce vomiting unless instructed`,
    lastUpdated: '2024-01-13'
  },
  {
    id: 4,
    title: 'Shelter Building Techniques',
    category: 'Survival',
    excerpt: 'Emergency shelter construction, site selection, and weather protection methods.',
    content: `# Emergency Shelter Building

## Site Selection
- Flat, elevated ground
- Away from water hazards
- Natural windbreaks
- Avoid dead or leaning trees
- Check for animal dens
- Consider sun exposure
- Proximity to water source

## Lean-To Shelter
1. Find sturdy support (tree, rock)
2. Place ridgepole at 45-60 degree angle
3. Lean branches against ridgepole
4. Layer smaller branches horizontally
5. Cover with leaves, bark, pine boughs (12+ inches thick)
6. Create debris bed inside
7. Build reflector wall for fire

## Debris Hut
1. Create ridgepole frame (one end elevated 3-4 feet)
2. Add ribbing on both sides at 45-degree angles
3. Layer debris 3 feet thick all around
4. Create small entrance
5. Plug entrance with debris bundle at night
6. Add thick interior bedding

## Snow Cave
1. Find deep snow drift (6+ feet)
2. Dig entrance tunnel sloping upward
3. Hollow out dome-shaped chamber
4. Walls 12-18 inches thick minimum
5. Create ventilation hole (ESSENTIAL)
6. Create elevated sleeping platform
7. Mark entrance clearly

## Tarp Shelter Configurations

### A-Frame
- Tie ridgeline between two trees
- Drape tarp over line
- Stake out corners at 45-degree angle

### Lean-To
- Tie one edge high (7-8 feet)
- Stake opposite edge to ground
- Open to fire for warmth

## Insulation Materials
1. Dry leaves (oak, maple)
2. Pine needles
3. Dry grass
4. Bark strips
5. Moss (if dry)

## Ground Insulation
- Critical: lose more heat to ground than air
- Minimum 6 inches of insulation
- Dry materials only
- Create raised platform if possible`,
    lastUpdated: '2024-01-12'
  },
  {
    id: 5,
    title: 'Fire Starting Methods',
    category: 'Survival',
    excerpt: 'Master fire starting techniques, fuel selection, and fire management in various conditions.',
    content: `# Fire Starting & Management

## Fire Triangle
1. Heat - Ignition source
2. Fuel - Combustible material
3. Oxygen - Air flow

## Tinder (Catches spark)
- Dry grass and leaves
- Pine needles
- Birch bark
- Cedar bark (shredded)
- Cattail fluff
- Fatwood (resin-rich pine)
- Must be bone dry

## Kindling (Sustains flame)
- Toothpick size (first)
- Pencil size
- Finger size
- Thumb size
- Dead standing wood preferred

## Fuel Wood
### Hardwoods (Best for heat)
- Oak - excellent coals
- Hickory - high heat output
- Maple - good heat
- Ash - burns green or dry

### Softwoods (Quick heat)
- Pine - easy to ignite
- Spruce - fast burning
- Fir - moderate heat

## Fire Starting Methods

### Matches
- Waterproof/stormproof matches best
- Store in waterproof container
- Light tinder from multiple points

### Ferro Rod
- Works when wet
- Scrape fast and hard
- Aim sparks at tinder

### Bow Drill (Friction)
1. Fireboard: Flat, dry softwood
2. Spindle: Straight stick, pencil-thick
3. Bow: Curved stick with cordage
4. Apply downward pressure
5. Bow back and forth rapidly
6. Transfer ember to tinder bundle

## Fire Lay Configurations

### Teepee
- Tinder in center
- Lean kindling in cone shape
- Good for quick heat

### Log Cabin
- Stack logs in square pattern
- Tinder in center
- Burns evenly, good coals

### Star Fire
- Logs arranged like star spokes
- Fire in center
- Push logs in as they burn

## Fire in Wet Conditions
- Find driest materials possible
- Split wood to expose dry interior
- Create feather sticks
- Use birch bark (burns when wet)
- Build platform of green wood

## Fire Safety
- Clear area 10 feet diameter
- Remove all flammable material
- Never leave fire unattended
- Keep water/dirt nearby
- Extinguish completely before leaving`,
    lastUpdated: '2024-01-11'
  },
  {
    id: 6,
    title: 'Navigation Without GPS',
    category: 'Survival',
    excerpt: 'Learn to navigate using sun, stars, natural indicators, and basic orienteering skills.',
    content: `# Navigation Without Technology

## Using the Sun

### Shadow Stick Method
1. Place stick vertically in ground
2. Mark tip of shadow
3. Wait 15-20 minutes
4. Mark new shadow tip
5. Line between marks runs East-West
6. First mark is West, second is East

### Watch Method (Northern Hemisphere)
1. Point hour hand at sun
2. Bisect angle between hour hand and 12
3. That line points South

## Using the Stars

### North Star (Polaris)
1. Find Big Dipper
2. Locate two stars forming front of "cup"
3. Draw imaginary line through them
4. Extend line 5 times the distance
5. Bright star = Polaris = North

### Southern Cross (Southern Hemisphere)
1. Find Southern Cross constellation
2. Extend long axis 4.5 times
3. Drop imaginary line to horizon
4. That point is South

## Natural Indicators

### Trees
- Moss grows on north side (Northern Hemisphere)
- Trees lean away from prevailing winds
- More branches on south side (more sun)

### Ant Hills
- Steeper side faces south (warmer)

### Snow
- Melts faster on south-facing slopes

## Map Reading Basics

### Contour Lines
- Connect points of equal elevation
- Close together = steep terrain
- Far apart = gentle slope
- Circular = hill or depression

### Scale
- 1:24,000 = 1 inch = 2,000 feet
- 1:50,000 = 1 inch = 4,167 feet

### Legend
- Symbols for trails, roads, water
- Blue = water features
- Green = vegetation
- Brown = contours
- Black = man-made features

## Compass Use

### Taking a Bearing
1. Hold compass flat
2. Point direction arrow at target
3. Rotate bezel until N aligns with needle
4. Read bearing at index line

### Following a Bearing
1. Set bearing on compass
2. Hold compass flat
3. Turn body until needle aligns with N
4. Walk in direction of travel arrow

## Distance Estimation

### Pace Count
1. Count every time right foot hits ground
2. Measure 100 meters
3. Count paces for that distance
4. Your pace count for 100m

### Time-Distance
- Flat terrain: 3-4 mph
- Hills: 2-3 mph
- Rough terrain: 1-2 mph`,
    lastUpdated: '2024-01-10'
  },
  {
    id: 7,
    title: 'Food Foraging Safety',
    category: 'Survival',
    excerpt: 'Safe foraging practices, edible plant identification, and avoiding poisonous species.',
    content: `# Safe Foraging Guide

## Universal Edibility Test
ONLY use if no other food available and plant is unknown

1. Separate plant into parts (roots, stems, leaves, flowers)
2. Test one part at a time
3. Smell - if unpleasant, discard
4. Rub on inner wrist - wait 15 minutes for reaction
5. Touch to lips - wait 3 minutes
6. Touch to tongue - wait 15 minutes
7. Chew small amount - wait 15 minutes
8. Swallow small amount - wait 5 hours
9. If no reaction, eat 1/4 cup - wait 5 hours
10. If still no reaction, plant part is safe

## Plants to AVOID

### Warning Signs
- Milky or discolored sap
- Beans, bulbs, or seeds inside pods
- Bitter or soapy taste
- Spines, fine hairs, or thorns
- Three-leaved growth pattern
- Almond scent in woody parts
- Grain heads with pink, purple, or black spurs

### Deadly Plants
- Poison Hemlock - looks like carrot, smells musty
- Water Hemlock - white flowers, purple-streaked stem
- Deadly Nightshade - black berries, bell-shaped flowers
- Foxglove - purple tubular flowers
- Oleander - pink/white flowers, all parts toxic
- Castor Bean - large palmate leaves, spiky seed pods

## Safe Edible Plants

### Dandelion
- Entire plant edible
- Leaves best when young
- Roots can be roasted
- Flowers make tea

### Cattail
- "Supermarket of the swamp"
- Young shoots edible raw
- Pollen from flowers
- Roots starchy (cook like potato)

### Clover
- Red and white clover safe
- Flowers and leaves edible
- High in protein
- Better cooked

### Plantain (not banana)
- Broad leaves with parallel veins
- Young leaves best
- Cook like spinach
- Seeds edible

### Acorns
- All oak acorns edible after processing
- Must leach tannins (bitter, toxic)
- Shell, crush, soak in water repeatedly
- Roast and grind into flour

## Foraging Rules

### Safety First
1. 100% positive identification required
2. Never eat mushrooms unless expert
3. Avoid plants near roads (pollution)
4. Don't forage in treated areas (pesticides)
5. Take only what you need
6. Leave roots unless necessary

### Sustainable Harvesting
- Take no more than 10% from area
- Rotate foraging locations
- Don't damage plants unnecessarily
- Spread seeds to encourage growth

## Berries

### Safe Berries (Generally)
- Blueberries - blue/black, star on bottom
- Blackberries - black, compound berry
- Raspberries - red/black, hollow center
- Strawberries - red, seeds on outside

### Dangerous Berries
- White berries - usually poisonous
- Yellow berries - usually poisonous
- Red berries - 50/50 (many toxic)
- Blue/Black berries - mostly safe (but verify)

## Nuts

### Safe Nuts
- Walnuts - hard shell, brain-like nut
- Hickory - hard shell, sweet nut
- Pecans - smooth shell, sweet
- Hazelnuts - round, hard shell
- Pine nuts - from pine cones

### Processing
- Remove outer husk
- Crack shell
- Check for mold or insects
- Roast to improve flavor

## Water Plants

### Edible
- Watercress - peppery taste
- Arrowhead - tubers like potato
- Water lily - roots and seeds
- Wild rice - grain heads

### Caution
- Only harvest from clean water
- Avoid stagnant water
- Risk of parasites
- Cook when possible`,
    lastUpdated: '2024-01-09'
  },
  {
    id: 8,
    title: 'Knots & Rope Work',
    category: 'Technical',
    excerpt: 'Essential knots for survival, camping, rescue, and everyday use with step-by-step instructions.',
    content: `# Essential Knots Guide

## Basic Knots

### Square Knot (Reef Knot)
**Use:** Joining two ropes of equal diameter
**Steps:**
1. Right over left and under
2. Left over right and under
3. "Right over left, left over right"
**Warning:** Not for critical loads, can slip

### Bowline
**Use:** Creates fixed loop, rescue, securing to post
**Steps:**
1. Make small loop (rabbit hole)
2. Pass end up through loop (rabbit comes out)
3. Around standing line (around tree)
4. Back down through loop (back in hole)
5. Tighten
**Memory:** "Rabbit comes out of hole, around tree, back in hole"

### Clove Hitch
**Use:** Securing rope to post or tree
**Steps:**
1. Wrap rope around post
2. Cross over and wrap again
3. Tuck end under second wrap
**Quick method:** Make two loops, stack second on first, slide over post

### Taut-Line Hitch
**Use:** Adjustable loop, tent guy lines
**Steps:**
1. Wrap around anchor twice (inside standing line)
2. Wrap once outside standing line
3. Pass through loops
4. Slide to adjust tension

## Binding Knots

### Timber Hitch
**Use:** Dragging logs, temporary attachment
**Steps:**
1. Pass rope around object
2. Wrap end around standing line
3. Tuck under itself 3-4 times
4. Tighten

### Constrictor Knot
**Use:** Binding, very secure, difficult to untie
**Steps:**
1. Make clove hitch
2. Pass end under first wrap
3. Pull tight
**Note:** May need to cut to remove

## Loop Knots

### Figure-Eight Loop
**Use:** Climbing, rescue, strong fixed loop
**Steps:**
1. Make bight (fold) in rope
2. Form figure-eight with bight
3. Pass bight through loop
4. Tighten

### Alpine Butterfly
**Use:** Mid-line loop, load in any direction
**Steps:**
1. Make two wraps around hand
2. Pull back loop over front loop
3. Pull through center
4. Tighten

## Joining Knots

### Sheet Bend
**Use:** Joining ropes of different diameters
**Steps:**
1. Make bight in thicker rope
2. Pass thin rope up through bight
3. Around both parts of bight
4. Under itself
5. Tighten

### Double Fisherman's
**Use:** Joining rope ends, very secure
**Steps:**
1. Tie double overhand on first rope around second
2. Tie double overhand on second rope around first
3. Pull knots together
**Use:** Climbing, critical applications

## Friction Hitches

### Prusik
**Use:** Ascending rope, backup
**Steps:**
1. Wrap loop around main rope 3 times
2. Pass end through loop
3. Tighten
**Note:** Grips when loaded, slides when loose

### Trucker's Hitch
**Use:** Mechanical advantage, securing loads
**Steps:**
1. Tie slip loop in standing line
2. Pass end through anchor
3. Through slip loop
4. Pull for 3:1 advantage
5. Secure with half hitches

## Stopper Knots

### Figure-Eight
**Use:** Prevents rope from slipping through
**Steps:**
1. Make loop
2. Pass end around and through loop
3. Tighten

### Double Overhand
**Use:** Backup knot, stopper
**Steps:**
1. Make overhand knot
2. Pass end through again
3. Tighten

## Lashing

### Square Lashing
**Use:** Joining poles at right angles
**Steps:**
1. Clove hitch on vertical pole
2. Wrap around both poles (over-under pattern)
3. 3-4 wraps
4. Frapping (wrap between poles)
5. Clove hitch to finish

### Diagonal Lashing
**Use:** Joining poles at angles, bracing
**Steps:**
1. Timber hitch around both poles
2. Wrap in X pattern
3. 3-4 wraps each direction
4. Frapping between poles
5. Clove hitch to finish

## Rope Care

### Inspection
- Check for fraying
- Look for cuts or abrasions
- Feel for soft spots (internal damage)
- Check for discoloration
- Smell for chemical damage

### Storage
- Coil properly
- Store dry
- Avoid direct sunlight
- Keep away from chemicals
- Hang or store flat

### Cleaning
- Mild soap and water
- Rinse thoroughly
- Air dry completely
- Never machine dry
- Don't use bleach`,
    lastUpdated: '2024-01-08'
  }
];

export default function WikiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(wikiArticles.map(a => a.category))];

  const filteredArticles = wikiArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles, procedures, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selectedArticle ? (
        <div className="card p-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 text-sm font-medium inline-flex items-center gap-2"
          >
            ← Back to articles
          </button>
          
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full mb-3">
              {selectedArticle.category}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {selectedArticle.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{selectedArticle.excerpt}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedArticle.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Base</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="card p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                      {article.excerpt}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Updated {new Date(article.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No articles found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
