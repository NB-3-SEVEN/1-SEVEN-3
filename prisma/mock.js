export const PARTICIPANTS = [
  {
    id: 1000001,
    nickname: "홍길동",
    password: "password123",
    createdAt: "2023-07-16T09:00:00Z",
    updatedAt: "2023-07-16T09:00:00Z",
    groupId: 1000001,
  },
  {
    id: 1000002,
    nickname: "김영희",
    password: "password456",
    createdAt: "2023-07-16T09:30:00Z",
    updatedAt: "2023-07-16T09:30:00Z",
    groupId: 1000002,
  },
  {
    id: 1000003,
    nickname: "철수",
    password: "password789",
    createdAt: "2023-07-16T10:00:00Z",
    updatedAt: "2023-07-16T10:00:00Z",
    groupId: 1000002,
  },
];

export const GROUPS = [
  {
    id: 1000001,
    name: "운동 그룹 A",
    description: "건강한 삶을 위한 운동 그룹",
    photoUrl: "http://example.com/photoA.jpg",
    goalRep: 100,
    discordWebhookUrl: "http://discord.com/webhookA",
    discordInviteUrl: "http://discord.com/inviteA",
    likeCount: 10,
    tags: {
      connect: [{ id: 1 }, { id: 2 }],
    },
    ownerNickname: "홍길동",
    ownerPassword: "ownerpass123",
    recordCount: 5,
    createdAt: "2023-07-16T08:00:00Z",
    updatedAt: "2023-07-16T08:00:00Z",
  },
  {
    id: 1000002,
    name: "운동 그룹 B",
    description: "다양한 운동을 즐기는 그룹",
    photoUrl: "http://example.com/photoB.jpg",
    goalRep: 200,
    discordWebhookUrl: "http://discord.com/webhookB",
    discordInviteUrl: "http://discord.com/inviteB",
    likeCount: 20,
    tags: {
      connect: [{ id: 1 }, { id: 3 }],
    },
    ownerNickname: "김영희",
    ownerPassword: "ownerpass456",
    recordCount: 3,
    createdAt: "2023-07-16T08:30:00Z",
    updatedAt: "2023-07-16T08:30:00Z",
  },
];

export const RECORDS = [
  {
    id: 1000001,
    exerciseType: "RUN",
    description: "아침 조깅",
    time: 30,
    distance: 5,
    photos: ["http://example.com/photo1.jpg"],
    authorId: 1000001,
    groupId: 1000001,
    createdAt: "2023-07-16T09:00:00Z",
    updatedAt: "2023-07-16T09:00:00Z",
  },
  {
    id: 1000002,
    exerciseType: "BIKE",
    description: "자전거 라이딩",
    time: 60,
    distance: 20,
    photos: ["http://example.com/photo2.jpg"],
    authorId: 1000002,
    groupId: 1000001,
    createdAt: "2023-07-16T09:30:00Z",
    updatedAt: "2023-07-16T09:30:00Z",
  },
];

export const TAGS = [
  {
    id: 1,
    name: "운동",
    createdAt: "2023-01-16T09:30:00Z",
    updatedAt: "2023-02-16T09:30:00Z",
  },
  {
    id: 2,
    name: "건강",
    createdAt: "2023-03-16T09:30:00Z",
    updatedAt: "2023-04-16T09:30:00Z",
  },
  {
    id: 3,
    name: "팀워크",
    createdAt: "2023-05-16T09:30:00Z",
    updatedAt: "2023-06-16T09:30:00Z",
  },
];
