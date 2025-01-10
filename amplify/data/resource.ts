import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/

const schema = a.schema({
  Profile: a
    .model({
      // Required fields
      userId: a.string().required(),
      username: a.string().required(),//public
      email: a.string(),
      onboarded: a.boolean(),

      // Optional personal information
      firstName: a.string(),
      lastName: a.string(),
      displayName: a.string(),
      avatar: a.string(),
      bio: a.string(),

      country: a.string(),
      language: a.string(),
      musicGenre: a.string(),

      // Timestamps
      lastActive: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),

      // Leaderboard relevant stats
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
      producerId: a.hasOne('Producers', 'id'),
      aiCompanions: a.hasMany('AiCompanionData', 'ownerId'),
      songs: a.hasMany('Songs', 'ownerId'),
      tracks: a.hasMany('Tracks', 'ownerId'),
      status: a.string().default('ACTIVE'),
    })
    .authorization(allow => [
      allow.owner()
    ]),

  AiCompanionData: a
    .model({
      ownerId: a.hasOne('Profile', 'id'),
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
      ownerId: a.hasOne('Profile', 'id'),
      recordLabelId: a.string(),
      title: a.string(),
      imageURL: a.string(),
      description: a.string(),
      lyrics: a.string(),
      lyricsOwnerId: a.string(),
      mainMusicOwnerId: a.string(),//use id  of mina music track
      secondaryMusicOwnerId: a.string(),//comma separated list of user ids of contriubting tracks
      mainVocalsOwnerId: a.string(),
      secondaryVocalsOwnerId: a.string(),
      audioUrl: a.string(),
      mainMusicTrack: a.hasOne('Tracks', 'id'),
      remixedFrom: a.hasOne('Songs', 'id'),
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
      allow.guest().to(["read"]),
      allow.owner()
    ]),

  Tracks: a
    .model({
      ownerId: a.hasOne('Profile', 'id'),
      recordLabeld: a.string(),
      title: a.string(),
      description: a.string(),
      instruments: a.string(), //commmm a separated list of instruments
      audioUrl: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      songCount: a.integer().default(0),
      status: a.string().default('ACTIVE'),
      royalties: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.owner()
    ]),

  LipSyncBattlesParent: a
    .model({
      player1Id: a.hasOne('LipSyncBattlesEntries', 'playerId'),
      player2Id: a.hasOne('LipSyncBattlesEntries', 'playerId'),
      song: a.hasOne('Songs', 'id'),
      winner: a.hasOne('Profile', 'id'),
      comments: a.hasMany('Comments', 'lipSyncBattle'),
      battleType: a.string(),
      player1BattleId: a.string(),
      player2BattleId: a.string(),
      songId: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
      likes: a.integer().default(0),
      shares: a.integer().default(0),
      royalties: a.integer().default(0),
      winnerId: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
    ]),

  LipSyncBattlesEntries: a
    .model({
      playerId: a.string(),
      lipSyncBattlesParentId: a.hasOne('LipSyncBattlesParent', 'id'),
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
      result: a.string() //WIN, LOSE, DRAW
    }).authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
      allow.owner()
    ]),

  Comments: a
    .model({
      // Required fields
      songId: a.hasOne('Song', 'id'),
      lipSyncBattle: a.hasOne('LipSyncBattlesParent', 'id'),
      isVoteComment: a.boolean().default(false),
      userId: a.hasOne('Profile', 'id'),
      commentText: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
    }).authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read", "create"]),
      allow.owner()
    ]),

  Followers: a
    .model({
      // Required fields
      followerId: a.hasOne('Profile', 'id').required(),
      followingId: a.hasOne('Profile', 'id').required(),

      // Additional metadata
      followerUsername: a.string(),
      followerDisplayName: a.string(),
      followerAvatar: a.string(),

      followingUsername: a.string(),
      followingDisplayName: a.string(),
      followingAvatar: a.string(),

      // Timestamps
      createdAt: a.datetime(),
      updatedAt: a.datetime(),

      // Optional status field (for soft deletes or blocking)
      status: a.string().default('ACTIVE')
    }).authorization((allow) => [
      allow.guest().to(["read"]),
      allow.owner()
    ]),


  TokenCreditLogs: a
    .model({
      userId: a.hasOne('Profile', 'id'),
      direction: a.string(), //'added' or 'deducted'
      paymentMethod: a.string(), //'stripe' or 'credits' if added
      deductionDescription: a.string(),
      amount: a.integer(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      status: a.string().default('ACTIVE'),
    }).authorization((allow) => [
      allow.owner()
    ]),

  ComputeTasks: a
    .model({
      taskId: a.string(),
      taskDescription: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      finishedAt: a.datetime(),
      status: a.string().default('STARTED'),
      finished: a.boolean().default(false),
      failed: a.boolean().default(false),
      failedReason: a.string(),
    }).authorization((allow) => [
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


/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
