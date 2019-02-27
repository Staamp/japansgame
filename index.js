
var chaineJSON='{"hiragana":{"a":12354,"i":12356,"u":12358,"e":12360, "o" : 12362,"ka": 12363, "ga": 12364, "ki": 12365, "gi": 12366, "ku": 12367, "gu": 12368, "ke": 12369, "ge": 12370, "ko": 12371, "go": 12372,"sa": 12373, "za": 12374,"shi": 12375, "ji": 12376, "su": 12377, "zu": 12378, "se": 12379, "ze": 12380,"so": 12381, "zo": 12382,"ta": 12383, "da": 12384, "chi": 12385, "di": 12386, "tsu": 12388, "du": 12389,"te": 12390, "de": 12391,"to": 12392, "do": 12393,"na": 12394, "ni": 12395, "nu": 12396, "ne": 12397, "no": 12398, "ha": 12399, "ba": 12400, "pa": 12401,"hi": 12402, "bi": 12403, "pi": 12404, "fu": 12405, "bu": 12406, "pu": 12407,"he": 12408, "be": 12409, "pe": 12410, "ho": 12411, "bo": 12412, "po": 12413,"ma": 12414, "mi": 12415, "mu": 12416, "me": 12417, "mo": 12418,"ya": 12420, "yu": 12422, "yo": 12424, "ra": 12425, "ri": 12426, "ru": 12427, "re": 12428, "ro": 12429, "wa": 12431, "wi": 12432, "we": 12433, "wo": 12434,    "n" : 12435,     "vu": 12436         },   "katakana" : {  "a" : 12450, "i" : 12452, "u" : 12454, "e" : 12456, "o" : 12458,  "ka": 12459, "ga": 12460, "ki": 12461, "gi": 12462, "ku": 12463, "gu": 12464, "ke": 12465, "ge": 12466, "ko": 12467, "go": 12468, "sa": 12469, "za": 12470, "shi": 12471, "ji": 12472, "su": 12473, "zu": 12474,"se": 12475, "ze": 12476,"so": 12477, "zo": 12478,"ta": 12479, "da": 12480,"chi": 12481, "di": 12482,"tsu": 12484, "du": 12485,"te": 12486, "de": 12487,"to": 12488, "do": 12489,"na": 12490, "ni": 12491, "nu": 12492, "ne": 12493, "no": 12494, "ha": 12495, "ba": 12496, "pa": 12497,"hi": 12498, "bi": 12499, "pi": 12500,"fu": 12501, "bu": 12502, "pu": 12503,"he": 12504, "be": 12505, "pe": 12506, "ho": 12507, "bo": 12508, "po": 12509,"ma": 12510, "mi": 12511, "mu": 12512, "me": 12513, "mo": 12514, "ya": 12516, "yu": 12518, "yo": 12520,"ra": 12521, "ri": 12522, "ru": 12523, "re": 12524, "ro": 12525,"wa": 12527, "wi": 12528, "we": 12529, "wo": 12530,"n" : 12531,"vu": 12532, "va": 12535, "vi": 12536, "ve": 12537, "vo": 12538}}';
var alphabetALL=JSON.parse(chaineJSON);
function Partie(){
        var NomPartie="";
        var NombreManche;
        var secondes= 0;
        var mots;
        var motaDeviner;
        var nbreGagant=0;
        var dessinateur;
        var dessinateurManche=[];
        var manche=0;
        var nbEssaiParManche=0;
        var PartieEnCours=false;
        var clients ={};       // id -> socket
        var scores={};
        var NbEssai={};
        var gagnant=[];
        var AideDonnee=false;
        var alphabet;
        var avatar={};
    var __construct=function(that){
        that.NomPartie="partie1";
        that.NombreManche=3;
        that.secondes= 0;
        that.mots=undefined;
        that.motaDeviner=undefined;
        that.nbreGagant=0;
        that.dessinateur;
        that.dessinateurManche=[];
        that.manche=0;
        that.nbEssaiParManche=0;
        that.PartieEnCours=false;
        that.clients ={};
        that.scores={};
        that.NbEssai={};
        that.gagnant=[];
        that.AideDonnee=false;
        that.alphabet=alphabetALL["hiragana"];
        that.avatar={};
    }(this)

    this.initialise=function(NomPartie,NombreManche,alphabet){
        this.NomPartie=NomPartie;
        this.NombreManche=+NombreManche;
        if(alphabet!="les2"){
            this.alphabet=alphabetALL[alphabet];
        }
        else{
            for(var syllabe1 in alphabetALL.hiragana){
               this.alphabet[syllabe1]=alphabetALL.hiragana[syllabe1];
            }
            for(var syllabe2 in alphabetALL.katakana){
                this.alphabet[syllabe2+" "]=alphabetALL.katakana[syllabe2];
            }
        }
    }

    this.decrementerChrono=function(){
        console.log(EnsembleParties[this.NomPartie].secondes);
        if(this.secondes>0){
            this.secondes--;

            for(var client in  this.clients){
              this.clients[client].emit("setTimer",EnsembleParties[this.NomPartie].secondes);
            }
           setTimeout(this.decrementerChrono.bind(this),1000);
        }
        else{
            if(this.dessinateur!=undefined){
               var gainTour=Math.round(((this.gagnant.length)*30-EnsembleParties["partie1"].nbEssaiParManche*2)/(Object.keys(EnsembleParties["partie1"].clients).length-1));
               if(gainTour<0){
                    gainTour=0;
               }
                if(EnsembleParties[this.NomPartie].AideDonnee){
                    gainTour/=2;
                }
                this.scores[this.dessinateur]+=gainTour;
                EnsembleParties[this.NomPartie].dessinateurManche.push(EnsembleParties[this.NomPartie].dessinateur);
            }
            else{
                console.log("ALERTE CRITIQUE DE SECURITEE");
            }
            //On regarde si la manche est terminée.
            var finie=true;
            console.log(this.dessinateurManche);
            for(var joueur in this.clients){
                console.log(joueur);
                if(!this.dessinateurManche.includes(joueur)){
                    console.log("Passage if");
                    finie=false;
                }
            }
            if(finie){
                this.manche++;
                for(var client in  this.clients){
                    this.clients[client].emit("manche", this.manche);
                }
                if(this.manche==this.NombreManche){
                    for(var client in  this.clients){
                       this.clients[client].emit("finPartie", this.scores);
                    }
                     for(var i in this.scores){
                        this.scores[i]=0;
                    }
                   this.PartieEnCours=false;
                }
                this.dessinateurManche=[];
            }
            if(this.PartieEnCours){
                console.log("lancement!!!\n");
                do{
                    var i =getRandomInt(Object.keys(EnsembleParties[this.NomPartie].clients).length);
                    this.mots=send3data(this.alphabet);
                    this.dessinateur=Object.keys(EnsembleParties[this.NomPartie].clients)[i];
                }
                while(this.dessinateurManche.includes(this.dessinateur));
                for(var client in  EnsembleParties[this.NomPartie].clients){
                   this.clients[client].emit("liste", Object.keys(EnsembleParties[this.NomPartie].clients),this.scores,this.avatar);
                   this.clients[client].emit("designeDessinateur",Object.keys(EnsembleParties[this.NomPartie].clients)[i],this.mots);
                }
                this.secondes=30;
                this.gagnant=[];
                this.nbEssaiParManche=0;
                this.nbreGagant=0;
                this.AideDonnee=false;
                for(var user in this.NbEssai){
                  this.NbEssai[user]=3;
                }
                this.decrementerChrono();
            }
            else{
                delete EnsembleParties[this.NomPartie];
            }
        }
    }
}
var EnsembleParties={partie1:new Partie(),partie2:new Partie()};
console.log(EnsembleParties);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function send3data(alphabet){
    var taille_alphabet=0;
    for(var lettre in alphabet){
        taille_alphabet++;
    }
    var resultat=[];
    var random=[];
    for(var j=0;j<3;j++){
            do{
                var rand=getRandomInt(taille_alphabet);
            }
            while(random.includes(rand));
            random.push(rand);
            donnee=Object.keys(alphabet)[rand];
            resultat.push(donnee);
    }
    return resultat;
}
// Chargement des modules 
var express = require('express');
var app = express();
var server = app.listen(8080, function() {
    console.log("C'est parti ! En attente de connexion sur le port 8080...");
});


// Ecoute sur les websockets
var io = require('socket.io').listen(server);

// Configuration d'express pour utiliser le répertoire "public"
app.use(express.static('public'));
// set up to 
app.get('/', function(req, res) {  
    res.sendFile(__dirname + '/public/japansgame.html');
});




// Quand un client se connecte, on le note dans la console
io.on('connection', function (socket) {
    
    // message de debug
    console.log("Un client s'est connecté");
    var currentID = null;
    
    /**
     *  Doit être la première action après la connexion.
     *  @param  id  string  l'identifiant saisi par le client
     */

     
    socket.on("login", function(id) {
        while (clients[id]) {
            id = id + "(1)";   
        }
        currentID = id;
        clients[currentID] = socket;
        if(currentID!=undefined){
            scores[currentID]=0;
        }
        console.log("Nouvel utilisateur : " + currentID);
        // envoi d'un message de bienvenue à ce client
        socket.emit("bienvenue", id);
       socket.emit("essai", manche);
        // envoi aux autres clients 
        socket.broadcast.emit("message", { from: null, to: null, text: currentID + " a rejoint la discussion", date: Date.now() } );
        // envoi de la nouvelle liste à tous les clients connectés 
        io.sockets.emit("liste", Object.keys(clients),scores);
        NbEssai[currentID]=3;
    });
    
    socket.on("loginPartie", function(NomPartie,pseudo,avatar) {
        console.log("Server-loginPartie"+avatar);
        var erreurPseudo=false;
        for(var game in EnsembleParties){
            if(EnsembleParties[game].clients[pseudo]!=undefined){
                socket.emit("pseudoFAIL");
                erreurPseudo=true;
            }
        }
        if(!erreurPseudo){
            if(EnsembleParties[NomPartie]!=null&&EnsembleParties[NomPartie]!=undefined){
                while (EnsembleParties[NomPartie].clients[pseudo]) {
                    pseudo = pseudo + "(1)";   
                }
                currentID = pseudo;
                EnsembleParties[NomPartie].clients[currentID] = socket;
                if(currentID!=undefined){
                     EnsembleParties[NomPartie].scores[currentID]=0;
                     EnsembleParties[NomPartie].avatar[currentID]=avatar;
                }
                console.log("Nouvel utilisateur : " + currentID);
                socket.emit("EntreePartie",NomPartie);
                // envoi d'un message de bienvenue à ce client
                socket.emit("bienvenue", currentID);
                socket.emit("essai",  EnsembleParties[NomPartie].manche);
                // envoi aux autres clients
                for(var client in  EnsembleParties[NomPartie].clients){
                     EnsembleParties[NomPartie].clients[client].emit("message", { from: null, to: null, text: currentID + " a rejoint la discussion", date: Date.now() } );

                  // envoi de la nouvelle liste à tous les clients connectés 
                  EnsembleParties[NomPartie].clients[client].emit("liste", Object.keys( EnsembleParties[NomPartie].clients), EnsembleParties[NomPartie].scores,EnsembleParties[NomPartie].avatar);
                }
                 EnsembleParties[NomPartie].NbEssai[currentID]=3;
                 console.log(EnsembleParties);

            }
            else{
                socket.emit("loginFAIL");
            }
        }
    });
    
    socket.on("creerPartie",function(pseudo,NomPartie,NombreManche,alphabet){
        if(EnsembleParties[NomPartie]==undefined&& NomPartie!=""){
            EnsembleParties[NomPartie]=new Partie();
            EnsembleParties[NomPartie].initialise(NomPartie,NombreManche,alphabet);
            socket.emit("creationOK",pseudo,NomPartie);
        }
        socket.emit("creationFAIL");
    });
    /**
     *  Réception d'un message et transmission à tous.
     *  @param  msg     Object  le message à transférer à tous  
     */
    socket.on("message", function(msg,NomPartie) {
        if(msg.from!=EnsembleParties[NomPartie].dessinateur){
            if(EnsembleParties[NomPartie].motaDeviner==msg.text){
                EnsembleParties[NomPartie].nbreGagant++;
                if(msg.from!=undefined){
                    EnsembleParties[NomPartie].scores[msg.from]+=EnsembleParties[NomPartie].secondes;
                }
                //socket.emit("gagnant",msg.from);
                if(EnsembleParties[NomPartie].nbreGagant==Object.keys(EnsembleParties[NomPartie].clients).length-1 && Object.keys(EnsembleParties[NomPartie].clients).length!=1){
                   EnsembleParties[NomPartie].secondes=1;
                }
                msg.text="Bonne réponse";
                EnsembleParties[NomPartie].gagnant.push(msg.from);
                for(var client in  EnsembleParties[NomPartie].clients){
                 EnsembleParties[NomPartie].clients[client].emit("message", msg);
                 EnsembleParties[NomPartie].clients[client].emit("listegagnant",EnsembleParties[NomPartie].gagnant,EnsembleParties[NomPartie].avatar);
                }
            }
            else{
                if(!EnsembleParties[NomPartie].gagnant.includes(msg.from)&&EnsembleParties[NomPartie].NbEssai[msg.from]>0){
                    EnsembleParties[NomPartie].NbEssai[msg.from]--;
                    EnsembleParties[NomPartie].nbEssaiParManche++;
                    //plus d'essais
                    if(EnsembleParties[NomPartie].nbEssaiParManche==(Object.keys(EnsembleParties[NomPartie].clients).length-1)*3){
                        EnsembleParties[NomPartie].secondes=1;
                    }
                    EnsembleParties[NomPartie].clients[msg.from].emit("essai", EnsembleParties[NomPartie].NbEssai[msg.from]);
                    // si jamais la date n'existe pas, on la rajoute
                    msg.date = Date.now();
                    // si message privé, envoi seulement au destinataire
                    if (msg.to != null && EnsembleParties[NomPartie].clients[msg.to] != undefined) {
                        console.log(" --> message privé");
                        EnsembleParties[NomPartie].clients[msg.to].emit("message", msg);
                        if (msg.from != msg.to) {
                             for(var client in  EnsembleParties[NomPartie].clients){
                                EnsembleParties[NomPartie].clients[client].emit("message", msg);
                            }
                        }
                    }
                    else {
                        console.log(" --> broadcast");
                        for(var client in  EnsembleParties[NomPartie].clients){
                            EnsembleParties[NomPartie].clients[client].emit("message", msg);
                        }
                    }
                }
            }
        }
    });
    

    /** 
     *  Gestion des déconnexions
     */
    
    // fermeture
    socket.on("logout", function() { 
        // si client était identifié (devrait toujours être le cas)
        if (currentID) {
            console.log("Client auth");
            for(var game in EnsembleParties){
                console.log(game);
                console.log(EnsembleParties[game].clients[currentID]);
                if(EnsembleParties[game].clients[currentID]!=undefined){
                    if(Object.keys(EnsembleParties[game].clients).length<=1){
                        EnsembleParties[game].PartieEnCours=false;
                    }
                    else{
                        console.log("Sortie de l'utilisateur " + currentID);
                            // suppression de l'entrée
                        delete EnsembleParties[game].clients[currentID];
                         for(var client in  EnsembleParties[game].clients){
                            
                            EnsembleParties[game].clients[client].emit("message", 
                                { from: null, to: null, text: currentID + " a quitté la discussion", date: Date.now() } );
                            // envoi de la nouvelle liste pour mise à jour
                            EnsembleParties[game].clients[client].emit("liste", Object.keys(EnsembleParties[game].clients),EnsembleParties[game].scores,EnsembleParties[NomPartie].avatar);
                        }
                    }
                }
            }
        }
    });
    
    // déconnexion de la socket
    socket.on("disconnect", function(reason) { 
        // si client était identifié
        if (currentID) {

            for(var game in EnsembleParties){
                if(EnsembleParties[game].clients[currentID]!=undefined){
                    if(Object.keys(EnsembleParties[game].clients).length<=1){
                        EnsembleParties[game].PartieEnCours=false;
                    }
                    else{
                        delete EnsembleParties[game].scores[currentID];
                        delete EnsembleParties[game].clients[currentID];  
                         for(var client in  EnsembleParties[game].clients){
                            
                            EnsembleParties[game].clients[client].emit("message", 
                        { from: null, to: null, text: currentID + " vient de se déconnecter de l'application", date: Date.now() } );
                            // envoi de la nouvelle liste pour mise à jour
                            EnsembleParties[game].clients[client].emit("liste", Object.keys(EnsembleParties[game].clients),EnsembleParties[game].scores,EnsembleParties[game].avatar);
                        }
                    }
                }
            }
        }
        console.log("Client déconnecté");
    });
     socket.on("help", function(NomPartie) {
         EnsembleParties[NomPartie].AideDonnee=true;
        //clients[dessinateur].emit("help", alphabet.hiragana[motaDeviner]);
        socket.emit("help", EnsembleParties[NomPartie].alphabet[EnsembleParties[NomPartie].motaDeviner]);
    });

     socket.on("dessinCanvas", function(img,NomPartie) { 
        // si client était identifié
        if(NomPartie!=undefined){
            for(var client in  EnsembleParties[NomPartie].clients){
                 EnsembleParties[NomPartie].clients[client].emit("dessinCanvas", img);
            }
        }
    });
    socket.on("choixMot", function(num,NomPartie) {
       EnsembleParties[NomPartie].motaDeviner=EnsembleParties[NomPartie].mots[num];
        for(var client in  EnsembleParties[NomPartie].clients){
         EnsembleParties[NomPartie].clients[client].emit("finChoix");
        }
    });
    socket.on("go", function(NomPartie) {
        if(EnsembleParties[NomPartie]!=undefined && !EnsembleParties[NomPartie].PartieEnCours){
            EnsembleParties[NomPartie].PartieEnCours=true;
           
            EnsembleParties[NomPartie].decrementerChrono();
        }
    });


    socket.on("lancementPartie", function () {
        var i =getRandomInt(Object.keys(clients).length);
        console.log("lancementPartie");
        console.log(Object.keys(clients)[i]);
        io.sockets.emit("liste", Object.keys(clients),scores,EnsembleParties[NomPartie].avatar);
        io.sockets.emit("designeDessinateur",Object.keys(clients)[i]);
        decrementerChrono();
        gagnant=[];
        for(var user in NbEssai){
            NbEssai[user]=3;
        }
    });
});