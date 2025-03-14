import * as s from "superstruct";

export const CreateParticipant = s.object({
  nickname: s.size(s.string(), 1, 20),
  password: s.size(s.string(), 8, 20),
});

export const CreateGroup = s.object({
  name: s.size(s.string(), 1, 20),
  description: s.optional(s.string()),
  photoUrl: s.optional(s.string()),
  goalRep: s.min(s.integer(), 1),
  discordWebhookUrl: s.optional(s.size(s.string(), 1, 255)),
  discordInviteUrl: s.optional(s.size(s.string(), 1, 255)),
  tags: s.array(s.string()),
  ownerNickname: s.size(s.string(), 1, 20),
  ownerPassword: s.size(s.string(), 8, 20),
});

export const CreateRecord = s.object({
  exerciseType: s.string(),
  description: s.optional(s.string()),
  time: s.min(s.integer(), 1),
  distance: s.min(s.integer(), 0),
  photos: s.size(s.array(s.string()), 0, 10), // 최대 10장까지 허용
  authorNickname: s.size(s.string(), 1, 20),
  authorPassword: s.size(s.string(), 8, 20),
});

export const Query = s.object({
  limit: s.optional(s.min(s.integer(), 1)),
  page: s.optional(s.min(s.integer(), 1)),
  sort: s.optional(s.string()),
});

export const IdPwValidate = s.object({
  ownerPassword: s.size(s.string(), 8, 20),
});

export const DeletParticipant = s.object({
  nickname: s.size(s.string(), 1, 20),
  password: s.size(s.string(), 8, 20),
});

export const PatchGroup = s.partial(CreateGroup);
