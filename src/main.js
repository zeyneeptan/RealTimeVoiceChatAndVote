const startCallButton = document.getElementById('start-call');
const endCallButton = document.getElementById('end-call');
const remoteAudio = document.getElementById('remoteAudio');
const yesCountDisplay = document.getElementById('yes-count');
const noCountDisplay = document.getElementById('no-count');
const maybeCountDisplay = document.getElementById('maybe-count');
const voteYesButton = document.getElementById('vote-yes');
const voteNoButton = document.getElementById('vote-no');
const voteMaybeButton = document.getElementById('vote-maybe');
const voteCountDisplay = document.getElementById('vote-count');
const resetVotesButton = document.getElementById('reset-votes');
let voteHistory = [];

let localStream;
let peerConnection;
let voteCount = { yes: 0, no: 0, maybe: 0 };
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Here I am establishing the WebSocket connection
const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = async event => {
    try {
        const data = event.data instanceof Blob ? JSON.parse(await event.data.text()) : JSON.parse(event.data);

        if (data.type === 'vote') {
            if (data.vote === 1) {
                voteCount.yes += 1;
            } else if (data.vote === -1) {
                voteCount.no += 1;
            } else if (data.vote === 0) {
                voteCount.maybe += 1;
            }

            voteHistory.push(`${data.voteType} at ${data.timestamp}`);

            yesCountDisplay.textContent = voteCount.yes;
            noCountDisplay.textContent = voteCount.no;
            maybeCountDisplay.textContent = voteCount.maybe;

            updateVoteHistory();
        }
        else if (data.type === 'reset') {
            voteCount = { yes: 0, no: 0, maybe: 0 };
            voteHistory = [];

            yesCountDisplay.textContent = 0;
            noCountDisplay.textContent = 0;
            maybeCountDisplay.textContent = 0;
            updateVoteHistory();
        } else {
            handleSignal(data);
        }
    } catch (error) {
        console.error("JSON Parse Error:", error, "Raw message:", event.data);
    }
};



// Here I am starting the WebRTC call
async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(config);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = event => {
        remoteAudio.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            sendSignal({ type: 'candidate', candidate: event.candidate });
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendSignal({ type: 'offer', offer });
}

// Handling the signaling messages
async function handleSignal(data) {
    if (data.type === 'offer') {
        peerConnection = new RTCPeerConnection(config);
        peerConnection.ontrack = event => {
            remoteAudio.srcObject = event.streams[0];
        };
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                sendSignal({ type: 'candidate', candidate: event.candidate });
            }
        };
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendSignal({ type: 'answer', answer });

    } else if (data.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));

    } else if (data.type === 'candidate') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));

    } else if (data.type === 'vote') {
        voteCount += data.vote;
        voteCountDisplay.textContent = voteCount;
    }
}

function sendSignal(message) {
    ws.send(JSON.stringify(message));
}


function endCall() {
    peerConnection.close();
}



function castVote(value) {
    let voteType = value === 1 ? "Yes" : value === -1 ? "No" : "Maybe";
    const timestamp = new Date().toLocaleTimeString();

    sendSignal({ type: 'vote', vote: value, voteType, timestamp });
}


function updateVoteHistory() {
    const voteHistoryList = document.getElementById('vote-history');
    voteHistoryList.innerHTML = voteHistory.map(vote => `<li>${vote}</li>`).join('');
}
function resetVotes() {

    voteCount = { yes: 0, no: 0, maybe: 0 };
    voteHistory = [];


    yesCountDisplay.textContent = 0;
    noCountDisplay.textContent = 0;
    maybeCountDisplay.textContent = 0;
    updateVoteHistory();

    sendSignal({ type: 'reset' });
}


startCallButton.addEventListener('click', startCall);
endCallButton.addEventListener('click', endCall);
voteYesButton.addEventListener('click', () => castVote(1));
voteNoButton.addEventListener('click', () => castVote(-1));
voteMaybeButton.addEventListener('click', () => castVote(0));

resetVotesButton.addEventListener('click', resetVotes);