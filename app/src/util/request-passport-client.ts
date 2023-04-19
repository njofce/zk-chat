import { PASSPORT_URL, SEMAPHORE_GROUP_URL } from "../constants/zuzalu";
import {
  requestZuzaluRLNUrl,
} from "./passport-interface";
import { RLNPCD, RLNPCDPackage } from "./rln-pcd";

// Popup window will redirect to the passport to request a proof.
// Open the popup window under the current domain, let it redirect there:
export function requestProofFromPassport(proofUrl: string) {
  const popupUrl = `/popup?proofUrl=${encodeURIComponent(proofUrl)}`;
  window.open(popupUrl, "_blank", "width=360,height=480,top=100,popup");
}


export async function generateRLNProof(
  epoch: bigint,
  signal: string,
  rlnIdentifier: bigint,
  proveOnServer = false,
): Promise<RLNPCD | undefined> {
  return new Promise(async (resolve, reject) => {
    const returnUrl = window.location.origin + "/popup";
    const popupUrl = requestZuzaluRLNUrl(
      PASSPORT_URL,
      returnUrl,
      SEMAPHORE_GROUP_URL,
      rlnIdentifier.toString(),
      signal,
      epoch.toString(),
      proveOnServer
    );
    const popup = window.open(popupUrl, "popup", "width=600,height=600");
    const receiveMessage = (event: MessageEvent) => {
      // if (event.origin !== PASSPORT_URL) {
      //   return;
      // }

      const encodedPCD = event.data.encodedPCD;

      if (encodedPCD) {
        console.log("!@# Received PCD", encodedPCD);
        const parsedPCD = JSON.parse(decodeURIComponent(encodedPCD));
        if (parsedPCD.type !== RLNPCDPackage.name) {
          resolve(undefined);
        } else {
          RLNPCDPackage.deserialize(parsedPCD.pcd).then((pcd) => {
            resolve(pcd as RLNPCD);
          });
        }
      }
    };

    window.addEventListener("message", receiveMessage);

    const cleanup = () => {
      window.removeEventListener("message", receiveMessage);
      if (popup) {
        popup.close();
      }
    };

    popup?.addEventListener("beforeunload", cleanup);
  });
}