
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const spotify_uri_endpoint = 'https://accounts.spotify.com/authorize';
const client_id = '41b1bea3c5e642f99a6bc68de61fe29f';
const response_type = 'token';
const redirect_uri = chrome.identity.getRedirectURL();
const scope = 'user-read-private user-read-email user-library-read user-library-modify';
const state = generateRandomString(16);

let user_signed_in = false;
var access_token=null;

function get_endpoint_url(){
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=' + encodeURIComponent(response_type);;
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    url += '&state=' + encodeURIComponent(state);
    return url;
}

function getHashParams(redirect_uri) {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = redirect_uri.split('#')[1];
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

function get_authorization(redirect_uri){
    var stateKey = 'spotify_auth_state';
    var params = getHashParams(redirect_uri);
    return params.access_token;
}

function launch_Auth(){
    chrome.identity.launchWebAuthFlow({
        url: get_endpoint_url(),
        interactive: true
    }, function(redirect_uri){
        if (chrome.runtime.lastError || redirect_uri.includes('access_denied')) {
            console.log("Authentication Failed");
        } else {
            user_signed_in = true;
            console.log("User Authenticated");
            access_token = get_authorization(redirect_uri);
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == 'login') {
        
    }
    else if (request.message == 'logout'){

    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
    if (!access_token){
        launch_Auth();
    }
    else if (request.message == 'addSong') {
        console.log("Like on Spotify Button Pressed");
        var spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(access_token);
        var searchQuery = request.song.replaceAll("  ", " ").replaceAll(" ", "+");
        spotifyApi.searchTracks(searchQuery, function(err, data){
            if (err) console.log("err");
            else {
                console.log("query:", searchQuery);
                songResults = data.tracks.items;
                if (songResults === undefined || songResults.length == 0){
                    console.log("Song not found.");
                    sendResponse({reply: "failed"});
                }
                else { 
                    console.log(data);
                    song = data.tracks.items[0];
                    spotifyApi.addToMySavedTracks([song.uri.split(':')[2]], function(err, data){
                        if (err) console.error(err);
                        else{ 
                            console.log("Added ", song.name, "to liked tracks");
                            sendResponse({reply: "success", song: song.name, artist: song.artists[0].name});
                        }
                    });
                }  
            }
        });
        console.log(request.song);
        console.log("END");
    }
    return true;
});