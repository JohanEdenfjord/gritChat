//self invoked anonymous function!
(function (){

//global variable
let peer = null
let conn = null


//if there is a # in the url this puts the myPeerId where it should be!
const peerOnOpen = (id) => {
    document.querySelector('.my-peer-id').innerHTML = id;
};

//adds an id by putting an # after the URL.
let myPeerID = location.hash.slice(1);

const peerOnError = (error) => {
    console.log(error);
};

let consoleLog = (e) => {
    console.log(e)
};

// Connections
peer = new Peer(myPeerID, {
    host: "glajan.com",
    port: 8443, 
    path: '/myapp', 
    secure: true,
});

const connectToPeerClick = (el) => {     
    const peerId = el.target.textContent;  
    conn && conn.close();
    console.log("Atempting to Connect to " + peerId)   
    conn = peer.connect(peerId);    
    conn.on('open', () =>{
        console.log("connection is ....OPEN!")
        const event = new CustomEvent('peer-changed', {detail: peerId });
        document.dispatchEvent(event);
    });
    conn.on('error', consoleLog);
};


//open the connection! and handles eventual error!
peer.on('open', peerOnOpen);
peer.on('error', peerOnError);

//find and select where we will work to list out the other connected people!
document.querySelector('.list-all-peers-button').addEventListener('click', () => {

    peer.listAllPeers((peers) => {

        const peersEl = document.querySelector('.peers'); //decides where to put the peers-list   
        peersEl.firstChild && peersEl.firstChild.remove();
        const ul = document.createElement('ul'); //create a unordered list!

        peers
        .filter(
            (p) => p !== myPeerID) //tenerary to filter out your own id!
        .forEach(peerID => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.innerText = peerID; //making buttons of the ID
            button.classList.add("connect-button"); //well..
            button.classList.add(`peerID-${peerID}`); //adding a PeerID to the class
            button.addEventListener("click", connectToPeerClick);
            li.appendChild(button);//adding the button to the list element
            ul.appendChild(li);//adding the list-element to the ul.
        });
        peersEl.appendChild(ul); //setting the list to the peers El
    });
});

document.addEventListener('peer-changed', (ev) => {
    const peerId = ev.detail;
    console.log("peer-changed: ", peerId);
    const name = document.querySelector(".name");
    document.querySelectorAll('.connect-button').forEach((el) => {
        el.classList.remove("connected");
    });
    name.innerHTML = peerId;
    const button = document.querySelector(`.connect-button.peerID-${peerId}`);    
    button.classList.add('connected');
    
});

})();
 