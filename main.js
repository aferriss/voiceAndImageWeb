
// Array.prototype.removeCustom = function(from, to) {
//   var rest = this.slice((to || from) + 1 || this.length);
//   this.length = from < 0 ? this.length + from : from;
//   return this.push.apply(this, rest);
// };

				
var proxyUrl = "http://localhost/~adamferriss/getNouns/proxy.php?url=";

var container, scene, renderer, controls, camera, light, plane, shader, loader;
var orthoScene, orthoCamera, rtt, maskShader;

var w = window.innerWidth;
var h = window.innerHeight;

container = document.getElementById('container');


document.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener( 'resize', onWindowResize, false );

function onDocumentMouseDown(event){
	//console.log(camControls);
	 	// console.log(scene.children);
}

function onWindowResize() {
	renderer.setSize( window.innerWidth, window.innerHeight );
}


init();
var imp;

function init(){

	scene = new THREE.Scene();
	orthoScene = new THREE.Scene();

	rtt = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
	loader = new THREE.TextureLoader();


	shader = new THREE.ShaderMaterial({
		uniforms:{
			tex: {type: 't', value: loader.load('water.jpg')}
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragShader').textContent,
		side:THREE.DoubleSide
	});

	maskShader = new THREE.ShaderMaterial({
		uniforms:{
			tex0: {type: 't', value: loader.load('images/mask.png')},
			tex1: {type: 't', value: rtt }
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('maskShader').textContent,
		side:THREE.DoubleSide
	});

	camera = new THREE.PerspectiveCamera(45, w/h, 0.1,10000);
	camera.position.z = 500;

	orthoCamera = new THREE.OrthographicCamera(w/-2, w/2,  h/2, h/-2, -20000, 20000);


	var screenGeometry = new THREE.PlaneBufferGeometry( w,h );
	var plane = new THREE.Mesh(screenGeometry, shader);
	plane.position.set(0,0,-1000);
	scene.add(plane);	

	var orthoPlane = new THREE.Mesh(screenGeometry, maskShader);
	orthoScene.add(orthoPlane);

	renderer = new THREE.WebGLRenderer({ alpha: true , antiAlias: true});
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
var counter = 1;
var opacityCounter = 1;
function animate(){
	window.requestAnimationFrame(animate);
	controls.update();
	render();

	for (var i = 0; i<scene.children.length; i++){
		scene.children[i].position.z -= 5 ;

		if(scene.children[i].position.z < -10050){
			 // scene.children[i].position.z = 1000;
			// scene.children.splice(-i,1);
			 scene.remove(scene.children[i]);
		}
		// scene.children[i].rotation.y = counter*0.1;
		// scene.children[i].scale.x += 0.002;
		// scene.children[i].scale.y += 0.002;

	}
	$("#wordBox").css('opacity', opacityCounter);
	counter++;
	opacityCounter-=0.0009;
}

function render(){
	renderer.render(scene, camera, rtt, false);
	renderer.render(orthoScene, orthoCamera);
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
	$("#wordBox").empty().append(saidText.toUpperCase());
	$("#wordBox").fadeTo(10,1,function(){
		// $("#wordBox").fadeTo(22000,0);
	});
	
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
		saidText = "???????";
		$("#wordBox").empty().append(saidText.toUpperCase());
	}
	if (indWords.length >0){
		
		
				
		$.ajax({
			type: 'POST',
			url: 'getData.php',
			async: true,
			cache: false,
			data: {
				text: saidText
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
				var spacing = 0;
				var textures = [];
				
				var numImages = 1;
				for(var i =0; i<numImages; i++){
					// loadImage(parsedUrls[i],400,300, "body");
					var randUrl = Math.floor(Math.random()*parsedUrls.length);
					loader.load(parsedUrls[randUrl], function(texture){
						
						//delete all old images
						scene.children = [];
						opacityCounter = 1
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
						var randX =0;// (Math.random()*w*2)-w;
						var randY =0;// (Math.random()*h*2)-h;

						plane.position.set(randX,randY,spacing);
						
						// if(scene.children.length>=35){
						// 	 scene.children.splice(-i,1);
						// }
						// if(plane.position.x < 0){
						// 	plane.rotation.y = 45;
						// } else{
						// 	plane.rotation.y = -45;
						// }

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



