export interface Position {
   x: number;
   y: number;
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
