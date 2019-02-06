var isDessinateur=false;
var id;
var result;
document.addEventListener("DOMContentLoaded",function(e){
		var NomUtilisateur;
		var listeUser;
		document.getElementById('btnConnecter').addEventListener('click',connexion);
		document.getElementById('btnEnvoyer').addEventListener('click',envoyer);
		document.getElementById('btnImage').addEventListener('click',gif);
		document.getElementById('btnRechercher').addEventListener('click',rechercheGif);
		document.getElementById('btnFermer').addEventListener('click',Quittegif);
		var socket=io.connect("http://localhost:8080");
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
		estDessinateur();


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
function connexion(){
	NomUtilisateur=document.getElementById('pseudo').value;
	socket.emit("login",NomUtilisateur);
	var radio1=document.getElementById('radio1');
	radio1.checked=0;
	var radio2=document.getElementById('radio2');
	radio2.checked=1;
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
			socket.emit("message",{from:NomUtilisateur, to:to, text:txt, date:Date.now()});
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
		socket.emit("message",{from:NomUtilisateur, to:null, text:txt, date:Date.now()});
	
	}
}
function envoyerImage(src){
	console.log("ok");
	var main=document.getElementsByTagName('main')[0];

	socket.emit("message",{from:NomUtilisateur, to:null, text:"<img src="+src+">", date:Date.now()});

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
socket.on("liste",function(liste) {
	listeUser=liste;
	var aside=document.getElementsByTagName('aside')[0];
	aside.innerHTML="";
	for(var user in liste){
		aside.innerHTML+=liste[user]+"<br>";
	}
	console.log(liste);
});
socket.on("bienvenue",function(id) {
	var login=document.getElementById('login');
	login.innerHTML=id;
});
});
