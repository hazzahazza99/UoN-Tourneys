// src/app/services/faceit-hub.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const FACEIT_PROXY_URL = environment.faceitProxyUrl;

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

  getHubMatches(
    hubId: string,
    offset = 0,
    limit = 100
  ): Observable<HubMatchesResponse> {
    const url = `${FACEIT_PROXY_URL}?type=hubMatches&hubId=${hubId}&offset=${offset}&limit=${limit}`;
    return this.http.get<HubMatchesResponse>(url);
  }

  getMatchMeta(matchId: string): Observable<MatchMetaResponse> {
    const url = `${FACEIT_PROXY_URL}?type=matchMeta&matchId=${matchId}`;
    return this.http.get<MatchMetaResponse>(url);
  }

  getMatchStats(matchId: string): Observable<MatchStatsResponse> {
    const url = `${FACEIT_PROXY_URL}?type=matchStats&matchId=${matchId}`;
    return this.http.get<MatchStatsResponse>(url);
  }

  getHubLeaderboard(hubId: string, leaderboardId: string): Observable<LeaderboardResponse> {
  const url = `${FACEIT_PROXY_URL}?type=matchLeaderboard&leaderboardId=${leaderboardId}`;
  return this.http.get<LeaderboardResponse>(url);
}
}

export interface LeaderboardPlayer {
  user_id: string;
  nickname: string;
  avatar?: string;
  country: string;
  skill_level: number;
  faceit_url: string;
}

export interface LeaderboardEntry {
  player: LeaderboardPlayer;
  played: number;
  won: number;
  lost: number;
  draw: number;
  points: number;
  win_rate: number;
  current_streak: number;
  position: number;
}

export interface LeaderboardMeta {
  leaderboard_id: string;
  leaderboard_name: string;
  leaderboard_type: string;
  leaderboard_mode: string;
  competition_type: string;
  competition_id: string;
  game_id: string;
  region: string;
  ranking_type: string;
  start_date: number;
  end_date: number;
  min_matches: number;
  points_type: string;
  ranking_boost: number;
  points_per_win: number;
  points_per_loss: number;
  points_per_draw: number;
  starting_points: number;
  status: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardMeta;
  items: LeaderboardEntry[];
  start: number;
  end: number;
}

