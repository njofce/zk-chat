import JSONBig from "json-bigint";
import { v4 as uuid } from "uuid";
import { Proof, RLN, RLNFullProof } from "rlnjs";
import { Identity } from "@semaphore-protocol/identity";

import {
  BigIntArgument,
  ObjectArgument,
  PCD,
  PCDArgument,
  PCDPackage,
  SerializedPCD,
  StringArgument,
} from "@pcd/pcd-types";
import {
  SemaphoreIdentityPCD,
  SemaphoreIdentityPCDPackage,
} from "@pcd/semaphore-identity-pcd";
import {
  deserializeSemaphoreGroup,
  SerializedSemaphoreGroup,
} from "test-pcd-semaphore-group-pcd";

let initArgs: RLNPCDInitArgs | undefined = undefined;

export const RLNPCDTypeName = "rln-pcd";

export interface RLNPCDInitArgs {
  zkeyFilePath: string;
  wasmFilePath: string;
}

// Ref: https://github.com/Rate-Limiting-Nullifier/rlnjs/blob/97fe15e04428c6adf81dbc856859e07527a063c9/src/types.ts#L59-L66
export interface RLNPCDArgs {
  // Identifier of the app. Every app using RLN should use a unique identifier.
  rlnIdentifier: BigIntArgument;
  // The semaphore keypair for a user
  identity: PCDArgument<SemaphoreIdentityPCD>;
  // The semaphore group
  group: ObjectArgument<SerializedSemaphoreGroup>;
  // The message that the user is sending
  signal: StringArgument;
  // The timestamp the message is sent
  epoch: BigIntArgument;
}

// https://rate-limiting-nullifier.github.io/rln-docs/protocol_spec.html#technical-side-of-rln
export interface RLNPCDClaim {
  // The message that the user is sending
  x: bigint;
  // The timestamp the message is sent
  epoch: bigint;
  // Identifier of the app. Every app using RLN should use a unique identifier.
  rlnIdentifier: bigint;
  // The y value calculated from the polynomial of x
  yShare: bigint;
  // The merkle root of the identity commitment tree
  merkleRoot: bigint;
  // The unique identifier for (rlnIdentifier, epoch, identity)
  internalNullifier: bigint;
}

export interface RLNPCDProof {
  // snarkjs proof, including curve points and the protocol metadata
  proof: Proof;
  // The unique identifier for (rlnIdentifier, epoch)
  externalNullifier: bigint;
}

export class RLNPCD implements PCD<RLNPCDClaim, RLNPCDProof> {
  type = RLNPCDTypeName;

  public constructor(
    readonly id: string,
    readonly claim: RLNPCDClaim,
    readonly proof: RLNPCDProof
  ) {
    checkClaimProofMatching(claim, proof);
  }

  static fromRLNFullProof(rlnFullProof: RLNFullProof): RLNPCD {
    const publicSignals = rlnFullProof.snarkProof.publicSignals;
    const claim: RLNPCDClaim = {
      x: BigInt(publicSignals.signalHash),
      epoch: rlnFullProof.epoch,
      rlnIdentifier: rlnFullProof.rlnIdentifier,
      yShare: BigInt(publicSignals.yShare),
      merkleRoot: BigInt(publicSignals.merkleRoot),
      internalNullifier: BigInt(publicSignals.internalNullifier),
    };
    const proof: RLNPCDProof = {
      proof: rlnFullProof.snarkProof.proof,
      externalNullifier: BigInt(publicSignals.externalNullifier),
    };
    return new RLNPCD(uuid(), claim, proof);
  }

  toRLNFullProof(): RLNFullProof {
    return {
      snarkProof: {
        proof: this.proof.proof,
        publicSignals: {
          yShare: this.claim.yShare,
          merkleRoot: this.claim.merkleRoot,
          internalNullifier: this.claim.internalNullifier,
          signalHash: this.claim.x,
          externalNullifier: this.proof.externalNullifier,
        },
      },
      epoch: this.claim.epoch,
      rlnIdentifier: this.claim.rlnIdentifier,
    };
  }
}

function checkClaimProofMatching(claim: RLNPCDClaim, proof: RLNPCDProof) {
  const claimExternalNullifier = RLN._genNullifier(
    claim.epoch,
    claim.rlnIdentifier
  );
  if (claimExternalNullifier !== proof.externalNullifier) {
    throw new Error(
      `claim and proof mismatch: claimExternalNullifier=${claimExternalNullifier}, ` +
        `proof.externalNullifier=${proof.externalNullifier}`
    );
  }
}

export async function init(args: RLNPCDInitArgs) {
  initArgs = args;
}

export async function prove(args: RLNPCDArgs): Promise<RLNPCD> {
  if (!initArgs) {
    throw new Error("cannot make proof: init has not been called yet");
  }

  // Make sure all arguments are provided
  const rlnIdentifier = args.rlnIdentifier.value;
  if (!rlnIdentifier) {
    throw new Error("cannot make proof: rlnIdentifier is not provided");
  }
  const serializedIdentityPCD = args.identity.value?.pcd;
  if (!serializedIdentityPCD) {
    throw new Error("cannot make proof: missing semaphore identity PCD");
  }
  const identityPCD = await SemaphoreIdentityPCDPackage.deserialize(
    serializedIdentityPCD
  );

  const serializedGroup = args.group.value;
  if (!serializedGroup) {
    throw new Error("cannot make proof: group is not provided");
  }
  const epoch = args.epoch.value;
  if (!epoch) {
    throw new Error("cannot make proof: epoch is not provided");
  }
  const signal = args.signal.value;
  if (!signal) {
    throw new Error("cannot make proof: signal is not provided");
  }
  const identity = new Identity((identityPCD.claim.identity as any).toString());
  const rln = getRLNInstance(BigInt(rlnIdentifier), identity);
  const group = deserializeSemaphoreGroup(serializedGroup);
  const leafIndex = group.indexOf(identity.getCommitment());
  const merkleProof = group.generateMerkleProof(leafIndex);
  const fullProof = await rln.generateProof(signal, merkleProof, epoch);
  return RLNPCD.fromRLNFullProof(fullProof);
}

export async function verify(pcd: RLNPCD): Promise<boolean> {
  checkClaimProofMatching(pcd.claim, pcd.proof);
  const fullProof = pcd.toRLNFullProof();
  return await RLN.verifySNARKProof(verificationKeyJSON, fullProof.snarkProof);
}

function getRLNInstance(rlnIdentifier: bigint, identity?: Identity) {
  if (!initArgs) {
    throw new Error("cannot make proof: init has not been called yet");
  }
  // NOTE: here we preprocess output from `Identity.toString` in order to make it accepted
  // by `Identity.constructor` in RLN. This is a temporary workaround since if the output
  // from `identity.toString()` is directly passed to `RLN` we'll get an error like this:
  // 'Error: invalid BigNumber string (argument="value", value="0x0xc3443f53e7bc98ca74270fdc822b2750c500e66e0d685649c418d8dc813f86", code=INVALID_ARGUMENT, version=bignumber/5.7.0)'
  // TODO: This preprocessing will be unnecessary when we make RLN accept `Identity` directly.
  let identityStr: string | undefined;
  if (identity) {
    // Preprocess output from `Identity.toString` in order to make it accepted by `Identity.constructor` in RLN
    const obj: string[] = JSON.parse(identity.toString());
    identityStr = JSON.stringify(obj.map((e) => BigInt(e).toString(16)));
  } else {
    // Leave it undefined and let RLN handle it
    identityStr = undefined;
  }

  return new RLN(
    initArgs.wasmFilePath,
    initArgs.zkeyFilePath,
    verificationKeyJSON,
    rlnIdentifier,
    identityStr
  );
}

export async function serialize(pcd: RLNPCD): Promise<SerializedPCD<RLNPCD>> {
  return {
    type: RLNPCDTypeName,
    pcd: JSONBig({ useNativeBigInt: true }).stringify(pcd),
  } as SerializedPCD<RLNPCD>;
}

export async function deserialize(serialized: string): Promise<RLNPCD> {
  const parsed = JSONBig({ useNativeBigInt: true }).parse(serialized);
  const proof = parsed.proof;
  const claim = parsed.claim;
  return new RLNPCD(parsed.id, claim, proof);
}

/**
 * PCD-conforming wrapper for the RLN protocol. You can
 * find documentation of RLN here: https://rate-limiting-nullifier.github.io/rln-docs/what_is_rln.html
 */
export const RLNPCDPackage: PCDPackage<
  RLNPCDClaim,
  RLNPCDProof,
  RLNPCDArgs,
  RLNPCDInitArgs
> = {
  name: RLNPCDTypeName,
  init,
  prove,
  verify,
  serialize,
  deserialize,
};



const verificationKeyJSON = JSON.parse(`
{
  "protocol": "groth16",
  "curve": "bn128",
  "nPublic": 5,
  "vk_alpha_1": [
   "20491192805390485299153009773594534940189261866228447918068658471970481763042",
   "9383485363053290200918347156157836566562967994039712273449902621266178545958",
   "1"
  ],
  "vk_beta_2": [
   [
    "6375614351688725206403948262868962793625744043794305715222011528459656738731",
    "4252822878758300859123897981450591353533073413197771768651442665752259397132"
   ],
   [
    "10505242626370262277552901082094356697409835680220590971873171140371331206856",
    "21847035105528745403288232691147584728191162732299865338377159692350059136679"
   ],
   [
    "1",
    "0"
   ]
  ],
  "vk_gamma_2": [
   [
    "10857046999023057135944570762232829481370756359578518086990519993285655852781",
    "11559732032986387107991004021392285783925812861821192530917403151452391805634"
   ],
   [
    "8495653923123431417604973247489272438418190587263600148770280649306958101930",
    "4082367875863433681332203403145435568316851327593401208105741076214120093531"
   ],
   [
    "1",
    "0"
   ]
  ],
  "vk_delta_2": [
   [
    "8804911247767743718582746182478817918330124079736727004921853200288163523142",
    "6653518272868907124249134260279067650948116751796597374984090931574452724344"
   ],
   [
    "4289260481290368283859566071595686774015143711765997065849324601720881606188",
    "18881861710269294750472671400972421342425334984858038435471651022146723199983"
   ],
   [
    "1",
    "0"
   ]
  ],
  "vk_alphabeta_12": [
   [
    [
     "2029413683389138792403550203267699914886160938906632433982220835551125967885",
     "21072700047562757817161031222997517981543347628379360635925549008442030252106"
    ],
    [
     "5940354580057074848093997050200682056184807770593307860589430076672439820312",
     "12156638873931618554171829126792193045421052652279363021382169897324752428276"
    ],
    [
     "7898200236362823042373859371574133993780991612861777490112507062703164551277",
     "7074218545237549455313236346927434013100842096812539264420499035217050630853"
    ]
   ],
   [
    [
     "7077479683546002997211712695946002074877511277312570035766170199895071832130",
     "10093483419865920389913245021038182291233451549023025229112148274109565435465"
    ],
    [
     "4595479056700221319381530156280926371456704509942304414423590385166031118820",
     "19831328484489333784475432780421641293929726139240675179672856274388269393268"
    ],
    [
     "11934129596455521040620786944827826205713621633706285934057045369193958244500",
     "8037395052364110730298837004334506829870972346962140206007064471173334027475"
    ]
   ]
  ],
  "IC": [
   [
    "21245767436323310498849811602404578935106041268557716518170092969683557427022",
    "1213884936807149462109807656412200533191299163229146611054071808178183458413",
    "1"
   ],
   [
    "18918285612126485260632299226369290849398931955460583791434273697096747446843",
    "4249003838522302297001105594846547434289852327219703307894847167138232160092",
    "1"
   ],
   [
    "21131658339185658088093556861306418236805038262556197407580399419902487697625",
    "5386386468756985708669825529724308439093753222660934460701014058899174604413",
    "1"
   ],
   [
    "18069268769796561519681091164429972843385730470565406637067874672398809598927",
    "616648665079672138683902077923207794820803708902120406822937751718367418986",
    "1"
   ],
   [
    "10958383820320663513827315124914669815120228317480235889587788076650559040047",
    "20130063098730806362220354043618677403032047167996551848609475247065044064058",
    "1"
   ],
   [
    "1308064321846506082463084434058009031577104372690966188531318892539766962085",
    "8205255831339720983923535788260434278529437037844159146692971472590880706967",
    "1"
   ]
  ]
 }
`);