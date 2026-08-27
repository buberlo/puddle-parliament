export interface LoopCallbacks {
  readonly update: (dt: number) => void;
  readonly render: () => void;
  readonly isPaused?: () => boolean;
}

export interface LoopOptions {
  readonly fixedDeltaSeconds?: number;
  readonly maxFrameDeltaSeconds?: number;
}

const DEFAULT_FIXED_DELTA_SECONDS = 1 / 60;
const DEFAULT_MAX_FRAME_DELTA_SECONDS = 0.25;

export class GameLoop {
  private readonly callbacks: LoopCallbacks;
  private readonly fixedDelta: number;
  private readonly maxFrameDelta: number;

  private accumulator = 0;
  private lastTime = 0;
  private frameId = 0;
  private running = false;

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") {
      this.lastTime = performance.now();
      this.accumulator = 0;
    }
  };

  constructor(callbacks: LoopCallbacks, options: LoopOptions = {}) {
    this.callbacks = callbacks;

    const fixedDelta = options.fixedDeltaSeconds ?? DEFAULT_FIXED_DELTA_SECONDS;
    if (!Number.isFinite(fixedDelta) || fixedDelta <= 0) {
      throw new Error("fixedDeltaSeconds must be a positive finite number.");
    }

    const maxFrameDelta =
      options.maxFrameDeltaSeconds ?? DEFAULT_MAX_FRAME_DELTA_SECONDS;
    if (!Number.isFinite(maxFrameDelta) || maxFrameDelta <= 0) {
      throw new Error("maxFrameDeltaSeconds must be a positive finite number.");
    }

    this.fixedDelta = fixedDelta;
    this.maxFrameDelta = maxFrameDelta;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.accumulator = 0;
    this.lastTime = performance.now();

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    cancelAnimationFrame(this.frameId);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  destroy(): void {
    this.stop();
  }

  private readonly tick = (now: number): void => {
    if (!this.running) {
      return;
    }

    let frameDelta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (frameDelta < 0) {
      frameDelta = 0;
    }

    if (frameDelta > this.maxFrameDelta) {
      frameDelta = this.maxFrameDelta;
    }

    this.accumulator += frameDelta;

    const isPaused = this.callbacks.isPaused
      ? this.callbacks.isPaused()
      : false;

    while (this.accumulator >= this.fixedDelta) {
      if (!isPaused) {
        this.callbacks.update(this.fixedDelta);
      }

      this.accumulator -= this.fixedDelta;
    }

    this.callbacks.render();

    if (this.running) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };
}

export function startLoop(
  callbacks: LoopCallbacks,
  options: LoopOptions = {},
): GameLoop {
  const loop = new GameLoop(callbacks, options);
  loop.start();
  return loop;
}