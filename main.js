
// Array.prototype.removeCustom = function(from, to) {
//   var rest = this.slice((to || from) + 1 || this.length);
//   this.length = from < 0 ? this.length + from : from;
//   return this.push.apply(this, rest);
// };
				
var proxyUrl = "http://localhost/voiceAndImageWeb/proxy.php?url=";

var container, scene, renderer, controls, camera, light, plane, shader, loader;
var w = window.innerWidth;
var h = window.innerHeight;

container = document.getElementById('container');


document.addEventListener('mousedown', onDocumentMouseDown, false);

function onDocumentMouseDown(event){
	//console.log(camControls);
	 	console.log(scene.children.length);
}


init();


function init(){
	scene = new THREE.Scene();

	loader = new THREE.TextureLoader();

	shader = new THREE.ShaderMaterial({
		uniforms:{
			tex: {type: 't', value: loader.load('water.jpg')}
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragShader').textContent
	});

	camera = new THREE.PerspectiveCamera(45, w/h, 0.1,10000);
	camera.position.z = 500;

	var screenGeometry = new THREE.PlaneBufferGeometry( w,h );
	var plane = new THREE.Mesh(screenGeometry, shader);
	plane.position.set(0,0,-1000);
	scene.add(plane);	

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.clearColor( 0xffffff, 0);
	renderer.setSize(w, h);
	container.appendChild( renderer.domElement);

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.925;
	controls.enableZoom = true;	

	animate();
}

var inc = 5;
function animate(){
	window.requestAnimationFrame(animate);
	controls.update();
	render();

	for (var i = 0; i<scene.children.length; i++){
		scene.children[i].translateZ(-inc);

		if(scene.children[i].position.z < -50000){
			scene.children[i].position.z = 1000;
		}
	}
}

function render(){

	renderer.render(scene, camera);
}

function loadImage(path, width, height, target) {
    $('<img src="'+ path +'">').load(function() {
      $(this).width(width).height(height).appendTo(target);
    });
    console.log(path);
}


var lexer = new Lexer();
var tagger = new POSTagger();

window.SpeechRecognition = window.SpeechRecognition ||
							window.webkitSpeechRecognition ||
							null;

var recognizer = new window.SpeechRecognition();
recognizer.continuous = true;
recognizer.interimResults = false;

recognizer.onresult = function(event){
	var said = [];
	var saidText = event.results[event.results.length-1][0].transcript;
	 var words = lexer.lex(saidText);
	 var taggedWords = tagger.tag(words);
	var nouns = "";
	var indWords = [];
	for (var i in taggedWords){
		var taggedWord = taggedWords[i];
	    var word = taggedWord[0];
	    var tag = taggedWord[1];

	    if(tag == 'NN' || tag == 'NNP' || tag == 'NNPS' || tag == 'NNS' || tag == 'JJ' || tag == 'JJR' || tag == 'JJS' || tag == 'CD'){
	    	// nouns.push(word);
	    	nouns += word;
	    	// console.log(word);
	    	indWords.push(word);
	    }
   		  console.log(word + " /" + tag);
   		  nouns += " ";
	}
	console.log(nouns);
	if(indWords.length == 0){
		nouns = "question mark";
		indWords.push(nouns);
	}
	if (indWords.length >0){
		$.ajax({
			type: 'POST',
			url: 'getData.php',
			async: true,
			cache: false,
			data: {
				text: nouns
			},
			timeout: 30000,
			success: function(resp){
				var parsed = JSON.parse(resp);
				// console.log(parsed.results.length);
				var urls = [];
				for(var i = 0; i<parsed.results.length; i++){
					var url = parsed.results[i].image;
					urls.push(url);
				}
				// loadImage(urls[0], 400,300,"body");
				var parsedUrls = parseHtml(urls);
				var spacing = -1000;
				var textures = [];
				

				for(var i =0; i<parsedUrls.length; i++){
					// loadImage(parsedUrls[i],400,300, "body");
					loader.load(parsedUrls[i], function(texture){
						var shade =  new THREE.ShaderMaterial({
							uniforms:{
								tex: {type: 't', value: texture}
							},
							vertexShader: document.getElementById('vertexShader').textContent,
							fragmentShader: document.getElementById('fragShader').textContent
						});

						// textures.push(texture);
						// shade.uniforms.tex.value = texture;
						var screenGeometry = new THREE.PlaneBufferGeometry( w,h );
						var plane = new THREE.Mesh(screenGeometry, shade);
						var randX = (Math.random()*w)-w/2;
						var randY = (Math.random()*h)-h/2;
						plane.position.set(randX,randY,spacing);
						if(scene.children.length>=35){
							 scene.children.splice(-i,1);
						}

						scene.add(plane);	
						spacing+=2000;

					});

				}
				

				// console.log(urls);
			},
			error: function(e){
				console.log("error: "+ e);
			}
		});
	}



};

recognizer.onerror = function(event) {
	console.log(event.error);
};

recognizer.onend = function(){
	// console.log("ended");
	recognizer.start();
};

recognizer.start();



function parseHtml(data) {

    var urls = data;

    var corsPrefix = proxyUrl;
    //var corsPrefix = "http://localhost:8888/getImg/proxy.php?url=";
    //var corsPrefix = "http://corsify.appspot.com/"
    var jpegSuffix = "&mimeType=image/jpeg";
    var pngSuffix = "&mimeType=image/png";
    var gifSuffix = "&mimeType=image/gif";
    var htmlSuffix = "&mimeType=text/html";

    var jpeg = /jpeg/;
    var png = /png/;
    var gif = /gif/;

    var cnt = 0;
    var jpgEx = /jpg/g;
    var JPGEx = /JPG/g;
    var jpegEx = /jpeg/g;
    var pngEx = /png/g;
    var gifEx = /gif/g;
    var albumEx = /\/a\//g;

    for (var i = 0; i < urls.length; i++) {
        urls[i] = corsPrefix + urls[i];
        
        var foundJpg = urls[i].match(jpgEx);
        var foundjpeg = urls[i].match(jpegEx);
        var foundJPG = urls[i].match(JPGEx);
        var foundPng = urls[i].match(pngEx);
        var foundGif = urls[i].match(gifEx);


        if (foundJpg) {
            urls[i] = urls[i] + jpegSuffix;
        } else if (foundPng) {
            urls[i] = urls[i] + pngSuffix;
        } else if (foundGif) {
            urls[i] = urls[i] + gifSuffix;
        } else if( foundJPG) {
            urls[i] = urls[i] + jpegSuffix;
        } else if( foundjpeg) {
            urls[i] = urls[i] + jpegSuffix;
        }
        
    }


    return urls;


}



