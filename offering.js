function clickcreateoffer() {
  console.log('clickcreateoffer');
  document.getElementById('buttoncreateoffer').disabled = true;
  document.getElementById('spanoffer').classList.toggle('invisible');
  peerConnection = createPeerConnection(lasticecandidate);
  // chat channel
  _chatChannel = peerConnection.createDataChannel('chatChannel');
  _chatChannel.onopen = chatChannelOnOpen;
  _chatChannel.onclose = chatChannelOnClose;
  _chatChannel.onmessage = chatChannelOnMessage;
  // file channel
  _fileChannel = peerConnection.createDataChannel('fileChannel');
  _fileChannel.onopen = fileChannelOnOpen;
  _fileChannel.onclose = fileChannelOnClose;
  _fileChannel.onmessage = fileChannelOnMessage;
  // add mic
  addMicAudio(createAndSetOffer);
}

// creating offer
function createAndSetOffer() {
  createOfferPromise = peerConnection.createOffer();
  createOfferPromise.then(createOfferDone, createOfferFailed);
}

function createOfferDone(offer) {
  console.log('createOfferDone');
  setLocalPromise = peerConnection.setLocalDescription(offer);
  setLocalPromise.then(setLocalDone, setLocalFailed);
}

function createOfferFailed(reason) {
  console.log('createOfferFailed');
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
  textelement = document.getElementById('textoffer');
  offer = peerConnection.localDescription;
  textelement.value = JSON.stringify(offer);
  document.getElementById('buttonoffersent').disabled = false;
}

function clickoffersent() {
  console.log('clickoffersent');
  document.getElementById('spananswer').classList.toggle('invisible');
  document.getElementById('buttonoffersent').disabled = true;
}

function clickanswerpasted() {
  console.log('clickanswerpasted');
  document.getElementById('buttonanswerpasted').disabled = true;
  textelement = document.getElementById('textanswer');
  textelement.readOnly = true;
  answer = JSON.parse(textelement.value);
  setRemotePromise = peerConnection.setRemoteDescription(answer);
  setRemotePromise.then(setRemoteDone, setRemoteFailed);
}

function setRemoteDone() {
  console.log('setRemoteDone');
}

function setRemoteFailed(reason) {
  console.log('setRemoteFailed');
  console.log(reason);
}

