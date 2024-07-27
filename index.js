const fs = require("fs"); 
const csvParser = require("csv-parser");
const { stringify: csvStringify } = require("csv-stringify");
const dotenv = require("dotenv");


dotenv.config();
const CREATE_TWEET_QUERY_ID = "FcQ8KP1fbPXkq2AugbyXGw"


const makeBody = (tweetBody) => ({
  "variables": {
    "tweet_text": tweetBody,
    "dark_request": false,
    "media": {
      "media_entities": [],
      "possibly_sensitive": false
    },
    "semantic_annotation_ids": [],
    "disallowed_reply_options": null
  },
  "features": {
    "communities_web_enable_tweet_community_results_fetch": true,
    "c9s_tweet_anatomy_moderator_badge_enabled": true,
    "tweetypie_unmention_optimization_enabled": true,
    "responsive_web_edit_tweet_api_enabled": true,
    "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
    "view_counts_everywhere_api_enabled": true,
    "longform_notetweets_consumption_enabled": true,
    "responsive_web_twitter_article_tweet_consumption_enabled": true,
    "tweet_awards_web_tipping_enabled": false,
    "creator_subscriptions_quote_tweet_preview_enabled": false,
    "longform_notetweets_rich_text_read_enabled": true,
    "longform_notetweets_inline_media_enabled": true,
    "articles_preview_enabled": true,
    "rweb_video_timestamps_enabled": true,
    "rweb_tipjar_consumption_enabled": true,
    "responsive_web_graphql_exclude_directive_enabled": true,
    "verified_phone_label_enabled": false,
    "freedom_of_speech_not_reach_fetch_enabled": true,
    "standardized_nudges_misinfo": true,
    "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
    "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
    "responsive_web_graphql_timeline_navigation_enabled": true,
    "responsive_web_enhance_cards_enabled": false
  },

  "queryId": CREATE_TWEET_QUERY_ID
})



const {COOKIE, CRSF_TOKEN, AUTHORIZATION} = process.env;
if (!COOKIE || !CRSF_TOKEN || !AUTHORIZATION){
  console.log("please set the env variables COOKIE, CRSF_TOKEN, AUTHORIZATION");
  process.exit(1);
}
const headers =  {
  "accept": "*/*",
  "content-type": "application/json",
  "x-csrf-token": CRSF_TOKEN,
  "authorization": AUTHORIZATION,
  "cookie": COOKIE,
}

async function postTweet(text){
  const res = await fetch(`https://x.com/i/api/graphql/${CREATE_TWEET_QUERY_ID}/CreateTweet`, { 
    headers: headers,
    body: JSON.stringify(makeBody(text)),
    method: "POST"
  });
  
  return res;
}
 

function fromatMessage(cityName){ 
  return `fuck ${cityName}`;
}

const FILE_NAME = "eg-cities.csv";
const PARSE_OPTIONS = {
  header: true,
  columns: { city : "city", governance : "governance" },
}


function postAndUpdateCities(fileName, cities){
  const index = Math.floor(Math.random() * cities.length);
  const city = cities[index];
  const newCities = cities.filter((_, i) => i !== index);
  csvStringify(newCities, PARSE_OPTIONS, async (err, output) => {
    postTweet(fromatMessage(city.city)).then( async res => {
      if (res.ok){
        console.log(res);
        fs.writeFileSync(fileName, output);
        console.log(`done (${city.city}), remaining cities: ${newCities.length}`);
      }
      else{
        console.log(res.body);
        console.log(`failed (${city.city}), remaining cities: ${newCities.length}`);
        process.exit(1);
      }
    });
  });


}


function postRandomCity(fileName, closeCallback){
  const cities = [];
  const stream = fs.createReadStream(fileName);
    stream
      .pipe(csvParser())
      .on("data", data => cities.push(data))
      .on("end", () =>  closeCallback(cities));
}


postRandomCity(FILE_NAME, (cities) => {
  postAndUpdateCities(FILE_NAME, cities);
})



