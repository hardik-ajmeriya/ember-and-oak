/**
 * Seeds Ember & Oak: the floor plan, the autumn menu, upcoming events and a
 * scattering of existing reservations so the availability grid looks lived-in.
 * Usage: npm run seed
 */
import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import MenuItem from './models/MenuItem.js';
import DiningTable from './models/DiningTable.js';
import Reservation from './models/Reservation.js';
import Event from './models/Event.js';
import Enquiry from './models/Enquiry.js';
import { slotsForDay, durationFor } from './services/availability.js';

const img = (id, w = 1400, h = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const tables = [
  { label: 'T1', seats: 2, zone: 'window' },
  { label: 'T2', seats: 2, zone: 'window' },
  { label: 'T3', seats: 2, zone: 'main-room' },
  { label: 'T4', seats: 2, zone: 'main-room' },
  { label: 'T5', seats: 4, zone: 'main-room', combinable: true },
  { label: 'T6', seats: 4, zone: 'main-room', combinable: true },
  { label: 'T7', seats: 4, zone: 'window' },
  { label: 'T8', seats: 4, zone: 'mezzanine' },
  { label: 'T9', seats: 6, zone: 'mezzanine' },
  { label: 'T10', seats: 6, zone: 'main-room' },
  { label: 'C1', seats: 1, zone: 'counter' },
  { label: 'C2', seats: 1, zone: 'counter' },
  { label: 'C3', seats: 2, zone: 'counter' },
  { label: 'P1', seats: 10, zone: 'private' },
];

const menu = [
  // Snacks
  ['Warm sourdough, cultured butter', 'snacks', 'Two-day ferment, baked to order. The butter is churned in-house and salted with sea flakes.', 7, ['vegetarian'], 'year-round', 1, true],
  ['Oyster, elderflower mignonette', 'snacks', 'Carlingford rock oysters, dressed the moment they are opened.', 4.5, ['gluten-free', 'dairy-free'], 'year-round', 2, false],
  ['Smoked almonds, rosemary salt', 'snacks', 'Roasted over oak in the same oven as the bread.', 6, ['vegan', 'contains-nuts'], 'year-round', 3, false],
  // Starters
  ['Hand-dived scallop, brown butter, hazelnut', 'starters', 'Seared hard on one side only, finished with a butter caught just before it burns.', 22, ['gluten-free', 'contains-nuts'], 'autumn', 1, true],
  ['Heritage beetroot, whipped goat curd, walnut', 'starters', 'Four varieties, roasted in salt crust, dressed with the juice reduced to a glaze.', 16, ['vegetarian', 'gluten-free', 'contains-nuts'], 'autumn', 2, false],
  ['Cured trout, cucumber, buttermilk', 'starters', 'Cured for eighteen hours with juniper and dill, sliced thin as paper.', 18, ['gluten-free'], 'summer', 3, false],
  ['Wild mushroom tart, aged comté', 'starters', 'Puff pastry laminated in the kitchen, mushrooms foraged forty minutes from here.', 17, ['vegetarian'], 'autumn', 4, false],
  // Mains
  ['Dry-aged sirloin, bone marrow, watercress', 'mains', 'Thirty-five days on the bone. Served pink unless you tell us otherwise.', 42, ['gluten-free'], 'year-round', 1, true],
  ['Cornish turbot, mussels, sea vegetables', 'mains', 'On the bone, roasted in the wood oven and basted with its own juices.', 38, ['gluten-free'], 'autumn', 2, true],
  ['Slow-cooked lamb shoulder, anchovy, rosemary', 'mains', 'Six hours at low heat, pulled at the table. For two, minimum.', 68, ['gluten-free', 'dairy-free'], 'winter', 3, false],
  ['Celeriac shawarma, tahini, pomegranate', 'mains', 'A whole celeriac cooked on the rotisserie for four hours, carved to order.', 26, ['vegan', 'gluten-free'], 'autumn', 4, false],
  ['Hand-rolled pici, autumn truffle', 'mains', 'Rolled each morning, dressed simply so the truffle does the talking.', 34, ['vegetarian'], 'autumn', 5, false],
  // Sides
  ['Triple-cooked chips, malt salt', 'sides', 'Cooked in beef dripping. Worth the wait.', 8, ['gluten-free'], 'year-round', 1, false],
  ['Charred hispi cabbage, brown shrimp butter', 'sides', 'Blackened over coals and finished with shrimp butter.', 10, ['gluten-free'], 'autumn', 2, false],
  ['Leaf salad, mustard dressing', 'sides', 'Whatever the grower had that morning.', 7, ['vegan', 'gluten-free'], 'year-round', 3, false],
  // Desserts
  ['Burnt Basque cheesecake, quince', 'desserts', 'Baked hot and fast so the middle stays loose. Quince poached in its own syrup.', 12, ['vegetarian', 'gluten-free'], 'autumn', 1, true],
  ['Dark chocolate délice, sea salt, olive oil', 'desserts', 'Seventy percent Valrhona, a slick of Sicilian oil, a scatter of flakes.', 13, ['vegetarian'], 'year-round', 2, false],
  ['Bramley apple tart, brown sugar cream', 'desserts', 'Made to order — it takes twenty minutes, and it is worth them.', 14, ['vegetarian'], 'autumn', 3, false],
  // Cheese
  ['Three British cheeses, oat crackers, chutney', 'cheese', 'Chosen weekly from Neal’s Yard. Ask what is drinking well with them.', 16, ['vegetarian'], 'year-round', 1, false],
];

const events = [
  {
    title: 'Burgundy at the Counter',
    slug: 'burgundy-at-the-counter',
    kind: 'wine-dinner',
    summary: 'Six glasses, six courses, one importer who has opinions about all of them.',
    description:
      'Our sommelier hands the floor to Camille Roux, who has been importing from the Côte de Beaune for two decades. Six courses built around six wines rather than the other way round, served at the counter so you can watch each plate come together. Expect strong views on oak.',
    image: img('photo-1544148103-0773bf10d330', 1400, 900),
    pricePerHead: 145,
    seats: 12,
    seatsTaken: 9,
    host: 'Camille Roux',
    dayOffset: 12,
    hour: 19,
  },
  {
    title: 'Chef’s Table: Game Season',
    slug: 'chefs-table-game-season',
    kind: 'chefs-table',
    summary: 'Ten seats at the pass for the two weeks grouse is at its best.',
    description:
      'The pass seats ten, and for two weeks in October it belongs to whatever the estate sends down. There is no printed menu — the kitchen cooks what arrived that morning and explains each dish as it lands.',
    image: img('photo-1551218808-94e220e084d2', 1400, 900),
    pricePerHead: 120,
    seats: 10,
    seatsTaken: 4,
    host: 'Head Chef Ines Duarte',
    dayOffset: 20,
    hour: 18,
  },
  {
    title: 'Bread & Ferment Masterclass',
    slug: 'bread-and-ferment-masterclass',
    kind: 'masterclass',
    summary: 'A Saturday morning with our baker, a starter to take home, and lunch after.',
    description:
      'Three hours on shaping, scoring and reading a dough by feel rather than by clock. You leave with a jar of our starter, which is eleven years old and has a name. Lunch in the main room afterwards is included.',
    image: img('photo-1466637574441-749b8f19452f', 1400, 900),
    pricePerHead: 85,
    seats: 14,
    seatsTaken: 11,
    host: 'Baker Tom Aldridge',
    dayOffset: 27,
    hour: 10,
  },
];

const at = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const guestNames = [
  ['Freya Lindqvist', 'freya@example.com'], ['Omar Haddad', 'omar@example.com'],
  ['Rosa Bianchi', 'rosa@example.com'], ['Neil Ferguson', 'neil@example.com'],
  ['Aiko Tanaka', 'aiko@example.com'], ['Marcus Bell', 'marcus.b@example.com'],
  ['Priya Nair', 'priya@example.com'], ['Tom Whitaker', 'tomw@example.com'],
];

export async function seedDatabase({ log = console.log } = {}) {
  log('[seed] clearing collections…');
  await Promise.all([
    User.deleteMany({}), MenuItem.deleteMany({}), DiningTable.deleteMany({}),
    Reservation.deleteMany({}), Event.deleteMany({}), Enquiry.deleteMany({}),
  ]);

  const createdTables = await DiningTable.insertMany(tables);
  log(`[seed] ${createdTables.length} tables`);

  const createdMenu = await MenuItem.insertMany(
    menu.map(([name, course, description, price, dietary, season, order, featured]) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      course, description, price, dietary, season, order, featured,
      image: featured ? img('photo-1414235077428-338989a2e8c0', 900, 700) : '',
      pairing: course === 'mains' ? 'Ask for the by-the-glass list' : undefined,
    }))
  );
  log(`[seed] ${createdMenu.length} menu items`);

  const createdEvents = await Event.insertMany(
    events.map(({ dayOffset, hour, ...rest }) => ({ ...rest, startsAt: at(dayOffset, hour) }))
  );
  log(`[seed] ${createdEvents.length} events`);

  const [demoGuest] = await User.create([
    { name: 'Elena Marsh', email: 'guest@emberandoak.com', password: 'ember1234', phone: '+44 20 7946 0102', visits: 6 },
    { name: 'Front of House', email: 'staff@emberandoak.com', password: 'ember1234', role: 'staff' },
  ]);
  log('[seed] 2 demo users');

  // Fill roughly half of the next ten days so the picker shows real pressure.
  const reservations = [];
  for (let day = 1; day <= 10; day += 1) {
    const dayISO = at(day, 12).toISOString().slice(0, 10);
    const slots = slotsForDay(dayISO).filter((_, i) => i % 3 === 0);

    slots.forEach((slot, i) => {
      const [name, email] = guestNames[(day + i) % guestNames.length];
      const partySize = [2, 2, 4, 2, 6, 4][(day + i) % 6];
      const table = createdTables.find((t) => t.seats >= partySize && t.seats <= partySize + 3);
      if (!table) return;
      reservations.push({
        name, email,
        phone: '+44 20 7946 0100',
        partySize,
        startsAt: slot.startsAt,
        durationMins: durationFor(partySize),
        table: table._id,
        status: 'confirmed',
      });
    });
  }
  await Reservation.insertMany(reservations);
  log(`[seed] ${reservations.length} existing reservations`);

  // A couple of bookings owned by the demo guest so the account page has content.
  const twoTop = createdTables.find((t) => t.seats === 2);
  await Reservation.create([
    {
      guest: demoGuest._id, name: demoGuest.name, email: demoGuest.email, phone: demoGuest.phone,
      partySize: 2, startsAt: at(4, 19, 30), durationMins: 90, table: twoTop._id,
      occasion: 'anniversary', notes: 'Window table if one is free.', status: 'confirmed',
    },
    {
      guest: demoGuest._id, name: demoGuest.name, email: demoGuest.email, phone: demoGuest.phone,
      partySize: 4, startsAt: at(-21, 20), durationMins: 105, table: createdTables.find((t) => t.seats === 4)._id,
      status: 'completed',
    },
  ]);

  await Enquiry.insertMany([
    { name: 'Hannah Cole', email: 'hannah@example.com', kind: 'private-dining', message: 'Looking to book the private room for twelve in early December — is there a set menu?' },
    { name: 'Devon Price', email: 'devon@example.com', kind: 'press', message: 'Writing a piece on wood-fired kitchens for the weekend supplement. Would the chef be available?', status: 'replied' },
  ]);

  log('\n[seed] done. Demo logins:');
  log('  guest@emberandoak.com / ember1234');
  log('  staff@emberandoak.com / ember1234\n');

}

/** CLI entry point: `npm run seed`. Opens and closes its own connection. */
async function run() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing — copy .env.example to .env');
  await connectDB(process.env.MONGO_URI);
  await seedDatabase();
  await disconnectDB();
}

// Only run when executed directly, so importing seedDatabase() from the server
// does not wipe and refill the database as a side effect of the import.
const invokedDirectly =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  run().catch(async (err) => {
    console.error('[seed] failed:', err);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  });
}
