import { Timestamp } from "firebase-admin/firestore";

export interface User {
  name: string;
  lastName: string;
  email: string;
  createdAt: Timestamp;
}
