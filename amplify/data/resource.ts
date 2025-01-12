import { a, defineData, type ClientSchema } from '@aws-amplify/backend';
import { updateComputeTaskFunction } from '../functions/updateComputeTaskFunction/resource';

const schema = a.schema({
  Profile: a
    .model({
      userId: a.string().required(),
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
      lipSyncBattlesAttempted: a.integer().default(0),
      lipSyncBattlesLost: a.integer().default(0),
      aiCompanions: a.hasMany('AiCompanionData', 'aiOwnerId'),
      comments: a.hasMany('Comments', 'commentOwnerId'),
      producer: a.belongsTo('Producers', 'producerId'),
      songCollaborations: a.hasMany('Songs', 'aICollabId'),
      songs: a.hasMany('Songs', 'songOwnerId'),
      tracks: a.hasMany('Tracks', 'trackOwnerId'),
      followedByUsers: a.hasMany('UserFollowers', 'followingId'),
      followingAIs: a.hasMany('AIFollowers', 'followerId'),
      followingUsers: a.hasMany('UserFollowers', 'followerId'),
      likedBattles: a.hasMany('BattleLikes', 'userId'),
      likedComments: a.hasMany('CommentLikes', 'userId'),
      likedSongs: a.hasMany('SongLikes', 'userId'),
      lipSyncBattleEntries: a.hasMany('LipSyncBattlesEntries', 'playerOwnerId'),
      lipSyncBattlesAsPlayer1: a.hasMany('LipSyncBattlesParent', 'player1Id'),
      lipSyncBattlesAsPlayer2: a.hasMany('LipSyncBattlesParent', 'player2Id'),
      lipSyncBattlesWon: a.hasMany('LipSyncBattlesParent', 'winnerId'),
      notificationsReceived: a.hasMany('UserNotifications', 'userId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.guest().to(['read'])
    ]),

  Producers: a
    .model({
      producerId: a.string().required(),
      name: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      bio: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      profiles: a.hasMany('Profile', 'producerId'),
      songs: a.hasMany('Songs', 'songProducerId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  UserFollowers: a
    .model({
      followerId: a.string().required(),
      followingId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      createdAt: a.datetime(),
      followerAvatar: a.string(),
      followerDisplayName: a.string(),
      status: a.string().default('ACTIVE'),
      follower: a.belongsTo('Profile', 'followerId'),
      following: a.belongsTo('Profile', 'followingId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  AIFollowers: a
    .model({
      followerId: a.string().required(),
      aiCompanionId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      createdAt: a.datetime(),
      followerAvatar: a.string(),
      followerDisplayName: a.string(),
      status: a.string().default('ACTIVE'),
      follower: a.belongsTo('Profile', 'followerId'),
      aiCompanion: a.belongsTo('AiCompanionData', 'aiCompanionId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  UserNotifications: a
    .model({
      userId: a.string().authorization(allow => [
        allow.owner().to(['create', 'read'])
      ]).required(),
      type: a.string().authorization(allow => [
        allow.owner()
      ]).required(),
      sourceId: a.string().authorization(allow => [
        allow.owner()
      ]).required(),
      sourceType: a.string().authorization(allow => [
        allow.owner()
      ]).required(),
      createdAt: a.datetime(),
      isRead: a.boolean().default(false),
      status: a.string().default('ACTIVE'),
      user: a.belongsTo('Profile', 'userId')
    })
    .authorization((allow) => [
      allow.owner()
    ]),

  TokenCreditLogs: a
    .model({
      creditOwnerId: a.string().authorization(allow => [
        allow.owner().to(['create', 'read'])
      ]).required(),
      amount: a.integer(),
      createdAt: a.datetime(),
      deductionDescription: a.string(),
      direction: a.string(),
      paymentMethod: a.string(),
      status: a.string().default('ACTIVE'),
      updatedAt: a.datetime(),
      creditOwner: a.belongsTo('Profile', 'creditOwnerId'),
    })
    .authorization((allow) => [
      allow.owner()
    ]),

  Songs: a
    .model({
      songOwnerId: a.string().required(),
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
      title: a.string(),
      updatedAt: a.datetime(),
      likesCount: a.integer().default(0),
      playCount: a.integer().default(0),
      royalties: a.integer().default(0),
      shares: a.integer().default(0),
      totalDuration: a.integer(),
      trendingScore: a.float().default(0),
      viewsLast24h: a.integer().default(0),
      aiCollab: a.belongsTo('Profile', 'aICollabId'),
      songOwner: a.belongsTo('Profile', 'songOwnerId'),
      songProducer: a.belongsTo('Producers', 'songProducerId'),
      songTracks: a.hasMany('SongTracks', 'songId'),
      comments: a.hasMany('Comments', 'songId'),
      likes: a.hasMany('SongLikes', 'songId'),
      lipSyncBattleEntries: a.hasMany('LipSyncBattlesEntries', 'songId'),
      lipSyncBattles: a.hasMany('LipSyncBattlesParent', 'songId'),
      status: a.string().default('DRAFT'),
      computeTasks: a.hasMany('ComputeTasks', 'songId'),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner(),
    ]),

  SongTracks: a.model({
    songId: a.string(),
    trackId: a.string(),
    song: a.belongsTo('Songs', 'songId'),
    track: a.belongsTo('Tracks', 'trackId'),
    volume: a.integer().default(0.5),


  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.owner(),
  ]),


  Tracks: a
    .model({
      trackOwnerId: a.string().authorization(allow => [
        allow.owner().to(['create', 'read']),
        allow.authenticated().to(['read'])
      ]).required(),
      audioUrl: a.string(),
      createdAt: a.datetime(),
      description: a.string(),
      instruments: a.string(),
      recordLabel: a.string(),
      status: a.string().default('ACTIVE'),
      title: a.string(),
      updatedAt: a.datetime(),
      royalties: a.integer().default(0),
      songCount: a.integer().default(0),
      profile: a.belongsTo('Profile', 'trackOwnerId'),
      songTracks: a.hasMany('SongTracks', 'trackId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow.owner(),
    ]),

  ComputeTasks: a
    .model({
      taskOwnerId: a.string().required(),
      taskId: a.string().required(),
      createdAt: a.datetime(),
      failed: a.boolean().default(false),
      failedReason: a.string(),
      finishedAt: a.datetime(),
      finished: a.boolean().default(false),
      status: a.string().default('STARTED'),
      taskDescription: a.string(),
      songId: a.string(),
      updatedAt: a.datetime(),
      profile: a.belongsTo('Profile', 'taskOwnerId'),
      song: a.belongsTo('Songs', 'songId'),
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
      seedId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
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
      player1Id: a.string().required(),
      player2Id: a.string().required(),
      battleType: a.string(),
      completedAt: a.datetime(),
      createdAt: a.datetime(),
      likesCount: a.integer().default(0),
      royalties: a.integer().default(0),
      shares: a.integer().default(0),
      songId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      status: a.string().default('ACTIVE'),
      updatedAt: a.datetime(),
      winnerId: a.string(),
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
      playerOwnerId: a.string().required(),
      audioUrl: a.string(),
      battleId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      communityScoreAvg: a.integer().default(0),
      createdAt: a.datetime(),
      imageUrl: a.string(),
      judge1Score: a.integer().default(0),
      judge2Score: a.integer().default(0),
      judge3Score: a.integer().default(0),
      result: a.string(),
      royalties: a.integer().default(0),
      songId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      status: a.string().default('ACTIVE'),
      totalJudgeScore: a.integer().default(0),
      updatedAt: a.datetime(),
      videoUrl: a.string(),
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
      songId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      aiCompanionId: a.string(),
      createdAt: a.datetime(),
      isAILike: a.boolean().default(false),
      status: a.string().default('ACTIVE'),
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
      battleId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      aiCompanionId: a.string(),
      createdAt: a.datetime(),
      isAILike: a.boolean().default(false),
      status: a.string().default('ACTIVE'),
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
      commentId: a.string().authorization(allow => [
        allow.owner(),
        allow.guest().to(['read'])
      ]).required(),
      aiCompanionId: a.string(),
      createdAt: a.datetime(),
      isAILike: a.boolean().default(false),
      status: a.string().default('ACTIVE'),
      user: a.belongsTo('Profile', 'userId'),
      aiCompanion: a.belongsTo('AiCompanionData', 'aiCompanionId'),
      comment: a.belongsTo('Comments', 'commentId'),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  // Ai
  chat: a.conversation({
    aiModel: a.ai.model('Claude 3 Haiku'),
    systemPrompt: 'You are a music producer named Tom',
  })
    .authorization((allow) => allow.owner()),

  generateSong: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'), //Claude 3.5 Sonnet
    systemPrompt: 'You are a music producer who writes songs',
  })
    .arguments({
      description: a.string(),
    })
    .returns(
      a.customType({
        name: a.string(),
        lyrics: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated()),

  // functions
  updateComputeTaskFunction: a
    .query()
    .arguments({
      name: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(updateComputeTaskFunction))
    .authorization((allow) => allow.guest())
});


export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});