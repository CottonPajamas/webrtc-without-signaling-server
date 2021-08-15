function clickofferpasted() {
  console.log('clickremoteoffer');
  document.getElementById('buttonofferpasted').disabled = true;
  peerConnection = createPeerConnection(lasticecandidate);
  peerConnection.ondatachannel = handleDataChannel;
  textelement = document.getElementById('textoffer');
  textelement.readOnly = true;
  offer = JSON.parse(textelement.value);
  // add mic
  addMicAudio(createAndSetAnswer);
}

function createAndSetAnswer() {
  setRemotePromise = peerConnection.setRemoteDescription(offer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
}

function setRemoteDone() {
  console.log('setRemoteDone');
  createAnswerPromise = peerConnection.createAnswer();
  createAnswerPromise.then(createAnswerDone, createAnswerFailed);
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

function createAnswerDone(answer) {
  console.log('createAnswerDone');
  setLocalPromise = peerConnection.setLocalDescription(answer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
  document.getElementById('spananswer').classList.toggle('invisible');
}

function createAnswerFailed(reason) {
  console.log('createAnswerFailed');
  console.log(reason);
}

function setLocalDone() {
  console.log('setLocalDone');
}

function setLocalFailed(reason) {
  console.log('setLocalFailed');
  console.log(reason);
}

function lasticecandidate() {
  console.log('lasticecandidate');
  textelement = document.getElementById('textanswer');
  answer = peerConnection.localDescription
  textelement.value = JSON.stringify(answer);
}

function handleDataChannel(event) {
  if (event.channel.label == "chatChannel") {
    _chatChannel = event.channel;
    _chatChannel.onopen = chatChannelOnOpen;
    _chatChannel.onclose = chatChannelOnClose;
    _chatChannel.onmessage = chatChannelOnMessage;
  }
  if (event.channel.label == "fileChannel") {
    _fileChannel = event.channel;
    _fileChannel.onopen = fileChannelOnOpen;
    _fileChannel.onclose = fileChannelOnClose;
    _fileChannel.onmessage = fileChannelOnMessage;
  }
}
