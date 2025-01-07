let bgAudio: HTMLAudioElement | null = null;

export const initAudio = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        bgAudio = document.getElementById('bg-audio') as HTMLAudioElement;
        if (bgAudio) {
            bgAudio.volume = 0.6; // Set initial volume
            bgAudio.play()
                .then(() => resolve())
                .catch((error) => reject(error));
        } else {
            resolve();
        }
    });
}

export const fadeOutAndStop = (duration: number = 1000): Promise<void> => {
    return new Promise<void>((resolve) => {
        if (!bgAudio) {
            resolve();
            return;
        }

        const startVolume: number = bgAudio.volume;
        const steps: number = 20; // Number of steps in the fade
        const volumeStep: number = startVolume / steps;
        const intervalTime: number = duration / steps;

        const fadeInterval: ReturnType<typeof setInterval> = setInterval(() => {
            if (bgAudio) {
                if (bgAudio.volume > volumeStep) {
                    bgAudio.volume -= volumeStep;
                } else {
                    bgAudio.volume = 0;
                    bgAudio.pause();
                    clearInterval(fadeInterval);
                    resolve();
                }
            }
        }, intervalTime);
    });
}

// Optional: Add error handling interface
interface AudioError extends Error {
    code?: number;
}

// Optional: Add a type for the audio controller
export interface AudioController {
    initAudio: () => Promise<void>;
    fadeOutAndStop: (duration?: number) => Promise<void>;
}

// Optional: Add a cleanup function
export const cleanup = (): void => {
    if (bgAudio) {
        bgAudio.pause();
        bgAudio.currentTime = 0;
        bgAudio = null;
    }
}
