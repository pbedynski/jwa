define(
	['jquery','underscore-min','knockout', 'sammy','text!../../data/data.json', 'domReady!'], 
  function($, _, ko, Sammy, AllData) {

 var _ = this.window._;

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

  function Item(data, type){
    this.data = data;
    this.costs = ko.computed(function(){
      return this.data.price + " " + this.data.additional;
    }, this);
    this.type = type;
  }


	return function appViewModel() {
    
    var self = this;


  console.log('gmaps');
  // console.log(gmaps);
   var mapOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        console.log(document.getElementById("map_canvas"));
      var map = new google.maps.Map(document.getElementById("map_canvas"),
            mapOptions);


    // Data
    self.apartmentsInfo = AllDataJSON.apartments_info;
    self.apartments = ko.observableArray([]);
    self.penthousesInfo = AllDataJSON.penthouses_info;
    self.penthouses = ko.observableArray([]);
    self.housesInfo = AllDataJSON.houses_info;
    self.houses = ko.observableArray([]);
    self.storesInfo = AllDataJSON.stores_info;
    self.stores = ko.observableArray([]);

    //analyze data

    _.each(AllDataJSON.apartments, function(apartment){
      self.apartments().push(new Item(apartment, 'Apartments'));
    })
    _.each(AllDataJSON.penthouses, function(penthouse){
      self.penthouses().push(new Item(penthouse, 'Penthouses'));
    })
    _.each(AllDataJSON.houses, function(house){
      self.house().push(new Item(house, 'Houses'));
    })
    _.each(AllDataJSON.stores, function(store){
      self.stores().push(new Item(store,"Stores"));
    })

    var instance;
    // Helper
    self.applyGallery = function(element){
      //TODO: after render is called for each element .. here is should only be called once
      console.log('apply gallery: ' + element);
      console.log('gallery len ' +$('#Gallery a').length);

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
       return   folder === "Apartments" || 
                folder === "Penthouses" || 
                folder === "Houses" || 
                folder === "Stores";
    }

    self.foldersToShow = ['Apartments', 'Penthouses', 'Houses','Stores'];
    
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
      if (self.chosenFolderId() === 'Apartments') return self.apartmentsInfo; 
      if (self.chosenFolderId() === 'Penthouses')  return self.penthousesInfo;
      if (self.chosenFolderId() === 'Houses')  return self.housesInfo;
      if (self.chosenFolderId() === 'Stores')  return self.storesInfo;
      return null;
    },this);
    self.templateFolderData = ko.computed(function(){
      if (! self.isCurrentlyTemplateFolder()) return null;
      if (self.chosenFolderId() === 'Apartments') return self.apartments; 
      if (self.chosenFolderId() === 'Penthouses')  return self.penthouses;
      if (self.chosenFolderId() === 'Houses')  return self.houses;
      if (self.chosenFolderId() === 'Stores')  return self.stores;
      return null;
    },this);

    // Behaviours    
    self.goToFolder = function(folder) { 
      location.hash = folder;
    };

    
    self.goToItem = function(item) {
      console.log('goto item: ' + item);
      location.hash = item.type + '/' + item.data.id; 
    }

    self.getItemByIdAndType = function(id, type){
      var id = parseInt(id);
      console.log('looking for ' + type + " id: " + id);
      if (type ==='Apartments') return _.find(self.apartments(), function(item){return item.data.id === id}); 
      if (type ==='Penthouses') return _.find(self.penthouses(), function(item){return item.data.id === id});
      if (type ==='Houses') return _.find(self.houses(), function(item){return item.data.id === id});
      if (type ==='Stores') return _.find(self.stores(), function(item){return item.data.id === id});
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
          console.log(self.chosenItemData());
          // $.get("/", { itemid: this.params.itemid }, self.chosenItemData);
        });
    
        this.get('', function() { this.app.runRoute('get', '#Home') });
    }).run();   
	} 
});