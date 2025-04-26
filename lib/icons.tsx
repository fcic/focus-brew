import { IconType } from "react-icons";
import {
  WiRain,
  WiThunderstorm,
  WiDaySunnyOvercast,
  WiStrongWind,
  WiSnowflakeCold,
  WiRaindrops,
  WiNightAltStormShowers,
  WiUmbrella,
  WiStars,
  WiTime3,
} from "react-icons/wi";
import {
  GiCampfire,
  GiWaterfall,
  GiWaveSurfer,
  GiJungle,
  GiMountainCave,
  GiCoffeeCup,
  GiSoundWaves,
  GiMusicalNotes,
  GiHeadphones,
  GiRabbit,
  GiShipWheel,
} from "react-icons/gi";
import { FaCity, FaBuilding, FaCar, FaBox, FaVolumeUp } from "react-icons/fa";
import { BsBuildingsFill } from "react-icons/bs";
import { IoSaveSharp, IoTrashBin } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { HiRadio } from "react-icons/hi2";

import { SoundCategory } from "./paths";

export const icons = {
  CloudRain: WiRain,
  Trees: GiJungle,
  Coffee: GiCoffeeCup,
  Flame: GiCampfire,
  Save: IoSaveSharp,
  Trash: IoTrashBin,
  Plus: AiOutlinePlus,
  Volume2: FaVolumeUp,
  Music: GiMusicalNotes,
  Building: FaBuilding,
  Building2: BsBuildingsFill,
  Rabbit: GiRabbit,
  Car: FaCar,
  Package: FaBox,
  Radio: HiRadio,
  Headphones: GiHeadphones,
  Wind: WiStrongWind,
  Bird: GiRabbit,
  Droplets: WiRaindrops,
  Snowflake: WiSnowflakeCold,
  Ship: GiShipWheel,
  Mountain: GiMountainCave,
  Umbrella: WiUmbrella,
  Zap: WiThunderstorm,
  Clock: WiTime3,
  Star: WiStars,
  Waves: GiWaveSurfer,
};

export const getSoundIcon = (
  name: string,
  category: SoundCategory
): IconType => {
  const nameLower = name.toLowerCase();
  const categoryLower = category.toLowerCase();

  // Check name first for more specific matching
  if (nameLower.includes("rain")) return WiRain;
  if (nameLower.includes("thunder")) return WiThunderstorm;
  if (nameLower.includes("forest") || nameLower.includes("jungle"))
    return GiJungle;
  if (nameLower.includes("cafe")) return GiCoffeeCup;
  if (nameLower.includes("fire") || nameLower.includes("campfire"))
    return GiCampfire;
  if (
    nameLower.includes("ocean") ||
    nameLower.includes("waves") ||
    nameLower.includes("water")
  )
    return GiWaveSurfer;
  if (nameLower.includes("wind")) return WiStrongWind;
  if (nameLower.includes("birds")) return GiRabbit;
  if (nameLower.includes("snow")) return WiSnowflakeCold;
  if (nameLower.includes("droplets")) return WiRaindrops;
  if (nameLower.includes("sail") || nameLower.includes("boat"))
    return GiShipWheel;
  if (nameLower.includes("umbrella")) return WiUmbrella;
  if (nameLower.includes("radio")) return HiRadio;
  if (nameLower.includes("alarm")) return WiTime3;
  if (nameLower.includes("mountain") || nameLower.includes("waterfall"))
    return GiMountainCave;
  if (nameLower.includes("clock")) return WiTime3;
  if (nameLower.includes("star") || nameLower.includes("night")) return WiStars;

  // Then check category
  switch (categoryLower) {
    case "nature":
      return GiJungle;
    case "places":
      return FaBuilding;
    case "urban":
      return BsBuildingsFill;
    case "animals":
      return GiRabbit;
    case "transport":
      return FaCar;
    case "things":
      return FaBox;
    case "noise":
      return HiRadio;
    case "binaural":
      return GiHeadphones;
    case "rain":
      return WiRain;
    default:
      return GiMusicalNotes;
  }
};
