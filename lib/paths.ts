export const soundCategories = [
  "nature",
  "rain",
  "places",
  "urban",
  "animals",
  "binaural",
  "noise",
  "things",
  "transport",
] as const;

export type SoundCategory = (typeof soundCategories)[number];

export interface SoundPath {
  id: string;
  name: string;
  audioUrl: string;
  category: SoundCategory;
}

export const soundPaths: SoundPath[] = [
  // Nature
  {
    id: "nature-campfire",
    name: "Campfire",
    audioUrl: "/sounds/nature/campfire.mp3",
    category: "nature",
  },
  {
    id: "nature-waterfall",
    name: "Waterfall",
    audioUrl: "/sounds/nature/waterfall.mp3",
    category: "nature",
  },
  {
    id: "nature-waves",
    name: "Waves",
    audioUrl: "/sounds/nature/waves.mp3",
    category: "nature",
  },
  {
    id: "nature-river",
    name: "River",
    audioUrl: "/sounds/nature/river.mp3",
    category: "nature",
  },
  {
    id: "nature-jungle",
    name: "Jungle",
    audioUrl: "/sounds/nature/jungle.mp3",
    category: "nature",
  },
  {
    id: "nature-wind",
    name: "Wind",
    audioUrl: "/sounds/nature/wind.mp3",
    category: "nature",
  },
  {
    id: "nature-droplets",
    name: "Droplets",
    audioUrl: "/sounds/nature/droplets.mp3",
    category: "nature",
  },
  {
    id: "nature-howling-wind",
    name: "Howling Wind",
    audioUrl: "/sounds/nature/howling-wind.mp3",
    category: "nature",
  },
  {
    id: "nature-walk-in-snow",
    name: "Walk in Snow",
    audioUrl: "/sounds/nature/walk-in-snow.mp3",
    category: "nature",
  },
  {
    id: "nature-walk-on-gravel",
    name: "Walk on Gravel",
    audioUrl: "/sounds/nature/walk-on-gravel.mp3",
    category: "nature",
  },
  {
    id: "nature-walk-on-leaves",
    name: "Walk on Leaves",
    audioUrl: "/sounds/nature/walk-on-leaves.mp3",
    category: "nature",
  },
  {
    id: "nature-wind-in-trees",
    name: "Wind in Trees",
    audioUrl: "/sounds/nature/wind-in-trees.mp3",
    category: "nature",
  },

  // Animals
  {
    id: "animals-beehive",
    name: "Beehive",
    audioUrl: "/sounds/animals/beehive.mp3",
    category: "animals",
  },
  {
    id: "animals-birds",
    name: "Birds",
    audioUrl: "/sounds/animals/birds.mp3",
    category: "animals",
  },
  {
    id: "animals-cat-purring",
    name: "Cat Purring",
    audioUrl: "/sounds/animals/cat-purring.mp3",
    category: "animals",
  },
  {
    id: "animals-chickens",
    name: "Chickens",
    audioUrl: "/sounds/animals/chickens.mp3",
    category: "animals",
  },
  {
    id: "animals-cows",
    name: "Cows",
    audioUrl: "/sounds/animals/cows.mp3",
    category: "animals",
  },
  {
    id: "animals-crickets",
    name: "Crickets",
    audioUrl: "/sounds/animals/crickets.mp3",
    category: "animals",
  },
  {
    id: "animals-crows",
    name: "Crows",
    audioUrl: "/sounds/animals/crows.mp3",
    category: "animals",
  },
  {
    id: "animals-dog-barking",
    name: "Dog Barking",
    audioUrl: "/sounds/animals/dog-barking.mp3",
    category: "animals",
  },
  {
    id: "animals-frog",
    name: "Frog",
    audioUrl: "/sounds/animals/frog.mp3",
    category: "animals",
  },
  {
    id: "animals-horse-galopp",
    name: "Horse Galopp",
    audioUrl: "/sounds/animals/horse-galopp.mp3",
    category: "animals",
  },
  {
    id: "animals-owl",
    name: "Owl",
    audioUrl: "/sounds/animals/owl.mp3",
    category: "animals",
  },
  {
    id: "animals-seagulls",
    name: "Seagulls",
    audioUrl: "/sounds/animals/seagulls.mp3",
    category: "animals",
  },
  {
    id: "animals-sheep",
    name: "Sheep",
    audioUrl: "/sounds/animals/sheep.mp3",
    category: "animals",
  },
  {
    id: "animals-whale",
    name: "Whale",
    audioUrl: "/sounds/animals/whale.mp3",
    category: "animals",
  },
  {
    id: "animals-wolf",
    name: "Wolf",
    audioUrl: "/sounds/animals/wolf.mp3",
    category: "animals",
  },
  {
    id: "animals-woodpecker",
    name: "Woodpecker",
    audioUrl: "/sounds/animals/woodpecker.mp3",
    category: "animals",
  },

  // Binaural
  {
    id: "binaural-alpha",
    name: "Binaural Alpha",
    audioUrl: "/sounds/binaural/binaural-alpha.wav",
    category: "binaural",
  },
  {
    id: "binaural-beta",
    name: "Binaural Beta",
    audioUrl: "/sounds/binaural/binaural-beta.wav",
    category: "binaural",
  },
  {
    id: "binaural-delta",
    name: "Binaural Delta",
    audioUrl: "/sounds/binaural/binaural-delta.wav",
    category: "binaural",
  },
  {
    id: "binaural-gamma",
    name: "Binaural Gamma",
    audioUrl: "/sounds/binaural/binaural-gamma.wav",
    category: "binaural",
  },
  {
    id: "binaural-theta",
    name: "Binaural Theta",
    audioUrl: "/sounds/binaural/binaural-theta.wav",
    category: "binaural",
  },

  // Noise
  {
    id: "noise-brown",
    name: "Brown Noise",
    audioUrl: "/sounds/noise/brown-noise.wav",
    category: "noise",
  },
  {
    id: "noise-pink",
    name: "Pink Noise",
    audioUrl: "/sounds/noise/pink-noise.wav",
    category: "noise",
  },
  {
    id: "noise-white",
    name: "White Noise",
    audioUrl: "/sounds/noise/white-noise.wav",
    category: "noise",
  },

  // Places
  {
    id: "places-airport",
    name: "Airport",
    audioUrl: "/sounds/places/airport.mp3",
    category: "places",
  },
  {
    id: "places-cafe",
    name: "Cafe",
    audioUrl: "/sounds/places/cafe.mp3",
    category: "places",
  },
  {
    id: "places-carousel",
    name: "Carousel",
    audioUrl: "/sounds/places/carousel.mp3",
    category: "places",
  },
  {
    id: "places-church",
    name: "Church",
    audioUrl: "/sounds/places/church.mp3",
    category: "places",
  },
  {
    id: "places-construction-site",
    name: "Construction Site",
    audioUrl: "/sounds/places/construction-site.mp3",
    category: "places",
  },
  {
    id: "places-crowded-bar",
    name: "Crowded Bar",
    audioUrl: "/sounds/places/crowded-bar.mp3",
    category: "places",
  },
  {
    id: "places-laboratory",
    name: "Laboratory",
    audioUrl: "/sounds/places/laboratory.mp3",
    category: "places",
  },
  {
    id: "places-laundry-room",
    name: "Laundry Room",
    audioUrl: "/sounds/places/laundry-room.mp3",
    category: "places",
  },
  {
    id: "places-library",
    name: "Library",
    audioUrl: "/sounds/places/library.mp3",
    category: "places",
  },
  {
    id: "places-night-village",
    name: "Night Village",
    audioUrl: "/sounds/places/night-village.mp3",
    category: "places",
  },
  {
    id: "places-office",
    name: "Office",
    audioUrl: "/sounds/places/office.mp3",
    category: "places",
  },
  {
    id: "places-restaurant",
    name: "Restaurant",
    audioUrl: "/sounds/places/restaurant.mp3",
    category: "places",
  },
  {
    id: "places-subway-station",
    name: "Subway Station",
    audioUrl: "/sounds/places/subway-station.mp3",
    category: "places",
  },
  {
    id: "places-supermarket",
    name: "Supermarket",
    audioUrl: "/sounds/places/supermarket.mp3",
    category: "places",
  },
  {
    id: "places-temple",
    name: "Temple",
    audioUrl: "/sounds/places/temple.mp3",
    category: "places",
  },
  {
    id: "places-underwater",
    name: "Underwater",
    audioUrl: "/sounds/places/underwater.mp3",
    category: "places",
  },

  // Rain
  {
    id: "rain-light",
    name: "Light Rain",
    audioUrl: "/sounds/rain/light-rain.mp3",
    category: "rain",
  },
  {
    id: "rain-heavy",
    name: "Heavy Rain",
    audioUrl: "/sounds/rain/heavy-rain.mp3",
    category: "rain",
  },
  {
    id: "rain-window",
    name: "Rain on Window",
    audioUrl: "/sounds/rain/rain-on-window.mp3",
    category: "rain",
  },
  {
    id: "rain-thunder",
    name: "Thunder",
    audioUrl: "/sounds/rain/thunder.mp3",
    category: "rain",
  },
  {
    id: "rain-on-car-roof",
    name: "Rain on Car Roof",
    audioUrl: "/sounds/rain/rain-on-car-roof.mp3",
    category: "rain",
  },
  {
    id: "rain-on-leaves",
    name: "Rain on Leaves",
    audioUrl: "/sounds/rain/rain-on-leaves.mp3",
    category: "rain",
  },
  {
    id: "rain-on-tent",
    name: "Rain on Tent",
    audioUrl: "/sounds/rain/rain-on-tent.mp3",
    category: "rain",
  },
  {
    id: "rain-on-umbrella",
    name: "Rain on Umbrella",
    audioUrl: "/sounds/rain/rain-on-umbrella.mp3",
    category: "rain",
  },

  // Urban
  {
    id: "urban-ambulance-siren",
    name: "Ambulance Siren",
    audioUrl: "/sounds/urban/ambulance-siren.mp3",
    category: "urban",
  },
  {
    id: "urban-busy-street",
    name: "Busy Street",
    audioUrl: "/sounds/urban/busy-street.mp3",
    category: "urban",
  },
  {
    id: "urban-crowd",
    name: "Crowd",
    audioUrl: "/sounds/urban/crowd.mp3",
    category: "urban",
  },
  {
    id: "urban-fireworks",
    name: "Fireworks",
    audioUrl: "/sounds/urban/fireworks.mp3",
    category: "urban",
  },
  {
    id: "urban-highway",
    name: "Highway",
    audioUrl: "/sounds/urban/highway.mp3",
    category: "urban",
  },
  {
    id: "urban-road",
    name: "Road",
    audioUrl: "/sounds/urban/road.mp3",
    category: "urban",
  },
  {
    id: "urban-traffic",
    name: "Traffic",
    audioUrl: "/sounds/urban/traffic.mp3",
    category: "urban",
  },

  // Things
  {
    id: "things-boiling-water",
    name: "Boiling Water",
    audioUrl: "/sounds/things/boiling-water.mp3",
    category: "things",
  },
  {
    id: "things-bubbles",
    name: "Bubbles",
    audioUrl: "/sounds/things/bubbles.mp3",
    category: "things",
  },
  {
    id: "things-ceiling-fan",
    name: "Ceiling Fan",
    audioUrl: "/sounds/things/ceiling-fan.mp3",
    category: "things",
  },
  {
    id: "things-clock",
    name: "Clock",
    audioUrl: "/sounds/things/clock.mp3",
    category: "things",
  },
  {
    id: "things-dryer",
    name: "Dryer",
    audioUrl: "/sounds/things/dryer.mp3",
    category: "things",
  },
  {
    id: "things-keyboard",
    name: "Keyboard",
    audioUrl: "/sounds/things/keyboard.mp3",
    category: "things",
  },
  {
    id: "things-morse-code",
    name: "Morse Code",
    audioUrl: "/sounds/things/morse-code.mp3",
    category: "things",
  },
  {
    id: "things-paper",
    name: "Paper",
    audioUrl: "/sounds/things/paper.mp3",
    category: "things",
  },
  {
    id: "things-singing-bowl",
    name: "Singing Bowl",
    audioUrl: "/sounds/things/singing-bowl.mp3",
    category: "things",
  },
  {
    id: "things-slide-projector",
    name: "Slide Projector",
    audioUrl: "/sounds/things/slide-projector.mp3",
    category: "things",
  },
  {
    id: "things-tuning-radio",
    name: "Tuning Radio",
    audioUrl: "/sounds/things/tuning-radio.mp3",
    category: "things",
  },
  {
    id: "things-typewriter",
    name: "Typewriter",
    audioUrl: "/sounds/things/typewriter.mp3",
    category: "things",
  },
  {
    id: "things-vinyl-effect",
    name: "Vinyl Effect",
    audioUrl: "/sounds/things/vinyl-effect.mp3",
    category: "things",
  },
  {
    id: "things-washing-machine",
    name: "Washing Machine",
    audioUrl: "/sounds/things/washing-machine.mp3",
    category: "things",
  },
  {
    id: "things-wind-chimes",
    name: "Wind Chimes",
    audioUrl: "/sounds/things/wind-chimes.mp3",
    category: "things",
  },
  {
    id: "things-windshield-wipers",
    name: "Windshield Wipers",
    audioUrl: "/sounds/things/windshield-wipers.mp3",
    category: "things",
  },

  // Transport
  {
    id: "transport-airplane",
    name: "Airplane",
    audioUrl: "/sounds/transport/airplane.mp3",
    category: "transport",
  },
  {
    id: "transport-inside-a-train",
    name: "Inside a Train",
    audioUrl: "/sounds/transport/inside-a-train.mp3",
    category: "transport",
  },
  {
    id: "transport-rowing-boat",
    name: "Rowing Boat",
    audioUrl: "/sounds/transport/rowing-boat.mp3",
    category: "transport",
  },
  {
    id: "transport-sailboat",
    name: "Sailboat",
    audioUrl: "/sounds/transport/sailboat.mp3",
    category: "transport",
  },
  {
    id: "transport-submarine",
    name: "Submarine",
    audioUrl: "/sounds/transport/submarine.mp3",
    category: "transport",
  },
  {
    id: "transport-train",
    name: "Train",
    audioUrl: "/sounds/transport/train.mp3",
    category: "transport",
  },

  // Alarm (no category)
  {
    id: "alarm",
    name: "Alarm",
    audioUrl: "/sounds/alarm.mp3",
    category: "things",
  },
];
