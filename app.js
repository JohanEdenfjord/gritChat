
//if there is a # in the url this puts the myPeerId where it should be!
const peerOnOpen = (id) => {
    document.querySelector('.my-peer-id').innerHTML = id;
};

//adds an id by putting an # after the URL.
const myPeerID = location.hash.slice(1);

const peerOnError = (error) => {
    console.log(error)
}
// Connecting to the peer-server!
const peer = new Peer(myPeerID, {
    host: "glajan.com",
    port: 8443, 
    path: '/myapp', 
    secure: true,
});

//open the connection! and handles eventual error!
peer.on('open', peerOnOpen);
peer.on('error', peerOnError);

document.querySelector('.list-all-peers-button').addEventListener('click', () => {

    peer.listAllPeers((peers) => {

        const peersEl = document.querySelector('.peers');        
        const ul = document.createElement('ul');

        peers
        .filter(
            (p) => p !== myPeerID) //tenerary
        .forEach(peerID => {
            const li = document.createElement('li');

            li.innerText = peerID
            ul.appendChild(li)
        });

        peersEl.appendChild(ul)
    });
});