import React, { Component } from 'react';
import './App.css';
import axios from 'axios'

class App extends Component {
  constructor(props) {
    super(props);

    // Assign state itself, and a default value for items
    this.state = {
      venues: [],
      markers: [],
      selectedItem: null,

    };

    this.search = this.search.bind(this);
  }


  componentDidMount() {
    this.getVenues();
    this.renderMap();
    this.search();
  }

  componentDidUpdate() {
    if (this.state.selectedItem) {
        //1. find selecter marker object
        let selectedMarker = this.state.markers.find(m => {
            return m.id === this.state.selectedItem;
        });
        this.toggleBounce(selectedMarker);
        setTimeout(function(){selectedMarker.setAnimation(null);}, 4200);
    }
}

  // Function used to animate the list item's corresponding marker and display the information for that venue
  toggleBounce = (marker) => {
        let infoWindow = new window.google.maps.InfoWindow({});
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(window.google.maps.Animation.BOUNCE);
          infoWindow.setContent(marker.contentString)
          infoWindow.open(this.map, marker);
        }
      }

// funciton used to stor the id of the selected list item to cross reference with marker ID's to toggle bounce and text
  showInfo(e, id) {
  let result = this.state.venues.find(myVenue => {
    return myVenue.venue.id === id;
  });
  this.setState({"selectedItem": result.venue.id})
}



// Renders Map, called on componentDidMount
  renderMap() {
      loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDIXFf8P9TFxVbapkE9R2DZmWMjEd-F_qk&callback=initMap")
      window.initMap = this.initMap
  }
// Gets venue objects from foursquare API and store them as an array in the venues state
  getVenues = () => {
    const endPoint = "https://api.foursquare.com/v2/venues/explore?"
    const parameters = {
      client_id: "CE1SYIYZSRNZHJ0XAVOZN0PTNZUYSC3QDLLEBB0BLJEQXVRI",
      client_secret: "4DGOKJZ3KJ20FGGNPMPE0FBZRK3FXMO2EDTKMVF5AR5V3CX3",
      section: "food",
      near: "Porter Square",
      v: "20182507",
      radius: "1000"
    }
    axios.get(endPoint + new URLSearchParams(parameters))
      .then(response => {
        this.setState({
          venues: response.data.response.groups[0].items,
        }, this.renderMap())
      })
      .catch(error => {
        console.log("The Foursquare API has failed to load venues" + error)
      })
  }

// Initializes map, and creates markers for each object in the venues state, and stores the markers as new array in markers state
  initMap = () => {
    let infoWindow = new window.google.maps.InfoWindow({});
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat:42.394212, lng: -71.1250933},
      zoom: 15,
    })
    this.state.venues.map(myVenue => {

      var marker = new window.google.maps.Marker({
          position: {lat:myVenue.venue.location.lat, lng: myVenue.venue.location.lng},
          map: map,
          title: myVenue.venue.name,
          id: myVenue.venue.id,
          animation: null,
          visible: true,
          contentString: `<div id="content">
                <div id="siteNotice">
                </div>
                <h1 id="firstHeading" class="firstHeading">${myVenue.venue.name}</h1>
                <div id="bodyContent">
                  <p class="address">${myVenue.venue.location.address}, ${myVenue.venue.location.city}</p>
                </div>
                </div>`,
          })

      marker.addListener('click', function() {
        infoWindow.setContent(marker.contentString)
        infoWindow.open(this.map, marker);
      });

      // pushes each marker into the marker state array
      this.setState({
        markers: [...this.state.markers, marker]
      })
    })
    // Checks to see if Google maps loaded, and console logs an error if it does/ does not.
    if (typeof google === 'object' && typeof window.google.maps === 'object') {
      console.log("Google Maps loaded successfully")
    } else {
      console.log("Google Maps API not loaded successfully")
    }
  }
  // prevents page from re-loading on pressing enter on form field
  handleQuerySubmit = (event) => {
    event.preventDefault();
  }

   search() {
    // Declare variables
    var input, filter, ul, li, a, i, markerCollection;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('button');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("p")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }

    // maps through markers to show/hide markers that match the search query
    markerCollection = this.state.markers;
    markerCollection.map(marker => {
      if (marker.title.toUpperCase().indexOf(filter) > -1) {
          marker.setVisible(true);
      } else {
          marker.setVisible(false);
      }
    })
}

  render() {
    return (
      <main>
        <div className="list-of-venues">
        <input tabIndex="1" type="text" id="myInput" onKeyUp={this.search} placeholder="Search for bars and restaurants.."></input>
          <div id="myUL">
          {this.state.venues.map((venue) => {
              return (
              <button tabIndex="0" key={venue.venue.id} onClick={e => this.showInfo(e, venue.venue.id)}>
                <p>{venue.venue.name}</p>
              </button>
            )
          })}
          </div>
        </div>
        <div id="map"></div>
      </main>
    )
  }
}

function loadScript(url, err ) {
const index = window.document.getElementsByTagName('script')[0]
const script = window.document.createElement('script')
script.src = url
script.async = true
script.defer = true
index.parentNode.insertBefore(script, index)
}

export default App;
