import * as PIXI from "pixi.js";
import { color } from "./ui.colors";

export const createScrollBox = (props: {
   width: number;
   height: number;
   fontSize: number;
   defaultText?: string;
   title: string;
}) => {
   const { width, height, defaultText, title, fontSize } = props;

   const ctr = new PIXI.Container();
   ctr.interactive = true;
   let mouseHovering = false;
   ctr.onpointerenter = () => {
      mouseHovering = true;
   };
   ctr.onpointerleave = () => {
      mouseHovering = false;
   };

   const lineCount = defaultText?.split("\n").length || 0;
   const resolution = lineCount > 500 ? 3.5 : 5;

   const titleText = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontSize: fontSize * 1.75,
         fontWeight: "bold",
         fontFamily: "consolas",
         fill: color.white,
      }),
      text: title,
      resolution: resolution,
   });

   const scrollMaskCtr = new PIXI.Container();

   const bodyText = new PIXI.Text({
      style: new PIXI.TextStyle({
         fontSize: fontSize,
         fontFamily: "consolas",
         fill: color.white,
         wordWrap: true,
         wordWrapWidth: width,
      }),
      text: defaultText?.trim(),
      resolution: resolution,
   });
   scrollMaskCtr.addChild(bodyText);

   const maskX = 0;
   const maskY = titleText.y + titleText.height + 5;
   const maskWidth = width;
   const maskHeight = height - maskY;

   const maskGraphic = new PIXI.Graphics()
      .rect(maskX, maskY, maskWidth, maskHeight)
      .fill({ color: 0xff00ff, alpha: 0.8 });

   scrollMaskCtr.mask = maskGraphic;

   scrollMaskCtr.x = maskX;
   scrollMaskCtr.y = maskY;

   ctr.addChild(maskGraphic, titleText, scrollMaskCtr);
   let scrollBar: Scrollbar | undefined;
   if (height < bodyText.height) {
      scrollBar = createScrollBar({
         height: maskHeight,
         width: 2.25,
         scrollableH: bodyText.height,
      });
      ctr.addChild(scrollBar.ctr);
   }

   return {
      ctr,
      scrollTo: (deltaY: number) => {
         if (!mouseHovering) return;
         scrollMaskCtr.y -= deltaY;

         const minScrollY = maskY + maskHeight - bodyText.height;
         const maxScrollY = maskY;

         if (scrollMaskCtr.y < minScrollY) {
            scrollMaskCtr.y = minScrollY;
         } else if (scrollMaskCtr.y > maxScrollY) {
            scrollMaskCtr.y = maxScrollY;
         }

         const scrollSize = Math.abs(maxScrollY - minScrollY);
         const scrollPoint = Math.abs(scrollMaskCtr.y - maxScrollY);
         const percent = scrollPoint / scrollSize;
         scrollBar?.scrollPercent(percent);
      },
      updatePosBasedOn: (graphic: PIXI.Graphics) => {
         if (scrollBar) {
            titleText.x = width * 0.5 - titleText.width * 0.5;
            bodyText.x = width * 0.5 - bodyText.width * 0.5 - 5;
            scrollBar.ctr.x = bodyText.x + bodyText.width + 10;
            scrollBar.ctr.y = titleText.y + 12;
         } else {
            titleText.x = width * 0.5 - titleText.width * 0.5;
            bodyText.x = width * 0.5 - bodyText.width * 0.5;
         }

         ctr.x = graphic.x + (graphic.width * 0.5 - width * 0.5);
         ctr.y = graphic.y + 20;
      },
   };
};

const createScrollBar = (props: {
   height: number;
   width: number;
   scrollableH: number;
}): Scrollbar => {
   const { height, width, scrollableH } = props;
   const ctr = new PIXI.Container();

   const scrollBg = new PIXI.Graphics()
      .roundRect(0, 0, width, height, 0.5)
      .fill({ color: color.outBorder });

   const scrollBarH = (height / scrollableH) * height;
   const scrollBar = new PIXI.Graphics()
      .roundRect(0, 0, width, scrollBarH, 0.5)
      .fill({ color: color.inBorder });

   ctr.addChild(scrollBg, scrollBar);

   const scrollPercent = (percent: number) => {
      let scrollPercent = percent > 1 ? 1 : percent;
      scrollPercent = percent < 0 ? 0 : percent;
      const openScrollBarSpace = height - scrollBarH;
      const newVal = openScrollBarSpace * scrollPercent;
      scrollBar.y = newVal;
   };
   return {
      ctr,
      scrollPercent,
   };
};

interface Scrollbar {
   ctr: PIXI.Container<PIXI.ContainerChild>;
   scrollPercent: (percent: number) => void;
}

// export const BLOCK_SAMPLE = `
// {
//   "hash": "0000000000000000000f66c00d418e590...",
//   "height": 850000,
//   "version": 536870912,
//   "previous_block_hash": "00000000000000005a...",
//   "merkle_root": "2d1f4b5c6d7d8d9e0f1a2b3c4d...",
//   "timestamp": 1720000000,
//   "bits": "1903a3d5",
//   "nonce": 123456789,
//   "size": 1234567,
//   "stripped_size": 1234000,
//   "weight": 4000000,
//   "transaction_count": 2500,
//   "median_time": 1719999900,
//   "difficulty": 987654321098.765,
//   "is_valid": true,
//   "confirmations": 10,
//   "transactions": [
//     {
//       "txid": "b10a20c9f8e7d6a5b4c3d2e1f0a23...",
//       "size": 220,
//       "vsize": 180,
//       "fee": 45000,
//       "inputs": [
//         {
//           "txid": "prev_txid_a...",
//           "vout": 0,
//           "value": 10000000,
//           "address": "bc1q..."
//         }
//       ],
//       "outputs": [
//         {
//           "value": 9900000,
//           "address": "bc1q..."
//         },
//         {
//           "value": 55000,
//           "address": "bc1q..."
//         }
//       ],
//       "is_coinbase": true,
//       "coinbase_data": "038d8f000000000000...",
//       "locktime": 0
//     },
//     {
//       "txid": "c20b30d8e9f0a1bdf2a3b4c5d6e7...",
//       "size": 300,
//       "vsize": 250,
//       "fee": 15000,
//       "inputs": [
//         {
//           "txid": "prev_txid_b...",
//           "vout": 1,
//           "value": 500000
//         }
//       ],
//       "outputs": [
//         {
//           "value": 480000,
//           "address": "1A1zP1e..."
//         },
//         {
//           "value": 5000,
//           "address": "1ABCxyz..."
//         }
//       ],
//       "is_coinbase": false,
//       "locktime": 0
//     }
//   ]
// }
// `;

// export const MEMPOOL_SAMPLE = `
// {
//   "total_transactions": 25487,
//   "total_size_bytes": 12345678,
//   "min_fee_rate_sats_per_vbyte": 1.5,
//   "max_fee_rate_sats_per_vbyte": 250.0,
//   "transactions_by_fee_rate": {
//     "200+": [
//       "txid_abc123...",
//       "txid_def456...",
//       "txid_ghi789..."
//     ],
//     "100-199": [
//       "txid_jkl012...",
//       "txid_mno345..."
//     ],
//     "50-99": [
//       "txid_pqr678...",
//       "txid_stu901..."
//     ],
//     "10-49": [
//       "txid_vwx234...",
//       "txid_yza567..."
//     ],
//     "1-9": [
//       "txid_bcd890...",
//       "txid_efg123...",
//       "txid_hij456..."
//     ]
//   },
//   "transactions_details": {
//     "txid_abc123...": {
//       "version": 2,
//       "locktime": 0,
//       "size": 220,
//       "vsize": 180,
//       "weight": 720,
//       "fee": 45000,
//       "fee_rate_sats_per_vbyte": 250.0,
//       "time_received": 1678886400,
//       "height_received": 780123,
//       "is_bip125_replaceable": true,
//       "inputs": [
//         {
//           "txid": "prev_txid_1...",
//           "vout": 0,
//           "script_sig": "...",
//           "sequence": 4294967295
//         }
//       ],
//       "outputs": [
//         {
//           "value": 10000000,
//           "script_pubkey": "...",
//           "address": "bc1q..."
//         },
//         {
//           "value": 20000,
//           "script_pubkey": "...",
//           "address": "bc1q..."
//         }
//       ],
//       "descendantcount": 0,
//       "descendantsize": 0,
//       "ancestorcount": 0,
//       "ancestorsize": 0
//     },
//     "txid_def456...": {
//       "version": 1,
//       "locktime": 0,
//       "size": 250,
//       "vsize": 250,
//       "weight": 1000,
//       "fee": 20000,
//       "fee_rate_sats_per_vbyte": 80.0,
//       "time_received": 1678886450,
//       "height_received": 780123,
//       "is_bip125_replaceable": false,
//       "inputs": [...],
//       "outputs": [...]
//     },
//     "txid_ghi789...": {
//       "version": 2,
//       "locktime": 0,
//       "size": 300,
//       "vsize": 200,
//       "weight": 800,
//       "fee": 1000,
//       "fee_rate_sats_per_vbyte": 5.0,
//       "time_received": 1678886500,
//       "height_received": 780123,
//       "is_bip125_replaceable": true,
//       "inputs": [...],
//       "outputs": []
//     }
//   },
//   "projected_blocks": [
//     {
//       "block_height_estimate": 780124,
//       "total_fees_sats": 5000000,
//       "total_size_bytes": 990000,
//       "transaction_count": 1800,
//       "median_fee_rate_sats_per_vbyte": 15.0,
//       "transactions": [
//         "txid_abc123...",
//         "txid_jkl012...",
//       ]
//     },
//     {
//       "block_height_estimate": 780125,
//       "total_fees_sats": 3000000,
//       "total_size_bytes": 980000,
//       "transaction_count": 2200,
//       "median_fee_rate_sats_per_vbyte": 8.0,
//       "transactions": [
//         "txid_pqr678...",
//         "txid_vwx234...",
//       ]
//     }
//   ]
// }`;

// export const BTC_WALLET_SAMPLE = `
// {
//   "wallet_name": "My Bitcoin Wallet - Main Account",
//   "wallet_id": "wallet_1234567890abcdef123abcdef...",
//   "total_balance_btc": 0.51234567,
//   "total_balance_sats": 51234567,
//   "addresses": [
//     {
//       "address": "bc1qxy2345678904567890abcdefm...",
//       "balance_sats": 25000000,
//       "tx_count": 15,
//       "utxos": [
//         {
//           "txid": "e4a5bajb2c3d4e5f32df2a3b4c5d6...",
//           "vout": 0,
//           "value": 10000000,
//           "status": {
//             "confirmed": true,
//             "block_height": 800000,
//             "block_hash": "00000000cef1234567890...",
//             "block_time": 1678886400
//           }
//         },
//         {
//           "txid": "f5a6b7c8d9e0f1a2lkef3a4b5c6d7...",
//           "vout": 1,
//           "value": 15000000,
//           "status": {
//             "confirmed": false
//           }
//         }
//       ]
//     },
//     {
//       "address": "1BpR2XyZ12cdef123456789abcdefg...",
//       "balance_sats": 26234567,
//       "tx_count": 8,
//       "utxos": [
//         {
//           "txid": "a1bd0e1f2a3b4c5d6e7fa9b0c1d2e3...",
//           "vout": 0,
//           "value": 26234567,
//           "status": {
//             "confirmed": true,
//             "block_height": 790000,
//             "block_hash": "0000000076543234567890...",
//             "block_time": 1677777777
//           }
//         }
//       ]
//     }
//   ],
//   "recent_transactions": [
//     {
//       "txid": "g1h2i3j4k5l6m7n84u5v6wx8y9z0a1b2c3...",
//       "type": "send",
//       "amount_sats": -1000000,
//       "fee_sats": 500,
//       "status": "confirmed",
//       "block_height": 850000,
//       "timestamp": 1720000000
//     },
//     {
//       "txid": "d1e2f3a4b5c1c2d3e4f5a6b78d9e0f1a2b3...",
//       "type": "receive",
//       "amount_sats": 5000000,
//       "fee_sats": 0,
//       "status": "confirmed",
//       "block_height": 849990,
//       "timestamp": 1719999000
//     },
//     {
//       "txid": "x9y0z1a7a8b9c0d1e2f3a4b5cd7e8f9a0b1...",
//       "type": "send",
//       "amount_sats": -50000,
//       "fee_sats": 100,
//       "status": "pending",
//       "timestamp": 1720000050
//     }
//   ]
// }
// `;
