export const useRelicLeaderboards = () => {
  const boards = [
    {
      id: 0,
      name: 'Custom',
      isranked: 0,
      leaderboardmap: [
        {
          matchtype_id: 0,
          statgroup_type: 1,
          race_id: 0,
        },
      ],
    },
    {
      id: 1,
      name: '1v1_chaos_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 0,
        },
      ],
    },
    {
      id: 2,
      name: '1v1_dark_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 1,
        },
      ],
    },
    {
      id: 3,
      name: '1v1_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 2,
        },
      ],
    },
    {
      id: 4,
      name: '1v1_guard_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 3,
        },
      ],
    },
    {
      id: 5,
      name: '1v1_necron_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 4,
        },
      ],
    },
    {
      id: 6,
      name: '1v1_ork_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 5,
        },
      ],
    },
    {
      id: 7,
      name: '1v1_sisters_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 6,
        },
      ],
    },
    {
      id: 8,
      name: '1v1_space_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 7,
        },
      ],
    },
    {
      id: 9,
      name: '1v1_tau_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 1,
          statgroup_type: 1,
          race_id: 8,
        },
      ],
    },
    {
      id: 10,
      name: '2v2_chaos_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 0,
        },
      ],
    },
    {
      id: 11,
      name: '2v2_dark_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 1,
        },
      ],
    },
    {
      id: 12,
      name: '2v2_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 2,
        },
      ],
    },
    {
      id: 13,
      name: '2v2_guard_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 3,
        },
      ],
    },
    {
      id: 14,
      name: '2v2_necron_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 4,
        },
      ],
    },
    {
      id: 15,
      name: '2v2_ork_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 5,
        },
      ],
    },
    {
      id: 16,
      name: '2v2_sisters_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 6,
        },
      ],
    },
    {
      id: 17,
      name: '2v2_space_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 7,
        },
      ],
    },
    {
      id: 18,
      name: '2v2_tau_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 2,
          statgroup_type: 1,
          race_id: 8,
        },
      ],
    },
    {
      id: 19,
      name: '3v3_chaos_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 0,
        },
      ],
    },
    {
      id: 20,
      name: '3v3_dark_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 1,
        },
      ],
    },
    {
      id: 21,
      name: '3v3_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 2,
        },
      ],
    },
    {
      id: 22,
      name: '3v3_guard_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 3,
        },
      ],
    },
    {
      id: 23,
      name: '3v3_necron_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 4,
        },
      ],
    },
    {
      id: 24,
      name: '3v3_ork_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 5,
        },
      ],
    },
    {
      id: 25,
      name: '3v3_sisters_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 6,
        },
      ],
    },
    {
      id: 26,
      name: '3v3_space_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 7,
        },
      ],
    },
    {
      id: 27,
      name: '3v3_tau_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 3,
          statgroup_type: 1,
          race_id: 8,
        },
      ],
    },
    {
      id: 28,
      name: '4v4_chaos_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 0,
        },
      ],
    },
    {
      id: 29,
      name: '4v4_dark_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 1,
        },
      ],
    },
    {
      id: 30,
      name: '4v4_eldar_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 2,
        },
      ],
    },
    {
      id: 31,
      name: '4v4_guard_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 3,
        },
      ],
    },
    {
      id: 32,
      name: '4v4_necron_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 4,
        },
      ],
    },
    {
      id: 33,
      name: '4v4_ork_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 5,
        },
      ],
    },
    {
      id: 34,
      name: '4v4_sisters_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 6,
        },
      ],
    },
    {
      id: 35,
      name: '4v4_space_marine_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 7,
        },
      ],
    },
    {
      id: 36,
      name: '4v4_tau_race',
      isranked: 1,
      leaderboardmap: [
        {
          matchtype_id: 4,
          statgroup_type: 1,
          race_id: 8,
        },
      ],
    },
  ]
  return boards
}
