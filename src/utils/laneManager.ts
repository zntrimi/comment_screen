import { LANE_HEIGHT } from './constants';

export class LaneManager {
  private lanes: number[];
  private laneCount: number;

  constructor(screenHeight: number) {
    this.laneCount = Math.floor(screenHeight / LANE_HEIGHT);
    this.lanes = new Array(this.laneCount).fill(0);
  }

  assignLane(): number {
    const now = Date.now();
    let bestLane = 0;
    let bestTime = this.lanes[0] ?? 0;

    for (let i = 0; i < this.laneCount; i++) {
      if ((this.lanes[i] ?? 0) <= now) {
        bestLane = i;
        break;
      }
      if ((this.lanes[i] ?? 0) < bestTime) {
        bestTime = this.lanes[i] ?? 0;
        bestLane = i;
      }
    }

    return bestLane;
  }

  occupyLane(lane: number, durationMs: number): void {
    this.lanes[lane] = Date.now() + durationMs;
  }

  getTopPosition(lane: number): number {
    return lane * LANE_HEIGHT;
  }

  reset(): void {
    this.lanes.fill(0);
  }
}
