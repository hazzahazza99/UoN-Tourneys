import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  FaceitHubService,
  MatchMetaResponse,
  MatchStatsResponse,
  MatchStatsRound
} from '../../services/faceit-hub';
import { firstValueFrom } from 'rxjs';

export interface AggregatedPlayerStats {
  playerId: string;
  nickname: string;
  avatar?: string;

  matches: number;
  wins: number;
  winRate: number; // %

  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;

  // totals
  damage: number;
  headshots: number;

  kdRatio: number;
  krRatio: number;   // kills / round
  adr: number;       // damage / round
  hsPercent: number; // %

  doubleKills: number;
  tripleKills: number;
  quadroKills: number;
  pentaKills: number;

  clutchKills: number;

  firstKills: number;
  entryCount: number;

  // clutches
  oneV2Count: number;
  oneV2Wins: number;
  oneV1Count: number;
  oneV1Wins: number;

  // flashes / util
  flashCount: number;
  flashSuccesses: number;
  enemiesFlashed: number;

  utilityDamage: number;      // total utility damage
  utilityCount: number;       // total utility uses
  utilitySuccesses: number;   // total successful utility
  utilityUsagePerRound: number;

  pistolKills: number;
  sniperKills: number;
  knifeKills: number;
  zeusKills: number;

  // leaderboard
  points: number;
  leaderboardPosition: number;
  leaderboardWins: number;
  leaderboardPlayed: number;
}

type RankInfo = { first: number; second: number; third: number };

@Component({
  selector: 'app-hub-player-stats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './hub-player-stats.html',
  styleUrl: './hub-player-stats.scss'
})
export class HubPlayerStatsComponent implements OnInit, AfterViewInit { // customs / 1v1 / 5v5 ids in order
  hubId = 'f1137391-0c60-40f4-8b54-1b7ae8ec5bcc'; //'f1137391-0c60-40f4-8b54-1b7ae8ec5bcc' //'366fcb35-50c0-4da6-96e7-fe4a29710d28' // '937c289d-47b2-4fc5-8500-8d73a6e587e9'
  leaderboardId = '69319308c5bdcb0bf0f0ee5f'; //'69319308c5bdcb0bf0f0ee5f"' //'693191848bd8357df7ac91ad' // '692def172584a759a9bd3eed' 

  maxMatches = 100;

  loading = false;
  error: string | null = null;

  displayedColumns: string[] = [
    'pos',
    'avatar',
    'nickname',
    'points',          

    'matches',
    'wins',
    'winRate',
    'rounds',

    'kills',
    'deaths',
    'kdRatio',
    'krRatio',
    'adr',
    'hsPercent',

    'damage',
    'headshots',

    'assists',
    'mvps',

    'doubleKills',
    'tripleKills',
    'quadroKills',
    'pentaKills',

    'clutchKills',

    'firstKills',
    'entryCount',

    'oneV2Count',
    'oneV2Wins',
    'oneV1Count',
    'oneV1Wins',

    'flashCount',
    'flashSuccesses',
    'enemiesFlashed',

    'utilityCount',
    'utilitySuccesses',
    'utilityDamage',
    'utilityUsagePerRound',

    'pistolKills',
    'sniperKills',
    'knifeKills',
    'zeusKills'
  ];

  dataSource = new MatTableDataSource<AggregatedPlayerStats>([]);

  private columnRanks: Record<string, RankInfo> = {};
  private rankColumns: (keyof AggregatedPlayerStats)[] = [
    'points',

    'matches',
    'wins',
    'winRate',
    'rounds',
    'kills',
    'deaths',
    'kdRatio',
    'krRatio',
    'adr',
    'hsPercent',

    'damage',
    'headshots',

    'assists',
    'mvps',
    'doubleKills',
    'tripleKills',
    'quadroKills',
    'pentaKills',
    'clutchKills',
    'firstKills',
    'entryCount',

    'oneV2Count',
    'oneV2Wins',
    'oneV1Count',
    'oneV1Wins',

    'flashCount',
    'flashSuccesses',
    'enemiesFlashed',

    'utilityCount',
    'utilitySuccesses',
    'utilityDamage',
    'utilityUsagePerRound',

    'pistolKills',
    'sniperKills',
    'knifeKills',
    'zeusKills'
  ];

  columnTooltips: Record<string, string> = {
    pos: 'Overall position',
    avatar: 'Player avatar',
    nickname: 'FACEIT nickname',
    points: 'Tournament leaderboard points',

    matches: 'Number of matches played',
    wins: 'Total wins across all matches',
    winRate: 'Win percentage across all matches',
    rounds: 'Total rounds played across all matches',
    kills: 'Total kills across all matches',
    deaths: 'Total deaths across all matches',

    kdRatio: 'Kills divided by deaths (Kill/Death Ratio)',
    krRatio: 'Kills per round',
    adr: 'Average damage per round',
    hsPercent: 'Percentage of kills that were headshots',

    damage: 'Total damage dealt across all matches',
    headshots: 'Total headshot kills across all matches',

    assists: 'Total assists',
    mvps: 'Total round MVPs',

    doubleKills: 'Number of rounds with exactly 2 kills',
    tripleKills: 'Number of rounds with exactly 3 kills',
    quadroKills: 'Number of rounds with exactly 4 kills',
    pentaKills: 'Number of rounds with exactly 5 kills',

    clutchKills: 'Clutch kills (1vX situations)',

    firstKills: 'Opening kills in rounds',
    entryCount: 'Total entry attempts',

    oneV2Count: 'Total 1v2 situations reached',
    oneV2Wins: 'Won 1v2 situations',
    oneV1Count: 'Total 1v1 situations reached',
    oneV1Wins: 'Won 1v1 situations',

    flashCount: 'Total flashbangs thrown',
    flashSuccesses: 'Effective flashes (blind enemy)',
    enemiesFlashed: 'Total enemies affected by flashes',

    utilityCount: 'Utility pieces thrown',
    utilitySuccesses: 'Utility actions that were effective (damage dealt)',
    utilityDamage: 'Total damage done with utility',
    utilityUsagePerRound: 'Utility used per round',

    pistolKills: 'Kills made with pistols',
    sniperKills: 'AWP/Scout/G3SG1/SCAR-20 sniper kills',
    knifeKills: 'Knife kills',
    zeusKills: 'Zeus taser kills'
  };

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  constructor(private hubService: FaceitHubService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
  }

  reload(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading = true;
    this.error = null;
    this.dataSource.data = [];

    this.hubService.getHubMatches(this.hubId, 0, this.maxMatches).subscribe({
      next: async (resp) => {
        const finishedMatchIds = resp.items
          .filter((m) => m.status === 'FINISHED')
          .map((m) => m.match_id);

        if (!finishedMatchIds.length) {
          this.dataSource.data = [];
          this.loading = false;
          return;
        }

        let aggregated: AggregatedPlayerStats[] = [];

        try {
          const combined: { meta: MatchMetaResponse; stats: MatchStatsResponse }[] =
            [];

          for (const matchId of finishedMatchIds) {
            const [meta, stats] = await Promise.all([
              firstValueFrom(this.hubService.getMatchMeta(matchId)),
              firstValueFrom(this.hubService.getMatchStats(matchId))
            ]);

            if (meta && stats) {
              combined.push({ meta, stats });
            }
          }

          aggregated = this.aggregate(combined);
        } catch (err) {
          console.error(err);
          this.error = 'Failed to load match stats from FACEIT.';
          this.loading = false;
          return;
        }

        try {
          const board = await firstValueFrom(
            this.hubService.getHubLeaderboard(this.hubId, this.leaderboardId)
          );

          const map = new Map(board.items.map((p) => [p.player.user_id, p]));

          for (const player of aggregated) {
            const entry = map.get(player.playerId);
            if (!entry) continue;

            player.points = entry.points;
            player.leaderboardPosition = entry.position;
            player.leaderboardWins = entry.won;
            player.leaderboardPlayed = entry.played;
          }
        } catch (err) {
          console.warn('Failed to load leaderboard, falling back to kills sort', err);
        }

        const hasPoints = aggregated.some((p) => (p.points ?? 0) > 0);

        aggregated.sort((a, b) => {
          if (hasPoints) {
            const pa = a.points ?? 0;
            const pb = b.points ?? 0;

            if (pb !== pa) return pb - pa;          // 1. Points DESC
            if (b.wins !== a.wins) return b.wins - a.wins;   // 2. Kills DESC
            if (b.matches !== a.matches) return b.matches - a.matches; // 4. Matches DESC

            return 0;
          }

          return 0;
        });



        this.calculateColumnRanks(aggregated);
        this.dataSource.data = aggregated;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load hub matches from FACEIT.';
        this.loading = false;
      }
    });
  }

  private aggregate(
    matches: { meta: MatchMetaResponse; stats: MatchStatsResponse }[]
  ): AggregatedPlayerStats[] {
    const playerMap = new Map<string, AggregatedPlayerStats>();

    for (const { meta, stats } of matches) {
      const round: MatchStatsRound | undefined = stats.rounds?.[0];
      if (!round) continue;

      const roundsPlayed = parseInt(round.round_stats['Rounds'] || '0', 10) || 0;

      // Build avatar lookup from meta
      const avatarLookup = new Map<string, { nickname: string; avatar?: string }>();
      Object.values(meta.teams || {}).forEach((team) => {
        team.roster.forEach((p) => {
          avatarLookup.set(p.player_id, { nickname: p.nickname, avatar: p.avatar });
        });
      });

      for (const team of round.teams || []) {
        const teamWin = team.team_stats['Team Win'] === '1';

        for (const player of team.players || []) {
          const key = player.player_id;
          if (!key) continue;

          const baseInfo = avatarLookup.get(key);
          const stats = player.player_stats || {};

          const num = (field: string): number =>
            stats[field] != null ? parseFloat(stats[field]) || 0 : 0;

          const kills = num('Kills');
          const deaths = num('Deaths');
          const assists = num('Assists');
          const mvps = num('MVPs');
          const damage = num('Damage');
          const headshots = num('Headshots');

          const doubleKills = num('Double Kills');
          const tripleKills = num('Triple Kills');
          const quadroKills = num('Quadro Kills');
          const pentaKills = num('Penta Kills');
          const clutchKills = num('Clutch Kills');

          const firstKills = num('First Kills');
          const entryCount = num('Entry Count');

          const oneV2Count = num('1v2Count');
          const oneV2Wins = num('1v2Wins');
          const oneV1Count = num('1v1Count');
          const oneV1Wins = num('1v1Wins');

          const flashCount = num('Flash Count');
          const flashSuccesses = num('Flash Successes');
          const enemiesFlashed = num('Enemies Flashed');

          const utilityDamage = num('Utility Damage');
          const utilityCount = num('Utility Count');
          const utilitySuccesses = num('Utility Successes');

          const pistolKills = num('Pistol Kills');
          const sniperKills = num('Sniper Kills');
          const knifeKills = num('Knife Kills');
          const zeusKills = num('Zeus Kills');

          const points = num('Points');
          const leaderboardPosition = num('Leaderboard Position');
          const leaderboardWins = num('Leaderboard Wins');
          const leaderboardPlayed = num('Leaderboard Played');

          let agg = playerMap.get(key);
          if (!agg) {
            agg = {
              playerId: key,
              nickname: baseInfo?.nickname ?? player.nickname,
              avatar: baseInfo?.avatar,

              matches: 1,
              wins: teamWin ? 1 : 0,
              winRate: 0,

              rounds: roundsPlayed,
              kills,
              deaths,
              assists,
              mvps,
              damage,
              headshots,

              kdRatio: 0,
              krRatio: 0,
              adr: 0,
              hsPercent: 0,

              doubleKills,
              tripleKills,
              quadroKills,
              pentaKills,
              clutchKills,

              firstKills,
              entryCount,

              oneV2Count,
              oneV2Wins,
              oneV1Count,
              oneV1Wins,

              flashCount,
              flashSuccesses,
              enemiesFlashed,

              utilityDamage,
              utilityCount,
              utilitySuccesses,
              utilityUsagePerRound: 0,

              pistolKills,
              sniperKills,
              knifeKills,
              zeusKills,

              // leaderboard defaults
              points: 0,
              leaderboardPosition: 9999,
              leaderboardWins: 0,
              leaderboardPlayed: 0
            };

            playerMap.set(key, agg);
          } else {
            agg.matches += 1;
            if (teamWin) agg.wins += 1;

            agg.rounds += roundsPlayed;
            agg.kills += kills;
            agg.deaths += deaths;
            agg.assists += assists;
            agg.mvps += mvps;
            agg.damage += damage;
            agg.headshots += headshots;

            agg.doubleKills += doubleKills;
            agg.tripleKills += tripleKills;
            agg.quadroKills += quadroKills;
            agg.pentaKills += pentaKills;
            agg.clutchKills += clutchKills;

            agg.firstKills += firstKills;
            agg.entryCount += entryCount;

            agg.oneV2Count += oneV2Count;
            agg.oneV2Wins += oneV2Wins;
            agg.oneV1Count += oneV1Count;
            agg.oneV1Wins += oneV1Wins;

            agg.flashCount += flashCount;
            agg.flashSuccesses += flashSuccesses;
            agg.enemiesFlashed += enemiesFlashed;

            agg.utilityDamage += utilityDamage;
            agg.utilityCount += utilityCount;
            agg.utilitySuccesses += utilitySuccesses;

            agg.pistolKills += pistolKills;
            agg.sniperKills += sniperKills;
            agg.knifeKills += knifeKills;
            agg.zeusKills += zeusKills;

            if (!agg.avatar && baseInfo?.avatar) {
              agg.avatar = baseInfo.avatar;
            }
            if (!agg.nickname && baseInfo?.nickname) {
              agg.nickname = baseInfo.nickname;
            }
          }
        }
      }
    }

    // Compute derived stats
    for (const agg of playerMap.values()) {
      agg.kdRatio = agg.deaths > 0 ? agg.kills / agg.deaths : agg.kills;
      agg.krRatio = agg.rounds > 0 ? agg.kills / agg.rounds : 0;
      agg.adr = agg.rounds > 0 ? agg.damage / agg.rounds : 0;
      agg.hsPercent = agg.kills > 0 ? (agg.headshots / agg.kills) * 100 : 0;
      agg.winRate = agg.matches > 0 ? (agg.wins / agg.matches) * 100 : 0;
      agg.utilityUsagePerRound =
        agg.rounds > 0 ? agg.utilityCount / agg.rounds : 0;
    }

    return Array.from(playerMap.values());
  }

  private calculateColumnRanks(players: AggregatedPlayerStats[]): void {
    this.columnRanks = {};

    for (const col of this.rankColumns) {
      const values = Array.from(
        new Set(
          players
            .map((p) => (p[col] as unknown as number) ?? 0)
            .filter((v) => !isNaN(v))
        )
      ).sort((a, b) => b - a);

      if (!values.length) continue;

      this.columnRanks[col as string] = {
        first: values[0],
        second: values[1] ?? Number.NEGATIVE_INFINITY,
        third: values[2] ?? Number.NEGATIVE_INFINITY
      };
    }
  }

  getPositionClass(index: number): string {
    const pos = index + 1;
    if (pos === 1) return 'pos-1';
    if (pos === 2) return 'pos-2';
    if (pos === 3) return 'pos-3';
    return '';
  }

  getStatClass(row: AggregatedPlayerStats, column: string): string {
    const rank = this.columnRanks[column];
    if (!rank) return '';

    const value = (row as any)[column] as number;
    if (value === rank.first) return 'rank-1';
    if (value === rank.second) return 'rank-2';
    if (value === rank.third) return 'rank-3';
    return '';
  }

  trackByPlayer(_: number, row: AggregatedPlayerStats): string {
    return row.playerId;
  }
}
