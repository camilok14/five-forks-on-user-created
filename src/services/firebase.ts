import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { CustomerCreateResponse } from "./flow/types";

const app = initializeApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export const setAuthUserClaims = async (
  userUid: string,
  name: string,
  lastName: string
): Promise<void> => {
  await Promise.all([
    auth.updateUser(userUid, { displayName: `${name} ${lastName}` }),
    auth.setCustomUserClaims(userUid, { name: name, lastName: lastName }),
  ]);
};

export const insertFlowCustomer = async (
  userUid: string,
  flowCustoner: CustomerCreateResponse
): Promise<void> => {
  await firestore.collection("flow-customers").doc(userUid).set(flowCustoner);
};
