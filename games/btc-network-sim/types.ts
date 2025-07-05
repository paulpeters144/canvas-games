import {} from "./util";

export interface Position {
   x: number;
   y: number;
}

export interface BlockHeader {
   previousBlockHash?: string;
   merkleRoot: string;
   timestamp: number;
   nonce: number;
}

export interface Block {
   hash: string;
   height: number;
   header: BlockHeader;
   transactionCount: number;
   difficulty: number;
   confirmations: number;
   rewardAmount: string;
   rewardFees: string;
   minerRewardAddress: string;
   transactions: BlockTx[];
}

export interface UTXO {
   id: string;
   value: string;
   owner: string;
}

export interface PreSignedTx {
   inputs: UTXO[];
   outputs: UTXO[];
   pubKey: string;
   fee: string;
}

export interface BlockTx extends PreSignedTx {
   sig: string;
   hash: string;
}
