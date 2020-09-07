//self invoked anonymous function!
(function () {
  //global variable
  let peer = null;
  let conn = null;
  let messageBox = document.querySelector(".new-message");
  let mediaConnection = null;

  //if there is a # in the url this puts the myPeerId where it should be!
  const peerOnOpen = (id) => {
    document.querySelector(".my-peer-id").innerHTML = id;
  };

  //adds an id by putting an # after the URL.
  let myPeerID = location.hash.slice(1);

  const peerOnError = (error) => {
    console.log(error);
  };

  let consoleLog = (e) => {
    console.log(e);
  };

  // Connections
  peer = new Peer(myPeerID, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        {
          url: ["stun:eu-turn7.xirsys.com"],
        },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          url: "turn:eu-turn7.xirsys.com:80?transport=udp",
        },
      ],
    },
  });

  function printMessage(message, who) {
    const messageDiv = document.querySelector(".messages");
    const messageWrapper = document.createElement("div");
    const newMessageDiv = document.createElement("div");
    newMessageDiv.innerText = message + "\n" + new Date().toLocaleTimeString();
    //console.log(message);
    messageWrapper.classList.add("message");
    if (who === "me") {
      messageWrapper.classList.add("me");
      //console.log("me");
    } else if (who === "them") {
      messageWrapper.classList.add("them");
      //console.log("them");
    }
    messageWrapper.appendChild(newMessageDiv);
    messageDiv.appendChild(messageWrapper);
    messageDiv.scrollTo(0, messageDiv.scrollHeight);
  }

  document
    .querySelector(".send-new-message-button")
    .addEventListener("click", () => {
      sendTheMessage();
    });

  messageBox.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      sendTheMessage();
    }
  });

  function sendTheMessage() {
    let message = document.querySelector(".new-message").value;
    conn.send(message);
    printMessage(message, "me");
    messageBox.value = "";
  }

  const connectToPeerClick = (el) => {
    const peerId = el.target.textContent;
    conn && conn.close();
    console.log("Atempting to Connect to " + peerId);
    conn = peer.connect(peerId);

    conn.on("open", () => {
      console.log("connection is ....OPEN!");
      const event = new CustomEvent("peer-changed", {
        detail: { peerId: peerId },
      });
      document.dispatchEvent(event);
      conn.on("data", (data) => {
        console.log(data);
        printMessage(data, "them");
      });
    });
    conn.on("error", consoleLog);
  };
  const peerOnCall = (incommingCall) => {
    if (confirm("answer Call?")) {
      mediaConnection && mediaConnection.close();
      //answer incoming call! please! :D
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((myStream) => {
          mediaConnection = incommingCall;
          incommingCall.answer(myStream);
          mediaConnection.on("stream", mediaConnectionOnStream);
        });
    };
  };
  //open the connection! and handles eventual error!
  peer.on("open", peerOnOpen);
  peer.on("error", peerOnError);
  peer.on("call", peerOnCall);

  //on peer Event 'call' when we get a call!

  peer.on("connection", (newConnection) => {
    console.log("connection from remote peer is established!");
    console.log(newConnection);
    //closing previous connection
    conn && conn.close();

    //accept new Conection!

    conn = newConnection;

    //callback for event!
    conn.on("data", (data) => {
      console.log(data);
      printMessage(data, "them");
    });

    //create peerChanged event
    const peerChangedEvent = new CustomEvent("peer-changed", {
      detail: { peerId: conn.peer },
    });
    document.dispatchEvent(peerChangedEvent);
  });

  //find and select where we will work to list out the other connected people!
  document
    .querySelector(".list-all-peers-button")
    .addEventListener("click", () => {
      peer.listAllPeers((peers) => {
        const peersEl = document.querySelector(".peers"); //decides where to put the peers-list
        peersEl.firstChild && peersEl.firstChild.remove();
        const ul = document.createElement("ul"); //create a unordered list!

        peers
          .filter((p) => p !== myPeerID) //tenerary to filter out your own id!
          .forEach((peerID) => {
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.innerText = peerID; //making buttons of the ID
            button.classList.add("connect-button"); //well..
            button.classList.add(`peerID-${peerID}`); //adding a PeerID to the class
            button.addEventListener("click", connectToPeerClick);
            li.appendChild(button); //adding the button to the list element
            ul.appendChild(li); //adding the list-element to the ul.
          });
        peersEl.appendChild(ul); //setting the list to the peers El
      });
    });

  //display video of me!
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then((stream) => {
      const video = document.querySelector(".video-container.me video");
      video.muted = true;
      video.srcObject = stream;
    });

  const mediaConnectionOnStream = (theirStream) => {
    const video = document.querySelector(".video-container.them video");
    video.muted = true;
    video.srcObject = theirStream;
  };

  const startVideoCall = () => {
    const video = document.querySelector(".video-container.them");
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    startButton.classList.remove("active");
    stopButton.classList.add("active");

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((myStream) => {
        mediaConnection = peer.call(conn.peer, myStream);
        console.log(mediaConnection);
        mediaConnection.on("stream", mediaConnectionOnStream);
      });
  };

  const stopVideoCall = () => {
    const video = document.querySelector(".video-container.them");
    const startButton = video.querySelector(".start");
    const stopButton = video.querySelector(".stop");
    stopButton.classList.remove("active");
    startButton.classList.add("active");
  };

  //start Video click handler!
  document
    .querySelector(".video-container.them .start")
    .addEventListener("click", startVideoCall);

  //stop Video call Click handler!
  document
    .querySelector(".video-container.them .stop")
    .addEventListener("click", stopVideoCall);

  document.addEventListener("peer-changed", (ev) => {
    const peerId = ev.detail.peerId;
    console.log("peer-changed: ", peerId);
    document.querySelector(".name").innerHTML = peerId;
    //removing connected when changing peer!
    document.querySelectorAll(".connect-button").forEach((el) => {
      el.classList.remove("connected");
    });
    const button = document.querySelector(`.connect-button.peerID-${peerId}`);
    button.classList.add("connected");

    //video update subtext and so on
    const video = document.querySelector(".video-container.them");
    video.classList.add("connected");
    video.querySelector(".stop").classList.remove("active");
    video.querySelector(".start").classList.add("active");
  });
})();
