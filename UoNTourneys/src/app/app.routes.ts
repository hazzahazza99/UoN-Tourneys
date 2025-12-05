import { Routes } from '@angular/router';
import { MatchViewerComponent } from './components/match-viewer/match-viewer';

export const routes: Routes = [
    { path: '', component: MatchViewerComponent },
    { path: '**', redirectTo: '' }
];
