export type Occupation = {
  id: number;
  name: string;
  is_system_default: boolean;
};

export type EducationLevel = {
  id: number;
  name: string;
  is_system_default: boolean;
};


export type ClosenessScore = {
  id: number;
  name: string;
}

export type Mood ={
  id: number;
  name: string;
  emoji_icon: string;
  is_system_default: boolean;
};

export type ContextCategory = {
  id: number;
  name: string;
  color: string;
  is_system_default: boolean;
};

export type DetailCategory = {
  id: number;
  name: string;
  icon_reference?: string | null;
  parent?: number | null;
  is_system_default: boolean;
  children: DetailCategory[];
};

export type NoteMarker = {
  id: number;
  name: string;
  color_hex: string;
  icon_reference?: string | null;
  is_system_default: boolean;
};

export type MediaType = {
  id: number;
  name: string;
};

export type JournalTag = {
  id: number;
  tag_name: string;
  is_system_default: boolean;
};
