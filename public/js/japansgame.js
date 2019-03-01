//Coté Client-japan's game-Ponçot Cédric-Courvoisier Nicolas- Web Avancé 2018/2019


//Classe 'command' qui sert à dessiner dans le canvas.
//xDepart,yDepart sont les points "ancrés" de départ dans le dessin d'une ligne ou d'un rectangle.
class command{
	constructor(){
		this.buttonLeftPressed = false;
		this.x=0;
		this.y=0;
		this.xDepart=0;
		this.yDepart=0;
	}
	setCoordonnee(X,Y){
		this.x=X;
		this.y=Y;
	}
	setCoordonneeDepart(){
		this.xDepart=this.x;
		this.yDepart=this.y;
	}

}

//variable coté client.
var avatarUser=1;
var gagnantTour=[];
var numeroMot;
var mot;
var isDessinateur=false;
var id;
var result;
var etat="pinceau";
var taille=5;
var instanceCommande=new command();
var overlay;
var canvasOverlay;
var essai=3;
var elimine=false;
var gagne=false;
var dataUser;
var nomPartieUser;
var NomUtilisateur;
var listeUser;

var socket=io.connect("http://localhost:8080");

document.addEventListener("DOMContentLoaded",function(e){

		//écouteurs sur les différents boutons
		document.getElementById('btnCreerPartie').addEventListener('click',creerPartie);
		document.getElementById('btnQuitter').addEventListener('click',deconnecte);
		document.getElementById('btnEnvoyer').addEventListener('click',envoyer);
		overlay = document.getElementById('overlay');
		canvasOverlay = overlay.getContext('2d');
		overlay.addEventListener('mouseover',entreeCanvas);
		overlay.addEventListener('mouseout',sortieCanvas);
		overlay.addEventListener('mousemove', Deplacement);
		overlay.addEventListener('mouseup',relachementSouris);
		overlay.addEventListener('mousedown', clicSouris);
		document.getElementById('tracer').addEventListener('click',function(){etat="pinceau"});
		document.getElementById('gommer').addEventListener('click',function(){etat="gomme"});
		document.getElementById('ligne').addEventListener('click',function(){etat="ligne"});
		document.getElementById('rectangle').addEventListener('click',function(){etat="rectangle"});
		document.getElementById('new').addEventListener('click',clearCanvas);
		document.getElementById('start').addEventListener('click',function(){socket.emit("go",nomPartieUser);});
		var res=document.getElementById('bcResults');

		//écouteur permettant d'envoyer un message en appuyant sur la touche 'Entrée'
		document.getElementById("monMessage").addEventListener('keypress', function (e) {
		    var key = e.which || e.keyCode;
		    if (key === 13) { 
		    	envoyer();
		    }
    	});

//Lance une partie
function creerPartie(){
	//récuperation des options de parties
	NomUtilisateur=document.getElementById('pseudo').value;
	var NomPartieTemp=document.getElementById('nomPartieCreation').value;
	var AlphabetTemp=document.getElementById('alphabet').value;
	var NombreMancheTemp=document.getElementById('NombreManche').value;
	var suffpre=recupSuffixePrefixe();
	//Envoi de la socket au serveur
	socket.emit("creerPartie",NomUtilisateur,NomPartieTemp,NombreMancheTemp,AlphabetTemp,suffpre);
}

//Quitte une partie (non lancée)
function deconnecte(){
	socket.emit("retourEcran");
	//On repasse sur l'écran de connexion
	document.getElementById('logScreen').style.display="block";
	document.getElementById('error').innerHTML="";
	document.getElementById('all').style.display="none";
	document.getElementById('debutTour').style.display="none";
	document.getElementById('syllabe').innerHTML="";
}

//remplace les messages contenant :) :D zzz <3 :( grr :D :/ :0 par des smileys associés
function detecteEmoji(text){
	var res=text;
 	var regexRire=new RegExp(':\\\)');
 	res=text.replace(regexRire,'<img class ="emoji rire">');
 	var regexSourire=new RegExp(':D');
 	res=res.replace(regexSourire,'<img class ="emoji sourire">');
 	var regexZzz=new RegExp('zzz');
 	res=res.replace(regexZzz,'<img class ="emoji zzz">');
 	var regexlove=new RegExp('<3');
 	res=res.replace(regexlove,'<img class ="emoji love">');
 	var regexHolala=new RegExp(':\\\(');
 	res=res.replace(regexHolala,'<img class ="emoji triste">');
 	var regexGrr=new RegExp('grr');
 	res=res.replace(regexGrr,'<img class ="emoji grr">');
 	var regexBanane=new RegExp(':D');
 	res=res.replace(regexBanane,'<img class ="emoji banane">');
 	var regexMalade=new RegExp(':/');
 	res=res.replace(regexMalade,'<img class ="emoji malade">');
 	var regexHolala=new RegExp(':0');
 	res=res.replace(regexHolala,'<img class ="emoji holala">');
 	return res;
}

//Permet d'inserer une image dans le chat avec la syntaxe [img:src]
function detecteImage(text){
	var indiceDepart=text.indexOf('[img:')+5;
	var indiceFin=text.indexOf(']')
	if(indiceFin<0 || indiceDepart<0 || indiceDepart>indiceFin){
			return text;
	}
	return "<img src="+text.substring(indiceDepart, indiceFin)+">";
}

//Convertit une Date en une chaine de caractères representant celle-ci
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp );
  var hour = a.getHours();
  if(hour<10){
  	hour="0"+hour;
  }
  var min = a.getMinutes();
  if(min<10){
  	min="0"+min;
  }
   var sec = a.getSeconds();
  if(sec<10){
  	sec="0"+sec;
  }
  var time = hour + ':' + min + ':' + sec ;
  return time;
}

//Fonction permettant d'envoyer un message (public ou privé)
function envoyer(){
	essai--;
	var main=document.getElementsByTagName('main')[0];
	var txt=document.getElementById('monMessage').value;
	if(txt.indexOf('@')==0){
		var indexEspace=txt.indexOf(' ');
		if(indexEspace==-1){
			main.innerHTML+="Message non envoyé<br>";
		}
		var to=txt.substring(1,indexEspace);
		var utilisateurExistant=false;
		for(var user in listeUser){
			if(listeUser[user]==to){
				utilisateurExistant=true;
			}
		}
		if(utilisateurExistant){
			if(txt==detecteImage(txt)){
				txt=detecteEmoji(txt);
			}
			txt=detecteImage(txt);
			socket.emit("message",{from:NomUtilisateur, to:to, text:txt, date:Date.now()},nomPartieUser);
		}
		else{
			main.innerHTML+="Message non envoyé<br>";
		}
	}
	else{
		if(txt==detecteImage(txt)){
			txt=detecteEmoji(txt);
		}
		txt=detecteImage(txt);
		socket.emit("message",{from:NomUtilisateur, to:null, text:txt, date:Date.now()},nomPartieUser);
	}
}


//=======================================================================================================
//=======================================FONCTIONS A PROPOS DU DESSIN DANS LE CANVAS=====================
//=======================================================================================================

//Reinitialise le canvas, puis transmet l'information au serveur
function clearCanvas(){
	var dessin = document.getElementById('dessin');
	var cvsDessin = dessin.getContext('2d');
	cvsDessin.clearRect(0,0,500,500);
	appelleSocketCanvas();
}

//Gère le clic de souris dans le canvas
function clicSouris(){
	canvasOverlay.clearRect(0,0,500,500);
	instanceCommande.buttonLeftPressed = true;
	if(etat=="pinceau"){
		afficheCercle();
	}
	if(etat=="gomme"){
		afficheGomme();
	}
	if(etat=="ligne"||etat=="rectangle"){
		instanceCommande.setCoordonneeDepart();
	}
}

//Envoie au serveur le nouveau dessin
function appelleSocketCanvas(){
	socket.emit("dessinCanvas",document.getElementById('dessin').toDataURL(),nomPartieUser);
}

//Gère le déplacement de la souris dans le canvas
function Deplacement(e){
	var rect = e.target.getBoundingClientRect();
	var x = e.clientX - rect.left;
	var y = e.clientY - rect.top;
	instanceCommande.setCoordonnee(x,y);
	afficheCurseur();
	if(instanceCommande.buttonLeftPressed == true){
		if(etat=="pinceau"){
			afficheCercle();
		}
		if(etat=="gomme"){
			afficheGomme();
		}
	}
}

//Gère l'entrée de la souris dans le canvas
function entreeCanvas(){
	taille=document.getElementById('size').value;
	afficheCurseur();
}

//Gère l'affichage du curseur dans le canvas
function afficheCurseur(){
	canvasOverlay.clearRect(0,0,500,500);
	canvasOverlay.fillStyle = 'RGBa(255,255,255,1)';
	canvasOverlay.strokeStyle = 'RGBa(255,255,255,1)';
	if(etat=="pinceau"){
		afficheCercleCurseur();
	}
	if(etat=="gomme"){
		canvasOverlay.fillRect(instanceCommande.x,instanceCommande.y,taille,taille);
	}
	if(etat=="ligne"){
		if(instanceCommande.buttonLeftPressed){
			canvasOverlay.beginPath();
			canvasOverlay.clearRect(0,0,500,500);
			canvasOverlay.lineWidth = taille;
			canvasOverlay.moveTo(instanceCommande.xDepart,instanceCommande.yDepart);
			canvasOverlay.lineTo(instanceCommande.x,instanceCommande.y);
			canvasOverlay.stroke();
		}
		else{
			afficheCercleCurseur();
		}	
	}
	if(etat=="rectangle"){
		if(instanceCommande.buttonLeftPressed){
			var ecartX=instanceCommande.xDepart-instanceCommande.x;
			var ecartY=instanceCommande.yDepart-instanceCommande.y;
			canvasOverlay.fillRect(instanceCommande.x,instanceCommande.y,ecartX,ecartY);
		}
		else{
			canvasOverlay.fillRect(instanceCommande.x,instanceCommande.y,15,15);
		}	

	}
}

function afficheCercle(){
	var dessin = document.getElementById('dessin');
	var canvasDessin = dessin.getContext('2d');
	canvasDessin.fillStyle = 'RGB(255,255,255)';
	var cercle = new Path2D();
    cercle.arc(instanceCommande.x, instanceCommande.y, taille, 0, 2 * Math.PI);
    canvasDessin.fill(cercle);
}

//Gère l'affichage de la gomme
function afficheGomme(){
	var dessin = document.getElementById('dessin');
	var canvasDessin = dessin.getContext('2d');
	canvasDessin.fillStyle = 'RGB(255,255,255)';
	canvasDessin.clearRect(instanceCommande.x, instanceCommande.y,taille,taille);
}

//Gère l'affichage du curseur en mode "cercle"
function afficheCercleCurseur(){
	var cercle = new Path2D();
   // cercle.moveTo(125, 35);
    cercle.arc(instanceCommande.x, instanceCommande.y, taille, 0, 2 * Math.PI);
    canvasOverlay.fill(cercle);
}

//Affiche le rectangle dans le canvas
function afficheRectangle(){
	var dessin = document.getElementById('dessin');
	var canvasDessin = dessin.getContext('2d');
	canvasDessin.fillStyle = 'RGBa(255,255,255,1)';
	var ecartX=instanceCommande.xDepart-instanceCommande.x;
	var ecartY=instanceCommande.yDepart-instanceCommande.y;
	canvasDessin.fillRect(instanceCommande.x,instanceCommande.y,ecartX,ecartY);
}

//Affiche la ligne dans le canvas
function afficheLigne(){
	var dessin = document.getElementById('dessin');
	var canvasDessin = dessin.getContext('2d');
	canvasDessin.beginPath();
	canvasDessin.strokeStyle = 'RGBa(255,255,255,1)';
	canvasDessin.lineWidth = taille;
	canvasDessin.moveTo(instanceCommande.xDepart,instanceCommande.yDepart);
	canvasDessin.lineTo(instanceCommande.x,instanceCommande.y);
	canvasDessin.stroke();
}

//Gère le relachement de la souris dans le canvas
function relachementSouris(){
	instanceCommande.buttonLeftPressed =false;
	if(etat=="pinceau"){
		afficheCercle();
	}
	if(etat=="gomme"){
		afficheGomme();
	}
	if(etat=="ligne"){
		afficheLigne();
	}
	if(etat=="rectangle"){
		afficheRectangle();
	}
	appelleSocketCanvas();
}

//gère la sortie de la souris du canvas
function sortieCanvas(){
	instanceCommande.buttonLeftPressed = false;
}

//=======================================================================================================
//=======================================ECOUTEURS DE SOCKET=============================================
//=======================================================================================================

//Récupère le nouveau canvas et le place sur la page.
socket.on("dessinCanvas",function(image){
	if(!isDessinateur){
		var dessin = document.getElementById('dessin');
		var canvasDessin = dessin.getContext('2d');
		canvasDessin.clearRect(0,0,500,500);
		var img = new Image();
		img.src = image;
		img.onload = function () {
			canvasDessin.drawImage(img, 0, 0);
		};
	}
});

//Indique que le dessinateur a choisi son mot à faire deviner
socket.on("finChoix",function() {
	if(document.getElementById('logScreen').style.display=="none"){
		if(numeroMot==null){
			numeroMot=0;
		}
		document.getElementById('all').style.display="block";
		document.getElementById('debutTour').style.display="none";
	}
});

//Récupère le temps restant dans la manche.
socket.on("setTimer",function(time){
	document.getElementById('timer').innerHTML=time;
});

//Indique que la partie est en cours.
socket.on("EntreePartie",function(nomPartie){
	document.getElementsByTagName('main')[0].innerHTML="";
	document.getElementById('logScreen').style.display="none";
	document.getElementById('all').style.display="block";
	document.getElementById('AffichageNomPartie').innerHTML=nomPartie;
	etat="";
	document.getElementById('toolbox').style.display="none";
	nomPartieUser=nomPartie;

});

//Socket permettant de connaitre le dessinateur.
socket.on("designeDessinateur",function(i,data){
	document.getElementById('start').style.display='none';
	essai=3;
	if(document.getElementById('all').style.display!="none"&&document.getElementById('logScreen').style.display=="none"){
		document.getElementById('classement').innerHTML="";
		var dessin = document.getElementById('dessin');
		var canvasDessin = dessin.getContext('2d');
		gagnantTour=[];
		canvasDessin.clearRect(0,0,500,500);
		document.getElementById('all').style.display="none";
		document.getElementById('debutTour').style.display="block";
		if(i==NomUtilisateur){
			numeroMot=null;
			dataUser=data;
			document.getElementById('finManche').innerHTML="<p>Vous êtes le dessinateur!<button type='button' onclick=onclick=envoiMot(0)>"+data[0]+"</button>,<button type='button' onclick=envoiMot(1)>"+data[1]+"</button>,<button type='button' onclick=envoiMot(2)>"+data[2]+"</button></p>";
			
			etat="pinceau";
			document.getElementById('toolbox').style.display="";
			isDessinateur=true;
		}
		else{
			document.getElementById('finManche').innerHTML="<p>"+i+" est le dessinateur!</p>";
			etat="";
			document.getElementById('toolbox').style.display="none";
			document.getElementById('syllabe').innerHTML="";
		}
	}
});

//récupère le nombre d'essais restant
socket.on("essai",function(nombre){
	document.getElementById('essai').innerHTML="Essai="+nombre;
});

//récupère le numéro de la manche
socket.on("manche",function(nombre){
	document.getElementById('manche').innerHTML="manche="+nombre;
});

//Indique que la partie est finie
socket.on("finPartie",function(scores){
	document.getElementById('start').style.display='block';
	document.getElementById('all').style.display="none";
	document.getElementById('finManche').innerHTML="";
	document.getElementById('debutTour').style.display="block";
	var copieScore=scores;
	for(var classement in copieScore){
		if(classement==undefined){
			delete copieScore[classement];
		}
	}
	var compteur=1;
	document.getElementById('classement').innerHTML="Classement de la partie<br>";
	for(var classement in copieScore){
		var max=0;
		var userMax;
		for(var user in copieScore){
			if(copieScore[user]>=max){
				max=copieScore[user];
				userMax=user;
			}
		}
		document.getElementById('classement').innerHTML+=compteur+") "+userMax+" avec "+copieScore[userMax]+"points<br>";
		copieScore[userMax]=-1;
		compteur++;
	}
	document.getElementById('classement').innerHTML+="<button type=button id=quitter onclick=quitter()>Quitter</button>";
});

//Indique les joeurs qui sont gagnant cette manche. (Ils sont surlignés en vert dans le chat)
socket.on("listegagnant",function(l,avatar){
	gagnantTour=l;
	var aside=document.getElementsByTagName('aside')[0];
	aside.innerHTML="";
	for(var user in listeUser){
		if(gagnantTour.includes(listeUser[user])){
			if(avatar[listeUser[user]]==1){
				aside.innerHTML+="<span id=gagnant>"+listeUser[user]+"-"+scoreUser[listeUser[user]]+"<img src='../images/femme.jpeg' width='30px' height='30px'></span><br>";
			}
			else{
				aside.innerHTML+="<span id=gagnant>"+listeUser[user]+"-"+scoreUser[listeUser[user]]+"<img src='../images/homme.jpeg' width='30px' height='30px'></span><br>";
			}
		}
		else{
			if(avatar[listeUser[user]]==1){
				aside.innerHTML+=listeUser[user]+"-"+scoreUser[listeUser[user]]+"<img src='../images/femme.jpeg' width='30px' height='30px'><br>";
			}
			else{
				aside.innerHTML+=listeUser[user]+"-"+scoreUser[listeUser[user]]+"<img src='../images/homme.jpeg' width='30px' height='30px'><br>";
			}
		}
	}
});

//Indique que la création de la partie a réussie
socket.on("creationOK",function(pseudo,nomPartie){
	if(document.getElementById("homme").checked){
		avatarUser=2;
	}
	else{
		avatarUser=1;
	}
	socket.emit("loginPartie",nomPartie,pseudo,avatarUser);
});

//Indique que la création de la partie a échoué
socket.on("creationFAIL",function(){
	document.getElementById('error').innerHTML="Nom de partie déjà utilisé ou invalide";
});

//Indique que la partie que l'on veut rejoindre n'existe pas/plus
socket.on("loginFAIL",function(){
	document.getElementById('error').innerHTML="Partie introuvable";
});

//Indique que le pseudo est déjà pris
socket.on("pseudoFAIL",function(){
	document.getElementById('error').innerHTML="Pseudo déjà pris";
});

//Indique son nom
socket.on("bienvenue",function(id) {
	var login=document.getElementById('login');
	login.innerHTML=id;

});

//Récupère la liste des joueurs dans la partie (avatar, nom et score)
socket.on("liste",function(liste,score,avatar) {
	listeUser=liste;
	scoreUser=score;
	var aside=document.getElementsByTagName('aside')[0];
	aside.innerHTML="";
	for(var user in liste){
		if(avatar[liste[user]]=='1'){
			aside.innerHTML+=liste[user]+"-"+score[liste[user]]+"<img src='../images/femme.jpeg' width='30px' height='30px'><br>";
		}
		else{
			aside.innerHTML+=liste[user]+"-"+score[liste[user]]+"<img src='../images/homme.jpeg' width='30px' height='30px'><br>";
		}
	}
});

//Affiche les messages du chat
socket.on("message",function(msg) {
	var main=document.getElementsByTagName('main')[0];
	if(msg.from!=null){
		if(msg.to==null){
			if(msg.from==NomUtilisateur){
				main.innerHTML+="<span class=moi>"+timeConverter(msg.date)+" - "+msg.from+" : "+msg.text+"<br></span>";
			}
			else{
				main.innerHTML+=timeConverter(msg.date)+" - "+msg.from+" : "+msg.text+"<br>";
			}
		}
		else{
			if(msg.to==NomUtilisateur){
				main.innerHTML+="<span class=mp>"+timeConverter(msg.date)+" - "+msg.to+"(à "+msg.from+") : "+msg.text+"<br></span>";
			}
			else{
				main.innerHTML+="<span class=mp>"+timeConverter(msg.date)+" - "+msg.from+"(à "+msg.to+") : "+msg.text+"<br></span>";
			}
		}
	}
	else{
		main.innerHTML+="<span class=system>[admin]"+msg.text+"<br></span>";
	}
});
});

//Renvoie le symbole si l'aide est demandée
socket.on("help",function(lettre){
	document.getElementById('syllabe').innerHTML+="-&#"+lettre+";";
	document.getElementById('help').style.display="none";
});

//Demande l'aide
function help(){
	socket.emit("help",nomPartieUser);
}

//Envoie au serveur le mot qui a été choisi par le dessinateur
function envoiMot(num){
	document.getElementById('syllabe').innerHTML=dataUser[num]+"<button id='help' onclick=help()>Help</button>";
	socket.emit("choixMot",num,nomPartieUser);
}

//Sors du classement, et renvoie à l'écran de connexion
function quitter() {
	document.getElementById('logScreen').style.display="block";
	document.getElementById('error').innerHTML="";
	document.getElementById('all').style.display="none";
	document.getElementById('debutTour').style.display="none";
	document.getElementById('syllabe').innerHTML="";
}

//Lorsque l'on crée une partie, on stocke dans le local Storage les options.
function sauvegarderOptionPartie() {
	document.getElementById('start').style.display='block';
	localStorage.setItem('Nom',document.getElementById('pseudo').value);
	localStorage.setItem('NombreManche',document.getElementById('NombreManche').value);
	localStorage.setItem('alphabet',document.getElementById('alphabet').value);
	localStorage.setItem('nomPartieCreation',document.getElementById('nomPartieCreation').value);
	if(document.getElementById("homme").checked){
		localStorage.setItem('avatar',2);
	}
	else{
		localStorage.setItem('avatar',1);
	}
	localStorage.setItem('sufpre',recupSuffixePrefixe())
}

//Lorsque l'on veut lancer la même partie que précedement, on récupère dans le local Storage les différentes options
function chargerOptionPartie() {
	var pseudo=localStorage.getItem('Nom');
	var NombreMancheTemp=localStorage.getItem('NombreManche');
	var alphabetTemp=localStorage.getItem('alphabet');
	var nomPartieTemp=localStorage.getItem('nomPartieCreation');
	var suffpre=localStorage.getItem('sufpre');
	document.getElementById('start').style.display='block';
	if(pseudo!=undefined&&NombreMancheTemp!=undefined&&alphabetTemp!=undefined&&nomPartieTemp!=undefined&&suffpre!=undefined){
		socket.emit("creerPartie",pseudo,nomPartieTemp,NombreMancheTemp,alphabetTemp,suffpre);
	}
	else{
		document.getElementById("error").innerHTML="Aucune information n'est enregistrée";
	}
}

//Renvoie dans un tableau les différents Regexp des suffixes/préfixes cochés.
function recupSuffixePrefixe(){
	var bouton=document.getElementsByTagName("input");
	var res= [];
	for (var i=0; i<bouton.length;i++){
		if(bouton[i].type=="checkbox" && bouton[i].checked && !bouton[i].disabled){
			res.push(bouton[i].value);
		}
	}
	return res;
}

//Affiche le menu des options avancées
function optionAvance() {
	document.getElementById("options").style.display = "inline";
}

//Ferme le menu des options avancées
function optionFermer() {
	document.getElementById("options").style.display = "none";
}

//Permet de rejoindre une partie déjà créée
function Rejoindre() {
	if(document.getElementById("homme").checked){
		avatarUser=2;
	}
	else{
		avatarUser=1;
	}
	document.getElementById('start').style.display='block';
	NomUtilisateur=document.getElementById('pseudo').value;
	nomPartieUser=document.getElementById('nomPartie').value;
	socket.emit("loginPartie",nomPartieUser,NomUtilisateur,avatarUser);
}