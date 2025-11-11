const promtEle = document.getElementById("promt");
const chatEle = document.querySelector(".chat-box");
const subBut = document.querySelector('input[type=submit]');;

var isSpeaking = false;
let currentSpeakingEle = null;

window.speechSynthesis.onvoiceschanged = () => {
    voicesReady = true;
};

function resetAIImage(ele) {
    ele.value = "";
}

function checkAIPromtImage(ele) {
    var file = ele.files[0];
    // Check MIME type
    [mainType, subType] = file.type.toString().split("/");
    if (mainType !== "image") {
        alert("Only Images are Allowed..");
        ele.value = "";
    }
    else if (["gif", "x-icon"].includes(subType)) {
        alert("No GIF/icon images are Allowed..");
        ele.value = "";
    }
    else if (file.size > 2000000) {
        alert("file size must be less than 2MB")
        ele.value = "";
    }
}

function makeNewChatRow(promt) {
    let currentTime = dayjs().format("HH:mm");
    let newDiv = document.createElement("div");
    newDiv.style.paddingLeft = "50%";
    newDiv.className = "chat chat-end";


    let headerDiv = document.createElement("div");
    headerDiv.className = "chat-header";
    headerDiv.innerText = "Human";

    let textDiv = document.createElement("div");
    textDiv.className = "chat-bubble";
    textDiv.innerText = promt;

    let footerDiv = document.createElement("div");
    footerDiv.className = "chat-footer opacity-50";
    footerDiv.innerText = `send at ${currentTime}`;

    // single inner HTML but execute HTML instead of showing the paste content.

    // newDiv.innerHTML = `<div class="chat-header">Human</div>
    //                         <div class="chat-bubble">${innerHTML}</div>
    //                         <div class="chat-footer opacity-50">Send at ${currentTime}</div>`;

    newDiv.append(headerDiv, textDiv, footerDiv);

    return newDiv;
}
promtEle.addEventListener("keyup", (ev) => {
    if (ev.key === "Enter" && ev.shiftKey === false) {
        let innerHTML = promtEle.value;
        chatEle.appendChild(makeNewChatRow(innerHTML));
        chatEle.parentElement.scrollTo({
            top: chatEle.scrollHeight,
            behavior: "smooth"
        });

        subBut.click();
        promtEle.value = ""; // reset the value
    }
})

function makeAllImagesToShow() {
    document.querySelectorAll(".speaker-img").forEach((speakerEle) => {
        speakerEle.src = speakerEle.dataset.speaker;
    }
    )
}

function speak(ele) {

    if (isSpeaking) {
        cancelSpeech();
        makeAllImagesToShow();
        if (document.querySelectorAll(".sound").length > 1 && currentSpeakingEle !== ele) {
            speak(ele);
            let speakerEle = ele.querySelector("img");
            speakerEle.src = speakerEle.dataset.mute;
        }
    }
    else {
        let data = ele.closest(".chat-start").innerText;
        let words = data.split(/\n\s*/g);
        let index = 0;

        currentSpeakingEle = ele;
        let speakerEle = ele.querySelector("img");
        speakerEle.src = speakerEle.dataset.mute;


        function playNext() {
            if (index > words.length) {
                isSpeaking = false
                currentSpeakingEle = null;
                speakerEle.src = speakerEle.dataset.speaker;
                return;
            }
            let speechObj = new SpeechSynthesisUtterance(words[index])
            speechObj.onend = () => {
                index++;
                playNext();
            }
            window.speechSynthesis.speak(speechObj);
            isSpeaking = true;
        }
        playNext();
    }
}

function cancelSpeech() {
    isSpeaking = false;
    window.speechSynthesis.cancel();
}




document.addEventListener("htmx:afterSwap", (ev) => {

    let scrollEle = document.querySelector(".main-section");

    scrollEle.scrollTop = scrollEle.scrollHeight;
})