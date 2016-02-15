var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(18.4805261,-70.0169394)
};

window.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

/* Collection of points of interests */
var pointsOfInterest = [
  {
    name: 'GALERIA 360',
    lat: 18.4809331,
    lng: -69.9680159,
    url: ''
    },
    {
    name: 'BELLAS ARTES',
    lat: 18.4680062,
    lng: -69.9043372,
    url: ''
    },
    {
    name: 'JARDIN BOTANICO',
    lat: 18.4941898,
    lng: -69.9607407,
    url: ''
    },
    {
    name: 'UASD',
    lat: 18.4951925,
    lng: -69.9239931,
    url: ''
    },
    {
    name: 'TEATRO NACIONAL',
    lat: 18.4708131,
    lng: -69.9130207,
    url: ''
    },
    {
    name: 'ZOODOM',
    lat: 18.5096472,
    lng: -69.9289337,
    url: ''
    },
    {
    name: 'CATEDRAL PRIMADA DE AMERICA',
    lat: 18.4722577,
    lng:  -69.8855819,
    url: ''
    }
];

/* Create InfoBox Singleton for one InfoBox displayed only */
var infoBox = new InfoBox({
    content: "",
    disableAutoPan: false,
    maxWidth: 150,
    pixelOffset: new google.maps.Size(-140, 0),
    zIndex: null,
    boxStyle: {
    background: "url('images/tipbox.gif') no-repeat",
    opacity: 1,
    width: "300px"
    },
    closeBoxMargin: "12px 4px 2px 2px",
    closeBoxURL: "images/close.gif",
    infoBoxClearance: new google.maps.Size(1, 1)
});

/* Data model holding all the info for specific attraction */
var Pin = function Pin(map, name, lat, lng, infobox) {
    var self = this;

    self.name = ko.observable(name);
    self.lat = ko.observable(lat);
    self.lng = ko.observable(lng);
    self.url =  "";
    self.wikipediaContent =ko.observable('<div class="infobox">' +
                                        "Loading Wikipedia...Working hard!" +
                                        '</class>');

    self.marker = new google.maps.Marker({
                        position: new google.maps.LatLng(lat, lng),
                        title: name,
                        map:map
    });

    self.clickOnListItem = function () {
        infoBox.close();
        infoBox.setContent(self.wikipediaContent());
        infoBox.open(map, self.marker);
    };

    google.maps.event.addListener(self.marker, 'click', function() {
        infoBox.close();
        infoBox.setContent(self.wikipediaContent());
        infoBox.open(map, self.marker);
        });
};

/* viewModel tying together all the actions and data */
var viewModel = function (attractions) {
    var self = this;
    self.pins = ko.observableArray([]);

    /* Display markers for each attraction and bound the markers on map */
    var bounds = new google.maps.LatLngBounds();

    attractions.forEach(function(point) {
        self.pins.push(new Pin(window.map, point.name, point.lat, point.lng));
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });

    map.fitBounds(bounds);

    /* Binding function for search */
    self.searchStr = ko.observable("");
    self.searchStr.subscribe(function(newVal) {
        if (newVal || newVal ==="") {
        self.pins().forEach(function(p) {
                p.marker.setVisible(true);
            });
        return "";
        }
        return searchStr;
    });

    self.searchFun = function () {
        infoBox.close(); // remove the infobox before search
        self.pins().forEach(function(p) {
            if (p.name().toLowerCase().indexOf(self.searchStr().toLowerCase()) >= 0) {
            p.marker.setVisible(true);
        } else {
            p.marker.setVisible(false);
        }
        });
    };

    /* Loading wikipedia infomation for attraction */
    self.loadWikipedia = (function () {
        self.pins().forEach(function(p) {
            var wikipediaUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + p.name() + '&format=json&callback=wikiCallback';
            var wikiRequestTimeout = setTimeout(function () {
            }, 8000);

            $.ajax({
                url: wikipediaUrl,
                dataType: "jsonp",
                success: function(response) {
                    p.wikipediaContent('<div class="infobox">' +
                                        response[2][0] +
                                        '</class>');
                    p.url = response[3][0];
                    clearTimeout(wikiRequestTimeout);
                },
                /* Error loading the content, set the error message per pin/marker */
                error: function(jqXHR, textStatus, errorThrown ) {
                    p.wikipediaContent('<div class="infobox">' +
                                        "Error Loading Wikipedia, reload the page when network is available" +
                                        '</class>');
                    clearTimeout(wikiRequestTimeout);
                }
            });
        });
    }());
};

ko.applyBindings(new viewModel(pointsOfInterest));