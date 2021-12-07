"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasVotedBy = hasVotedBy;
exports.startVoteBot = startVoteBot;
exports.votePost = votePost;

var _steem = require("../utils/steem");

var _config = require("../config");

var _helper = require("../utils/helper");

var _nodeSchedule = _interopRequireDefault(require("node-schedule"));

var _dsteem = _interopRequireDefault(require("../utils/dsteem"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ROBİA SP MİKTARI
const cheerio = require('cheerio');

const rp = require('request-promise');

var url = 'https://steemd.com/@inven.cu02';
rp(url).then(html => {
  let sp = [];
  var $ = cheerio.load(html);
  const res = $("p:contains('SP')").text();
  var a = res.trim();
  var b = a.replace(",", ".");
  sp = b.slice(0, -2); // var b = sp.substring(0,7);

  var sonSp = parseFloat(sp);
  console.log('====================================');
  console.log(sonSp);
  console.log('====================================');
});

async function startVoteBot() {
  console.log("Starting the vote bot...");
  await calculateWeight();
  await voteBotActivity();
}

let weights = {};
let timestamp = new Date();

async function calculateWeight() {
  const list = await (0, _helper.getDelegatorInfo)();
  var i = 0;
  let accounts = [list.length]; //accounts name

  let delSp = [list.length]; // delegate amount of users

  let totalSp = 0; //total delegate amount of bot account

  weights = {};

  for (i = 0; i < list.length; i++) {
    accounts[i] = list[i][1];
    delSp[i] = list[i][3];
  }

  for (i = 0; i < delSp.length; i++) {
    totalSp += delSp[i];
  }

  for (i = 0; i < delSp.length; i++) {
    delSp[i] = Math.floor(delSp[i] * 15 * 100 / totalSp);

    if (delSp[i] > 10000) {
      delSp[i] = 10000;
    } else if (delSp[i] < 1) {
      delSp[i] = 1;
    }
  }

  for (let k in accounts) {
    let weight = delSp[k];
    const delegators = accounts[k];
    weights[delegators] = weight;
  }

  return accounts; // for(i=0;i<accounts.length;i++){  // to see all permlinks in delagator list
  //  let veri = getPermLink(accounts[i])
  //  veri.then(function (result) {
  //    console.log(result)
  //   })
  // }   
}

async function getPermLink(account) {
  try {
    let data = await (0, _helper.getLastPost)(account);
    let permLink = data[0][4];
    return permLink;
  } catch (e) {
    return true;
  }
}

function getVotingWeight(author) {
  return weights[author];
}

async function isCreatedToday(author, permlink) {
  try {
    const post = await (0, _steem.getPostContent)(author, permlink);
    const midnight_today = getMidnight();
    return new Date(post.created + "Z") > midnight_today;
  } catch (e) {
    //console.error("Fail to check the creation date of the post", e);
    return true;
  }
}

function getMidnight() {
  const now = new Date(); // timezone = 9 means +0900 timezone, i.e. Korean timezone

  return daysAgo({
    now,
    days: 0,
    zero: true,
    timezone: 9
  });
}

async function hasVotedBy(author, permLink, voter) {
  try {
    const post = await (0, _steem.getPostContent)(author, permLink);
    const voters = post.active_votes.map(v => v.voter);
    return voters.includes(voter);
  } catch (e) {
    //console.error("Fail to check whether the post has voted or not", e);
    return false;
  }
}

async function hasVotedAuthorToday(author) {
  if (!author) return true;
  const voted_authors = await getRecentlyVotedAuthors();

  if (voted_authors.includes(author)) {
    // the author has been voted today
    console.log("Skip! I already voted the author @%s today", author);
    return true;
  } else {
    return false;
  }
}

async function getRecentlyVotedAuthors() {
  const operations = await getAccountHistory(_config.VOTE_BOT_ACCOUNT, -1, 1000);
  const midnight_today = getMidnight();
  return operations.filter(op => op[1].op[0] === "vote").filter(op => new Date(op[1].timestamp + "Z") > midnight_today) // within 1 day
  .map(op => op[1].op[1].author).filter(author => author !== _config.VOTE_BOT_ACCOUNT);
}

async function votePost(author, permLink, timestamp) {
  const voter = _config.VOTE_BOT_ACCOUNT;
  const voted = await hasVotedBy(author, permLink, voter);
  const weight = getVotingWeight(author);
  const privateKey = _config.VOTE_BOT_KEY;

  if (!weight) {
    console.log("Skip , author is not valid stakeholder");
    return;
  }

  if (voted) {
    console.log("Skip , Already voted up");
    return;
  }

  const postedToday = isCreatedToday(author, permLink);

  if (!postedToday) {
    console.log("Skip post is not created to day ");
    return;
  } // now let's vote after 3 mins 45 secs (minus 2 seconds to ensure inclusion)


  const vote_time = new Date(new Date(timestamp).getTime() + 238 * 1000); // console.log(
  //   "Will vote @%s/%s with weight [%s] at",
  //   author,
  //   permLink,
  //   weight,
  //   vote_time
  // );

  _dsteem.default.broadcast.vote({
    voter,
    author,
    permLink,
    weight
  }, _config.VOTE_BOT_KEY);

  console.log("Voted @%s/%s with weight = %s", author, permLink, weight); //  schedule.scheduleJob(vote_time), async () => {
  //   try{
  //     const alreadyVoted = await hasVotedBy(author,permLink,voter);
  //     if(alreadyVoted){
  //       console.log("Failed! I already voted the post @%s/%s",author,permLink)
  //       return;
  //     }
  //     const votedAuthor = await hasVotedAuthorToday(author);
  //     if(votedAuthor){
  //       return;
  //     }
  //     const op = await client.broadcast.vote(
  //       "vote",{
  //         voter,
  //         author,
  //         permLink,
  //         weight,
  //       },
  //       VOTE_BOT_KEY
  //     )
  //     console.log("Voted @%s/%s with weight = %s", author, permLink, weight)
  //     client.broadcast.sign(op,privateKey) 
  //   }
  //   catch (e) {
  //     console.error(
  //       "Failed when vote @%s/%s with weight = %s",
  //       author,
  //       permLink,
  //       weight,
  //       e
  //     );
  //       if (e.jse_shortmsg=="( now - voter.last_vote_time ).to_seconds() >= STEEM_MIN_VOTE_INTERVAL_SEC: Can only vote once every 3 seconds."){
  //       const delay_time = new Date(new Date(vote_time).getTime() + 3 * 1000);
  //       console.log(
  //        "2re try Will vote @%s/%s with weight [%s] at",
  //       author,
  //       permLink,
  //       weight,
  //       delay_time
  //        );
  //       await schedule.scheduleJob(delay_time, async () => {
  //         try {
  //           await client.broadcast(
  //             "vote",
  //             {
  //             voter,
  //             author,
  //             permLink,
  //             weight,
  //             },
  //             VOTE_BOT_KEY
  //             );
  //           console.log("2retry Voted @%s/%s with weight = %s", author, permLink, weight);
  //         }catch (e) {
  //           console.error(
  //             "Failed when vote @%s/%s with weight = %s",
  //             author,
  //             permLink,
  //             weight,
  //             e
  //           );
  //               if (e.jse_shortmsg=="( now - voter.last_vote_time ).to_seconds() >= STEEM_MIN_VOTE_INTERVAL_SEC: Can only vote once every 3 seconds."){
  //               const delay_time = new Date(new Date(vote_time).getTime() + 3 * 1000);
  //               console.log(
  //                "3re try Will vote @%s/%s with weight [%s] at",
  //                 author,
  //                permLink,
  //                   weight,
  //                 delay_time
  //                );
  //               await schedule.scheduleJob(delay_time, async () => {
  //                 try {
  //                   await client.broadcast(
  //                     "vote",
  //                     {
  //                     voter,
  //                     author,
  //                     permLink,
  //                     weight,
  //                     },
  //                     VOTE_BOT_KEY
  //                     );
  //                   console.log("3retry Voted @%s/%s with weight = %s", author, permLink, weight);
  //                 }catch (e) {
  //                   console.error(
  //                     "3 Failed when vote @%s/%s with weight = %s",
  //                     author,
  //                     permLink,
  //                     weight,
  //                     e
  //                   );
  //                 }
  //               })
  //               }
  //         }
  //       })
  //       }
  //   }
  // }
}

async function voteBotActivity() {
  const list = await (0, _helper.getDelegatorInfo)();
  let author = 0;
  var i = 0;
  let permLink;

  for (i = 0; i < list.length; i++) {
    author = list[i][1];
    permLink = await getPermLink(author);
    votePost(author, permLink, timestamp);
  }
}

async function scheduleUpdateVotingWeight() {
  const scheduledTime = Date.now; // GTC time very day

  const j = _nodeSchedule.default.scheduleJob(scheduledTime, async () => {
    await calculateWeight();
  });

  console.log("Scheduled updating voting weight at", scheduledTime);
}