import * as s from "superstruct";

export const CreateParticipant = s.object({
  nickname: s.size(s.string(), 1, 20),
  password: s.size(s.string(), 8, 20),
  groupId: s.min(s.integer(), 1),
});

export const CreateGroup = s.object({
  name: s.size(s.string(), 1, 20),
  description: s.optional(s.string()),
  photoUrl: s.optional(s.string()),
  goalRep: s.min(s.integer(), 1),
  discordWebHookUrl: s.optional(s.size(s.string(), 1, 255)),
  discordInviteUrl: s.optional(s.size(s.string(), 1, 255)),
  likeCount: s.optional(s.min(s.integer), 0),
  tags: s.array(s.string()),
  ownerNickname: s.size(s.string(), 1, 20),
  ownerPassword: s.size(s.string(), 8, 20),
  badges: s.array(s.enums(["PARTICIPATION_10", "RECORD_100", "LIKE_100"])),
  recordCount: s.optional(s.min(s.integer(), 0)),
});

export const CreateRecord = s.object({
  exerciseType: s.enums(["RUN", "BIKE", "SWIM"]),
  description: s.optional(s.string()),
  time: s.min(s.integer(), 1),
  distance: s.min(s.integer(), 0),
  photos: s.size(s.array(s.string()), 0, 10), // 최대 10장까지 허용
  authorNickname: s.size(s.string(), 1, 20),
  authorPassword: s.size(s.string(), 8, 20),
});
