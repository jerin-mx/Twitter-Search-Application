var content = document.getElementById("content");
var fetchTime = document.getElementById("fetch_time");
var resultLen = document.getElementById("result_len");

// document.getElementById("search_btn").onclick = btnSearch;
// document.getElementById("metric_btn").onclick = btnMetric;

const searchTypes = document.querySelectorAll("input[name='search_type']");
var searchType, searchWord, startDate, endDate;

function btnMetric(){
    console.log('test');
    $.ajax({
        type: "GET",
        url: "http://localhost:5000/metric",
        dataType: "json",
        success: buildMetric,
        error: function(xrh, status, error) { alert("Error in fetching data.") }
    });
}


function btnSearch(){
    searchTypes.forEach( radio => {
        if(radio.checked) searchType = radio.value;
    });
    searchWord = document.getElementById("search_word").value;
    startDate = document.getElementById("start_date").value;
    endDate = document.getElementById("end_date").value;

    if(searchWord===""){
        alert("Please enter a search word!!!");
        return;
    }
    if(startDate==="") startDate="na";
    else startDate=Date.parse(startDate);
    if(endDate==="") endDate="na";
    else endDate=Date.parse(endDate);

    getAPI(searchType, searchWord, startDate, endDate);
}

const getAPI = (type, word, sDate, eDate) => {
    $.ajax({
        type: "GET",
        url: "http://localhost:5000/"+type +"/"+ word +"/"+ sDate +"/"+ eDate,
        dataType: "json",
        success: buildFeed,
        error: function(xrh, status, error) { alert("Error in fetching data.") }
    });
}

function buildFeed(response){
    res = response['data']
    fetchTime.innerHTML = "Search Time: " + response['fetch_time']*1000 + " ms";
    resultLen.innerHTML = res.length + " tweets found.";

    var feedStr = '<h2>Tweets</h2>';
    
    if(res.length===0) feedStr += "No tweet matched search Query.";

    var i, mx = res.length<100 ? res.length:100;
    for(i=0; i<mx; i++){
        var tweet = res[i];
        feedStr += '<div class="card">';
        feedStr += '<div><span onclick="authorClick(\''+ tweet['user']['id'] +'\');" class="name click_div">'+ tweet['user']['name'];
        if(tweet['user']['verified']) feedStr += ' <img src="./static/verified.png" width="14" height="14" />';
        feedStr += '</span></div>';

        feedStr += '<div class="time">'+ fromatDate(tweet['created_at']) +'</div>';
        feedStr += '<div class="screen_name">@'+ tweet['user']['screen_name'] +'</div>';
        feedStr += '<div class="tweet">'+ tweet['text'] +'</div>';
        
        feedStr += '<div class="bottom_bar">';
        feedStr += '<div onclick="retweetClick(\''+ tweet['id'] +'\');" class="retweet_count click_div">Retweets: '+ tweet['retweet_count'] +'</div>';
        feedStr += '<div class="favourite_count">Favourites: '+ tweet['favorite_count'] +'</div>';
        feedStr += '<div class="reply_count">Replies: '+ tweet['reply_count'] +'</div>';
	    feedStr += '</div>';

	    feedStr += '</div>';
    }

    content.innerHTML = feedStr;
}

const authorClick = (id) => {
    $.ajax({
        type: "GET",
        url: "http://localhost:5000/author/"+ id,
        dataType: "json",
        success: buildAuthor,
        error: function(xrh, status, error) { alert("Error in fetching data.") }
    });
}

function buildAuthor(response){
    author = response['data']
    fetchTime.innerHTML = "Search Time: " + response['fetch_time']*1000 + " ms";
    resultLen.innerHTML = author['tweets'].length + " tweets found." + author['retweets'].length + " retweets found.";

    console.log(author['tweets']);

    var feedStr = '<h2>Author</h2>';

    feedStr += '<div class="card" style="background-color:#33475b; color:white;">';

    feedStr += '<div class="name">'+ author['name'];
    if(author['verified']) feedStr += ' <img src="./static/verified.png" width="14" height="14" />';
    feedStr += '</div>';

    var dt = new Date(author['created_at']*1000)
    feedStr += '<div class="time"><span class="bu">Joined:</span> '+ dt.toDateString() +'</div>';
    feedStr += '<div class="screen_name">@'+ author['screen_name'] +'</div>';
    feedStr += '<div class="tweet"><span class="bu">Description:</span> '+ author['description'] +'</div>';
    
    feedStr += '<div class="bottom_bar">';
    feedStr += '<div class="friends_count">Friends: '+ author['friends_count'] +'</div>';
    feedStr += '<div class="followers_count">Followers: '+ author['followers_count'] +'</div>';
    feedStr += '</div>';

    feedStr += '</div>';


    feedStr += '<div class="tab">'
    feedStr += '<button id="defaultOpen" class="tablinks" onclick="switchTab(event, \'tweet_block\')">Tweets</button>';
    feedStr += '<button class="tablinks" onclick="switchTab(event, \'retweet_block\')">Retweets</button>';
    feedStr += '</div>';

	feedStr += '<div id="tweet_block" class="tabcontent">';
	feedStr += makeTweetList(author['tweets']);
    feedStr += '</div>';

	feedStr += '<div id="retweet_block" class="tabcontent">';
	feedStr += makeTweetList(author['retweets']);
	feedStr += '</div>';
    
	feedStr += '</div>';
    content.innerHTML = feedStr;

    document.getElementById("defaultOpen").click();
}

function makeTweetList(res){
    if(res.length===0) return "No tweets here!!";
    
    var feedStr = "";
    
    var i, mx = res.length<100 ? res.length:100;
    for(i=0; i<mx; i++){
        var tweet = res[i];
        feedStr += '<div class="card">';

        feedStr += '<div class="name">'+ tweet['user']['name'];
        if(tweet['user']['verified']) feedStr += ' <img src="./static/verified.png" width="14" height="14" />';
        feedStr += '</div>';

        feedStr += '<div class="time">'+ fromatDate(tweet['created_at']) +'</div>';
        feedStr += '<div class="screen_name">@'+ tweet['user']['screen_name'] +'</div>';
        feedStr += '<div class="tweet">'+ tweet['text'] +'</div>';
        
        feedStr += '<div class="bottom_bar">';
        feedStr += '<div onclick="retweetClick(\''+ tweet['id'] +'\');" class="retweet_count click_div">Retweets: '+ tweet['retweet_count'] +'</div>';
        feedStr += '<div class="favourite_count">Favourites: '+ tweet['favorite_count'] +'</div>';
        feedStr += '<div class="reply_count">Replies: '+ tweet['reply_count'] +'</div>';
	    feedStr += '</div>';

	    feedStr += '</div>';
    }

    return feedStr;
}

const retweetClick = (id) => {
    $.ajax({
        type: "GET",
        url: "http://localhost:5000/retweet/"+ id,
        dataType: "json",
        success: buildRetweet,
        error: function(xrh, status, error) { alert("Error in fetching data.") }
    });
}

function buildRetweet(response){
    tweet = response['data']
    fetchTime.innerHTML = "Search Time: " + response['fetch_time']*1000 + " ms";
    resultLen.innerHTML = tweet['retweets'].length + " retweets found.";

    var feedStr = "";

    feedStr += '<div class="card" style="background-color:#33475b; color:white;">';

    feedStr += '<div class="name">'+ tweet['user']['name'];
    if(tweet['user']['verified']) feedStr += ' <img src="./static/verified.png" width="14" height="14" />';
    feedStr += '</div>';

    feedStr += '<div class="time">'+ fromatDate(tweet['created_at']) +'</div>';
    feedStr += '<div class="screen_name">@'+ tweet['user']['screen_name'] +'</div>';
    feedStr += '<div class="tweet">'+ tweet['text'] +'</div>';
    
    feedStr += '<div class="bottom_bar">';
    feedStr += '<div  class="retweet_count">Retweets: '+ tweet['retweet_count'] +'</div>';
    feedStr += '<div class="favourite_count">Favourites: '+ tweet['favorite_count'] +'</div>';
    feedStr += '<div class="reply_count">Replies: '+ tweet['reply_count'] +'</div>';
    feedStr += '</div>';

    feedStr += '</div>';


    feedStr += '<h2>Retweets</h2>';
	feedStr += '<div id="retweet_block">';
	feedStr += makeReweetList(tweet['retweets']);
	feedStr += '</div>';
    
	feedStr += '</div>';
    content.innerHTML = feedStr;
}

function makeReweetList(res){
    if(res.length===0) return "No retweets available!!";

    var feedStr = "";

    var tweet, i, mx = res.length<100 ? res.length:100;
    for(i=0; i<mx; i++){
        tweet = res[i];
        feedStr += '<div class="card">';

        feedStr += '<div class>ReTweeted: '+ fromatDate(tweet['created_at']) +'</div><br>';

        feedStr += '<div><span onclick="authorClick(\''+ tweet['user']['id'] +'\');" class="name click_div">'+ tweet['user']['name'];
        if(tweet['user']['verified']) feedStr += ' <img src="./static/verified.png" width="14" height="14" />';
        feedStr += '</span></div>';

        var dt = new Date(tweet['user']['created_at'])
        feedStr += '<div class="time"><span class="bu">Joined:</span> '+ dt.toDateString() +'</div>';
        feedStr += '<div class="screen_name">@'+ tweet['user']['screen_name'] +'</div>';
        feedStr += '<div class="tweet"><span class="bu">Description:</span> '+ tweet['user']['description'] +'</div>';        
        
        
        feedStr += '<div class="bottom_bar">';
        feedStr += '<div class="friends_count">Friends: '+ tweet['user']['friends_count'] +'</div>';
        feedStr += '<div class="followers_count">Followers: '+ tweet['user']['followers_count'] +'</div>';
        feedStr += '</div>';


	    feedStr += '</div>';
    }
    return feedStr;
}

var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fromatDate(dt){
    dt = new Date(dt*1000);
    return month[dt.getMonth()] +' '+ dt.getDate() +', '+ dt.getFullYear() +' - '+ dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds();
}

function switchTab(evt, tabName) {
    var i, tabcontent, tablinks;
  
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}




function buildMetric(response){
    fetchTime.innerHTML = "Search Time: " + response['fetch_time']*1000 + " ms";
    resultLen.innerHTML = "";

    var feedStr = "";

    feedStr += '<h2>Top 10 Users</h2>';
    feedStr += '<table> <tr><th>Name</th><th>Followers</th></tr>';
    var users = response['data'][0];
    for(var i=0; i<users.length; i++){
        feedStr += '<tr><td>'+ users[i]['name'] +'</td><td>'+ users[i]['count'] +'</td></tr>';   
    }
    feedStr += '</table>';
    
    feedStr += '<h2>Top 10 Tweets</h2>';
    var res = response['data'][1]
    for(var i=0; i<res.length; i++){
        var tweet = res[i];
        feedStr += '<div class="card">';
        feedStr += '<div><span onclick="authorClick(\''+ tweet['user']['id'] +'\');" class="name click_div">'+ tweet['user']['name'];
        if(tweet['user']['verified']) feedStr += ' <img src="./static/verified.png" width="14" height="14" />';
        feedStr += '</span></div>';

        feedStr += '<div class="time">'+ fromatDate(tweet['created_at']) +'</div>';
        feedStr += '<div class="screen_name">@'+ tweet['user']['screen_name'] +'</div>';
        feedStr += '<div class="tweet">'+ tweet['text'] +'</div>';
        
        feedStr += '<div class="bottom_bar">';
        feedStr += '<div onclick="retweetClick(\''+ tweet['id'] +'\');" class="retweet_count click_div">Retweets: '+ tweet['retweet_count'] +'</div>';
        feedStr += '<div class="favourite_count">Favourites: '+ tweet['favorite_count'] +'</div>';
        feedStr += '<div class="reply_count">Replies: '+ tweet['reply_count'] +'</div>';
	    feedStr += '</div>';

	    feedStr += '</div>';
    }

    content.innerHTML = feedStr;
}
