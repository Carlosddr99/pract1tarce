
let form = document.getElementById("form");
let nombre = document.getElementById("nombre");
let mensajes = document.getElementById("mensajes");
let btnEnviar = document.getElementById("btnEnviar");

let formMensajes = document.getElementById("formMensaje");

let bloqueAudio = document.getElementById("bloqueAudio");
let botonStop = document.getElementById("botonStop");
let botonGrabar = document.getElementById("botonGrabar");
let botonCancelar = document.getElementById("botonCancelar");
let audio = document.getElementById("audio");
let grabando = document.getElementById("grabando");

let peerConecction = document.getElementById("peerConecction");
let audioPeer = document.getElementById("audioPeer");

let mediaRecord;

let fragmentosDeAudio = [];
let grabado = false;
let isGrabando = false;
let blobAudio ;
let nombreMensaje = "";

bloqueAudio.style.display = 'none';
botonStop.style.display = 'none';

botonGrabar.onclick = (e) => grabar();
botonStop.onclick = (e) => stopGrabacion();

let condicionesStream;
let remoteStream;

const constraints = {
    'audio': true
}

function init(){
    fetch('https://pract1tarce.onrender.com/misRutasRouter/getMensajes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json;charset=utf-8'}
    })
    .then(response => response.json())
    .then(data => {
        let datos =  JSON.parse(JSON.stringify(data));
        for(let dato in datos.mensajes){
            let mensajeUnico = datos.mensajes[dato]
            if(mensajeUnico.isAudio === true){
                nombreMensaje = mensajeUnico.usuario;
                addAudio(mensajeUnico.mensaje)
            }else{
                nombreMensaje = mensajeUnico.usuario;
                addMessage(mensajeUnico.mensaje)
            }
        }
    })

}


init(); 

btnEnviar.addEventListener("click", ()=>{
    enviar();
});

function grabarAudio(){
    isGrabando = true;

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            condicionesStream =  stream;
            mediaRecorder = new MediaRecorder(stream);
            addListernersMediaRecord();
            mostrarPanelAudio();
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
        });
    
}

function enviar(){

    nombreMensaje = nombre.value;

    if(nombreMensaje === ""){
        alert("Debe Introducir Nombre") 
    }
    else{
        (grabado)? enviarAudio() : enviarMensaje();
    }

}

function enviarMensaje(){
    let mensajeEnviar = document.getElementById("mensaje");
    if(mensajeEnviar.value === ""){
        alert("Debe Introducir Un Mensaje") 
    }
    else{
        almacenarFirebase(mensajeEnviar.value, false);
    }
}



function mostrarPanelAudio(){
    formMensajes.style.display = 'none';
    bloqueAudio.style.display = 'block';
}

botonCancelar.addEventListener("click", function() {
    bloqueAudio.style.display = 'none';
    formMensajes.style.display = 'inline';
    botonStop.style.display = 'none';
    botonGrabar.style.display = 'inline';
    isGrabando = false;
    blobAudio = null;
    grabado = false;
});


function grabar (){
    botonGrabar.style.display = 'none';
    botonStop.style.display = 'inline';
    mediaRecorder.start();
}

function stopGrabacion(){
    grabado = true;
    mediaRecorder.stop();
    isGrabando = false;
}

function addListernersMediaRecord(){
    mediaRecorder.addEventListener("dataavailable", evento => {
        console.log("dataavailable")
        fragmentosDeAudio.push(evento.data);
    });
    
    mediaRecorder.addEventListener("stop", () => {
        console.log("stop")
        blobAudio = new Blob(fragmentosDeAudio);
        fragmentosDeAudio = [];
        var blobUrl = URL.createObjectURL(blobAudio);
        audio.src = blobUrl;
        audio.controls = true;
        form.removeChild(grabando);
    });
}

function enviarAudio(){
    var reader = new FileReader();
    reader.readAsDataURL(blobAudio); 
    reader.onloadend = function() {
    var base64data = reader.result;                
    almacenarFirebase(base64data, true);
    }
}

function addAudio(base64data){
    var audioNuevo = new Audio("data:audio/mpeg;base64" +base64data);
    audioNuevo.controls = true;
    let divNuevoMensaje = document.createElement("div");
    divNuevoMensaje.style = ' display: flex; flex-direction : row; font-size: 18px; border-radius: 20px; background-color: rgb(199, 180, 205); solid black; margin: 4px; width: fit-content; padding: 8px'
    let parrafoNombreMensaje = document.createElement("p");
    parrafoNombreMensaje.innerHTML = nombreMensaje + " :";
    parrafoNombreMensaje.style = 'margin-right: 5px; color: white'
    divNuevoMensaje.appendChild(parrafoNombreMensaje);
    divNuevoMensaje.appendChild(audioNuevo);
    mensajes.appendChild(divNuevoMensaje);
}


function addMessage(mensaje){
    let divNuevoMensaje = document.createElement("div");
    divNuevoMensaje.style = 'display: flex; font-size: 18px; border-radius: 20px; background-color: rgb(199, 180, 205); solid black; margin: 4px; width: fit-content; padding: 8px'
    let parrafoNombreMensaje = document.createElement("p");
    let parrafoMensaje = document.createElement("p");
    parrafoNombreMensaje.innerHTML = nombreMensaje + " :";
    parrafoNombreMensaje.style = 'margin-right: 5px; color: white'
    parrafoMensaje.innerHTML =  mensaje;
    divNuevoMensaje.appendChild(parrafoNombreMensaje);
    divNuevoMensaje.appendChild(parrafoMensaje);
    mensajes.appendChild(divNuevoMensaje);
}

function almacenarFirebase(mensaje, isAudio){
    let newMessage = {
        "usuario": nombreMensaje,
        "mensaje": mensaje,
        "isAudio" :isAudio
    }

    fetch('https://pract1tarce.onrender.com/misRutasRouter/addMensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8'},
        body: JSON.stringify(newMessage)
    })
    .then(response => response.json())
    .then(data => {
        if(data.mensaje = "Correcto"){
            if(isAudio){
                addAudio(mensaje);
            }else{
                addMessage(mensaje);
            }
        }else{
            alert("No se ha podido enviar el mensaje")
        }
    })
}
let rtcPeerConnection;
const socket = io()
const roomId = 87;
const iceServers = {
    iceServers: [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
    ],
}

function conexionPeer(){
    form.style.display = 'none';
    peerConecction.style.display = 'block';
    socket.emit('join-room', (roomId))
}

function cerrarSesion(){
    socket.emit("close");
    form.style.display = 'block';
    peerConecction.style.display = 'none';
}

socket.on('user-connected', async () => {
    await setLocalStream(constraints)
    socket.emit('start_call', roomId)
})

function addLocalTracks(rtcPeerConnection) {
    condicionesStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, condicionesStream)
    })
}

async function setLocalStream(mediaConstraints) {
    try {
        condicionesStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
    } catch (error) {
        console.error('Could not get user media', error)
    }
}

socket.on('start_call',  async() => {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.onicecandidate = sendIceCandidate
    await createOffer(rtcPeerConnection)
})

function sendIceCandidate(event) {
    if (event.candidate) {
        socket.emit('webrtc_ice_candidate', {
        roomId,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
        })
    }
}

socket.on('webrtc_offer', async (event) => {  
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        addLocalTracks(rtcPeerConnection)
        rtcPeerConnection.ontrack = setRemoteStream
        rtcPeerConnection.onicecandidate = sendIceCandidate
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
        await createAnswer(rtcPeerConnection)
    }
)

socket.on('webrtc_answer', (event) => {
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

socket.on('webrtc_ice_candidate', (event) => {

    const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
    })
    rtcPeerConnection.addIceCandidate(candidate)
})

function setRemoteStream(event) {
    audioPeer.srcObject = event.streams[0]
    remoteStream = event.stream
}

async function createOffer(rtcPeerConnection) {
    try {
    const sessionDescription = await rtcPeerConnection.createOffer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
    socket.emit('webrtc_offer', {
        type: 'webrtc_offer',
        sdp: sessionDescription,
        roomId,
        })
    } catch (error) {
        console.error(error)
    }
}

async function createAnswer(rtcPeerConnection) {
    try {
        const sessionDescription = await rtcPeerConnection.createAnswer()
        rtcPeerConnection.setLocalDescription(sessionDescription)
        socket.emit('webrtc_answer', {
        type: 'webrtc_answer',
        sdp: sessionDescription,
        roomId,
    })
    } catch (error) {
        console.error(error)
    }
}

