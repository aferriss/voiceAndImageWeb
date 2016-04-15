
// Array.prototype.removeCustom = function(from, to) {
//   var rest = this.slice((to || from) + 1 || this.length);
//   this.length = from < 0 ? this.length + from : from;
//   return this.push.apply(this, rest);
// };

				
// var proxyUrl = "http://localhost/~adamferriss/getNouns/proxy.php?url=";
var proxyUrl = window.location.href + "proxy.php?url=";

var container, scene, renderer, controls, camera, light, plane, shader, loader;
var orthoScene, orthoCamera, rtt, maskShader, threshShader;
var colorSepScene, colorSepTex, colorSepShader;
var blurHScene, blurVScene;
var blurHTex, blurVTex;
var blurHShader, blurVShader;

var w = window.innerWidth;
var h = window.innerHeight;

container = document.getElementById('container');


document.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener( 'resize', onWindowResize, false );

function onDocumentMouseDown(event){
	//console.log(camControls);
	 	// console.log(scene.children);
	 	console.log(threshShader.uniforms.tex.value);
}

function onWindowResize() {
	renderer.setSize( window.innerWidth, window.innerHeight );
}


init();
var imp;

function init(){

	scene = new THREE.Scene();
	orthoScene = new THREE.Scene();
	blurHScene = new THREE.Scene();
	blurVScene = new THREE.Scene();
	colorSepScene = new THREE.Scene();

	rtt = new THREE.WebGLRenderTarget( w,h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
	blurHTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
	blurVTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });
	colorSepTex = new THREE.WebGLRenderTarget(w, h, {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat });

	loader = new THREE.TextureLoader();

	shader = new THREE.ShaderMaterial({
		uniforms:{
			tex: {type: 't', value: blurVTex},
			mask: {type: 't', value: loader.load('images/mask.png')},
			time: {type: 'f', value: 0}
			
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

	threshShader = new THREE.ShaderMaterial({
		uniforms:{
			tex0: {type: 't', value: loader.load('water.jpg')},
			time: {type: 'f', value: 0},
			fadeOut: { type: 'f', value:0}
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('threshShader').textContent,
		side:THREE.DoubleSide
	});

	colorSepShader = new THREE.ShaderMaterial({
		uniforms:{
			tex0: {type: 't', value: rtt},
			step: {type: 'v2', value: new THREE.Vector2(1.8/w, 1.8/h)},
			time: {type: 'f', vale: 0}
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('colorSep').textContent,
		side:THREE.DoubleSide
	});

	blurHShader = new THREE.ShaderMaterial({
		uniforms:{
			srcTex: {type: 't', value: colorSepTex},
			step: {type: 'v2', value: new THREE.Vector2(0.15/w, 0.15/h)}
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('blurH').textContent
	});

	blurVShader = new THREE.ShaderMaterial({
		uniforms:{
			srcTex: {type: 't', value: blurHTex},
			step: {type: 'v2', value: new THREE.Vector2(0.15/w, 0.15/h)}
		},
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('blurV').textContent
	});

	camera = new THREE.PerspectiveCamera(45, w/h, 0.1,10000);
	camera.position.z = 500;

	orthoCamera = new THREE.OrthographicCamera(w/-2, w/2,  h/2, h/-2, -20000, 20000);

	var screenGeometry = new THREE.PlaneBufferGeometry( w,h );
	var plane = new THREE.Mesh(screenGeometry, shader);
	// plane.position.set(0,0,-1000);
	scene.add(plane);	

	var orthoPlane = new THREE.Mesh(screenGeometry, threshShader);
	orthoScene.add(orthoPlane);

	orthoPlane = new THREE.Mesh(screenGeometry, colorSepShader);
	colorSepScene.add(orthoPlane);

	orthoPlane = new THREE.Mesh(screenGeometry, blurHShader);
	blurHScene.add(orthoPlane);

	orthoPlane = new THREE.Mesh(screenGeometry, blurVShader);
	blurVScene.add(orthoPlane);

	renderer = new THREE.WebGLRenderer({ alpha: true , antiAlias: true});
	// renderer.clearColor( 0x000000, 0);
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
var timeInc = 0;
var fadeOut = 0;

function animate(){
	window.requestAnimationFrame(animate);
	controls.update();
	render();

	for (var i = 0; i<scene.children.length; i++){
		// scene.children[i].position.z -= 5 ;

		if(scene.children[i].position.z < -10050){
			 // scene.children[i].position.z = 1000;
			// scene.children.splice(-i,1);
			 scene.remove(scene.children[i]);
		}
		// scene.children[i].rotation.y = counter*0.1;
		// scene.children[i].scale.x += 0.002;
		// scene.children[i].scale.y += 0.002;

	}
	// $("#wordBox").css('opacity', opacityCounter);

	threshShader.uniforms.time.value =  opacityCounter;
	colorSepShader.uniforms.time.value =  opacityCounter;
	shader.uniforms.time.value =  counter*0.005;

	threshShader.uniforms.fadeOut.value = fadeOut;
	if(opacityCounter < 0.0){
		fadeOut+=0.001;
	}
	counter++;
	timeInc = ((timeInc + 0.001) % 1);
	opacityCounter-=0.0007;
}

function render(){
	
	renderer.render(orthoScene, orthoCamera, rtt, false);
	renderer.render(colorSepScene, orthoCamera, colorSepTex, false);
	renderer.render(blurHScene, orthoCamera, blurHTex, false);
	renderer.render(blurVScene, orthoCamera, blurVTex, false);
	renderer.render(scene, orthoCamera);
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
recognizer.interimResults = true;

recognizer.onresult = function(event){
	var said = [];
	if(event.results[event.results.length-1].isFinal == true){
	var saidText = event.results[event.results.length-1][0].transcript;
	// $("#wordBox").empty().append(saidText.toUpperCase());
	// $("#wordBox").fadeTo(10,1,function(){
		// $("#wordBox").fadeTo(22000,0);
	// });
	console.log(event.results[event.results.length-1]);
	var words = lexer.lex(saidText);
	var taggedWords = tagger.tag(words);
	var nouns = "";
	var indWords = [];
	for (var i in taggedWords){
		var taggedWord = taggedWords[i];
	    var word = taggedWord[0];
	    var tag = taggedWord[1];

	    // if(tag == 'NN' || tag == 'NNP' || tag == 'NNPS' || tag == 'NNS' || tag == 'JJ' || tag == 'JJR' || tag == 'JJS' || tag == 'CD'){
	    	// nouns.push(word);
	    	nouns += word;
	    	// console.log(word);
	    	indWords.push(word);
	    // }
   		  console.log(word + " /" + tag);
   		  nouns += " ";
	}
	console.log(nouns);
	if(indWords.length == 0){
		nouns = "question mark";
		indWords.push(nouns);
		saidText = "???????";
		// $("#wordBox").empty().append(saidText.toUpperCase());
	}
	if (indWords.length >0){
		
		
				
		$.ajax({
			type: 'POST',
			url: 'getData.php',
			async: false,
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
				var spacing = 2000;
				var textures = [];
				
				var numImages = 20;
				// for(var i =0; i<numImages; i++){
					// loadImage(parsedUrls[i],400,300, "body");
					var randUrl = Math.floor(Math.random()*parsedUrls.length);
					loader.load(parsedUrls[0], function(texture){
						
						//delete all old images
						// scene.children = [];
						opacityCounter = 1;
						counter = 1;
						fadeOut = 0;
						threshShader.uniforms.tex0.value = texture;
						// var shade =  new THREE.ShaderMaterial({
						// 	// uniforms:{
						// 	// 	tex: {type: 't', value: texture}
						// 	// },
						// 	// vertexShader: document.getElementById('vertexShader').textContent,
						// 	// fragmentShader: document.getElementById('fragShader').textContent
						// 	uniforms:{
						// 		tex0: {type: 't', value:texture},
						// 		time: {type: 'f', value: 0}
						// 	},
						// 	vertexShader: document.getElementById('vertexShader').textContent,
						// 	fragmentShader: document.getElementById('threshShader').textContent,
						// 	side:THREE.DoubleSide
						// });

						// textures.push(texture);
						// shade.uniforms.tex.value = texture;

						// var screenGeometry = new THREE.PlaneBufferGeometry( w,h );
						// var plane = new THREE.Mesh(screenGeometry, shade);
						// var randX =0;// (Math.random()*w*2)-w;
						// var randY =0;// (Math.random()*h*2)-h;

						// plane.position.set(randX,randY,-1000);
						
						// if(scene.children.length>=35){
						// 	 scene.children.splice(-i,1);
						// }
						// if(plane.position.x < 0){
						// 	plane.rotation.y = 45;
						// } else{
						// 	plane.rotation.y = -45;
						// }

						// scene.add(plane);	
						// spacing+=2000;

					});

				// }
				

				// console.log(urls);
			},
			error: function(e){
				console.log("error: "+ e);
			}
		});
	}

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



