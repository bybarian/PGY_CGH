export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: number;
}

export interface Note {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  author: string;
  isAnonymous: boolean;
  createdAt: number;
  tilt?: number; // visual rotation angle
  comments?: Comment[];
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

export interface GroupBoard {
  id: string;
  name: string;
  room: string;
  tutor: string;
  moderatorTitle: string;
  caseTitle: string;
  caseDescription: string;
  caseTarget: string; // discussion goal
  notes: Note[];
  drawings: DrawingPath[];
}

export interface BoardSyncData {
  groups: { [groupId: string]: GroupBoard };
  activeUsers: number;
}
