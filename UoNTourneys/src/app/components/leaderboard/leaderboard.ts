import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  LeaderboardService,
  FaceitLeaderboardResponse,
  FaceitLeaderboardItem
} from '../../services/leaderboard';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.scss']
})
export class LeaderboardComponent {
  leaderboardId = '692def172584a759a9bd3eed';

  loading = false;
  error: string | null = null;
  data: FaceitLeaderboardResponse | null = null;

  // NEW: dedicated avatar column
  displayedColumns: string[] = [
    'position',
    'avatar',
    'player',
    'elo',
    'played',
    'won',
    'lost',
    'winrate',
    'streak'
  ];

  constructor(private leaderboardService: LeaderboardService) {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    if (!this.leaderboardId) {
      this.error = 'Please enter a leaderboard ID.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.leaderboardService.getLeaderboard(this.leaderboardId, 0, 50).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load leaderboard. Check the ID, API key and CORS.';
        this.loading = false;
      }
    });
  }

  onReload() {
    this.loadLeaderboard();
  }

  trackByPlayer(_: number, row: FaceitLeaderboardItem) {
    return row.player.user_id;
  }

  getFaceitUrl(row: FaceitLeaderboardItem): string {
    return row.player.faceit_url.replace('{lang}', 'en');
  }

  getWinRatePercent(row: FaceitLeaderboardItem): number {
    return row.win_rate * 100;
  }
}
