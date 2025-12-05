import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  MatchService,
  FaceitMatchSummary,
  FaceitTeam,
  FaceitPlayerStats
} from '../../services/match';

@Component({
  selector: 'app-match-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './match-viewer.html',
  styleUrls: ['./match-viewer.scss']
})
export class MatchViewerComponent {
  matchId = '1-961f1182-24de-43a8-81f9-5a43efbeab3c'; // default example
  loading = false;
  error: string | null = null;
  match: FaceitMatchSummary | null = null;

  displayedColumns: string[] = ['nickname', 'kills', 'deaths', 'kd', 'adr', 'hs', 'mvps'];

  constructor(private matchService: MatchService) {}

  onFetch() {
    if (!this.matchId) {
      this.error = 'Please enter a match ID.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.match = null;

    this.matchService.getMatchStats(this.matchId).subscribe({
      next: (res) => {
        this.match = this.matchService.mapToSummary(res);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load match stats. Check the ID, API key and CORS.';
        this.loading = false;
      }
    });
  }

  getTeamCssClass(team: FaceitTeam): string {
    return team.win ? 'team-card team-win' : 'team-card team-loss';
  }

  getTotalKills(team: FaceitTeam): number {
    return team.players.reduce((sum, p) => sum + p.kills, 0);
  }

  getAverageADR(team: FaceitTeam): number | null {
    const adrValues = team.players
      .map(p => p.adr)
      .filter((a): a is number => typeof a === 'number');

    if (!adrValues.length) return null;
    return adrValues.reduce((sum, a) => sum + a, 0) / adrValues.length;
  }

  getTopFragger(team: FaceitTeam): FaceitPlayerStats | null {
    if (!team.players.length) return null;
    return team.players.reduce((top, p) => (p.kills > top.kills ? p : top), team.players[0]);
  }

  trackByPlayer(_: number, player: FaceitPlayerStats) {
    return player.player_id;
  }
}
