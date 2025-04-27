"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { soundCategories, soundPaths, type SoundCategory } from "@/lib/paths";
import { getSoundIcon, icons } from "@/lib/icons";
import { SaveIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  audioUrl: string;
  volume: number;
  playing: boolean;
  category: string;
  isLoading?: boolean;
  error?: string;
}

interface SoundMix {
  id: string;
  name: string;
  sounds: {
    id: string;
    volume: number;
    playing: boolean;
  }[];
  createdAt: string;
}

interface SoundCardProps {
  sound: Sound;
  onToggle: (id: string) => void;
  onVolumeChange: (id: string, volume: number) => void;
}

interface MasterVolumeProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

interface SaveMixProps {
  mixName: string;
  onMixNameChange: (name: string) => void;
  onSave: () => void;
  isValid: boolean;
}

interface SavedMixCardProps {
  mix: SoundMix;
  sounds: Sound[];
  onLoad: (mix: SoundMix) => void;
  onDelete: (id: string) => void;
}

const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
} as const;

const DEFAULT_VOLUME = 50;
const MAX_VOLUME = 100;
const MIN_VOLUME = 0;

const SoundCard = React.memo(function SoundCard({
  sound,
  onToggle,
  onVolumeChange,
}: SoundCardProps) {
  const handleSliderClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div {...ANIMATION_CONFIG}>
      <div
        className={cn(
          "p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm",
          "hover:border-zinc-700/50 transition-all cursor-pointer",
          sound.playing && "border-zinc-700 bg-zinc-800/50",
          sound.error && "border-red-900/50"
        )}
        onClick={() => onToggle(sound.id)}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className={cn(
              "p-2 bg-zinc-800 rounded-lg",
              sound.isLoading && "animate-pulse"
            )}
          >
            {sound.icon}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-zinc-200">
              {sound.name}
            </span>
            {sound.error && (
              <p className="text-xs text-red-400 mt-0.5">{sound.error}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-zinc-400">
            {React.createElement(icons.Volume2)}
          </div>
          <Slider
            value={[sound.volume]}
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            step={1}
            onValueChange={(value) => onVolumeChange(sound.id, value[0])}
            onClick={handleSliderClick}
            onMouseDown={handleSliderClick}
            onMouseUp={handleSliderClick}
            disabled={!sound.playing || sound.isLoading || !!sound.error}
            className={cn(
              "flex-1",
              (sound.isLoading || sound.error) && "opacity-50"
            )}
          />
          <span className="text-xs text-zinc-400 w-8 text-right">
            {sound.volume}%
          </span>
        </div>
      </div>
    </motion.div>
  );
});

const MasterVolume = React.memo(function MasterVolume({
  volume,
  onVolumeChange,
}: MasterVolumeProps) {
  return (
    <div className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg">
          <div className="w-4 h-4 text-zinc-400">
            {React.createElement(icons.Volume2)}
          </div>
        </div>
        <span className="text-sm font-medium text-zinc-200">Master Volume</span>
        <span className="text-xs text-zinc-400 ml-auto">{volume}%</span>
      </div>
      <Slider
        value={[volume]}
        min={MIN_VOLUME}
        max={MAX_VOLUME}
        step={1}
        onValueChange={(value) => onVolumeChange(value[0])}
        className="flex-1"
      />
    </div>
  );
});

const SaveMix = React.memo(function SaveMix({
  mixName,
  onMixNameChange,
  onSave,
  isValid,
}: SaveMixProps) {
  return (
    <div className="flex items-end gap-2 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
      <div className="flex-1">
        <Label htmlFor="mix-name" className="text-sm mb-2 block text-zinc-400">
          Mix Name
        </Label>
        <Input
          id="mix-name"
          value={mixName}
          onChange={(e) => onMixNameChange(e.target.value)}
          placeholder="My custom mix"
          className="h-9 bg-zinc-800/50 border-zinc-700/50 text-zinc-200 focus:border-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <Button
        onClick={onSave}
        disabled={!isValid}
        size="sm"
        className={cn(
          "bg-zinc-800 hover:bg-zinc-700 text-zinc-200",
          "border border-zinc-700/50",
          "disabled:bg-zinc-900 disabled:text-zinc-500"
        )}
      >
        <SaveIcon className="w-4 h-4" />
      </Button>
    </div>
  );
});

const SavedMixCard = React.memo(function SavedMixCard({
  mix,
  sounds,
  onLoad,
  onDelete,
}: SavedMixCardProps) {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(mix.id);
    },
    [mix.id, onDelete]
  );

  const activeSounds = useMemo(
    () =>
      mix.sounds
        .filter((s) => s.playing)
        .map((s) => {
          const soundInfo = sounds.find((ds) => ds.id === s.id);
          return { ...s, info: soundInfo };
        }),
    [mix.sounds, sounds]
  );

  return (
    <div
      className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700/50 transition-all cursor-pointer"
      onClick={() => onLoad(mix)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <div className="w-4 h-4 text-zinc-400">
              {React.createElement(icons.Music)}
            </div>
          </div>
          <span className="text-sm font-medium text-zinc-200">{mix.name}</span>
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            Load
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <div className="w-4 h-4">{React.createElement(icons.Trash)}</div>
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {activeSounds.map((s) => (
          <div
            key={s.id}
            className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full flex items-center gap-1.5"
          >
            <div className="w-3 h-3 text-zinc-400">{s.info?.icon}</div>
            <span>
              {s.info?.name}: {s.volume}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export function AmbientSounds() {
  const [sounds, setSounds] = useState<Sound[]>(() => {
    // Tenta carregar as configurações de volume do localStorage
    const savedVolumes = localStorage.getItem("ambient-sound-volumes");
    const volumeMap: Record<string, number> = savedVolumes
      ? JSON.parse(savedVolumes)
      : {};

    return soundPaths.map((sound) => ({
      ...sound,
      icon: (
        <div className="w-5 h-5">
          {React.createElement(getSoundIcon(sound.name, sound.category))}
        </div>
      ),
      // Usa o volume salvo ou o volume padrão
      volume: volumeMap[sound.id] || DEFAULT_VOLUME,
      playing: false,
      isLoading: false,
      error: undefined,
    }));
  });

  const [masterVolume, setMasterVolume] = useLocalStorage<number>(
    "ambient-master-volume",
    DEFAULT_VOLUME
  );

  const [savedMixes, setSavedMixes] = useLocalStorage<SoundMix[]>(
    "sound-mixes",
    []
  );
  const [newMixName, setNewMixName] = useState("");
  const [activeTab, setActiveTab] = useState<SoundCategory>("nature");

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const loadingStatus = useRef<{ [key: string]: boolean }>({});
  const initialized = useRef<{ [key: string]: boolean }>({});
  const playPromises = useRef<{ [key: string]: Promise<void> }>({});
  const activeAudioState = useRef<{ [key: string]: boolean }>({});
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sortedMixes = useMemo(
    () =>
      [...savedMixes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [savedMixes]
  );

  const filteredSounds = useMemo(
    () => sounds.filter((sound) => sound.category === activeTab),
    [sounds, activeTab]
  );

  useEffect(() => {
    soundPaths.forEach((sound) => {
      if (!initialized.current[sound.id]) {
        initialized.current[sound.id] = true;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
          audio.load();
        }
      });
      audioRefs.current = {};
      loadingStatus.current = {};
      initialized.current = {};
      playPromises.current = {};
    };
  }, []);

  const initializeAudio = useCallback(
    (soundId: string) => {
      // Encontre as informações do som
      const soundInfo = sounds.find((s) => s.id === soundId);
      if (!soundInfo) {
        console.warn(`Sound with id ${soundId} not found`);
        return null;
      }

      // Se já existir uma instância de áudio para este som, retorne-a
      if (audioRefs.current[soundId] && audioRefs.current[soundId].src) {
        return audioRefs.current[soundId];
      }

      try {
        // Verificar se a URL é válida
        const audioPath = soundInfo.audioUrl;
        if (!audioPath) {
          throw new Error(`Invalid audio path for sound ${soundId}`);
        }

        // Criação do elemento de áudio com uma abordagem mais segura
        const audio = document.createElement("audio");

        // Configurar propriedades básicas
        audio.preload = "auto";
        audio.loop = true;
        audio.crossOrigin = "anonymous"; // Evitar problemas CORS

        // Definir manipuladores de eventos antes de configurar src
        const handleCanPlay = () => {
          loadingStatus.current[soundId] = false;
          setSounds((prev) =>
            prev.map((s) =>
              s.id === soundId
                ? { ...s, isLoading: false, error: undefined }
                : s
            )
          );
        };

        const handleError = (e: Event) => {
          loadingStatus.current[soundId] = false;

          // Se a janela estiver sendo arrastada, trate o erro de forma diferente
          if (isDragging) {
            console.warn(
              `Audio error during window drag for ${soundId} - will attempt recovery`
            );
            // Não atualize o estado para erro, apenas registre aviso
            return;
          }

          // Logs detalhados para depuração
          console.error(`Error loading sound ${soundId}:`, {
            errorEvent: e,
            errorType: e.type,
            target: e.target,
            path: audioPath,
            details: "Audio loading failed",
          });

          setSounds((prev) =>
            prev.map((s) =>
              s.id === soundId
                ? {
                    ...s,
                    isLoading: false,
                    error: "Failed to load sound",
                    playing: false,
                  }
                : s
            )
          );
        };

        // Adicionar ouvintes de eventos
        audio.addEventListener("canplaythrough", handleCanPlay);
        audio.addEventListener("error", handleError);

        // Função para garantir limpeza adequada do elemento de áudio
        const cleanupAudio = () => {
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          audio.src = "";
          audio.load();
        };

        // Armazenar para limpeza futura
        const cleanup = {
          cleanupFn: cleanupAudio,
          hasError: false,
        };

        // Verificar se o arquivo existe antes de atribuir ao src
        fetch(audioPath, { method: "HEAD" })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // O arquivo existe, configure o src com uma verificação de erro
            audio.src = audioPath;

            // Safari e alguns navegadores não acionam eventos se src for definido depois
            // Força o carregamento do áudio
            audio.load();
          })
          .catch((error) => {
            console.error(`Could not access audio file for ${soundId}:`, error);

            cleanup.hasError = true;
            cleanupAudio();

            setSounds((prev) =>
              prev.map((s) =>
                s.id === soundId
                  ? {
                      ...s,
                      isLoading: false,
                      error: "Sound file not accessible",
                      playing: false,
                    }
                  : s
              )
            );
          });

        // Armazenar a referência do áudio
        audioRefs.current[soundId] = audio;

        return audio;
      } catch (error) {
        console.error(`Exception setting up audio for ${soundId}:`, error);

        setSounds((prev) =>
          prev.map((s) =>
            s.id === soundId
              ? {
                  ...s,
                  isLoading: false,
                  error: "Failed to initialize audio",
                  playing: false,
                }
              : s
          )
        );

        return null;
      }
    },
    [sounds, isDragging]
  );

  const toggleSound = useCallback((id: string) => {
    setSounds((prev) =>
      prev.map((sound) => {
        if (sound.id === id) {
          const newPlaying = !sound.playing;
          if (!newPlaying && audioRefs.current[id]) {
            if (!playPromises.current[id]) {
              audioRefs.current[id].pause();
              audioRefs.current[id].currentTime = 0;
            } else {
              console.log(
                `Scheduled pause for ${id} after play promise resolves`
              );
            }
            return { ...sound, playing: false, error: undefined };
          }
          return {
            ...sound,
            playing: newPlaying,
            isLoading: newPlaying,
            error: undefined,
          };
        }
        return sound;
      })
    );
  }, []);

  const handleVolumeChange = useCallback((id: string, volume: number) => {
    setSounds((prev) =>
      prev.map((sound) => (sound.id === id ? { ...sound, volume } : sound))
    );
  }, []);

  const handleMasterVolumeChange = useCallback((volume: number) => {
    setMasterVolume(volume);
  }, []);

  const handleSaveMix = useCallback(() => {
    if (!newMixName.trim()) return;

    const newMix: SoundMix = {
      id: crypto.randomUUID(),
      name: newMixName.trim(),
      sounds: sounds.map(({ id, volume, playing }) => ({
        id,
        volume,
        playing,
      })),
      createdAt: new Date().toISOString(),
    };

    setSavedMixes((prev) => [newMix, ...prev]);
    setNewMixName("");
  }, [newMixName, sounds, setSavedMixes]);

  const handleLoadMix = useCallback((mix: SoundMix) => {
    setSounds((prev) =>
      prev.map((sound) => {
        const mixSound = mix.sounds.find((s) => s.id === sound.id);
        return mixSound
          ? { ...sound, volume: mixSound.volume, playing: mixSound.playing }
          : sound;
      })
    );
  }, []);

  const handleDeleteMix = useCallback(
    (id: string) => {
      setSavedMixes((prev) => prev.filter((mix) => mix.id !== id));
    },
    [setSavedMixes]
  );

  useEffect(() => {
    const updateAudio = async () => {
      // Se estiver arrastando, armazene o estado atual dos sons em vez de atualizar os áudios
      if (isDragging) {
        // Armazene quais sons estavam tocando para restauração posterior
        sounds.forEach((sound) => {
          activeAudioState.current[sound.id] = sound.playing;
        });
        return;
      }

      const playingSounds = sounds.filter((sound) => sound.playing);

      for (const sound of playingSounds) {
        // Inicializar áudio se necessário
        if (!audioRefs.current[sound.id]) {
          initializeAudio(sound.id);
          // Continue para o próximo ciclo para dar tempo ao áudio de ser inicializado
          continue;
        }

        const audio = audioRefs.current[sound.id];
        if (!audio || !audio.src) {
          // Se ainda não temos o áudio ou src não está definido, marque como erro
          setSounds((prev) =>
            prev.map((s) =>
              s.id === sound.id
                ? {
                    ...s,
                    playing: false,
                    isLoading: false,
                    error: "Audio unavailable",
                  }
                : s
            )
          );
          continue;
        }

        // Atualizar o volume
        const newVolume =
          (sound.volume / MAX_VOLUME) * (masterVolume / MAX_VOLUME);
        if (Math.abs(audio.volume - newVolume) > 0.01) {
          audio.volume = newVolume;
        }

        // Reproduzir áudio se necessário
        if (sound.playing && audio.paused && !playPromises.current[sound.id]) {
          try {
            // Se o áudio não estiver totalmente carregado, aguarde
            if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
              // Usar try/catch diretamente na operação play()
              try {
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                  // Registrar a promessa
                  playPromises.current[sound.id] = playPromise;

                  playPromise
                    .then(() => {
                      // Limpar a referência quando a promessa for resolvida
                      delete playPromises.current[sound.id];

                      // Verificar se o som deve ser pausado
                      const currentSoundState = sounds.find(
                        (s) => s.id === sound.id
                      );
                      if (
                        currentSoundState &&
                        !currentSoundState.playing &&
                        !audio.paused
                      ) {
                        audio.pause();
                        audio.currentTime = 0;
                      }
                    })
                    .catch((error) => {
                      // Limpar a referência quando falhar
                      delete playPromises.current[sound.id];

                      console.error(
                        `Play promise rejected for ${sound.id}:`,
                        error
                      );
                      let errorMessage = "Playback failed";

                      if (error.name === "NotAllowedError") {
                        errorMessage =
                          "Browser requires user interaction before playing audio";
                      }

                      setSounds((prev) =>
                        prev.map((s) =>
                          s.id === sound.id
                            ? {
                                ...s,
                                playing: false,
                                isLoading: false,
                                error: errorMessage,
                              }
                            : s
                        )
                      );
                    });
                }
              } catch (immediateError) {
                console.error(
                  `Immediate exception playing ${sound.id}:`,
                  immediateError
                );
                setSounds((prev) =>
                  prev.map((s) =>
                    s.id === sound.id
                      ? {
                          ...s,
                          playing: false,
                          isLoading: false,
                          error: "Playback error",
                        }
                      : s
                  )
                );
              }
            } else {
              // Áudio ainda carregando, mantenha o estado de carregamento
              setSounds((prev) =>
                prev.map((s) =>
                  s.id === sound.id ? { ...s, isLoading: true } : s
                )
              );
            }
          } catch (outerError) {
            console.error(
              `Outer exception in audio handling for ${sound.id}:`,
              outerError
            );
            setSounds((prev) =>
              prev.map((s) =>
                s.id === sound.id
                  ? {
                      ...s,
                      playing: false,
                      isLoading: false,
                      error: "Audio system error",
                    }
                  : s
              )
            );
          }
        }
      }

      // Gerenciar sons que não estão tocando
      const nonPlayingSounds = sounds.filter((sound) => !sound.playing);
      for (const sound of nonPlayingSounds) {
        const audio = audioRefs.current[sound.id];
        if (audio) {
          // Só pausar se não houver operação pendente
          if (!playPromises.current[sound.id] && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        }
      }
    };

    updateAudio();
  }, [sounds, masterVolume, initializeAudio, isDragging]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target as HTMLElement)?.matches?.("input, textarea")
      ) {
        e.preventDefault();
        setMasterVolume((prev) => (prev === 0 ? DEFAULT_VOLUME : 0));
      }

      if (
        e.code &&
        e.code.match(/Digit[1-9]/) &&
        !(e.target as HTMLElement)?.matches?.("input, textarea")
      ) {
        const volume = parseInt(e.code.replace("Digit", "")) * 10;
        setMasterVolume(volume);
      }

      if (e.altKey && e.code && e.code.match(/Digit[1-5]/)) {
        const index = parseInt(e.code.replace("Digit", "")) - 1;
        if (index < soundCategories.length) {
          setActiveTab(soundCategories[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    return () => {
      Object.entries(playPromises.current).forEach(([id, promise]) => {
        promise
          .catch(() => {})
          .finally(() => {
            if (audioRefs.current[id]) {
              audioRefs.current[id].pause();
            }
          });
      });
    };
  }, []);

  // Salva os volumes dos sons no localStorage quando eles mudam
  useEffect(() => {
    const volumeMap: Record<string, number> = {};
    sounds.forEach((sound) => {
      volumeMap[sound.id] = sound.volume;
    });

    localStorage.setItem("ambient-sound-volumes", JSON.stringify(volumeMap));
  }, [sounds]);

  // Adicionar detecção de arrasto de janela
  useEffect(() => {
    // Detectar o início do arrasto
    const handleDragStart = () => {
      setIsDragging(true);

      // Limpar qualquer timeout existente
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };

    // Detectar o fim do arrasto e configurar um pequeno atraso para restaurar áudios
    const handleDragEnd = () => {
      // Definir um timeout para restaurar os áudios após um breve atraso
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      // Fornecer um atraso para permitir que o navegador se estabilize após o arrasto
      dragTimeoutRef.current = setTimeout(() => {
        setIsDragging(false);
        // Tentar restaurar áudios que estavam ativos
        restoreAudiosAfterDrag();
      }, 500);
    };

    // Usar eventos de mouse como proxy para detecção de arrasto de janela
    window.addEventListener("mousedown", handleDragStart);
    window.addEventListener("mouseup", handleDragEnd);

    return () => {
      window.removeEventListener("mousedown", handleDragStart);
      window.removeEventListener("mouseup", handleDragEnd);

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  // Função para restaurar áudios após arrasto
  const restoreAudiosAfterDrag = useCallback(() => {
    // Apenas continue se não estiver mais arrastando
    if (isDragging) return;

    // Para cada som que deveria estar tocando
    sounds.forEach((sound) => {
      if (sound.playing) {
        // Verifique se há um elemento de áudio
        const audio = audioRefs.current[sound.id];

        if (audio) {
          // Se estiver pausado mas deveria estar tocando, tente restaurar
          if (audio.paused) {
            try {
              // Defina o volume correto
              const newVolume =
                (sound.volume / MAX_VOLUME) * (masterVolume / MAX_VOLUME);
              if (Math.abs(audio.volume - newVolume) > 0.01) {
                audio.volume = newVolume;
              }

              // Tente reproduzir novamente se o som deveria estar ativo
              if (!playPromises.current[sound.id]) {
                console.log(`Restoring audio for ${sound.id} after drag`);
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                  playPromises.current[sound.id] = playPromise;

                  playPromise
                    .then(() => {
                      delete playPromises.current[sound.id];
                    })
                    .catch((error) => {
                      delete playPromises.current[sound.id];
                      console.warn(
                        `Could not restore audio ${sound.id} after drag:`,
                        error
                      );
                    });
                }
              }
            } catch (error) {
              console.warn(
                `Error restoring audio ${sound.id} after drag:`,
                error
              );
            }
          }
        } else {
          // Se o áudio não existir, tente reinicializá-lo
          initializeAudio(sound.id);
        }
      }
    });
  }, [sounds, masterVolume, isDragging, initializeAudio]);

  // Adicionar efeito para tentar restaurar áudios após o arrasto ser concluído
  useEffect(() => {
    // Quando isDragging muda de true para false, tente restaurar os áudios
    if (!isDragging) {
      restoreAudiosAfterDrag();
    }
  }, [isDragging, restoreAudiosAfterDrag]);

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between p-6 pb-4">
        <MasterVolume
          volume={masterVolume}
          onVolumeChange={handleMasterVolumeChange}
        />
        <div className="text-xs text-zinc-500">
          <kbd className="px-2 py-1 bg-zinc-800 rounded">Space</kbd> Toggle
          Sound
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 px-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {soundCategories.map((category, index) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap",
                  "bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50",
                  "text-zinc-400 hover:text-zinc-200",
                  activeTab === category &&
                    "bg-zinc-800 text-zinc-200 border-zinc-700"
                )}
                onClick={() => setActiveTab(category)}
              >
                <span className="hidden sm:inline mr-1 text-zinc-500">
                  Alt+{index + 1}
                </span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea
          className="flex-1 pr-4"
          style={{ height: "calc(100vh - 280px)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredSounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                onToggle={toggleSound}
                onVolumeChange={handleVolumeChange}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm p-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-200">Saved Mixes</h3>
          <span className="text-xs text-zinc-500">
            Create custom combinations
          </span>
        </div>
        <SaveMix
          mixName={newMixName}
          onMixNameChange={setNewMixName}
          onSave={handleSaveMix}
          isValid={newMixName.trim().length > 0}
        />
        {sortedMixes.length > 0 && (
          <ScrollArea className="pr-4 mt-4" style={{ maxHeight: "160px" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedMixes.map((mix) => (
                <SavedMixCard
                  key={mix.id}
                  mix={mix}
                  sounds={sounds}
                  onLoad={handleLoadMix}
                  onDelete={handleDeleteMix}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
