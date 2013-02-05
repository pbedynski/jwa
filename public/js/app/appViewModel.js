define(
	['jquery','underscore-min','knockout', 'sammy','text!../../data/data.json','domReady!'], 
  function($, _, ko, Sammy, AllData) {

 var _ = this.window._;
 
 var Penthouse  = "Penthouse";
 var Apartment  = "Apartment";
 var House      = "House";
 var Store      = "Store";

 var safeParseJson = function(text) {
    try {
      return JSON.parse(text, function (key, value) {
        var type;
        if (value && typeof value === 'object') {
            type = value.type;
            if (typeof type === 'string' && typeof window[type] === 'function') {
                return new (window[type])(value);
            }
        }
        return value;
        });
    } catch (err) {
      console.log(err);
      return [];
    }
  } 

  var AllDataJSON = safeParseJson(AllData);

  function Item(data){
    this.data = data;
    this.costs = ko.computed(function(){
      return this.data.price + " " + this.data.additional;
    }, this);
    this.toString = function(){
      return "[Item] type: " + data.type + " id: " + data.id; 
    }
  }


  var markerPenthousePath = 'img/markers/penthouse.png';
  var markerApartmentPath = 'img/markers/apartment.png';
  var markerHousePath = 'img/markers/house.png';
  var markerStorePath = 'img/markers/store.png';

  var setMarker = function(item, onMarkerClick){
    this.name = item.data.address;
    this.lat = ko.observable(item.data.lat);
    this.long = ko.observable(item.data.lon);
    // console.log('Set Market: ' + this.lat() + " " + this.long());
    var markerPath;
    if (item.data.type === Apartment) markerPath = markerApartmentPath;
    if (item.data.type === Penthouse) markerPath = markerPenthousePath;
    if (item.data.type === Store) markerPath = markerStorePath;
    if (item.data.type === House) markerPath = markerHousePath;

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.lat(), this.long()),
        title: name,
        map: map,
        draggable: false,
        icon : markerPath
      });
    google.maps.event.addListener(marker, 'click', onMarkerClick);
    item.marker = marker;
  }

var map = new google.maps.Map(document.getElementById("map_canvas"),{
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: new google.maps.LatLng(52, 20)
});

	return function appViewModel() {
    
    var self = this;
    //localize
    window.locale = 'pl';   

    self.locale = ko.observable('pl');
    self.setLanguagePl = function(){self.setLanguage('pl')}
    self.setLanguageEn = function(){self.setLanguage('en')}
    self.setLanguage = function(language) {
      // console.log('Set language' + language);
      window.locale = language;
      self.locale(language);
    }

    self.showModal = function(){
      $('#modalUla').modal('toggle');
    }

    self.hideModal = function() {
      $('#modalUla').modal('hide');
    }

    self.info = AllDataJSON.info;
    self.objects = ko.observableArray([]);


    self.onMarkerClick = function(item) {
      return function(){
        console.log('marker clicked: ' + item);
        self.goToItem(item); 
        item.marker.setAnimation(google.maps.Animation.BOUNCE)
      }
    }

    //analyze data
    _.each(AllDataJSON.objects, function(object){
      var item = new Item(object);
      self.objects().push(item);
      setMarker(item, self.onMarkerClick(item));
    });
    console.log('objects ' + self.objects().length);

    self.Apartments = ko.computed(function() {
      return _.filter(self.objects(), function(object){return object.data.type === Apartment});
    },true);

    self.Penthouses = ko.computed(function() {
      return _.filter(self.objects(), function(object){return object.data.type === Penthouse});
    },true);

    self.Stores = ko.computed(function() {
      return _.filter(self.objects(), function(object){return object.data.type === Store});
    },true);

    self.Houses = ko.computed(function() {
      return _.filter(self.objects(), function(object){return object.data.type === House})
    },true);

    // Gallery

    var instance;
    // Helper
    self.applyGallery = function(element){
      //TODO: after render is called for each element .. here is should only be called once

      var PhotoSwipe = window.Code.PhotoSwipe;
      var options =  {  getImageMetaData: function(el){ return { relatedUrl: el.getAttribute('related_url') }}}
      if (instance != undefined) PhotoSwipe.detatch(instance);
      instance = PhotoSwipe.attach( window.document.querySelectorAll('#Gallery a'), options );
          
      // instance.addEventHandler(PhotoSwipe.EventTypes.onTouch, function(e){
      //   if (e.action === 'tap'){
      //     var currentImage = instance.getCurrentImage();
      //     window.open(currentImage.metaData.relatedUrl);
      //   }
      // });  


    }

    self.elementDisplayed = ko.observable(0);
    self.shouldShowElement = function(all, index){
      return parseInt(index) === (self.elementDisplayed() % all);
    }

    var interval = 7000; //5 seconds
    window.setInterval(function(){
      self.elementDisplayed((self.elementDisplayed()+1)%100);
    }, interval);


    // Navigation

    self.chosenFolderId = ko.observable();
    self.chosenItemData = ko.observable();
  
   self.isTemplateFolder = function(folder) {
       return   folder === Apartment || 
                folder === Penthouse || 
                folder === House || 
                folder === Store;
    }

    self.foldersToShow = [Apartment, Penthouse, House , Store];
    
    self.isCurrentlyTemplateFolder = ko.computed(function(){
      return self.isTemplateFolder(self.chosenFolderId());  
    }, this);

    self.isHomeFolder = ko.computed(function(){
        return self.chosenFolderId() === 'Home';
    },this)

    self.isDetails = ko.computed(function(){
        return self.chosenItemData() != null;
    },this)

    self.shouldDisplayRightPanel = ko.computed(function(){
       return self.chosenFolderId() === 'Home' || self.isTemplateFolder(self.chosenFolderId());
    },this);

    self.templateFolderInfo = ko.computed(function(){
      if (! self.isCurrentlyTemplateFolder()) return null;
      if (self.chosenFolderId() === Apartment) return self.info.Apartment; 
      if (self.chosenFolderId() === Penthouse)  return self.info.Penthouse;
      if (self.chosenFolderId() === House)  return self.info.House;
      if (self.chosenFolderId() === Store)  return self.info.Store;
      return null;
    },this);
    self.templateFolderData = ko.computed(function(){
      if (! self.isCurrentlyTemplateFolder()) return null;
      if (self.chosenFolderId() === Apartment) return self.Apartments; 
      if (self.chosenFolderId() === Penthouse)  return self.Penthouses;
      if (self.chosenFolderId() === House)  return self.Houses;
      if (self.chosenFolderId() === Store)  return self.Stores;
      return null;
    },this);

    // Behaviours    
    self.goToFolder = function(folder) { 
      location.hash = folder;
    };
    
    self.goToItem = function(item) {
      console.log('goto item: ' + item.toString());
      location.hash = item.data.type + '/' + item.data.id; 
    }

    self.getItemByIdAndType = function(id, type){
      var id = parseInt(id);
      console.log('looking for ' + type + " id: " + id);
      if (type === Apartment) return _.find(self.Apartments(), function(item){return item.data.id === id}); 
      if (type === Penthouse) return _.find(self.Penthouses(), function(item){return item.data.id === id});
      if (type === House) return _.find(self.Houses(), function(item){return item.data.id === id});
      if (type === Store) return _.find(self.Stores(), function(item){return item.data.id === id});
      return null;
    }
      // Client-side routes    
    Sammy(function() {
        this.get('#:folder', function() {
          self.chosenFolderId(this.params.folder);
          self.chosenItemData(null);
          // $.get("/", { folder: this.params.folder }, self.chosenFolderId);
        });

        this.get('#:folder/:itemid', function() {
          self.chosenFolderId(this.params.folder);
          self.chosenItemData(self.getItemByIdAndType(this.params.itemid, this.params.folder));
          var item = self.chosenItemData();
          
          map.setCenter(item.marker.position);
          item.marker.setAnimation(google.maps.Animation.BOUNCE);
          // window.setTimeout(function(){item.marker.setAnimation(null)}, 10000);
          // self.marker.setPosition(item.mapcenter);
          // $.get("/", { itemid: this.params.itemid }, self.chosenItemData);
        });
    
        this.get('', function() { this.app.runRoute('get', '#Home') });
    }).run();   
	} 
});

