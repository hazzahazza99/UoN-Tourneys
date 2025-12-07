import { Routes } from '@angular/router';
import { MatchViewerComponent } from './components/match-viewer/match-viewer';
import { LeaderboardComponent } from './components/leaderboard/leaderboard';
import { HubPlayerStatsComponent } from './components/hub-player-stats/hub-player-stats';

export const routes: Routes = [
    { path: '', component: HubPlayerStatsComponent  },
    { path: '**', redirectTo: '' }
];
