import { b64uDec } from "./utils/helper";


const config = {
  node: 'https://api.hive.blog',
  chain_id: 'beeab0de00000000000000000000000000000000000000000000000000000000',
  address_prefix: 'STM'
}



// STEEM CONFIG 
export const STEEM_API_URLS = [
    process.env.STEEM_API_URL || "https://api.steemit.com",
    "https://testnet.steemitdev.com"
  ];

  
  

export const VOTE_PERCENT = 50000; /*set 500% */
export const VOTE_BOT_ACCOUNT =  "inven.cu02";
export const VOTE_BOT_KEY = "5Kj61cv8Fi1wojxgxq13PoqNABmBZqCCKKaewXTTnkLvKpFXT6J";
module.exports = config
