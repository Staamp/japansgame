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
var socket=io.connect("http://localhost:8080");

document.addEventListener("DOMContentLoaded",function(e){
		var listeUser;
		document.getElementById('btnConnecter').addEventListener('click',connexion);
		document.getElementById('btnEnvoyer').addEventListener('click',envoyer);
		document.getElementById('btnImage').addEventListener('click',gif);
		document.getElementById('btnRechercher').addEventListener('click',rechercheGif);
		document.getElementById('btnFermer').addEventListener('click',Quittegif);
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
		for(var i =0;i<5;i++){
			res.innerHTML+="<div  id=id"+i+"></div>";
		}
		document.getElementById("id0").addEventListener('click',function(){
			envoyerImage(res.getElementsByTagName('img')[0].src);
		});
		document.getElementById("id1").addEventListener('click',function(){
			envoyerImage(res.getElementsByTagName('img')[1].src);
		});
		document.getElementById("id2").addEventListener('click',function(){
			envoyerImage(res.getElementsByTagName('img')[2].src);
		});
		document.getElementById("id3").addEventListener('click',function(){
			envoyerImage(res.getElementsByTagName('img')[3].src);
		});
		document.getElementById("id4").addEventListener('click',function(){
			envoyerImage(res.getElementsByTagName('img')[4].src);
		});
		document.getElementById("monMessage").addEventListener('keypress', function (e) {
		    var key = e.which || e.keyCode;
		    if (key === 13) { 
		    	envoyer();
		    }
    	});

/*Fonction TP3*/
function connexion(){
	NomUtilisateur=document.getElementById('pseudo').value;
	socket.emit("login",NomUtilisateur);
	document.getElementById('all').style.display="block";
	document.getElementById('logScreen').style.display="none";
}
function gif(){
	var image=document.getElementById('bcImage');
	image.style="display:block";
}
function Quittegif(){
	var image=document.getElementById('bcImage');
	image.style="display:none";
}
function rechercheGif(){
	var r=document.getElementById('recherche');
	var recherche=r.value;
	var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result=JSON.parse(this.responseText);
            console.log(result);

            id=0;
		    for(var image in result.data){
		    	document.getElementById("id"+id).innerHTML="";
		    	document.getElementById("id"+id).innerHTML+="<img src="+result.data[image].images.downsized.url+">";
		    	id++;
		    }
		   // ecouteur();
        }
    }

    xhttp.open("GET", 'http://api.giphy.com/v1/gifs/search?q='+recherche+'&api_key=0X5obvHJHTxBVi92jfblPqrFbwtf1xig&limit=5', true);
    xhttp.send();
}
function oki(){
	if(document.getElementById("id").getElementsByTagName('img')!=null){
		envoyerImage(res.getElementsByTagName('img')[0].src);
	}
}
function ecouteur(){
	
	 for(var i=0;i<id;i++){		  
		   document.getElementById('id'+i).addEventListener('click',envoyerImage(result.data[i].images.downsized.url));
	}
	//document.getElementById('id0').addEventListener('click',envoyerImage(result.data[0].images.downsized.url));
}

function estDessinateur(){
	var toolbox=document.getElementById('toolbox');
	toolbox.style="	";
}
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
function detecteImage(text){
	var indiceDepart=text.indexOf('[img:')+5;
	var indiceFin=text.indexOf(']')
	if(indiceFin<0 || indiceDepart<0 || indiceDepart>indiceFin){
			return text;
	}
	return "<img src="+text.substring(indiceDepart, indiceFin)+">";
}
function lancementPartie(){
	socket.emit("lancementPartie");
}
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
function envoyerImage(src){
	var main=document.getElementsByTagName('main')[0];
	socket.emit("message",{from:NomUtilisateur, to:null, text:"<img src="+src+">", date:Date.now()},nomPartieUser);

}

socket.on("message",function(msg) {
	var main=document.getElementsByTagName('main')[0];
	console.log(msg);
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

socket.on("liste",function(liste,score) {
	console.log("recu"+score);
	listeUser=liste;
	scoreUser=score;
	var aside=document.getElementsByTagName('aside')[0];
	aside.innerHTML="";
	for(var user in liste){
		aside.innerHTML+=liste[user]+"-"+score[liste[user]]+"<br>";
	}
	console.log(liste);
});


socket.on("bienvenue",function(id) {
	var login=document.getElementById('login');
	login.innerHTML=id;

});

socket.on("dessinCanvas",function(image){
	var dessin = document.getElementById('dessin');
	var canvasDessin = dessin.getContext('2d');
	var img = new Image();
	img.src = image;
	img.onload = function () {
		canvasDessin.drawImage(img, 0, 0);
	};
});

/**Fonctions TP2*/
function clearCanvas(){
	var dessin = document.getElementById('dessin');
	var cvsDessin = dessin.getContext('2d');
	cvsDessin.clearRect(0,0,500,500);
}

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

function appelleSocketCanvas(img){
	socket.emit("dessinCanvas",document.getElementById('dessin').toDataURL(),nomPartieUser);
}

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

function entreeCanvas(){
	taille=document.getElementById('size').value;
	afficheCurseur();
}

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

function afficheGomme(){
	var dessin = document.getElementById('dessin');
	var canvasDessin = dessin.getContext('2d');
	canvasDessin.fillStyle = 'RGB(255,255,255)';
	canvasDessin.clearRect(instanceCommande.x, instanceCommande.y,taille,taille);
}

function afficheCercleCurseur(){
	var cercle = new Path2D();
   // cercle.moveTo(125, 35);
    cercle.arc(instanceCommande.x, instanceCommande.y, taille, 0, 2 * Math.PI);
    canvasOverlay.fill(cercle);
}

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
	appelleSocketCanvas("lol");
}

function afficheRectangle(){
	var dessin = document.getElementById('dessin');
	var canvasDessin = dessin.getContext('2d');
	canvasDessin.fillStyle = 'RGBa(255,255,255,1)';
	var ecartX=instanceCommande.xDepart-instanceCommande.x;
	var ecartY=instanceCommande.yDepart-instanceCommande.y;
	canvasDessin.fillRect(instanceCommande.x,instanceCommande.y,ecartX,ecartY);
}
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
function sortieCanvas(){
	instanceCommande.buttonLeftPressed = false;
}

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
socket.on("finChoix",function() {
	if(document.getElementById('logScreen').style.display=="none"){
		if(numeroMot==null){
			numeroMot=0;
		}
		document.getElementById('all').style.display="block";
		document.getElementById('debutTour').style.display="none";
	}
});
socket.on("setTimer",function(time){
	console.log(time);
	document.getElementById('timer').innerHTML=time;
});
socket.on("EntreePartie",function(nomPartie){
	document.getElementById('logScreen').style.display="none";
	document.getElementById('all').style.display="block";
	document.getElementById('AffichageNomPartie').innerHTML=nomPartie;
	nomPartieUser=nomPartie;

});
socket.on("designeDessinateur",function(i,data){
	essai=3;
	if(document.getElementById('all').style.display!="none"&&document.getElementById('logScreen').style.display=="none"){
		document.getElementById('classement').innerHTML="";
		var dessin = document.getElementById('dessin');
		var canvasDessin = dessin.getContext('2d');
		gagnantTour=[];
		canvasDessin.clearRect(0,0,500,500);
		document.getElementById('all').style.display="none";
		document.getElementById('debutTour').style.display="block";
		console.log("Nom"+NomUtilisateur);
		if(i==NomUtilisateur){
			numeroMot=null;
			dataUser=data;
			console.log(data);
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
socket.on("essai",function(nombre){
	document.getElementById('essai').innerHTML="Essai="+nombre;
});
socket.on("manche",function(nombre){
	document.getElementById('manche').innerHTML="manche="+nombre;
});
socket.on("finPartie",function(scores){
	console.log("FIN PARTIE");
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
socket.on("listegagnant",function(l){
	gagnantTour=l;
	var aside=document.getElementsByTagName('aside')[0];
	aside.innerHTML="";
	for(var user in listeUser){
		if(gagnantTour.includes(listeUser[user])){
			aside.innerHTML+="<span id=gagnant>"+listeUser[user]+"-"+scoreUser[listeUser[user]]+"</span><br>";
		}
		else{
			aside.innerHTML+=listeUser[user]+"-"+scoreUser[listeUser[user]]+"<br>";
		}
	}
});
socket.on("error",function(){
	console.log("Message d'erreur - client")
	document.getElementById('error').innerHTML="Partie introuvable";
});
});
socket.on("help",function(lettre){
	document.getElementById('syllabe').innerHTML+="-&#"+lettre+";";
});

function help(){
	socket.emit("help",nomPartieUser);
}
function envoiMot(num){
	document.getElementById('syllabe').innerHTML=dataUser[num]+"<button onclick=help()>Help</button>";
	socket.emit("choixMot",num,nomPartieUser);
}
function quitter() {
	document.getElementById('all').style.display="block";
	document.getElementById('debutTour').style.display="none";
	document.getElementById('syllabe').innerHTML="";
}
function sauvegarderNom() {
	localStorage.setItem('Nom',document.getElementById('pseudo').value);
}
function chargerNom() {
	var pseudo=localStorage.getItem('Nom');
	if(pseudo!=null && pseudo!=undefined){
		connexionAncienProfil(pseudo);
	}
}
function connexionAncienProfil(NomUtilisateur){
	socket.emit("login",NomUtilisateur);
	document.getElementById('all').style.display="block";
	document.getElementById('logScreen').style.display="none";
}
function Rejoindre() {
	NomUtilisateur=document.getElementById('pseudo').value;
	nomPartieUser=document.getElementById('nomPartie').value;
	socket.emit("loginPartie",nomPartieUser,NomUtilisateur);
}