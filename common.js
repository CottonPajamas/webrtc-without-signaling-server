const configuration = {
  configuration: {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
    voiceActivityDetection: false,
  }, 
  iceServers: [{
    urls: "stun:stun.stunprotocol.org"
  }]
};

function chatlog(msg) {
  chatelement = document.getElementById('chatlog');
  chatelement.innerHTML += '<p>[' + new Date() + '] ' + msg + '</p>';
  chatelement.scrollTop = chatelement.scrollHeight
}

function createPeerConnection(lasticecandidate) {
  try {
    peerConnection = new RTCPeerConnection(configuration);
  } catch(err) {
    chatlog('error: ' + err);
  }
  peerConnection.ontrack = receiveCall;
  peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
  peerConnection.onconnectionstatechange = handleconnectionstatechange;
  peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
  return peerConnection;
}

function handleicecandidate(lasticecandidate) {
  return function(event) {
    if (event.candidate != null) {
      console.log('new ice candidate');
    } else {
      console.log('all ice candidates');
      lasticecandidate();
    }
  }
}

function handleconnectionstatechange(event) {
  console.log('handleconnectionstatechange');
  console.log(event);
}

function handleiceconnectionstatechange(event) {
  console.log('ice connection state: ' + event.target.iceConnectionState);
}



/* Chat functionality - START */
function chatChannelOnOpen() {
  console.log('=> chat channel successfully connected.');
  chatlog('connected');
  document.getElementById('chatinput').disabled = false;
  document.getElementById('chatbutton').disabled = false;
}

function chatChannelOnClose() {
  console.log('=> chat channel is disconnected.');
  chatlog('disconnected');
  document.getElementById('chatinput').disabled = true;
  document.getElementById('chatbutton').disabled = true;
}

function chatChannelOnMessage(message) {
  console.log('chatChannelOnMessage');
  // console.log(message);
  text = message.data;
  chatlog(text);
}

function chatbuttonclick() {
  console.log('chatbuttonclick');
  textelement = document.getElementById('chatinput');
  text = textelement.value;
  _chatChannel.send(text);
  chatlog(text);
  textelement.value = '';
}
/* Chat functionality - END */




/* File transfer functionality - START */
var localStream, sendFileDom = {},
    recFileDom = {},
    receiveBuffer = [],
    receivedSize = 0,
    file,
    bytesPrev = 0;
function onFileChange(fileTransfer) {
  console.log(fileTransfer);
  var files = fileTransfer.files;
  if (files.length > 0) {
      file = files[0];
      sendFileDom.name = file.name;
      sendFileDom.size = file.size;
      sendFileDom.type = file.type;
      sendFileDom.fileInfo = "areYouReady";
      console.log(sendFileDom);
  } else {
      console.log('No file selected');
  }
}

function fileChannelOnOpen() {
  console.log('=> file channel successfully connected.');
}

function fileChannelOnClose() {
  console.log('=> file channel is disconnected.');
}

function fileChannelOnMessage(e) {
  var type = Object.prototype.toString.call(e.data), data;
  if (type == "[object ArrayBuffer]") {
    data = e.data;
    receiveBuffer.push(data);
    receivedSize += data.byteLength;
    recFileProg.value = receivedSize;
    if (receivedSize == recFileDom.size) {
        var received = new window.Blob(receiveBuffer);
        file_download.href = URL.createObjectURL(received);
        file_download.innerHTML = "download";
        file_download.download = recFileDom.name;
        // rest
        receiveBuffer = [];
        receivedSize = 0;
    }
  } else if (type == "[object String]") {
    data = JSON.parse(e.data);
  } else if (type == "[object Blob]") {
    data = e.data;
    file_download.href = URL.createObjectURL(data);
    file_download.innerHTML = "download";
    file_download.download = recFileDom.name;
  }

  // Handle initial msg exchange
  if (data.fileInfo) {
    if (data.fileInfo == "areYouReady") {
        recFileDom = data;
        recFileProg.max = data.size;
        var sendData = JSON.stringify({ fileInfo: "readyToReceive" });
        _fileChannel.send(sendData);
    } else if (data.fileInfo == "readyToReceive") {
        sendFileProg.max = sendFileDom.size;
        sendFileinChannel(); // Start sending the file
    }
    // console.log('_fileChannel: ', data.fileInfo);
  }
}

function sendFile() {
  if (!fileTransfer.value) return;
  var fileInfo = JSON.stringify(sendFileDom);
  _fileChannel.send(fileInfo);
  console.log('file info sent');
}

function sendFileinChannel() {
  var chunkSize = 16384;
  var sliceFile = function(offset) {
      var reader = new window.FileReader();
      reader.onload = (function() {
          return function(e) {
              _fileChannel.send(e.target.result);
              if (file.size > offset + e.target.result.byteLength) {
                  window.setTimeout(sliceFile, 0, offset + chunkSize);
              }
              sendFileProg.value = offset + e.target.result.byteLength
          };
      })(file);
      var slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
  };
  sliceFile(0);
}
/* File transfer functionality - END */




/* Microphone functionality - START */
const micOnlyConstraints = window.constraints = {
  audio: true,
  video: false
};

function addMicAudio(invokePromise) {
  try {
    navigator.mediaDevices.getUserMedia(micOnlyConstraints)
    .then(function (stream) {
      console.log('Adding audio stream to peer connection');
      localStream = stream;
      peerConnection.addTrack(localStream.getTracks()[0]);
    })
    .catch(handleError)
    .finally(invokePromise);
  } catch (e) {
    console.log(e);
  }
}

function call(callButton) {
  const codecSelector = document.getElementById('codec');
  callButton.disabled = true;
  codecSelector.disabled = true;
  console.log('Starting call');
  navigator.mediaDevices.getUserMedia(micOnlyConstraints).then(gotStream).catch(handleError);
  // navigator.mediaDevices
  //     .getUserMedia(micOnlyConstraints)
  //     .then(peerConnection)
  //     .catch(e => {
  //       console.log(`getUserMedia() error: ${e.name}`);
  //     });
}

function receiveCall(e) {
  console.log('Received remote call');
  const audio1 = document.getElementById('audio1');
  if (audio1.srcObject !== e.streams[0]) {
    handleSuccess(new MediaStream([e.track]));
  } else {
    console.log('DID NOT receive remote stream');
  }
}

function handleSuccess(stream) {
  const audio = document.getElementById('audio1');
  const audioTracks = stream.getAudioTracks();
  console.log('Using audio device: ' + audioTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  window.stream = stream;
  audio.srcObject = stream;
}

function handleError(error) {
  const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
  console.log(errorMessage);
}
// navigator.mediaDevices.getUserMedia(micOnlyConstraints).then(handleSuccess).catch(handleError);
/* Microphone functionality - END */

