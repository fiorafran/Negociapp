  
// If we need to use custom DOM library, 's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'Negociapp',
    // App id
    id: 'com.negociapp.test',
    // Enable swipe panel
    panel: {
      swipe: false,
    },
    // Add default routes
    routes: [
      {
        path: '/search/',
        url: 'search.html',
      },
      {
        path: '/searchCo/',
        url: 'searchComer.html',
      },
      {
        path: '/searchAd/',
        url: 'searchAdmin.html',
      },
      {
        path: '/register/',
        url: 'register.html',
        options: {
        transition: 'f7-circle',
        }
      },
      {
        path: '/index/',
        url: 'index.html',
      },
    ]
    // ... other parameters
  });

var mainView = app.views.create('.view-main');

var db = firebase.firestore();
var userCol = db.collection("usuarios");
var commerceCol = db.collection("negocios");
var saveCol = db.collection("guardados");

var map, platform;
var pos, latitud, longitud, localLat, localLng;
var nombreUser;
var arrayMarcadores= [];
var latMark = [];
var lonMark = [];
var nomMark = [];
var tipMark = [];
var dirMark = [];
var horMark = [];

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    $$('#comp').on('click', sesionCheck);
    $$('#signOut').on('click', logOut);

    platform = new H.service.Platform({
        'apikey': 'gY5i9nh39CW9Hkb8itf7umEsECDyQzdTFVq9Oy5dEiU'
    });
});

/*Page init de la pantalla ya de busqueda, osea con sesion iniciada*/
$$(document).on('page:init', '.page[data-name="search"]', function (e) {
    latMark = [];
    lonMark = [];
    nomMark = [];
    tipMark = [];
    dirMark = [];
    horMark = [];
    var ArrayLocalesD = [];

    console.log('search');
    //obtener datos del usuario y mostrar nombre y apellido de la DB
    userCol.doc(email).get()
    .then((docRe) => {
        console.log(docRe.data());
        $$('#mName').text(docRe.data().Nombre +' '+ docRe.data().Apellido);
    })
    .catch((error) => {
        console.log('error '+error);
    })

    commerceCol.get()
    .then((querysnapp)=>{
        querysnapp.forEach((docI)=>{
            var idL = docI.id;
            var nombreL = docI.data().nombre;
            var direcL = docI.data().direccion;
            var horaL = docI.data().horario;
            $$('#cargaLocales').append(`
                <div class="block block-strong row">
                    <div class="col-45">
                        <p>`+nombreL+`</p>
                        <p>`+direcL+`</p>
                    </div>
                    <div class="col-45">
                        <p>`+horaL+`hs</p>
                        <span class="abierto">Abierto</span>
                    </div>
                    <div class="col-20">
                        <button class="heF text-align-center icon material-icons button button-small" id="`+nombreL+`" guardar="`+idL+`">
                        bookmark_border</button>
                    </div>
                </div>`);

            $$('#'+nombreL).on('click', ()=>{
                var sv = $$('#'+nombreL).attr('guardar');
                console.log(sv);
                if ($$('#'+nombreL).text() == 'bookmark_border') {
                    $$('#'+nombreL).text('bookmark');
                    ArrayLocalesD.push(sv);
                    datos = { LocalesGuardados: ArrayLocalesD };
                    saveCol.doc(email).set(datos);
                    console.log('Local guardado')

                    $$('#cont-guardados').append(`
                        <div class="Mostrador row" id="DBtn_`+nombreL+`">
                            <div class="col-50">
                                <p>Nombre: <b>`+nombreL+`</b></p>
                                <p>Direc.: <b>`+direcL+`</b></p>
                            </div>
                            <div class="col-50">
                                <p>Horario: <b>`+horaL+`hs</b></p>
                                <span class="abierto">Abierto</span>
                            </div>
                        </div>
                        `);

                } else {
                    $$('#'+nombreL).text('bookmark_border');
                    for (var i = 0; i < ArrayLocalesD.length; i++) {
                        if (ArrayLocalesD[i] === sv) {
                          ArrayLocalesD.splice(i, 1);
                          //i--;
                          console.log(ArrayLocalesD.length);
                        }
                    }
                    saveCol.doc(email).update({ LocalesGuardados: ArrayLocalesD })
                    .then(() => {
                        console.log("Local desguardado");
                        $$('#DBtn_'+nombreL).remove();
                    })
                    .catch((error) => {
                        console.error("Error updating document: ", error);
                    });
                }
            })

        });
    });

    var icon = new H.map.Icon('img/alf.png');
    var iconLocal = new H.map.Icon('img/comerce.png');
    var defaultLayers = platform.createDefaultLayers();

    // observador de posición
    // var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

    // Crear y mostrar mapa:
    map = new H.Map(document.getElementById('mapContainer'),
        defaultLayers.vector.normal.map,
        {
        zoom: 14,
        center: { lat: latitud, lng: longitud }
        });
        
        coords = {lat: latitud, lng: longitud};
        markerP = new H.map.Marker(coords, {icon: icon});
        userCol.doc(email).get()
        .then((docRe) => {
            nombreUser = docRe.data().Nombre;
            markerP.setData('<b>Posicion de '+nombreUser+'</b>');
        })
        .catch((error) => {
            console.log('error '+error);
        })
        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(markerP);
        map.setCenter(coords);

        //desplazamiento
        behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        //interfaz
        ui = H.ui.UI.createDefault(map, defaultLayers, 'es-ES');
        ui.getControl('mapsettings').setDisabled(true);

        var circle1 = new H.map.Circle(
            new H.geo.Point(latitud, longitud), //center
            600, // Radius in meters
            { style: {
                fillColor: 'rgba(106, 90, 205, 0.3)',
                lineWidth: 3,
                strokeColor: 'rgba(110, 0, 255, 1)'
            } }
        );
        circle1.setData('Circle1');
        map.addObject(circle1); 

        distanciaCirculo(latitud, longitud, -32.979020, -60.669609);

        function MARCADORES(map) {
            commerceCol.get()
            .then((com) => {
                com.forEach((doc) => {
                    console.log(doc.data().nombre);
                    nomDoc = doc.data().nombre;
                    tipDoc = doc.data().tipo;
                    dirDoc = doc.data().direccion;
                    horDoc = doc.data().horario;
                    lata = doc.data().latitud;
                    longa= doc.data().longitud;
                    arrayPushea(lata, longa);
                    documentPushea(nomDoc, tipDoc, dirDoc, horDoc);
                });
                console.log('el largo del array de latMark => ', latMark.length);
                console.log('el largo del array de nomMark => ', nomMark.length);
                for (i=0; i < latMark.length; i++) {
                    
                    console.log("posicion: ",i," latMark ", latMark[i], " lonMark ", lonMark[i]);
                    marker = new H.map.Marker({lat: latMark[i], lng: lonMark[i]}, {icon: iconLocal});
                    distanciaLegal(latMark[i], lonMark[i]);
                    marker.setData('<b>Tienda: </b>'+nomMark[i]+'<br/><b>Tipo: </b>'+tipMark[i]+'<br/><b>Direccion: </b>'+dirMark[i]+'<br/><b>Horario: </b>'+horMark[i]);
                }
            });
        }
        MARCADORES(map);

        //burbuja al tocar el marcador
        map.addEventListener('tap', function(t){
            //var tap1 = map.screenToGeo(t.currentPointer.viewportX, t.currentPointer.viewportY);
            if (t.target instanceof H.map.Marker) {
                var position = t.target.getGeometry(), data = t.target.getData();
                var bubble = new H.ui.InfoBubble(position, {
                        content: data
                    });
                // agregar la burbuja al mapa
                ui.addBubble(bubble);
                bubble.open();
            }
        });
        window.addEventListener('resize', () => map.getViewPort().resize());

    $$('#btn1').on('click', function(){setTitleBar(this)});
    $$('#btn2').on('click', function(){setTitleBar(this)});
    $$('#btn3').on('click', function(){setTitleBar(this)});

    $$('#regLocal').on('click', LocalReg);

})


$$(document).on('page:init', '.page[data-name="searchAdmin"]', function (e) {
    latMark = [];
    lonMark = [];
    nomMark = [];
    tipMark = [];
    dirMark = [];
    horMark = [];

    console.log('search admin');
    //obtener datos del usuario y mostrar nombre y apellido de la DB
    userCol.doc(email).get()
    .then((docRe) => {
        console.log(docRe.data());
        $$('#mName').text(docRe.data().Nombre +' '+ docRe.data().Apellido);
    })
    .catch((error) => {
        console.log('error '+error);
    })

    var iconLocal = new H.map.Icon('img/comerce.png');
    var icon = new H.map.Icon('img/alf.png');
    var defaultLayers = platform.createDefaultLayers();

    // observador de posición
    // var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

    // Crear y mostrar mapa:
    map = new H.Map(document.getElementById('mapContainerAd'),
        defaultLayers.vector.normal.map,
        {
        zoom: 14,
        center: { lat: latitud, lng: longitud }
        });
        
        coords = {lat: latitud, lng: longitud};
        markerP = new H.map.Marker(coords, {icon: icon});
        userCol.doc(email).get()
        .then((docRe) => {
            nombreUser = docRe.data().Nombre;
            markerP.setData('<b>Posicion de '+nombreUser+'</b>');
        })
        .catch((error) => {
            console.log('error '+error);
        })
        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(markerP);
        map.setCenter(coords);

        //desplazamiento
        behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        //interfaz
        ui = H.ui.UI.createDefault(map, defaultLayers, 'es-ES');
        ui.getControl('mapsettings').setDisabled(true);

        var circle1 = new H.map.Circle(
            new H.geo.Point(latitud, longitud), //center
            600, // Radius in meters
            { style: {
                fillColor: 'rgba(106, 90, 205, 0.3)',
                lineWidth: 3,
                strokeColor: 'rgba(110, 0, 255, 1)'
            } }
        );
        circle1.setData('Circle1');
        map.addObject(circle1);

        distanciaCirculo(latitud, longitud, -32.979020, -60.669609);

        function MARCADORES(map) {
            commerceCol.get()
            .then((com) => {
                com.forEach((doc) => {
                    console.log(doc.data().nombre);
                    nomDoc = doc.data().nombre;
                    tipDoc = doc.data().tipo;
                    dirDoc = doc.data().direccion;
                    horDoc = doc.data().horario;
                    lata = doc.data().latitud;
                    longa= doc.data().longitud;
                    arrayPushea(lata, longa);
                    documentPushea(nomDoc, tipDoc, dirDoc, horDoc);
                });
                console.log('el largo del array de latMark => ', latMark.length);
                console.log('el largo del array de nomMark => ', nomMark.length);
                for (i=0; i < latMark.length; i++) {
                    
                    console.log("posicion: ",i," latMark ", latMark[i], " lonMark ", lonMark[i]);
                    marker = new H.map.Marker({lat: latMark[i], lng: lonMark[i]}, {icon: iconLocal});
                    distanciaLegal(latMark[i], lonMark[i]);
                    marker.setData('<b>Tienda: </b>'+nomMark[i]+'<br/><b>Tipo: </b>'+tipMark[i]+'<br/><b>Direccion: </b>'+dirMark[i]+'<br/><b>Horario: </b>'+horMark[i]);
                }
            });
        }
        MARCADORES(map);

        //burbuja al tocar el marcador
        map.addEventListener('tap', function(t){
            //var tap1 = map.screenToGeo(t.currentPointer.viewportX, t.currentPointer.viewportY);
            if (t.target instanceof H.map.Marker) {
                var position = t.target.getGeometry(), data = t.target.getData()

                 var bubble = new H.ui.InfoBubble(position, {
                        content: data
                        //'<b>Posicion de '+nombreUser+'</b>'
                    });
                // agregar la burbuja al mapa
                ui.addBubble(bubble);
                bubble.open();
            }
        });
        window.addEventListener('resize', () => map.getViewPort().resize());

    $$('#btn1ad').on('click', function(){setTitleBar(this)});
    $$('#btn2ad').on('click', function(){setTitleBar(this)});
    $$('#btn3ad').on('click', function(){setTitleBar(this)});

    commerceCol.get().then((querys)=>{
        querys.forEach((docos)=>{
            var idN = docos.data().nombre;
            $$('#tab-p').append(`
                <div class="block block-strong" id="delbtn_`+idN+`">
                <div class="cien row">
                    <div class="col-50">
                        <p>Nombre: `+idN+`</p>
                    </div>
                    <div class="col-50">
                        <p>Direc: `+docos.data().direccion+`</p>
                    </div>
                    <div class="no-margin col-100"> 
                        <p class="no-margin">Dueño: `+docos.id+`</p>
                    </div>
                    <button class="button button-small button-fill color-red" id="`+idN+`" emailC="`+docos.id+`">Baja</button>
                </div>
                </div>`);
            $$('#'+idN).on('click',()=>{
                var emailC = $$('#'+idN).attr('emailC');
                app.dialog.confirm('Presione OK para borrar.', function(){
                    commerceCol.doc(emailC).delete()
                    .then(() => {
                        console.log("Borrando documento...");
                        console.log("Eliminando vista del local...");
                        $$('#delbtn_'+idN).remove();
                        mainView.router.navigate('/searchAd/', {reloadCurrent: true});
                        userCol.doc(emailC).update({Cuenta: 'usuario'})
                        .then(()=>{
                            console.log('actualizando usuario...');
                        })
                        .catch((errorU) => {
                            console.error("Error actualizando usuario", errorU);
                        });
                    }).catch((error) => {
                        console.error("Error borrando el documento: ", error);
                    });
                });
            });
        })
    })

})

$$(document).on('page:init', '.page[data-name="searchComer"]', function (e) {
    latMark = [];
    lonMark = [];
    nomMark = [];
    tipMark = [];
    dirMark = [];
    horMark = [];
    var ArrayLocalesD = [];

    console.log('search comercio');
    //obtener datos del usuario y mostrar nombre y apellido de la DB
    userCol.doc(email).get()
    .then((docRe) => {
        console.log(docRe.data());
        $$('#mName').text(docRe.data().Nombre +' '+ docRe.data().Apellido);
    })
    .catch((error) => {
        console.log('error '+error);
    })

    commerceCol.doc(email).get()
    .then((comercio) => {
        $$('#nomCom').val(comercio.data().nombre);
        var name = comercio.data().nombre;
        $$('#dirCom').val(comercio.data().direccion);
        $$('#hsCom').val(comercio.data().horario);
        $$('#tipCom').val(comercio.data().tipo);
        $$('#btnElm').append(`
            <button class="button button-small button-fill button-round color-red" id="btn_`+name+`" emailC="`+comercio.id+`">eliminar mi negocio</button>`);
        $$('#btn_'+name).on('click',()=>{
            var TheId = $$('#btn_'+name).attr('emailC');
            console.log(TheId);
            app.dialog.confirm('¿Está seguro que desea quitar su negocio?', ()=>{   
                commerceCol.doc(TheId).delete()
                .then(() => {
                    console.log("Negocio borrado!");
                    userCol.doc(TheId).update({Cuenta: 'usuario'})
                    .then(()=>{
                        console.log('actualizando usuario...');
                        mainView.router.navigate('/search/');
                    })
                    .catch((errorU) => {
                        console.error("Error actualizando usuario", errorU);
                    });
                })
                .catch((error) => {
                    console.error("Error al borrar negocio!", error);
                });
            });
        });
    });

    commerceCol.get()
    .then((querysnapp)=>{
        querysnapp.forEach((docI)=>{
            var idL = docI.id;
            var nombreL = docI.data().nombre;
            var direcL = docI.data().direccion;
            var horaL = docI.data().horario;
            $$('#cargaLocalesCo').append(`
                <div class="block block-strong row">
                    <div class="col-45">
                        <p>`+nombreL+`</p>
                        <p>`+direcL+`</p>
                    </div>
                    <div class="col-45">
                        <p>`+horaL+`hs</p>
                        <span class="abierto">Abierto</span>
                    </div>
                    <div class="col-20">
                        <button class="heF text-align-center icon material-icons button button-small" id="`+nombreL+`" guardar="`+idL+`">
                        bookmark_border</button>
                    </div>
                </div>`);

            $$('#'+nombreL).on('click', ()=>{
                var sv = $$('#'+nombreL).attr('guardar');
                console.log(sv);
                if ($$('#'+nombreL).text() == 'bookmark_border') {
                    $$('#'+nombreL).text('bookmark');
                    ArrayLocalesD.push(sv);
                    datos = { LocalesGuardados: ArrayLocalesD };
                    saveCol.doc(email).set(datos);
                    console.log('Local guardado')

                    $$('#cont-guardadosCo').append(`
                        <div class="Mostrador row" id="DBtn_`+nombreL+`">
                            <div class="col-50">
                                <p>Nombre: <b>`+nombreL+`</b></p>
                                <p>Direc.: <b>`+direcL+`</b></p>
                            </div>
                            <div class="col-50">
                                <p>Horario: <b>`+horaL+`hs</b></p>
                                <span class="abierto">Abierto</span>
                            </div>
                        </div>
                        `);

                } else {
                    $$('#'+nombreL).text('bookmark_border');
                    for (var i = 0; i < ArrayLocalesD.length; i++) {
                        if (ArrayLocalesD[i] === sv) {
                          ArrayLocalesD.splice(i, 1);
                          //i--;
                          console.log(ArrayLocalesD.length);
                        }
                    }
                    saveCol.doc(email).update({ LocalesGuardados: ArrayLocalesD })
                    .then(() => {
                        console.log("Local desguardado");
                        $$('#DBtn_'+nombreL).remove();
                    })
                    .catch((error) => {
                        console.error("Error updating document: ", error);
                    });
                }
            })

        });
    });

    var iconLocal = new H.map.Icon('img/comerce.png');
    var icon = new H.map.Icon('img/alf.png');
    var defaultLayers = platform.createDefaultLayers();

    // observador de posición
    // var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

    // Crear y mostrar mapa:
    map = new H.Map(document.getElementById('mapContainerCo'),
        defaultLayers.vector.normal.map,
        {
        zoom: 14,
        center: { lat: latitud, lng: longitud }
        });
        
        coords = {lat: latitud, lng: longitud};
        markerP = new H.map.Marker(coords, {icon: icon});

        userCol.doc(email).get()
        .then((docRe) => {
            nombreUser = docRe.data().Nombre;
            markerP.setData('<b>Posicion de '+nombreUser+'</b>');
        })
        .catch((error) => {
            console.log('error '+error);
        })
        // Add the marker to the map and center the map at the location of the marker:
        map.addObject(markerP);
        map.setCenter(coords);

        //desplazamiento
        behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        //interfaz
        ui = H.ui.UI.createDefault(map, defaultLayers, 'es-ES');
        ui.getControl('mapsettings').setDisabled(true);

        var circle1 = new H.map.Circle(
            new H.geo.Point(latitud, longitud), //center
            600, // Radius in meters
            { style: {
                fillColor: 'rgba(106, 90, 205, 0.3)',
                lineWidth: 3,
                strokeColor: 'rgba(110, 0, 255, 1)'
            } }
        );
        circle1.setData('Circle1');
        map.addObject(circle1);

        distanciaCirculo(latitud, longitud, -32.979020, -60.669609);

        function MARCADORES(map) {
            commerceCol.get()
            .then((com) => {
                com.forEach((doc) => {
                    console.log(doc.data().nombre);
                    nomDoc = doc.data().nombre;
                    tipDoc = doc.data().tipo;
                    dirDoc = doc.data().direccion;
                    horDoc = doc.data().horario;
                    lata = doc.data().latitud;
                    longa= doc.data().longitud;
                    arrayPushea(lata, longa);
                    documentPushea(nomDoc, tipDoc, dirDoc, horDoc);
                });
                console.log('el largo del array de latMark => ', latMark.length);
                console.log('el largo del array de nomMark => ', nomMark.length);
                for (i=0; i < latMark.length; i++) {
                    
                    console.log("posicion: ",i," latMark ", latMark[i], " lonMark ", lonMark[i]);
                    marker = new H.map.Marker({lat: latMark[i], lng: lonMark[i]}, {icon: iconLocal});
                    distanciaLegal(latMark[i], lonMark[i]);
                    marker.setData('<b>Tienda: </b>'+nomMark[i]+'<br/><b>Tipo: </b>'+tipMark[i]+'<br/><b>Direccion: </b>'+dirMark[i]+'<br/><b>Horario: </b>'+horMark[i]);
                }
            });
        }
        MARCADORES(map);

        //burbuja al tocar el marcador
        map.addEventListener('tap', function(t){
            //var tap1 = map.screenToGeo(t.currentPointer.viewportX, t.currentPointer.viewportY);
            if (t.target instanceof H.map.Marker) {
                var position = t.target.getGeometry(), data = t.target.getData()
                 var bubble = new H.ui.InfoBubble(position, {
                        content: data
                        //'<b>Posicion de '+nombreUser+'</b>'
                    });
                // agregar la burbuja al mapa
                ui.addBubble(bubble);
                bubble.open();
            }
        });
        window.addEventListener('resize', () => map.getViewPort().resize());

    $$('#btn1co').on('click', function(){setTitleBar(this)});
    $$('#btn2co').on('click', function(){setTitleBar(this)});
    $$('#btn3co').on('click', function(){setTitleBar(this)});

    $$('#status').on('click', function(){
        if (this.checked) {
          console.log('chequeado');
          $$('#statusST').text('Abierto').removeClass('cerrado').addClass('abierto');
        } else {
            console.log('no chequeado');
            $$('#statusST').text('Cerrado').removeClass('abierto').addClass('cerrado');
        }
    });
})

/*Page init de Inicio de sesion*/
$$(document).on('page:init', '.page[data-name="index"]', function (e) {
    
    console.log('index');

    $$('#logBtn').on('click', LogIn);
    $$('#RegisBtn').on('click', ()=>{
        mainView.router.navigate('/register/');
    })

    onSuccess = function(position) {
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;
        console.log(latitud);
        console.log(longitud);
    };

    onError = function(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
 
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    
})

/*Page init de Registro*/
$$(document).on('page:init', '.page[data-name="register"]', function (e) {
    console.log('register');
    $$('#backBtn').on('click', ()=>{
        app.dialog.confirm('¿Quieres cancelar el registro?',()=>{
            mainView.router.navigate('/index/');
        });
    })

    $$('#btnRegistrar').on('click', SignIn);
})

/* --- FUNCIONES --- */

/*Radio del circulo*/
distanciaCirculo = (lat1, lon1, lat2, lon2) => {
    let ubi1 = new google.maps.LatLng(lat1, lon1);
    let ubi2 = new google.maps.LatLng(lat2, lon2)
    distMax = google.maps.geometry.spherical.computeDistanceBetween(ubi1, ubi2);
    distMax = distMax.toFixed(0);
    console.log(distMax + ' metros del origen al final del circulo');
    return (distMax)
}

/*Calcular si el local esta dentro del radio*/
distanciaLegal = (lati, long) => {
    let ubi1 = new google.maps.LatLng(lati, long);
    let ubi2 = new google.maps.LatLng(latitud, longitud)
    distDelLocal = google.maps.geometry.spherical.computeDistanceBetween(ubi1, ubi2);
    if (distDelLocal<distMax) {
        console.log('maxima: '+distMax+' la del local: '+distDelLocal);
        console.log('Dentro del rango')
        map.addObject(marker);
    } else {
        console.log('maxima: '+distMax+' la del local: '+distDelLocal);
        console.log('Fuera de rango');
    }
}

/*Array de datos del local*/
documentPushea = (nom, tip, dir, hor) => {
    nomMark.push(nom);
    tipMark.push(tip);
    dirMark.push(dir);
    horMark.push(hor);
}

/*Array de latitudes y longitudes*/
arrayPushea = (lt, lg) => {
    latMark.push(lt);
    lonMark.push(lg);
}

/*Setear titulo navbar*/
 setTitleBar = (d) => {
    bID = d.id
    switch (bID) {
        case 'btn1': $$('#titleBar').html('Buscar negocios');
        break
        case 'btn2': $$('#titleBar').html('Registrar negocio');
        break
        case 'btn3': $$('#titleBar').html('Negocios guardados');
        break
        case 'btn1co': $$('#titleBarCo').html('Buscar negocios');
        break
        case 'btn2co': $$('#titleBarCo').html('Mi negocio');
        break
        case 'btn3co': $$('#titleBarCo').html('Negocios guardados');
        break
        case 'btn1ad': $$('#titleBarAd').html('Buscar negocios');
        break
        case 'btn2ad': $$('#titleBarAd').html('Administrar negocios');
        break
        case 'btn3ad': $$('#titleBarAd').html('Negocios guardados');
        break
    }
}

/*Cerrar sesión*/
 logOut = () => {
    var user = firebase.auth().currentUser;
    if (user) {
        app.dialog.confirm('¿Desea cerrar sesión?', function(){

            firebase.auth().signOut()
            .then(() => {
                console.log('Cerrar sesión');
                mainView.router.navigate('/index/');
                $$('#mName').text('');
                app.panel.close('.panel');
            })
            .catch((error) => {
                console.log('error '+error);
            });
        });
    } else {
      console.log('Ya cerre sesion');
    }
}

/*Sesion actual check*/
 sesionCheck = () => {
    var user = firebase.auth().currentUser;

    if (user) {
      console.log('Sesion actual '+user.email);
    } else {
      console.log('no inicio sesion');
    }
}

/*Registrar negocio*/
 LocalReg = () => {

    app.dialog.confirm("Si los datos son correctos presione OK", "Verifique sus datos", function(){

        nLocal = $$('#nameLocal').val();
        dLocal = $$('#dirLocal').val();
        hLocal = $$('#hDesde').val();
        hLocal+= ' - '
        hLocal+= $$('#hHasta').val();
        tLocal = $$('#tipoLocal').val();
        eLocal = $$('#emailLocal').val();
        if (dLocal != "") {
           var linka = 'https://geocoder.ls.hereapi.com/6.2/geocode.json';
            app.request.json(linka, {
                searchtext: dLocal+', Rosario, Santa Fe',
                apiKey: 'a5WyBGHmz8PggN7Ys6vvPWbTiiyAciHQROYMPYRHWPQ',
                gen: '9'
            }, 
            function (data) {
             // hacer algo con data
             localLat = data.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
             localLng = data.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
             console.log(localLat);
             console.log(localLng);
             GoCommer();
            }, 
            function(xhr, status) { console.log("error geo: "+status); } );
        }

        function GoCommer(){

            if (nLocal != "" && dLocal != "" && hLocal != "" && tLocal != "" && eLocal == email) {
            dataLocal = { nombre: nLocal, direccion: dLocal, horario: hLocal, tipo: tLocal, latitud: localLat, longitud: localLng, estado: 'Abierto' }
            commerceCol.doc(eLocal).set(dataLocal)
                .then(() => { 
                    app.dialog.alert('Local registrado correctamente'); 
                    userCol.doc(eLocal).update({ Cuenta: "comercio" })
                        .then(() => {
                            console.log("Usuario actualizado (Cuenta)");
                            mainView.router.navigate('/searchCo/');
                        })
                        .catch((error) => {
                            console.error("Error al ACTUALIZAR documento: ", error);
                        });
                })
                .catch((error) => {
                    console.error("Error al CREAR DOCUMENTO del LOCAL: ", error);
                })
            console.log('IF correctamente');
            } else if (eLocal != email){
                app.dialog.alert('Revisa tu email.');
                console.log('ELSE email correctamente');
            }  else {
                app.dialog.alert('Compe los campos faltantes');
            }
        }
    })
}

/*Registro de usuario*/
 SignIn = () => {
     nombre=$$('#regisNom').val();
     apellido=$$('#regisApe').val();
     email=$$('#regisEmail').val();
     password=$$('#regisPass').val();

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((user) => {

        var data = { Nombre: nombre, Apellido: apellido, Cuenta: 'usuario' };
        userCol.doc(email).set(data);
        app.dialog.alert('Usuario creado con éxito!'+'<br/>Bienvenido '+nombre,()=>{
            mainView.router.navigate('/search/');

        });

      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        app.dialog.alert('Falló la creación<br/>'+errorCode+'<br/>'+errorMessage);
    });
}

/*Inicio de sesion*/
 LogIn = () => {

    email=$$('#Email').val();
    password=$$('#Pass').val();

    firebase.auth().signInWithEmailAndPassword(email, password)
  .then((user) => {
        userCol.doc(email).get()
        .then((docRe) => {
            tCuenta = docRe.data().Cuenta;
            switch (tCuenta) {
                case 'admin': app.dialog.alert('Inicio de sesión correcto');
                                    setTimeout(function () {
                                        app.dialog.close();
                                        mainView.router.navigate('/searchAd/');
                                    }, 1000);
                break
                case 'usuario': app.dialog.alert('Inicio de sesión correcto');
                                    setTimeout(function () {
                                        app.dialog.close();
                                        mainView.router.navigate('/search/');
                                    }, 1000);
                break
                case 'comercio':app.dialog.alert('Inicio de sesión correcto');
                                    setTimeout(function () {
                                        app.dialog.close();
                                        mainView.router.navigate('/searchCo/');
                                    }, 1000);
                break
            }
        })
        .catch((error) => {
            console.log('error '+error);
        })
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        app.dialog.alert(error.code+'<br/>'+errorMessage);
    });
  
}