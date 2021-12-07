import { b64uDec } from "./utils/helper";

// STEEM CONFIG 
export const STEEM_API_URLS = [
    process.env.STEEM_API_URL || "https://api.steemit.com",
    "https://api.steemit.com",
    "https://aksaiapi.wherein.mobi",
    "https://cn.steems.top",
    "https://steem.61bts.com",
    "https://api.steem.fans",
    "https://api.justyy.com",
    "https://api.steemyy.com",
    "https://steem.justyy.workers.dev",
    "https://x68bp3mesd.execute-api.ap-northeast-1.amazonaws.com/release",
    "https://api.steem.buzz",
    "https://api.steemzzang.com",
    "https://testnet.steemitdev.com"
  ];

  
  

export const VOTE_PERCENT = 50000; /*set 100% */
export const VOTE_BOT_ACCOUNT = process.env.VOTE_BOT_ACCOUNT || "inven.cu01";
export const VOTE_BOT_KEY = "5Ka42Y1FvE1U8KkdrKnuYo7UtaGQig5zEdD7fqTt1rpim92SnhA";
