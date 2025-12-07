import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const FACEIT_BASE_URL = 'https://open.faceit.com/data/v4';

interface HubMatchItem {
  match_id: string;
  status: string;
}

export interface HubMatchesResponse {
  items: HubMatchItem[];
  start: number;
  end: number;
}

export interface MatchMetaTeamPlayer {
  player_id: string;
  nickname: string;
  avatar?: string;
}

export interface MatchMetaTeam {
  team_id?: string;
  roster: MatchMetaTeamPlayer[];
}

export interface MatchMetaResponse {
  match_id: string;
  status: string;
  teams: {
    [key: string]: MatchMetaTeam;
  };
}

export interface MatchStatsPlayer {
  player_id: string;
  nickname: string;
  player_stats: { [key: string]: string };
}

export interface MatchStatsTeam {
  team_id: string;
  team_stats: { [key: string]: string };
  players: MatchStatsPlayer[];
}

export interface MatchStatsRound {
  match_id: string;
  round_stats: { [key: string]: string };
  teams: MatchStatsTeam[];
}

export interface MatchStatsResponse {
  rounds: MatchStatsRound[];
}

@Injectable({ providedIn: 'root' })
export class FaceitHubService {
  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${environment.faceitApiKey}`
    });
  }

  getHubMatches(
    hubId: string,
    offset = 0,
    limit = 100
  ): Observable<HubMatchesResponse> {
    const url = `${FACEIT_BASE_URL}/hubs/${hubId}/matches?type=past&offset=${offset}&limit=${limit}`;
    return this.http.get<HubMatchesResponse>(url, { headers: this.headers });
  }

  getMatchMeta(matchId: string): Observable<MatchMetaResponse> {
    const url = `${FACEIT_BASE_URL}/matches/${matchId}`;
    return this.http.get<MatchMetaResponse>(url, { headers: this.headers });
  }

  getMatchStats(matchId: string): Observable<MatchStatsResponse> {
    const url = `${FACEIT_BASE_URL}/matches/${matchId}/stats`;
    return this.http.get<MatchStatsResponse>(url, { headers: this.headers });
  }
}
