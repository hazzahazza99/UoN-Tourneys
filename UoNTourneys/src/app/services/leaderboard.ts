import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FaceitLeaderboardMeta {
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

export interface FaceitLeaderboardPlayer {
  user_id: string;
  nickname: string;
  avatar?: string;
  country: string;
  skill_level: number;
  faceit_url: string;
}

export interface FaceitLeaderboardItem {
  player: FaceitLeaderboardPlayer;
  played: number;
  won: number;
  lost: number;
  draw: number;
  points: number;
  win_rate: number;       // 0–1
  current_streak: number;
  position: number;
}

export interface FaceitLeaderboardResponse {
  leaderboard: FaceitLeaderboardMeta;
  items: FaceitLeaderboardItem[];
  start: number;
  end: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private baseUrl = environment.faceitProxyUrl;

  constructor(private http: HttpClient) {}

  getLeaderboard(
    leaderboardId: string,
    offset = 0,
    limit = 50
  ): Observable<FaceitLeaderboardResponse> {
    const url = `${this.baseUrl}/leaderboards/${leaderboardId}?offset=${offset}&limit=${limit}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.faceitProxyUrl}`
    });

    return this.http.get<FaceitLeaderboardResponse>(url, { headers });
  }
}
