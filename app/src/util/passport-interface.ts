// Mostly copied from @pcd/passport-interface and consumer-client
import { ArgsOf, PCD, PCDPackage, ArgumentTypeName } from "@pcd/pcd-types";
import { RLNPCDPackage } from "./rln-pcd";
import { SemaphoreSignaturePCDPackage } from "test-pcd-semaphore-signature-pcd";


export enum PCDRequestType {
  Get = "Get",
  Add = "Add",
}

export interface PCDRequest {
  returnUrl: string;
  type: PCDRequestType;
}

export interface GetRequestOptions {
  genericProveScreen?: boolean;
  title?: string;
  description?: string;
  debug?: boolean;
  proveOnServer?: boolean;
}

export interface PCDGetRequest<T extends PCDPackage = PCDPackage>
  extends PCDRequest {
  type: PCDRequestType.Get;
  pcdType: T["name"];
  args: ArgsOf<T>;
  options?: GetRequestOptions;
}

export interface PCDAddRequest extends PCDRequest {
  type: PCDRequestType.Add;
  pcd: PCD;
}

export function constructPassportPcdGetRequestUrl<T extends PCDPackage>(
  passportOrigin: string,
  returnUrl: string,
  pcdType: T["name"],
  args: ArgsOf<T>,
  options?: GetRequestOptions
) {
  const req: PCDGetRequest<T> = {
    type: PCDRequestType.Get,
    returnUrl: returnUrl,
    args: args,
    pcdType,
    options,
  };
  const encReq = encodeURIComponent(JSON.stringify(req));
  return `${passportOrigin}#/prove?request=${encReq}`;
}

export function constructPassportPcdAddRequestUrl(
  passportOrigin: string,
  returnUrl: string,
  pcd: PCD
) {
  const req: PCDAddRequest = {
    type: PCDRequestType.Add,
    returnUrl: returnUrl,
    pcd,
  };
  return `${passportOrigin}?request=${JSON.stringify(req)}`;
}

export function requestZuzaluRLNUrl(
  urlToPassportWebsite: string,
  returnUrl: string,
  urlToSemaphoreGroup: string,
  rlnIdentifier: string,
  signal: string,
  epoch: string,
  proveOnServer?: boolean
) {
  const url = constructPassportPcdGetRequestUrl<
    typeof RLNPCDPackage
  >(
    urlToPassportWebsite,
    returnUrl,
    RLNPCDPackage.name,
    {
      rlnIdentifier: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value: rlnIdentifier ?? "1",
      },
      identity: {
        argumentType: ArgumentTypeName.PCD,
        value: undefined,
        userProvided: true,
      },
      group: {
        argumentType: ArgumentTypeName.Object,
        userProvided: false,
        remoteUrl: urlToSemaphoreGroup,
      },
      signal: {
        argumentType: ArgumentTypeName.String,
        userProvided: false,
        value: signal ?? "1",
      },
      epoch: {
        argumentType: ArgumentTypeName.BigInt,
        userProvided: false,
        value: epoch ?? "1",
      },
    },
    {
      proveOnServer: proveOnServer,
    }
  );

  return url;
}

export function requestSemaphoreSignatureUrl(
  urlToPassportWebsite: string,
  returnUrl: string,
  messageToSign: string,
  proveOnServer?: boolean
) {
  const url = constructPassportPcdGetRequestUrl<
    typeof SemaphoreSignaturePCDPackage
  >(
    urlToPassportWebsite,
    returnUrl,
    SemaphoreSignaturePCDPackage.name,
    {
      identity: {
        argumentType: ArgumentTypeName.PCD,
        value: undefined,
        userProvided: true,
      },
      signedMessage: {
        argumentType: ArgumentTypeName.String,
        value: messageToSign,
        userProvided: false,
      },
    },
    {
      proveOnServer: proveOnServer,
    }
  );

  return url;
}
