import type { Principal } from '@dfinity/principal';
export interface _SERVICE {
  'ListItem' : (arg_0: Principal, arg_1: bigint) => Promise<string>,
  'completePurchase' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: Principal,
    ) => Promise<string>,
  'getListed' : () => Promise<Array<Principal>>,
  'getOpenDID' : () => Promise<Principal>,
  'getOriginalOwner' : (arg_0: Principal) => Promise<Principal>,
  'getOwnedNFTs' : (arg_0: Principal) => Promise<Array<Principal>>,
  'getPrice' : (arg_0: Principal) => Promise<bigint>,
  'isListed' : (arg_0: Principal) => Promise<boolean>,
  'mint' : (arg_0: Array<number>, arg_1: string) => Promise<Principal>,
}
