const axios = require('axios');
const schedule = require('node-schedule');

//Config Things
let token = ""; //Put your token here. Example: "TOKEN"
let groupID = ""; //Put your Group ID here. Example: "111111"
let discordWebhook = ""; //Discord Webhook
let AutoLike = false; //Auto Like

let lastMessageID = 0;

async function makeRequest(url, token, method) {
  const config = {
      method: method,
      url: url,
      headers: { 
        'cookie': "oauth_token=" + token, 
        "authorization": "Bearer " + token
      }
  }

  let res = await axios(config).catch((error) => {
    return false;
  });
  return res.data;
}

async function makeLikeRequest(token, MessageID) {
  const config = {
      method: "post",
      url: "https://www.yammer.com/api/v1/messages/liked_by/current.json?message_id="+MessageID+"&access_token="+token,
      headers: { 
        'cookie': "oauth_token=" + token, 
        "authorization": "Bearer " + token
      }
  }

  let res = await axios(config).catch((error) => {
    return false;
  });
  return res.data;
}

async function sendDiscordWebhook(title, link, message) {
  let res = await axios.post(discordWebhook, {
    "content": "@everyone",
      "embeds": [{
          "title": title,
          "description": message,
          "url": link,
          "color": 5814783
    }]
  }).catch((error) => {
    return false;
  });
  return res.data;
}

const job = schedule.scheduleJob('*/10 * * * * *', function(){
  if(token != "" && groupID != "") {
    const apiurl = "https://www.yammer.com/api/v1/messages/in_group/" + groupID + ".json";
    let request = makeRequest(apiurl,token,"get");
    request.then(function(result) {
        if (result){
          console.log("Last message ID:" + result["messages"][0]["id"]); //You can comment this because running this script 24/7 would bloat memory with "Last Message ID" Logs
          if (result["messages"][0]["id"] != lastMessageID && lastMessageID != 0) {
            console.log("That is a new Message!");
            sendDiscordWebhook("New Yammer Message:", result["messages"][0]["web_url"], result["messages"][0]["content_excerpt"]);
            if (AutoLike == true){
              makeLikeRequest(token, result["messages"][0]["id"])
            }
          }
          lastMessageID = result["messages"][0]["id"];
        }
    })
  }
  else {
    console.log("Please set your Token and Group ID!");
  }
});
