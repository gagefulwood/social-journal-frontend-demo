export type DetailCategory = {
  id: number;
  name: string;
};

export type ContactDetail = {
  id: number;
  category: DetailCategory;
  value: string;
};