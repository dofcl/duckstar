import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
// @ts-ignore
const schema = a.schema({


  Profile: a
    .model({
      // Required fields
      userId: a.string().required(),
      username: a.string().required(),

      // Basic info
      avatar: a.string(),
      bio: a.string(),
      country: a.string(),
      createdAt: a.datetime(),
      displayName: a.string(),
      email: a.string(),
      firstName: a.string(),
      language: a.string(),
      lastActive: a.datetime(),
      lastName: a.string(),
      musicGenre: a.string(),
      onboarded: a.boolean(),
      producerId: a.id(),
      status: a.string().default('ACTIVE'),
      updatedAt: a.datetime(),

      // Stats and scores
      credits: a.integer().default(100),
      creditLogs: a.hasMany('TokenCreditLogs', 'creditOwnerId'),
      computeTasks: a.hasMany('ComputeTasks', 'taskOwnerId'), 
      followersCount: a.integer().default(0),
      followingCount: a.integer().default(0),
      monthlyScore: a.integer().default(0),
      rank: a.integer(),
      songsCreated: a.integer().default(0),
      tier: a.string().default('BRONZE'),
      totalScore: a.integer().default(0),
      weeklyScore: a.integer().default(0),
      winRate: a.float().default(0),

      // Battle stats
      lipSyncBattlesAttempted: a.integer().default(0),
      lipSyncBattlesLost: a.integer().default(0),

      // Relationships - Content
      aiCompanions: a.hasMany('AiCompanionData', 'aiOwnerId'),
      comments: a.hasMany('Comments', 'commentOwnerId'),
      producer: a.belongsTo('Producers', 'producerId'),
      songCollaborations: a.hasMany('Songs', 'aICollabId'),
      songs: a.hasMany('Songs', 'songOwnerId'),
      tracks: a.hasMany('Tracks', 'trackOwnerId'),

      // Relationships - Social
      followedByUsers: a.hasMany('UserFollowers', 'followingId'),
      followingAIs: a.hasMany('AIFollowers', 'followerId'),
      followingUsers: a.hasMany('UserFollowers', 'followerId'),

      // Relationships - Engagement
      likedBattles: a.hasMany('BattleLikes', 'userId'),
      likedComments: a.hasMany('CommentLikes', 'userId'),
      likedSongs: a.hasMany('SongLikes', 'userId'),

      // Relationships - Battles
      lipSyncBattleEntries: a.hasMany('LipSyncBattlesEntries', 'playerOwnerId'),
      lipSyncBattlesAsPlayer1: a.hasMany('LipSyncBattlesParent', 'player1Id'),
      lipSyncBattlesAsPlayer2: a.hasMany('LipSyncBattlesParent', 'player2Id'),
      lipSyncBattlesWon: a.hasMany('LipSyncBattlesParent', 'winnerId'),

      // Relationships - Notifications
      notificationsReceived: a.hasMany('UserNotifications', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.guest().to(['read'])
    ]),

  UserFollowers: a
    .model({
      // Required fields
      followerId: a.string().required(),
      followingId: a.string().required(),

      // Denormalized fields
      createdAt: a.datetime(),
      followerAvatar: a.string(),
      followerDisplayName: a.string(),
      status: a.string().default('ACTIVE'),

      // Relationships
      follower: a.belongsTo('Profile', 'followerId'),
      following: a.belongsTo('Profile', 'followingId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  AIFollowers: a
    .model({
      // Required fields
      followerId: a.string().required(),
      aiCompanionId: a.string().required(),

      // Denormalized fields
      createdAt: a.datetime(),
      followerAvatar: a.string(),
      followerDisplayName: a.string(),
      status: a.string().default('ACTIVE'),

      // Relationships
      follower: a.belongsTo('Profile', 'followerId'),
      aiCompanion: a.belongsTo('AiCompanionData', 'aiCompanionId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  UserNotifications: a
    .model({
      // Required fields
      userId: a.string().required(),
      type: a.string().required(),
      sourceId: a.string().required(),
      sourceType: a.string().required(),

      // Status fields
      createdAt: a.datetime(),
      isRead: a.boolean().default(false),
      status: a.string().default('ACTIVE'),

      // Relationships
      user: a.belongsTo('Profile', 'userId')
    })
    .authorization((allow) => [
      allow.owner()
    ]),

  TokenCreditLogs: a
    .model({
      // Required fields
      amount: a.integer(),
      creditOwnerId: a.string().required(),
      createdAt: a.datetime(),
      deductionDescription: a.string(),
      direction: a.string(),
      paymentMethod: a.string(),
      status: a.string().default('ACTIVE'),
      updatedAt: a.datetime(),

      // Relationships
      creditOwner: a.belongsTo('Profile', 'creditOwnerId'),
    })
    .authorization((allow) => [
      allow.owner()
    ]),
  Songs: a
    .model({
      // Required fields
      songOwnerId: a.string().required(),

      // Basic info
      aICollabId: a.string(),
      audioUrl: a.string(),
      createdAt: a.datetime(),
      description: a.string(),
      genre: a.string(),
      imageURL: a.string(),
      isExplicit: a.boolean().default(false),
      lastModified: a.datetime(),
      lyrics: a.string(),
      songProducerId: a.string(),
      status: a.string().default('ACTIVE'),
      title: a.string(),
      trackId: a.string(),
      updatedAt: a.datetime(),

      // Stats and metrics
      likesCount: a.integer().default(0),
      playCount: a.integer().default(0),
      royalties: a.integer().default(0),
      shares: a.integer().default(0),
      totalDuration: a.integer(),
      trendingScore: a.float().default(0),
      viewsLast24h: a.integer().default(0),

      // Relationships - Ownership
      aiCollab: a.belongsTo('Profile', 'aICollabId'),
      songOwner: a.belongsTo('Profile', 'songOwnerId'),
      songProducer: a.belongsTo('Producers', 'songProducerId'),
      track: a.belongsTo('Tracks', 'trackId'),

      // Relationships - Content
      comments: a.hasMany('Comments', 'songId'),
      likes: a.hasMany('SongLikes', 'songId'),
      lipSyncBattleEntries: a.hasMany('LipSyncBattlesEntries', 'songId'),
      lipSyncBattles: a.hasMany('LipSyncBattlesParent', 'songId'),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner(),
    ]),

  Tracks: a
    .model({
      // Required fields
      trackOwnerId: a.string().required(),

      // Basic info
      audioUrl: a.string(),
      createdAt: a.datetime(),
      description: a.string(),
      instruments: a.string(),
      recordLabel: a.string(),
      status: a.string().default('ACTIVE'),
      title: a.string(),
      updatedAt: a.datetime(),

      // Stats
      royalties: a.integer().default(0),
      songCount: a.integer().default(0),

      // Relationships
      profile: a.belongsTo('Profile', 'trackOwnerId'),
      songs: a.hasMany('Songs', 'trackId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),

  Producers: a
    .model({
      // Basic info
      bio: a.string(),
      country: a.string(),
      createdAt: a.datetime(),
      imageURL: a.string(),
      name: a.string(),
      price: a.integer(),
      ttsId: a.string(),
      updatedAt: a.datetime(),

      // Stats
      songCount: a.integer().default(0),

      // Relationships
      profiles: a.hasMany('Profile', 'producerId'),
      songs: a.hasMany('Songs', 'songProducerId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.owner()
    ]),

  ComputeTasks: a
    .model({
      // Required fields
      taskOwnerId: a.string().required(),

      // Task info
      createdAt: a.datetime(),
      failed: a.boolean().default(false),
      failedReason: a.string(),
      finishedAt: a.datetime(),
      finished: a.boolean().default(false),
      status: a.string().default('STARTED'),
      taskDescription: a.string(),
      taskId: a.string(),
      updatedAt: a.datetime(),

      // Relationships
      profile: a.belongsTo('Profile', 'taskOwnerId'),
    })
    .authorization((allow) => [
      allow.owner()
    ]),
  AiCompanionData: a
    .model({
      aiOwnerId: a.string().required(),
      bio: a.string(),
      country: a.string(),
      createdAt: a.datetime(),
      followers: a.hasMany('AIFollowers', 'aiCompanionId'),
      followersCount: a.integer().default(0),
      imageURL: a.string(),
      lastInteractionAt: a.datetime(),
      likedBattles: a.hasMany('BattleLikes', 'aiCompanionId'),
      likedComments: a.hasMany('CommentLikes', 'aiCompanionId'),
      likedSongs: a.hasMany('SongLikes', 'aiCompanionId'),
      name: a.string(),
      price: a.integer(),
      profile: a.belongsTo('Profile', 'aiOwnerId'),
      seedId: a.string().required(),
      songCount: a.integer().default(0),
      status: a.string().default('ACTIVE'),
      totalInteractions: a.integer().default(0),
      totalLikes: a.integer().default(0),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  Comments: a
    .model({
      // Required fields
      commentOwnerId: a.string().required(),
      commentText: a.string(),
      commenterAvatar: a.string(),
      commenterDisplayName: a.string(),
      createdAt: a.datetime(),
      depth: a.integer().default(0),
      isVoteComment: a.boolean().default(false),
      likesCount: a.integer().default(0),
      lipSyncBattleId: a.string(),
      parentCommentId: a.string(),
      repliesCount: a.integer().default(0),
      songId: a.string(),
      status: a.string().default('ACTIVE'),
      voteScore: a.integer(),

      // Relationships
      likes: a.hasMany('CommentLikes', 'commentId'),
      lipSyncBattle: a.belongsTo('LipSyncBattlesParent', 'lipSyncBattleId'),
      parentComment: a.belongsTo('Comments', 'parentCommentId'),
      profile: a.belongsTo('Profile', 'commentOwnerId'),
      replies: a.hasMany('Comments', 'parentCommentId'),
      song: a.belongsTo('Songs', 'songId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),

      allow.owner()
    ]),

  LipSyncBattlesParent: a
    .model({
      // Required fields
      battleType: a.string(),
      completedAt: a.datetime(),
      createdAt: a.datetime(),
      likesCount: a.integer().default(0),
      player1Id: a.string().required(),
      player2Id: a.string().required(),
      royalties: a.integer().default(0),
      shares: a.integer().default(0),
      songId: a.string().required(),
      status: a.string().default('ACTIVE'),
      updatedAt: a.datetime(),
      winnerId: a.string(),

      // Relationships
      battleLikes: a.hasMany('BattleLikes', 'battleId'),
      comments: a.hasMany('Comments', 'lipSyncBattleId'),
      entries: a.hasMany('LipSyncBattlesEntries', 'battleId'),
      player1: a.belongsTo('Profile', 'player1Id'),
      player2: a.belongsTo('Profile', 'player2Id'),
      song: a.belongsTo('Songs', 'songId'),
      winner: a.belongsTo('Profile', 'winnerId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),

      allow.owner()
    ]),

  LipSyncBattlesEntries: a
    .model({
      // Required fields
      audioUrl: a.string(),
      battleId: a.string().required(),
      communityScoreAvg: a.integer().default(0),
      createdAt: a.datetime(),
      imageUrl: a.string(),
      judge1Score: a.integer().default(0),
      judge2Score: a.integer().default(0),
      judge3Score: a.integer().default(0),
      playerOwnerId: a.string().required(),
      result: a.string(),
      royalties: a.integer().default(0),
      songId: a.string().required(),
      status: a.string().default('ACTIVE'),
      totalJudgeScore: a.integer().default(0),
      updatedAt: a.datetime(),
      videoUrl: a.string(),

      // Relationships
      lipSyncBattlesParent: a.belongsTo('LipSyncBattlesParent', 'battleId'),
      player: a.belongsTo('Profile', 'playerOwnerId'),
      song: a.belongsTo('Songs', 'songId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),

      allow.owner()
    ]),

  SongLikes: a
    .model({
      userId: a.string().required(),
      songId: a.string().required(),
      aiCompanionId: a.string(),
      createdAt: a.datetime(),
      isAILike: a.boolean().default(false),
      status: a.string().default('ACTIVE'),
      // Relationships
      user: a.belongsTo('Profile', 'userId'),
      aiCompanion: a.belongsTo('AiCompanionData', 'aiCompanionId'),
      song: a.belongsTo('Songs', 'songId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),

      allow.owner()
    ]),

  BattleLikes: a
    .model({
      userId: a.string().required(),
      battleId: a.string().required(),
      aiCompanionId: a.string(),
      createdAt: a.datetime(),
      isAILike: a.boolean().default(false),
      status: a.string().default('ACTIVE'),
      // Relationships
      user: a.belongsTo('Profile', 'userId'),
      aiCompanion: a.belongsTo('AiCompanionData', 'aiCompanionId'),
      battle: a.belongsTo('LipSyncBattlesParent', 'battleId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),

      allow.owner()
    ]),

  CommentLikes: a
    .model({
      userId: a.string().required(),
      commentId: a.string().required(),
      aiCompanionId: a.string(),
      createdAt: a.datetime(),
      isAILike: a.boolean().default(false),
      status: a.string().default('ACTIVE'),
      // Relationships
      user: a.belongsTo('Profile', 'userId'),
      aiCompanion: a.belongsTo('AiCompanionData', 'aiCompanionId'),
      comment: a.belongsTo('Comments', 'commentId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),

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
