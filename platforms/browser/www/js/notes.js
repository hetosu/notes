var app = {

	model: {
		"notas": [{"titulo": "Comprar pan", "contenido": "Oferta en la panaderia de la esquina"}]
	},

	firebaseConfig: {
		apiKey: "AIzaSyDMuQ-GH82zsyPAPXQIdd8_HM6GkZEt7sE",
		authDomain: "mooc-notes-85483.firebaseapp.com",
		databaseURL: "https://mooc-notes-85483.firebaseio.com",
		projectId: "mooc-notes-85483",
		storageBucket: "mooc-notes-85483.appspot.com",
		messagingSenderId: "779842396342",
		appId: "1:779842396342:web:ec8a4b370c3f27c5"
	},

	inicio: function(){
		this.iniciaFastClick();
        this.iniciaFirebase();
		this.iniciaBotones();
		this.refrescarLista();
	},

	iniciaFastClick: function(){
		FastClick.attach(document.body);
	},

    iniciaFirebase: function(){
		firebase.initializeApp(this.firebaseConfig);
},

	iniciaBotones: function(){
		var salvar = document.querySelector('#salvar');
		var anadir = document.querySelector('#anadir');

		anadir.addEventListener('click', this.mostrarEditor, false);
		salvar.addEventListener('click', this.salvarNota, false);
	},

	mostrarEditor: function(){
		document.getElementById('titulo').value = "";
		document.getElementById('comentario').value = "";
		document.getElementById('note-editor').style.display = "block";
		document.getElementById('titulo').focus();
	},

	salvarNota: function() {
		app.construirNota();
		app.ocutarEditor();
		app.refrescarLista();
		if (!app.hayWifi()) {
			alert("There's no wifi connection :) Try again later, please!");
		} else {
			app.grabarDatos();
		}
	},

	construirNota: function() {
		var notas = app.model.notas;
		notas.push({"titulo": app.extraerTitulo(), "contenido": app.extraerComentario() });
	},

	extraerTitulo: function(){
		return document.getElementById('titulo').value;
	},

	extraerComentario: function() {
		return document.getElementById('comentario').value;
	},

	ocutarEditor: function() {
		document.getElementById('note-editor').style.display = "none";
	},

	refrescarLista: function() {
		var div = document.getElementById('notes-list');
		div.innerHTML = this.anadirNotasALaLista();
	},

	// Load from Firebase
	anadirNotasALaLista: function() {
		var notas = this.model.notas;
		var notasDivs = '';
		for (var i in notas) {
			var titulo = notas[i].titulo;
			notasDivs = notasDivs + this.anadirNota(i, titulo);
		}
		return notasDivs;
	},

	anadirNota: function(id, titulo){
		 return "<div class='note-item' id='notas[" + id + "]'>" + titulo + "</div>";
	},

	grabarDatos: function() {
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.gotFS, this.fail);
	},

	gotFS: function(fileSystem) {
		fileSystem.getFile("files/"+"model.json", {create: true, exclusive: false}, app.gotFileEntry, app.fail);
	},

	gotFileEntry: function(fileEntry) {
		fileEntry.createWriter(app.gotFileWriter, app.fail);
	},

	gotFileWriter: function(writer) {
		writer.onwriteend = function(evt) {
			console.log("datos grabados en externalApplicationStorageDirectory");
			app.salvarFirebase();
		};
		writer.write(JSON.stringify(app.model));
	},

    hayWifi: function(){
        return navigator.connection.type === 'wifi';
    },

   	salvarFirebase: function(){
 		var ref = firebase.storage().ref('model.json');
 		ref.putString(JSON.stringify(app.model));
 	},

	leerDatos: function() {
		window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.obtenerFS, this.fail);
	},

	obtenerFS: function(fileSystem) {
		fileSystem.getFile("files/"+"model.json", null, app.obtenerFileEntry, app.fail);
	},

	obtenerFileEntry: function(fileEntry) {
		fileEntry.file(app.leerFile, app.fail);
	},

	leerFile: function(file) {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
 			var data = evt.target.result;
			app.model = JSON.parse(data);
 			app.inicio();
 		};
 		reader.readAsText(file);
	},

	fail: function(error) {
		console.log(error.code);
	}
};

if ('addEventListener' in document) {
	document.addEventListener("deviceready", function(){
		app.leerDatos();		
	}, false);
};