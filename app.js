//self invoked anonymous function!
(function (){

//global variable
let peer = null


//if there is a # in the url this puts the myPeerId where it should be!
const peerOnOpen = (id) => {
    document.querySelector('.my-peer-id').innerHTML = id;
};

//adds an id by putting an # after the URL.
let myPeerID = location.hash.slice(1);

const peerOnError = (error) => {
    console.log(error);
}

// Connections
peer = new Peer(myPeerID, {
    host: "glajan.com",
    port: 8443, 
    path: '/myapp', 
    secure: true,
});

const connectToPeerClick = (el) => { 
    
    const peerId = el.target.textContent;  
    console.log("Atempting to Connect to " + peerId)   
    const conn = peer.connect(peerId);    
    conn.on('open', () =>{
        console.log("connection is ....OPEN!")
    });
};


//open the connection! and handles eventual error!
peer.on('open', peerOnOpen);
peer.on('error', peerOnError);

//find and select where we will work to list out the other connected people!
document.querySelector('.list-all-peers-button').addEventListener('click', () => {

    peer.listAllPeers((peers) => {

        const peersEl = document.querySelector('.peers'); //decides where to put the peers-list   
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
})();
