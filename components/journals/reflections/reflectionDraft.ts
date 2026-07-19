import type { ApiId } from "@/types/api";
import type {
  CarryForwardDrafts,
  CreateReflectionRequest,
  EmotionalManifestation,
  EmotionalReflectionDetail,
  FreeReflectionDetail,
  InteractionReflectionDetail,
  JournalAttachmentInput,
  MomentReflectionDetail,
  Reflection,
  ReflectionDetailByLens,
  ReflectionLens,
  UpdateReflectionRequest,
} from "@/types/journals";

export type ReflectionAttachmentDraft = {
  id?: ApiId;
  mediaAssetId: ApiId;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  originalFilename: string;
  contentType: string;
  durationSeconds: number | null;
  altText: string;
  caption: string;
  isSensitive: boolean;
  recordedAt: string;
  displayOrder: number;
};

export type ReflectionDraft<L extends ReflectionLens = ReflectionLens> = {
  lens: L;
  title: string;
  eventId: ApiId | null;
  primaryContactId: ApiId | null;
  contactIds: ApiId[];
  occurredAt: string;
  currentStep: string;
  detail: ReflectionDetailByLens[L];
  attachments: ReflectionAttachmentDraft[];
  coverMediaAssetId: ApiId | null;
  carryForward: CarryForwardDrafts;
};

export const REFLECTION_STEPS = {
  interaction: ["focus", "exchange", "meaning", "carry_forward", "review"],
  moment: ["focus", "notice", "meaning", "carry_forward", "review"],
  emotional: ["focus", "feelings", "understand", "carry_forward", "review"],
  free: ["writing", "carry_forward", "review"],
} satisfies Record<ReflectionLens, string[]>;

export function createEmptyReflectionDraft<L extends ReflectionLens>(
  lens: L,
): ReflectionDraft<L> {
  const detail = createEmptyDetail(lens);

  return {
    lens,
    title: "",
    eventId: null,
    primaryContactId: null,
    contactIds: [],
    occurredAt: "",
    currentStep: REFLECTION_STEPS[lens][0],
    detail,
    attachments: [],
    coverMediaAssetId: null,
    carryForward: { facts: [], observations: [] },
  };
}

export function reflectionToDraft<L extends ReflectionLens>(
  reflection: Reflection<L>,
): ReflectionDraft<L> {
  return {
    lens: reflection.format,
    title: reflection.title ?? "",
    eventId: reflection.event?.id ?? null,
    primaryContactId: reflection.primary_contact?.id ?? null,
    contactIds: reflection.contacts.map((contact) => contact.id),
    occurredAt: toDateTimeInputValue(reflection.occurred_at),
    currentStep:
      reflection.current_step || REFLECTION_STEPS[reflection.format][0],
    detail: reflection.detail,
    attachments: reflection.attachments.map((attachment) => ({
      id: attachment.id,
      mediaAssetId: attachment.media_asset.id,
      fileUrl: attachment.media_asset.file_url,
      thumbnailUrl: attachment.media_asset.thumbnail_url,
      originalFilename: attachment.media_asset.original_filename,
      contentType: attachment.media_asset.content_type,
      durationSeconds: attachment.media_asset.duration_seconds,
      altText: attachment.media_asset.alt_text,
      caption: attachment.media_asset.caption,
      isSensitive: attachment.is_sensitive,
      recordedAt: toDateTimeInputValue(attachment.recorded_at),
      displayOrder: attachment.display_order,
    })),
    coverMediaAssetId:
      reflection.attachments.find((attachment) => attachment.is_cover)
        ?.media_asset.id ?? null,
    carryForward: {
      facts: reflection.carry_forward.facts.map((fact) => ({ ...fact })),
      observations: reflection.carry_forward.observations.map(
        (observation) => ({ ...observation }),
      ),
    },
  };
}

export function toCreateReflectionRequest<L extends ReflectionLens>(
  draft: ReflectionDraft<L>,
): CreateReflectionRequest<L> {
  return {
    format: draft.lens,
    title: cleanOptionalText(draft.title),
    event_id: draft.eventId,
    primary_contact_id: draft.primaryContactId,
    contact_ids: draft.contactIds,
    occurred_at: toIsoDateTime(draft.occurredAt),
    current_step: draft.currentStep,
    detail: draft.detail,
    attachments: toAttachmentInputs(draft.attachments),
    cover_media_asset_id: draft.coverMediaAssetId,
    carry_forward: draft.carryForward,
  };
}

export function toUpdateReflectionRequest<L extends ReflectionLens>(
  draft: ReflectionDraft<L>,
  expectedRevision: number,
): UpdateReflectionRequest<L> {
  return {
    title: cleanOptionalText(draft.title),
    event_id: draft.eventId,
    primary_contact_id: draft.primaryContactId,
    contact_ids: draft.contactIds,
    occurred_at: toIsoDateTime(draft.occurredAt),
    current_step: draft.currentStep,
    detail: draft.detail,
    attachments: toAttachmentInputs(draft.attachments),
    cover_media_asset_id: draft.coverMediaAssetId,
    carry_forward: draft.carryForward,
    expected_revision: expectedRevision,
  };
}

export function isMeaningfulReflectionDraft(draft: ReflectionDraft): boolean {
  if (
    draft.eventId != null ||
    draft.primaryContactId != null ||
    draft.contactIds.length > 0 ||
    draft.attachments.length > 0 ||
    hasCarryForwardContent(draft)
  ) {
    return true;
  }

  switch (draft.lens) {
    case "interaction":
      return hasTextValue(draft.detail as InteractionReflectionDetail);
    case "moment":
      return hasTextValue(draft.detail as MomentReflectionDetail);
    case "emotional": {
      const detail = draft.detail as EmotionalReflectionDetail;
      return (
        detail.emotion_ids.length > 0 ||
        detail.manifestations.some((item) => item.text.trim()) ||
        hasTextValue({
          situation: detail.situation,
          connected_factors: detail.connected_factors,
          communicating: detail.communicating,
          understanding_now: detail.understanding_now,
          additional_writing: detail.additional_writing,
        })
      );
    }
    case "free": {
      const detail = draft.detail as FreeReflectionDetail;
      return Boolean(draft.title.trim() || detail.body.trim());
    }
  }
}

export function validateReflectionForCompletion(
  draft: ReflectionDraft,
): string[] {
  const errors: string[] = [];

  if (draft.lens === "interaction") {
    const detail = draft.detail as InteractionReflectionDetail;
    if (draft.primaryContactId == null || draft.primaryContactId === "") {
      errors.push("Choose a primary saved contact.");
    }
    requireText(
      errors,
      draft.occurredAt,
      "Add when this interaction occurred.",
    );
    requireText(
      errors,
      detail.topic_or_activity,
      "Describe what you were doing or discussing.",
    );
    requireText(errors, detail.user_actions, "Describe what you said or did.");
    requireText(
      errors,
      detail.contact_actions,
      "Describe what they said or did.",
    );
    requireText(
      errors,
      detail.contact_response,
      "Describe how they responded to you.",
    );
    requireText(errors, detail.user_response, "Describe how you responded.");
    requireText(
      errors,
      detail.feelings_now,
      "Describe how you feel about the interaction now.",
    );
    requireText(
      errors,
      detail.important_to_understand,
      "Describe what feels important to understand or remember.",
    );
  }

  if (draft.lens === "moment") {
    const detail = draft.detail as MomentReflectionDetail;
    requireText(
      errors,
      detail.focus_moment,
      "Choose the specific moment you are focusing on.",
    );
    requireText(
      errors,
      detail.what_happened,
      "Describe what happened in that moment.",
    );
    requireText(
      errors,
      detail.noticed_around,
      "Describe what you noticed around you.",
    );
    requireText(errors, detail.response, "Describe how you responded.");
    requireText(
      errors,
      detail.stood_out,
      "Describe what made the moment stand out.",
    );
    requireText(
      errors,
      detail.meaning_now,
      "Describe what the moment means to you now.",
    );
    requireText(
      errors,
      detail.remember,
      "Describe what you would like to remember.",
    );
  }

  if (draft.lens === "emotional") {
    const detail = draft.detail as EmotionalReflectionDetail;
    if (detail.emotion_ids.length === 0) {
      errors.push("Choose at least one feeling or state of mind.");
    }
    requireText(
      errors,
      detail.situation,
      "Describe what was happening when the feelings appeared.",
    );
    if (!detail.manifestations.some((item) => item.text.trim())) {
      errors.push("Add at least one thought, body response, or behavior.");
    }
    requireText(
      errors,
      detail.connected_factors,
      "Describe what seemed connected to these feelings.",
    );
    requireText(
      errors,
      detail.communicating,
      "Describe what the feelings may have been communicating.",
    );
    requireText(
      errors,
      detail.understanding_now,
      "Describe what you understand now.",
    );
  }

  if (draft.lens === "free") {
    const detail = draft.detail as FreeReflectionDetail;
    requireText(errors, draft.title, "Add a title.");
    requireText(errors, detail.body, "Write your reflection.");
  }

  draft.carryForward.facts.forEach((fact, index) => {
    if (fact.published_fact_id != null) return;
    if (fact.target_contact_id == null || fact.target_contact_id === "") {
      errors.push(`Choose a contact for carried-forward fact ${index + 1}.`);
    }
    requireText(
      errors,
      fact.detail_value,
      `Add a value for carried-forward fact ${index + 1}.`,
    );
  });

  draft.carryForward.observations.forEach((observation, index) => {
    if (observation.published_observation_id != null) return;
    if (
      observation.target_contact_id == null ||
      observation.target_contact_id === ""
    ) {
      errors.push(
        `Choose a contact for carried-forward observation ${index + 1}.`,
      );
    }
    requireText(
      errors,
      observation.body,
      `Add text for carried-forward observation ${index + 1}.`,
    );
  });

  return errors;
}

export function createManifestation(
  kind: EmotionalManifestation["kind"],
  displayOrder: number,
): EmotionalManifestation {
  return { kind, text: "", display_order: displayOrder };
}

function createEmptyDetail<L extends ReflectionLens>(
  lens: L,
): ReflectionDetailByLens[L] {
  const details: ReflectionDetailByLens = {
    interaction: {
      topic_or_activity: "",
      user_actions: "",
      contact_actions: "",
      contact_response: "",
      user_response: "",
      feelings_now: "",
      important_to_understand: "",
      additional_writing: "",
    },
    moment: {
      focus_moment: "",
      what_happened: "",
      noticed_around: "",
      response: "",
      stood_out: "",
      meaning_now: "",
      remember: "",
      additional_writing: "",
    },
    emotional: {
      emotion_ids: [],
      situation: "",
      manifestations: [],
      connected_factors: "",
      communicating: "",
      understanding_now: "",
      additional_writing: "",
    },
    free: { body: "" },
  };

  return details[lens];
}

function toAttachmentInputs(
  attachments: ReflectionAttachmentDraft[],
): JournalAttachmentInput[] {
  return attachments.map((attachment, index) => ({
    id: attachment.id,
    media_asset_id: attachment.mediaAssetId,
    is_sensitive: attachment.isSensitive,
    recorded_at: toIsoDateTime(attachment.recordedAt),
    display_order: index,
  }));
}

function toDateTimeInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function cleanOptionalText(value: string): string | undefined {
  const next = value.trim();
  return next || undefined;
}

function hasTextValue(values: object): boolean {
  return Object.values(values).some(
    (value) => typeof value === "string" && Boolean(value.trim()),
  );
}

function hasCarryForwardContent(draft: ReflectionDraft): boolean {
  return (
    draft.carryForward.facts.some((fact) =>
      Boolean(fact.detail_value.trim()),
    ) ||
    draft.carryForward.observations.some((observation) =>
      Boolean(observation.body.trim()),
    )
  );
}

function requireText(errors: string[], value: string, message: string) {
  if (!value.trim()) errors.push(message);
}
