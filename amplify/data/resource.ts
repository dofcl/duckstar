import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Profile: a
    .model({
      userId: a.string().required(),
      username: a.string().required(),
      email: a.string(),
      onboarded: a.boolean(),
      firstName: a.string(),
      lastName: a.string(),
      displayName: a.string(),
      avatar: a.string(),
      bio: a.string(),
      country: a.string(),
      language: a.string(),
      musicGenre: a.string(),
      lastActive: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      totalScore: a.integer().default(0),
      weeklyScore: a.integer().default(0),
      monthlyScore: a.integer().default(0),
      rank: a.integer(),
      tier: a.string().default('BRONZE'),
      followersCount: a.integer().default(0),
      followingCount: a.integer().default(0),
      credits: a.integer().default(100),
      songsCreated: a.integer().default(0),
      lipSyncBattlesAttempted: a.integer().default(0),
      lipSyncBattlesWon: a.integer().default(0),
      lipSyncBattlesLost: a.integer().default(0),
      winRate: a.float().default(0),
      producerId: a.id(),
      aiCompanions: a.hasMany('AiCompanionData', 'aiOwnerId'),
      songs: a.hasMany('Songs', 'songOwnerId'),
      tracks: a.hasMany('Tracks', 'trackOwnerId'),
      comments: a.hasMany('Comments', 'commentOwnerId'),
      status: a.string().default('ACTIVE'),
      computeTasks: a.hasMany('ComputeTasks', 'taskOwnerId'),
      tokenCreditLogs: a.hasMany('TokenCreditLogs', 'creditOwnerId'),
    })
    .authorization((allow) => [
      allow.owner()
    ]),

  AiCompanionData: a
    .model({
      aiOwnerId: a.string().required(),
      name: a.string(),
      imageURL: a.string(),
      bio: a.string(),
      country: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  Producers: a
    .model({
      profiles: a.hasMany('Profile', 'producerId'),
      name: a.string(),
      ttsId: a.string(),
      imageURL: a.string(),
      bio: a.string(),
      country: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.owner()
    ]),

  Songs: a
    .model({
      songOwnerId: a.string().required(),
      lipSyncBattles: a.hasMany('LipSyncBattlesParent', 'songId'),
      lipSyncBattleEntries: a.hasMany('LipSyncBattlesEntries', 'songId'),
      title: a.string(),
      imageURL: a.string(),
      description: a.string(),
      lyrics: a.string(),
      audioUrl: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      playCount: a.integer().default(0),
      likes: a.integer().default(0),
      shares: a.integer().default(0),
      comments: a.hasMany('Comments', 'songId'),
      royalties: a.integer().default(0),
      status: a.string().default('ACTIVE'),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner(),
    ]),

  Tracks: a
    .model({
      trackOwnerId: a.string().required(),
      songs: a.hasMany('Songs', 'songOwnerId'),
      recordLabel: a.string(),
      title: a.string(),
      description: a.string(),
      instruments: a.string(),
      audioUrl: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      songCount: a.integer().default(0),
      royalties: a.integer().default(0),
      status: a.string().default('ACTIVE'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),

  LipSyncBattlesParent: a
    .model({
      player1Id: a.string().required(),
      player2Id: a.string().required(),
      songId: a.string().required(),
      winnerId: a.string(),
      comments: a.hasMany('Comments', 'lipSyncBattleId'),
      battleType: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
      likes: a.integer().default(0),
      shares: a.integer().default(0),
      royalties: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
    ]),

  LipSyncBattlesEntries: a
    .model({
      playerOwnerId: a.string(),
      lipSyncBattlesParent: a.hasMany('LipSyncBattlesParent', 'player1Id'),
      songId: a.string(),
      imageUrl: a.string(),
      audioUrl: a.string(),
      videoUrl: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
      royalties: a.integer().default(0),
      judge1Score: a.integer().default(0),
      judge2Score: a.integer().default(0),
      judge3Score: a.integer().default(0),
      totalJudgeScore: a.integer().default(0),
      communityScoreAvg: a.integer().default(0),
      result: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
      allow.owner()
    ]),

  Comments: a
    .model({
      commentOwnerId: a.string().required(),
      songId: a.string().required(),
      lipSyncBattleId: a.string(),
      isVoteComment: a.boolean().default(false),
      commentText: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read", "create"]),
      allow.owner()
    ]),

  Followers: a
    .model({
      followerId: a.string().required(),
      followingId: a.string().required(),
      followingDisplayName: a.string(),
      followingAvatar: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  TokenCreditLogs: a
    .model({
      creditOwnerId: a.string().required(),
      direction: a.string(),
      paymentMethod: a.string(),
      deductionDescription: a.string(),
      amount: a.integer(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
    })
    .authorization((allow) => [
      allow.owner()
    ]),

  ComputeTasks: a
    .model({
      taskOwnerId: a.string().required(),
      taskId: a.string(),
      taskDescription: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      finishedAt: a.datetime(),
      status: a.string().default('STARTED'),
      finished: a.boolean().default(false),
      failed: a.boolean().default(false),
      failedReason: a.string(),
    })
    .authorization((allow) => [
      allow.owner()
    ]),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
