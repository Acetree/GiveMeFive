var myUrl = new URL(window.location);
var userName;
document.getElementById("enter").addEventListener("click", function() {
    userName = document.getElementById("name").value;
    if(userName == ""){
        alert("Please input your name");
    }else{
        window.location.replace(myUrl.origin+"/giveMeFive.html?userName="+userName);
    }
});