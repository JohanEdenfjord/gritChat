
const peerOnOpen = (id) => {
    document.querySelector('.my-peer-id').innerHTML = id;
};

const myPeerID = location.hash.slice(1);

console.log(myPeerID);

let peer = new Peer(myPeerID, {
    host: "glajan.com",
    port: 8443, 
    path: '/myapp', 
    secure: true,
});

peer.on('open', peerOnOpen);

