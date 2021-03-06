import { serializeEthAddrRegArgs, serializeSudtArgs } from "../../src/parse-tx";
import test from "ava";
import {
  EthAddrRegArgsType,
  normalizers,
  schemas,
  SudtArgsType,
} from "@godwoken-web3/godwoken";
import { Reader } from "@ckb-lumos/toolkit";
import web3Utils from "web3-utils";
import { MAX_ADDRESS_SIZE_PER_REGISTER_BATCH } from "../../src/methods/constant";
import { calcFee } from "../../src/util";

const serializedRegSetMappingL2Tx = prepareRegSetMappingTx();
const serializedRegBatchSetMappingL2Tx = prepareRegBatchSetMappingTx();
const serializedSudtTransferL2Tx = prepareSudtTransferTx();

test("8000000000000000 fee rate for setMapping", (t) => {
  const feeRate = BigInt("8000000000000000");
  const requiredFee = calcFee(serializedRegSetMappingL2Tx, feeRate);
  const consumed = web3Utils.fromWei(requiredFee.toString(10), "ether");
  console.log(`setMapping tx consume ${consumed} CKB`);
  t.true(+consumed > 0);
});

test(`8000000000000000 fee rate for ${MAX_ADDRESS_SIZE_PER_REGISTER_BATCH} hashes batchSetMapping`, (t) => {
  const feeRate = BigInt("8000000000000000");
  const requiredFee = calcFee(serializedRegBatchSetMappingL2Tx, feeRate);
  const consumed = web3Utils.fromWei(requiredFee.toString(10), "ether");
  console.log(`batchSetMapping tx consume ${consumed} CKB`);
  t.true(+consumed > 0);
});

test(`8000000000000000 fee rate for sudt transfer`, (t) => {
  const feeRate = BigInt("8000000000000000");
  const requiredFee = calcFee(serializedSudtTransferL2Tx, feeRate);
  const consumed = web3Utils.fromWei(requiredFee.toString(10), "ether");
  console.log(`sudt transfer tx consume ${consumed} CKB`);
  t.true(+consumed > 0);
});

// helper functions
function prepareSudtTransferTx() {
  const sudtTransfer = {
    to_address:
      "0x3991637c340d585858f45c440116aaf2d13580517fc0fffeb67b5bffe35d77d0",
    amount: "0xffffff",
    fee: {
      registry_id: "0x1",
      amount: "0x10",
    },
  };
  const sudtArgs = {
    type: SudtArgsType.SUDTTransfer,
    value: sudtTransfer,
  };
  const serializedSudtArgs = serializeSudtArgs(sudtArgs);
  const sudtL2Tx = {
    raw: {
      chain_id: "0x116e8",
      from_id: "0x10",
      to_id: "0x1",
      nonce: "0xa4",
      args: serializedSudtArgs,
    },
    signature:
      "0xbde03b87b7da48cc186a51f199355346a8173249886da75898159b1d00bb17940a908af2cc753b9003863a35a0bd35287e7c9f103339e05532d2be179d88d41800",
  };

  const serializedSudtL2Tx = new Reader(
    schemas.SerializeL2Transaction(normalizers.NormalizeL2Transaction(sudtL2Tx))
  ).serializeJson();
  return serializedSudtL2Tx;
}

function prepareRegSetMappingTx() {
  const setMapping = {
    gw_script_hash:
      "0x3991637c340d585858f45c440116aaf2d13580517fc0fffeb67b5bffe35d77d0",
    fee: {
      registry_id: "0x1",
      amount: "0x10",
    },
  };
  const ethAddrRegArgs = {
    type: EthAddrRegArgsType.SetMapping,
    value: setMapping,
  };
  const serializedSetMapping = serializeEthAddrRegArgs(ethAddrRegArgs);
  const regL2Tx = {
    raw: {
      chain_id: "0x116e8",
      from_id: "0x10",
      to_id: "0x2",
      nonce: "0xa4",
      args: serializedSetMapping,
    },
    signature:
      "0xbde03b87b7da48cc186a51f199355346a8173249886da75898159b1d00bb17940a908af2cc753b9003863a35a0bd35287e7c9f103339e05532d2be179d88d41800",
  };

  const serializedRegL2Tx = new Reader(
    schemas.SerializeL2Transaction(normalizers.NormalizeL2Transaction(regL2Tx))
  ).serializeJson();
  return serializedRegL2Tx;
}

function prepareRegBatchSetMappingTx() {
  const batchSetMapping = {
    gw_script_hashes: new Array(MAX_ADDRESS_SIZE_PER_REGISTER_BATCH).fill(
      "0x3991637c340d585858f45c440116aaf2d13580517fc0fffeb67b5bffe35d77d0"
    ),
    fee: {
      registry_id: "0x1",
      amount: "0x10",
    },
  };
  const ethAddrRegArgs = {
    type: EthAddrRegArgsType.BatchSetMapping,
    value: batchSetMapping,
  };
  const serializedSetMapping = serializeEthAddrRegArgs(ethAddrRegArgs);
  const regL2Tx = {
    raw: {
      chain_id: "0x116e8",
      from_id: "0x10",
      to_id: "0x2",
      nonce: "0xa4",
      args: serializedSetMapping,
    },
    signature:
      "0xbde03b87b7da48cc186a51f199355346a8173249886da75898159b1d00bb17940a908af2cc753b9003863a35a0bd35287e7c9f103339e05532d2be179d88d41800",
  };

  const serializedRegL2Tx = new Reader(
    schemas.SerializeL2Transaction(normalizers.NormalizeL2Transaction(regL2Tx))
  ).serializeJson();
  return serializedRegL2Tx;
}
