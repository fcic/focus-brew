import type { VolumeSettings } from "@/components/settings/volume-settings";

declare global {
  interface WindowEventMap {
    volume_settings_changed: CustomEvent<VolumeSettings>;
  }

  interface Window {
    _testSoundInstance?: HTMLAudioElement;
    _notificationSoundInstance?: HTMLAudioElement;
  }
}
