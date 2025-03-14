import { useEffect, useState } from 'react';
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  InputViewFunctionData,
  Network,
  TransactionResponse
} from "@aptos-labs/ts-sdk";

export interface BountyParams {
  bountyId: string;
  dataRefer: string;
  stakingAmount: number;
  minimumOfUser: number;
  expireTime: number;
}

export interface ParticipantParams {
  participantAddress: string;
  point: number;
  bountyId: string;
}

export const useContract = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);

  const MODULE_ADDRESS = "0xc49dbac3840306fba49daedca5393ecc8618cbeae845999ed5452702f872b306";

  // Initialize Aptos client
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);

  // Initialize account from private key
  const initializeAccount = async () => {
    try {
      const privateKey = new Ed25519PrivateKey("0x211f0019d2984999c44aae74c3200ebc6f9207fe9159da80043538bcda1dded0");
      const account = await Account.fromPrivateKey({ privateKey });
      return account;
    } catch (err) {
      console.error("Error initializing account:", err);
      setError("Failed to initialize account");
      throw err;
    }
  };
  
  useEffect(() => {
    initializeAccount()
  }, [])

  const getAllBounties = async <T>(): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const payload: InputViewFunctionData = {
        function: `${MODULE_ADDRESS}::bounty_pool_1_2::get_all_bounties`,
      };

      const data = await aptos.view({ payload });

      console.log(data[0])
      return data[0] as T;
    } catch (err: any) {
      console.error("Error getting all bounties:", err);
      setError(err.message || "Failed to get all bounties");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    transaction,
    getAllBounties
  };
};