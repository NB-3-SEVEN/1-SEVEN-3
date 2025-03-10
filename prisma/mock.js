export const GROUPS = [
  {
    name: "운동 그룹 A",
    description: "건강한 삶을 위한 운동 그룹",
    photoUrl: "http://localhost:3001/images/run.jpg",
    goalRep: 100,
    discordWebhookUrl:
      "https://discord.com/api/webhooks/1348485694795812894/OoTIboqP6HVGg9cdnvL3xPo40BonrSYMdyVfCN0DiBqc_N2kN44sH4U2ySBDpDlVjNT9",
    discordInviteUrl: "http://discord.com/inviteA",
    likeCount: 10,
    TagGroup: {
      create: [
        {
          tag: {
            create: {
              name: "운동",
            },
          },
        },
        {
          tag: {
            create: {
              name: "건강",
            },
          },
        },
      ],
    },
    ownerNickname: "홍길동",
    ownerPassword: "password123",
    recordCount: 5,
    createdAt: "2023-07-16T08:00:00Z",
    updatedAt: "2023-07-16T08:00:00Z",
    participants: {
      create: [
        {
          nickname: "홍길동",
          password: "password123",
          createdAt: "2023-07-16T09:00:00Z",
          updatedAt: "2023-07-16T09:00:00Z",
          records: {
            create: {
              exerciseType: "run",
              description: "아침 조깅",
              time: 30,
              distance: 5,
              photos: ["http://localhost:3001/images/run.jpg"],
              group: {
                connect: {
                  id: 1,
                },
              },
            },
          },
        },
      ],
    },
  },
  {
    name: "운동 그룹 B",
    description: "다양한 운동을 즐기는 그룹",
    photoUrl: "http://localhost:3001/images/bike.jpg",
    goalRep: 200,
    discordWebhookUrl:
      "https://discord.com/api/webhooks/1348521144042520667/1q3X4DhS8gVZ6XxJiXY5lg52yoKvY88BLTiBnBZW9mC3Mc5OlR-Ja45SMA-PNDbIrbdS",
    discordInviteUrl: "http://discord.com/inviteB",
    likeCount: 20,
    TagGroup: {
      create: [
        {
          tag: {
            create: {
              name: "팀워크",
            },
          },
        },
      ],
    },
    participants: {
      create: [
        {
          nickname: "김영희",
          password: "password456",
          createdAt: "2023-07-16T09:30:00Z",
          updatedAt: "2023-07-16T09:30:00Z",
          records: {
            create: {
              exerciseType: "bike",
              description: "자전거 라이딩",
              time: 60,
              distance: 20,
              photos: ["http://localhost:3001/images/bike.jpg"],
              group: {
                connect: {
                  id: 2,
                },
              },
            },
          },
        },
        {
          nickname: "철수",
          password: "password789",
          createdAt: "2023-07-16T10:00:00Z",
          updatedAt: "2023-07-16T10:00:00Z",
          records: {
            create: {
              exerciseType: "bike",
              description: "자전거 라이딩",
              time: 40,
              distance: 18,
              photos: ["http://localhost:3001/images/bike.jpg"],
              group: {
                connect: {
                  id: 2,
                },
              },
            },
          },
        },
        {
          nickname: "지훈",
          password: "password133",
          createdAt: "2023-07-16T10:30:00Z",
          updatedAt: "2023-07-16T10:30:00Z",
          records: {
            create: {
              exerciseType: "bike",
              description: "자전거 라이딩",
              time: 50,
              distance: 20,
              photos: ["http://localhost:3001/images/bike.jpg"],
              group: {
                connect: {
                  id: 2,
                },
              },
            },
          },
        },
        {
          nickname: "정우",
          password: "password233",
          createdAt: "2023-07-16T11:00:00Z",
          updatedAt: "2023-07-16T11:00:00Z",
          records: {
            create: {
              exerciseType: "bike",
              description: "자전거 라이딩",
              time: 10,
              distance: 5,
              photos: ["http://localhost:3001/images/bike.jpg"],
              group: {
                connect: {
                  id: 2,
                },
              },
            },
          },
        },
        {
          nickname: "채운",
          password: "password333",
          createdAt: "2023-07-16T11:30:00Z",
          updatedAt: "2023-07-16T11:30:00Z",
          records: {
            create: {
              exerciseType: "bike",
              description: "자전거 라이딩",
              time: 50,
              distance: 2,
              photos: ["http://localhost:3001/images/bike.jpg"],
              group: {
                connect: {
                  id: 2,
                },
              },
            },
          },
        },
        {
          nickname: "기범",
          password: "password433",
          createdAt: "2023-07-16T12:00:00Z",
          updatedAt: "2023-07-16T12:00:00Z",
          records: {
            create: {
              exerciseType: "bike",
              description: "자전거 라이딩",
              time: 30,
              distance: 50,
              photos: ["http://localhost:3001/images/bike.jpg"],
              group: {
                connect: {
                  id: 2,
                },
              },
            },
          },
        },
        {
          nickname: "지수",
          password: "password533",
          createdAt: "2023-07-16T12:30:00Z",
          updatedAt: "2023-07-16T12:30:00Z",
        },
        {
          nickname: "현우",
          password: "password633",
          createdAt: "2023-07-16T13:00:00Z",
          updatedAt: "2023-07-16T13:00:00Z",
        },
        {
          nickname: "강태",
          password: "password733",
          createdAt: "2023-07-16T13:30:00Z",
          updatedAt: "2023-07-16T13:30:00Z",
        },
        {
          nickname: "준수",
          password: "password833",
          createdAt: "2023-07-16T14:00:00Z",
          updatedAt: "2023-07-16T14:00:00Z",
        },
      ],
    },
    ownerNickname: "김영희",
    ownerPassword: "password456",
    recordCount: 3,
    createdAt: "2023-07-16T08:30:00Z",
    updatedAt: "2023-07-16T08:30:00Z",
  },
];
