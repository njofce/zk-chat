import axios, { AxiosResponse } from 'axios';
import { Group } from "@semaphore-protocol/group";
import { SemaphoreSignaturePCD, SemaphoreSignaturePCDPackage } from "test-pcd-semaphore-signature-pcd";
import { PASSPORT_URL } from "../constants/zuzalu";
import {
  requestZuzaluRLNUrl,
  requestSemaphoreSignatureUrl,
} from "./passport-interface";
import { RLNPCD, RLNPCDPackage } from "./rln-pcd";

import { serverUrl } from "../constants/constants";

// FIXME: reuse from zk-chat-client
const DEFAULT_DEPTH = 16
const DEFAULT_GROUP_ID = "1"
const DEFAULT_SIGNED_MESSAGE = "zk-chat-get-identity-commitment";

// Popup window will redirect to the passport to request a proof.
// Open the popup window under the current domain, let it redirect there:
export function requestProofFromPassport(proofUrl: string) {
  const popupUrl = `/popup?proofUrl=${encodeURIComponent(proofUrl)}`;
  window.open(popupUrl, "_blank", "width=360,height=480,top=100,popup");
}

export async function getIdentityCommitment(
  messageToSign?: string,
  proveOnServer: boolean = false,
): Promise<SemaphoreSignaturePCD | undefined> {
  return new Promise(async (resolve, reject) => {
    if (!messageToSign) {
      messageToSign = DEFAULT_SIGNED_MESSAGE;
    }
    const returnUrl = window.location.origin + "/popup";
    const popupUrl = requestSemaphoreSignatureUrl(
      PASSPORT_URL,
      returnUrl,
      messageToSign,
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
        if (parsedPCD.type !== SemaphoreSignaturePCDPackage.name) {
          resolve(undefined);
        } else {
          SemaphoreSignaturePCDPackage.deserialize(parsedPCD.pcd).then((pcd) => {
            resolve(pcd as SemaphoreSignaturePCD);
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

async function getSlashedGroup(): Promise<Group> {
  const url = serverUrl + "/zk-chat/api/user/leaves";
  const res: AxiosResponse = await axios({
    method: 'GET',
    url,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
  });
  const data = res.data as string[];
  // data contains an array of leaves in hex without `0x`.
  // E.g. in the format `["270c97128e2ec97b40c5774cb7f1ebf9b7abe704a13de12ea8fab656f30f4107","345b74e96c572951c50285495f19c175338fe3e03a5a6a040bf8a8da1f1d4ec","35fc1eef2dc43bc0c13e54a5104743952121ce5f957e4623fe553f7881232a1"]`
  // We need to convert it to an array of decimal strings
  const members = data.map((leaf) => BigInt("0x" + leaf).toString());
  const group = new Group(DEFAULT_GROUP_ID, DEFAULT_DEPTH);
  group.addMembers(members);
  console.log("!@# getSlashedGroup: got slashed group from url=", url, ", root=", group.root)
  return group;
}


export async function generateRLNProof(
  epoch: bigint,
  signal: string,
  rlnIdentifier: bigint,
  proveOnServer = false,
): Promise<RLNPCD | undefined> {
  return new Promise(async (resolve, reject) => {
    const returnUrl = window.location.origin + "/popup";
    const group = await getSlashedGroup();
    const popupUrl = requestZuzaluRLNUrl(
      PASSPORT_URL,
      returnUrl,
      group,
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