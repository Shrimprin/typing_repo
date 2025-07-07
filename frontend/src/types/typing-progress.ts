type Typo = {
  row: number;
  column: number;
  character: string;
};

export type TypingProgress = {
  row: number;
  column: number;
  time: string;
  total_typo_count: number;
  typos?: Typo[];
};
