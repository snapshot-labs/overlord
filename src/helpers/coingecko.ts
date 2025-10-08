import { withCache } from './cache';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const TIME_WINDOW = 2 * 3600;
const BASE_URL = 'https://pro-api.coingecko.com/api/v3';
const CURRENCY = 'usd';

// Network mapping retrieved from CoinGecko API: https://pro-api.coingecko.com/api/v3/asset_platforms
const NETWORK_MAPPING: Record<
  number,
  { platform_id: string; coin_id: string }
> = {
  1: { platform_id: 'ethereum', coin_id: 'ethereum' },
  9: { platform_id: 'quai-network', coin_id: 'quai-network' },
  10: { platform_id: 'optimistic-ethereum', coin_id: 'ethereum' },
  14: { platform_id: 'flare-network', coin_id: 'flare-networks' },
  19: { platform_id: 'songbird', coin_id: 'songbird' },
  20: { platform_id: 'elastos', coin_id: 'elastos' },
  24: { platform_id: 'kardiachain', coin_id: 'kardiachain' },
  25: { platform_id: 'cronos', coin_id: 'crypto-com-chain' },
  30: { platform_id: 'rootstock', coin_id: 'rootstock' },
  40: { platform_id: 'telos', coin_id: 'telos' },
  42: { platform_id: 'lukso', coin_id: 'lukso-token-2' },
  50: { platform_id: 'xdc-network', coin_id: 'xdce-crowd-sale' },
  52: { platform_id: 'coinex-smart-chain', coin_id: 'coinex-token' },
  56: { platform_id: 'binance-smart-chain', coin_id: 'binancecoin' },
  57: { platform_id: 'syscoin', coin_id: 'syscoin' },
  61: { platform_id: 'ethereum-classic', coin_id: 'ethereum-classic' },
  66: { platform_id: 'okex-chain', coin_id: 'oec-token' },
  70: { platform_id: 'hoo-smart-chain', coin_id: 'hoo-token' },
  82: { platform_id: 'meter', coin_id: 'meter' },
  88: { platform_id: 'tomochain', coin_id: 'tomochain' },
  96: { platform_id: 'bitkub-chain', coin_id: 'bitkub-coin' },
  100: { platform_id: 'xdai', coin_id: 'xdai' },
  106: { platform_id: 'velas', coin_id: 'velas' },
  108: { platform_id: 'thundercore', coin_id: 'thunder-token' },
  119: { platform_id: 'enuls', coin_id: 'nuls' },
  122: { platform_id: 'fuse', coin_id: 'fuse-network-token' },
  128: { platform_id: 'huobi-token', coin_id: 'huobi-token' },
  130: { platform_id: 'unichain', coin_id: 'ethereum' },
  137: { platform_id: 'polygon-pos', coin_id: 'matic-network' },
  146: { platform_id: 'sonic', coin_id: 'sonic-3' },
  148: { platform_id: 'shimmer_evm', coin_id: 'shimmer' },
  151: { platform_id: 'redbelly-network', coin_id: 'redbelly-network-token' },
  169: { platform_id: 'manta-pacific', coin_id: 'weth' },
  177: { platform_id: 'hashkey-chain', coin_id: 'hashkey-ecopoints' },
  185: { platform_id: 'mint', coin_id: 'weth' },
  196: { platform_id: 'x-layer', coin_id: 'okb' },
  199: { platform_id: 'bittorrent', coin_id: 'bittorrent' },
  204: { platform_id: 'opbnb', coin_id: 'binancecoin' },
  232: { platform_id: 'lens', coin_id: 'gho' },
  239: { platform_id: 'tac', coin_id: 'tac' },
  248: { platform_id: 'oasys', coin_id: 'oasys' },
  250: { platform_id: 'fantom', coin_id: 'fantom' },
  252: { platform_id: 'fraxtal', coin_id: 'frax-share' },
  255: { platform_id: 'kroma', coin_id: 'weth' },
  288: { platform_id: 'boba', coin_id: 'ethereum' },
  295: { platform_id: 'hedera-hashgraph', coin_id: 'hedera-hashgraph' },
  311: { platform_id: 'omax', coin_id: 'omax-token' },
  314: { platform_id: 'filecoin', coin_id: 'filecoin' },
  321: { platform_id: 'kucoin-community-chain', coin_id: 'kucoin-shares' },
  324: { platform_id: 'zksync', coin_id: 'ethereum' },
  336: { platform_id: 'shiden network', coin_id: 'shiden' },
  361: { platform_id: 'theta', coin_id: 'theta-token' },
  369: { platform_id: 'pulsechain', coin_id: 'pulsechain' },
  388: { platform_id: 'cronos-zkevm', coin_id: 'cronos-zkevm-cro' },
  416: { platform_id: 'sx-network', coin_id: 'sx-network-2' },
  480: { platform_id: 'world-chain', coin_id: 'weth' },
  520: { platform_id: 'xt-smart-chain', coin_id: 'xtcom-token' },
  530: { platform_id: 'function-x', coin_id: 'fx-coin' },
  570: { platform_id: 'rollux', coin_id: 'syscoin' },
  592: { platform_id: 'astar', coin_id: 'astar' },
  614: { platform_id: 'graphlinq-chain', coin_id: 'graphlinq-protocol' },
  648: { platform_id: 'endurance', coin_id: 'endurance' },
  690: { platform_id: 'redstone', coin_id: 'weth' },
  747: { platform_id: 'flow-evm', coin_id: 'flow' },
  766: { platform_id: 'ql1', coin_id: 'wrapped-qom' },
  813: { platform_id: 'qitmeer-network', coin_id: 'qitmeer-network' },
  841: { platform_id: 'taraxa', coin_id: 'taraxa' },
  888: { platform_id: 'wanchain', coin_id: 'wanchain' },
  999: { platform_id: 'hyperevm', coin_id: 'hyperliquid' },
  1030: { platform_id: 'conflux', coin_id: 'conflux-token' },
  1088: { platform_id: 'metis-andromeda', coin_id: 'metis-token' },
  1101: { platform_id: 'polygon-zkevm', coin_id: 'ethereum' },
  1111: { platform_id: 'wemix-network', coin_id: 'wemix-token' },
  1116: { platform_id: 'core', coin_id: 'coredaoorg' },
  1130: { platform_id: 'defichain-evm', coin_id: 'defichain' },
  1135: { platform_id: 'lisk', coin_id: 'lisk' },
  1209: { platform_id: 'saita-chain', coin_id: 'saitachain-coin-2' },
  1231: { platform_id: 'ultron', coin_id: 'ultron' },
  1234: { platform_id: 'step-network', coin_id: 'stepex' },
  1284: { platform_id: 'moonbeam', coin_id: 'moonbeam' },
  1285: { platform_id: 'moonriver', coin_id: 'moonriver' },
  1300: { platform_id: 'glue', coin_id: 'glue-2' },
  1329: { platform_id: 'sei-v2', coin_id: 'wrapped-sei' },
  1339: { platform_id: 'elysium', coin_id: 'lava' },
  1480: { platform_id: 'vana', coin_id: 'vana' },
  1514: { platform_id: 'story', coin_id: 'story-2' },
  1559: {
    platform_id: 'tenet',
    coin_id: 'tenet-1b000f7b-59cb-4e06-89ce-d62b32d362b9'
  },
  1597: { platform_id: 'reactive-network', coin_id: 'reactive-network' },
  1625: { platform_id: 'gravity-alpha', coin_id: 'g-token' },
  1868: { platform_id: 'soneium', coin_id: 'ethereum' },
  1890: { platform_id: 'lightlink', coin_id: 'ethereum' },
  1907: { platform_id: 'Bitcichain', coin_id: 'bitcicoin' },
  1923: { platform_id: 'swellchain', coin_id: 'ethereum' },
  1996: { platform_id: 'sanko', coin_id: 'dream-machine-token' },
  2000: { platform_id: 'dogechain', coin_id: 'dogechain' },
  2001: { platform_id: 'milkomeda-cardano', coin_id: 'cardano' },
  2016: { platform_id: 'mainnetz', coin_id: 'mainnetz' },
  2020: { platform_id: 'ronin', coin_id: 'ronin' },
  2040: { platform_id: 'vanar-chain', coin_id: 'vanar-chain' },
  2222: { platform_id: 'kava', coin_id: 'kava' },
  2342: { platform_id: 'omnia', coin_id: 'omniaverse' },
  2345: { platform_id: 'goat', coin_id: 'wrapped-bitcoin' },
  2372: { platform_id: 'besc-hyperchain', coin_id: 'wrapped-besc-2' },
  2415: { platform_id: 'xodex', coin_id: 'xodex' },
  2525: { platform_id: 'inevm', coin_id: 'injective-protocol' },
  2611: { platform_id: 'redlight-chain', coin_id: 'redlight-chain' },
  2741: { platform_id: 'abstract', coin_id: 'ethereum' },
  2818: { platform_id: 'morph-l2', coin_id: 'weth' },
  3338: { platform_id: 'peaq', coin_id: 'peaq-2' },
  3637: { platform_id: 'botanix', coin_id: 'wrapped-bitcoin' },
  3693: { platform_id: 'empire', coin_id: 'empire-capital-token' },
  3721: { platform_id: 'xone', coin_id: 'wrapped-xoc' },
  3776: { platform_id: 'astar-zkevm', coin_id: 'weth' },
  3797: { platform_id: 'alverychain', coin_id: 'alvey-chain' },
  4061: { platform_id: 'nahmii', coin_id: 'nahmii' },
  4158: { platform_id: 'crossfi', coin_id: 'crossfi-2' },
  4162: { platform_id: 'sx-rollup', coin_id: 'sx-network-2' },
  4200: { platform_id: 'merlin-chain', coin_id: 'wrapped-bitcoin' },
  4337: { platform_id: 'beam', coin_id: 'beam' },
  4352: { platform_id: 'memecore', coin_id: 'memecore' },
  4488: { platform_id: 'hydra', coin_id: 'hydra' },
  4689: { platform_id: 'iotex', coin_id: 'iotex' },
  5000: { platform_id: 'mantle', coin_id: 'mantle' },
  5031: { platform_id: 'somnia', coin_id: 'somnia' },
  5112: { platform_id: 'ham', coin_id: 'weth' },
  5165: { platform_id: 'bahamut', coin_id: 'fasttoken' },
  5234: { platform_id: 'humanode', coin_id: 'wrapped-ehmnd' },
  5330: { platform_id: 'superseed', coin_id: 'ethereum' },
  5464: { platform_id: 'saga', coin_id: 'saga-2' },
  5545: { platform_id: 'duckchain', coin_id: 'the-open-network' },
  6001: { platform_id: 'bouncebit', coin_id: 'bouncebit' },
  6661: { platform_id: 'cybria', coin_id: 'wrapped-cybria' },
  6900: { platform_id: 'nibiru', coin_id: 'nibiru' },
  6942: { platform_id: 'laikachain', coin_id: 'laikachain' },
  7000: { platform_id: 'zetachain', coin_id: 'zetachain' },
  7070: { platform_id: 'planq-network', coin_id: 'planq' },
  7171: { platform_id: 'bitrock', coin_id: 'bitrock' },
  7560: { platform_id: 'cyber', coin_id: 'weth' },
  7700: { platform_id: 'canto', coin_id: 'canto' },
  7887: { platform_id: 'kinto', coin_id: 'ethereum' },
  8217: { platform_id: 'klay-token', coin_id: 'kaia' },
  8453: { platform_id: 'base', coin_id: 'ethereum' },
  8668: { platform_id: 'hela', coin_id: 'hela-usd' },
  8811: { platform_id: 'haven1', coin_id: 'haven1' },
  8822: { platform_id: 'iota-evm', coin_id: 'iota' },
  8889: { platform_id: 'vyvo-smart-chain', coin_id: 'vyvo-smart-chain' },
  8899: { platform_id: 'jibchain', coin_id: 'wrapped-jbc' },
  9001: { platform_id: 'evmos', coin_id: 'evmos' },
  9008: { platform_id: 'shido', coin_id: 'shido-2' },
  9745: { platform_id: 'plasma', coin_id: 'plasma' },
  9898: { platform_id: 'larissa', coin_id: 'larissa-blockchain' },
  9980: { platform_id: 'combo', coin_id: 'wbnb' },
  10000: { platform_id: 'smartbch', coin_id: 'bitcoin-cash' },
  10088: { platform_id: 'gatelayer', coin_id: 'gatechain-token' },
  10201: { platform_id: 'maxxchain', coin_id: 'power' },
  10849: { platform_id: 'lamina1', coin_id: 'lamina1' },
  11235: { platform_id: 'haqq-network', coin_id: 'islamic-coin' },
  11501: { platform_id: 'bevm', coin_id: 'bitcoin' },
  11820: { platform_id: 'artela', coin_id: 'artela-network' },
  12553: { platform_id: 'rss3-vsl', coin_id: 'rss3' },
  13371: { platform_id: 'immutable', coin_id: 'immutable-x' },
  16116: { platform_id: 'defiverse', coin_id: 'oasys' },
  16507: { platform_id: 'genesys-network', coin_id: 'genesys' },
  16661: { platform_id: '0g', coin_id: 'zero-gravity' },
  16718: { platform_id: 'airdao', coin_id: 'amber' },
  17777: { platform_id: 'eos-evm', coin_id: 'eos' },
  18159: { platform_id: 'proof-of-memes', coin_id: 'proof-of-memes-pomchain' },
  18686: { platform_id: 'moonchain', coin_id: 'mxc' },
  18888: { platform_id: 'titanchain', coin_id: 'tokenize-xchange' },
  22776: { platform_id: 'map-protocol', coin_id: 'marcopolo' },
  23294: { platform_id: 'oasis-sapphire', coin_id: 'oasis-network' },
  27563: { platform_id: 'onchain', coin_id: 'weth' },
  31612: { platform_id: 'mezo', coin_id: 'wrapped-bitcoin' },
  32520: { platform_id: 'bitgert', coin_id: 'bitrise-token' },
  32769: { platform_id: 'zilliqa-evm', coin_id: 'zilliqa' },
  33139: { platform_id: 'apechain', coin_id: 'apecoin' },
  33979: { platform_id: 'funki', coin_id: 'ethereum' },
  34443: { platform_id: 'mode', coin_id: 'mode' },
  35441: { platform_id: 'q-mainnet', coin_id: 'q-protocol' },
  39797: { platform_id: 'energi', coin_id: 'energi' },
  41923: { platform_id: 'edu-chain', coin_id: 'edu-coin' },
  42161: { platform_id: 'arbitrum-one', coin_id: 'ethereum' },
  42170: { platform_id: 'arbitrum-nova', coin_id: 'ethereum' },
  42220: { platform_id: 'celo', coin_id: 'celo' },
  42262: { platform_id: 'oasis', coin_id: 'oasis-network' },
  42793: { platform_id: 'etherlink', coin_id: 'tezos' },
  43111: { platform_id: 'hemi', coin_id: 'weth' },
  43114: { platform_id: 'avalanche', coin_id: 'avalanche-2' },
  43419: { platform_id: 'gunz', coin_id: 'gunz' },
  48900: { platform_id: 'zircuit', coin_id: 'weth' },
  50104: { platform_id: 'sophon', coin_id: 'sophon' },
  52014: { platform_id: 'electroneum', coin_id: 'electroneum' },
  53935: { platform_id: 'defi-kingdoms-blockchain', coin_id: 'defi-kingdoms' },
  55244: {
    platform_id: 'Superposition',
    coin_id: 'superposition-bridged-weth-superposition'
  },
  56288: { platform_id: 'boba-bnb', coin_id: 'boba-network' },
  57073: { platform_id: 'ink', coin_id: 'ethereum' },
  59144: { platform_id: 'linea', coin_id: 'ethereum' },
  62621: { platform_id: 'multivac', coin_id: 'multivac' },
  73115: { platform_id: 'icb-network', coin_id: 'icb-network' },
  78887: { platform_id: 'lung-chain', coin_id: 'lunagens' },
  80094: { platform_id: 'berachain', coin_id: 'berachain-bera' },
  81457: { platform_id: 'blast', coin_id: 'blast-old' },
  83872: { platform_id: 'zedxion', coin_id: 'zedxion-2' },
  88811: { platform_id: 'units-network', coin_id: 'unit0' },
  98866: { platform_id: 'plume-network', coin_id: 'plume' },
  100009: { platform_id: 'vechain', coin_id: 'vechain' },
  111188: { platform_id: 're-al', coin_id: 'weth' },
  153153: { platform_id: 'odyssey-chain', coin_id: 'dione' },
  161803: { platform_id: 'eventum', coin_id: 'ethereum' },
  167000: { platform_id: 'taiko', coin_id: 'taiko' },
  200901: { platform_id: 'bitlayer', coin_id: 'bitcoin' },
  210425: { platform_id: 'platon-network', coin_id: 'platon-network' },
  322202: { platform_id: 'parex-network', coin_id: 'parex' },
  333999: { platform_id: 'polis-chain', coin_id: 'polis' },
  440017: { platform_id: 'graphite-network', coin_id: 'graphite-network' },
  534352: { platform_id: 'scroll', coin_id: 'weth' },
  622277: { platform_id: 'hypra-network', coin_id: 'hypra' },
  660279: { platform_id: 'xai', coin_id: 'xai-blockchain' },
  747474: { platform_id: 'katana', coin_id: 'weth' },
  777777: { platform_id: 'winr', coin_id: 'winr-protocol' },
  800001: { platform_id: 'octaspace', coin_id: 'octaspace' },
  810180: { platform_id: 'zklink-nova', coin_id: 'zklink' },
  1440000: { platform_id: 'xrpl-evm', coin_id: 'ripple' },
  7225878: { platform_id: 'saakuru', coin_id: 'wrapped-oasys' },
  7777777: { platform_id: 'zora-network', coin_id: 'weth' },
  10241024: { platform_id: 'alienx', coin_id: 'weth' },
  19880818: { platform_id: 'deepbrain-chain', coin_id: 'deepbrain-chain' },
  21000000: { platform_id: 'corn', coin_id: 'bitcorn-3' },
  245022934: { platform_id: 'neon-evm', coin_id: 'neon' },
  333000333: { platform_id: 'meld', coin_id: 'meld-2' },
  666666666: { platform_id: 'degen', coin_id: 'degen-base' },
  888888888: { platform_id: 'ancient8', coin_id: 'weth' },
  1313161554: { platform_id: 'aurora', coin_id: 'aurora-near' },
  1380012617: { platform_id: 'rari', coin_id: 'weth' },
  1666600000: { platform_id: 'harmony-shard-0', coin_id: 'harmony' },
  2046399126: { platform_id: 'skale', coin_id: 'skale' }
};

/**
 * Fetches the historical token price from CoinGecko API at a specific timestamp.
 *
 * @param network - The blockchain network ID
 * @param address - The token contract address
 * @param ts - Unix timestamp (in seconds) for the price query
 * @returns Promise resolving to the token price in USD, or 0 if data is unavailable
 *
 * @remarks
 * This function will return 0 in the following cases:
 * - Network is not supported (no platform ID mapping)
 * - Token address is invalid or not found
 * - No price data available for the specified timestamp
 * - API response contains no prices
 * - Missing or invalid API key
 *
 * Network errors from the fetch request are not caught and will bubble up to the caller.
 */
export async function getTokenPriceAtTimestamp(
  network: number,
  address: string | null,
  ts: number
) {
  return withCache(`price:${network}:${address}:${ts}`, async () => {
    if (!COINGECKO_API_KEY) throw new Error('Missing CoinGecko API key');

    const coinId =
      NETWORK_MAPPING[network]?.[!address ? 'coin_id' : 'platform_id'];
    if (!coinId) return 0;

    const coinParam = !address ? '' : `contract/${address}/`;
    const url = `${BASE_URL}/coins/${coinId}/${coinParam}market_chart/range?${new URLSearchParams(
      {
        vs_currency: CURRENCY,
        from: (ts - TIME_WINDOW).toString(),
        to: (ts + TIME_WINDOW).toString(),
        x_cg_pro_api_key: COINGECKO_API_KEY
      }
    )}`;

    const response = await fetch(url);
    const data: any = await response.json();

    if (!data.prices?.length) return 0;

    const [, price] = data.prices.reduce((closest: any, current: any) =>
      Math.abs(current[0] - ts) < Math.abs(closest[0] - ts) ? current : closest
    );

    return price;
  });
}
