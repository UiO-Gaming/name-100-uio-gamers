export interface Match {
  input: string;
  name: string | undefined;
  description: string | undefined;
  correct: boolean;
}

export interface NorwegianPersonItem {
  article_type_id: number;
  rank: number;
  taxonomy_title?: string;
  subject_title?: string;
  first_sentences?: string;
  snippet?: string;
  title?: string;
  headword?: string;
  article_url_json?: string;
}
