var songName;
function setSong(titleString){
    songName = titleString.replace(/ *\([^)]*\) */g, " ")
    songName = songName.replace(/&.*-/, "").replace(/,.*-/, "");
    var replacements = ["-", "ft.", "€", ",", "\\.", "featuring"];
    $.each(replacements, function (index, item) {
        songName = songName.replace(new RegExp(item, "g"), '');
    });
}
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length) {
              if (mutation.type == 'childList') {
                setSong(mutation.target.textContent);
              }
          }
    })
})


function checkNode() {
        console.log("checknode");
        var targetNode = document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer");

        if (!targetNode) {
            window.setTimeout(checkNode, 500);
            return;
        }
        var x = document.querySelector("#top-row > ytd-video-owner-renderer");
        var button = document.createElement("button");
        button.innerHTML = "<img src='https://www.flaticon.com/svg/static/icons/svg/2111/2111624.svg' style='width:12px; height:12px;'/> Add to Library";
        button.style.position = "relative";
        button.style.right = "20px";
        button.style.marginLeft = "40px";
        button.style.top = "7px";
        button.style.height = "37px";
        button.style.textAlign = "center";
        button.style.width = "120px";
        button.style.outline = 'none';
        button.style.backgroundColor = '#191414';
        button.style.color = '#4caf50';
        button.style.borderRadius = "5px";
        setSong(targetNode.textContent);
        button.addEventListener('click', () => {
            chrome.runtime.sendMessage({message: 'addSong', song: songName}, function(response){
                var popup = document.querySelector('#myPopup');
                if (!popup) {
                    popup = document.createElement('div');
                    popup.style.width = '160px';
                    popup.style.backgroundColor = '#555';
                    popup.style.color = '#fff';
                    popup.style.textAlign = 'center';
                    popup.style.borderRadius = ' 6px';
                    popup.style.padding = '8px 0';
                    popup.style.position = 'absolute';
                    popup.style.bottom = '125%';
                    popup.style.left = '50%';
                    popup.style.marginLeft = '-80px';
                    popup.id = 'myPopup';
                }
                if (response.reply == 'no token'){
                    popup.innerText = "Please sign in to Spotify by clicking on the S Icon";
                    button.appendChild(popup);
                    $('#myPopup').hide().fadeIn(300).delay(1500).fadeOut(400);
                }
                if (response.reply == 'success'){
                    popup.innerText = response.song + " by " + response.artist + " added to library."
                    button.appendChild(popup);
                    $('#myPopup').hide().fadeIn(300).delay(1500).fadeOut(400);
                } 
                else if (response.reply == 'failed'){
                    popup.innerText = "Song not found";
                    button.appendChild(popup);
                    $('#myPopup').hide().fadeIn(300).delay(1000).fadeOut(400);
                }
            });
        });
        x.appendChild(button);
        var config = {
            childList: true,
            subtree:true
        }
        observer.observe(targetNode, config);
}

checkNode();
observer.observe(document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer"), {childList: true, subtree: true});

