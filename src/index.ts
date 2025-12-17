/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentCreated } from "firebase-functions/firestore";
import { User } from "./models/user.model";
import { insertFlowCustomer, setAuthUserClaims } from "./services/firebase";
import { getFlowClient } from "./services/flow";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

export const onUserCreated = onDocumentCreated(
  {
    document: "/users/{userId}",
    region: "southamerica-west1",
    timeoutSeconds: 540,
    memory: "16GiB",
    cpu: 8,
  },
  async (event) => {
    const { userId } = event.params;
    const { name, lastName, email } = event.data?.data() as User;

    setAuthUserClaims(userId, name, lastName);

    const flowClient = getFlowClient();
    const flowCustomer = await flowClient.createCustomer({
      name: `${name} ${lastName}`,
      email: email,
      externalId: userId,
    });
    await insertFlowCustomer(userId, flowCustomer);
  }
);
