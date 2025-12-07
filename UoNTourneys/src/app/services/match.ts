import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FaceitPlayerStats {
  player_id: string;
  nickname: string;
  kills: number;
  deaths: number;
  adr?: number;
  result?: number;
  headshots?: number;
  headshotPercent?: number;
  mvps?: number;
  kdRatio?: number;
  krRatio?: number;
}

export interface FaceitTeam {
  team_id: string;
  name: string;
  win: boolean;
  finalScore: number;
  players: FaceitPlayerStats[];
}

export interface FaceitMatchSummary {
  matchId: string;
  map: string;
  region: string;
  score: string;
  rounds: number;
  teams: FaceitTeam[];
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = environment.faceitProxyUrl;

  constructor(private http: HttpClient) {}

  getMatchStats(matchId: string): Observable<any> {
    const url = `${this.baseUrl}/matches/${matchId}/stats`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.faceitProxyUrl}`
    });

    return this.http.get<any>(url, { headers });
  }

  mapToSummary(apiResponse: any): FaceitMatchSummary {
    const round = apiResponse.rounds?.[0];

    const map = round?.round_stats?.Map ?? 'Unknown';
    const region = round?.round_stats?.Region ?? 'Unknown';
    const score = round?.round_stats?.Score ?? '';
    const rounds = Number(round?.round_stats?.Rounds ?? 0);

    const teams: FaceitTeam[] = (round?.teams ?? []).map((t: any) => {
      const teamStats = t.team_stats ?? {};
      const finalScore = Number(teamStats['Final Score'] ?? 0);
      const win = teamStats['Team Win'] === '1';
      const name = teamStats['Team'] ?? t.team_id;

      const players: FaceitPlayerStats[] = (t.players ?? []).map((p: any) => {
        const ps = p.player_stats ?? {};

        const kills = Number(ps['Kills'] ?? 0);
        const deaths = Number(ps['Deaths'] ?? 0);

        return {
          player_id: p.player_id,
          nickname: p.nickname,
          kills,
          deaths,
          adr: ps['ADR'] !== undefined ? Number(ps['ADR']) : undefined,
          result: ps['Result'] !== undefined ? Number(ps['Result']) : undefined,
          headshots: ps['Headshots'] !== undefined ? Number(ps['Headshots']) : undefined,
          headshotPercent: ps['Headshots %'] !== undefined ? Number(ps['Headshots %']) : undefined,
          mvps: ps['MVPs'] !== undefined ? Number(ps['MVPs']) : undefined,
          kdRatio: ps['K/D Ratio'] !== undefined ? Number(ps['K/D Ratio']) : (deaths ? kills / deaths : undefined),
          krRatio: ps['K/R Ratio'] !== undefined ? Number(ps['K/R Ratio']) : undefined
        };
      });

      return {
        team_id: t.team_id,
        name,
        win,
        finalScore,
        players
      };
    });

    return {
      matchId: round?.match_id ?? '',
      map,
      region,
      score,
      rounds,
      teams
    };
  }
}
