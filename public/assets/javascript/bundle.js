"use strict";
//API :AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM

var AutocompleteManager = function ($) {
  //Initialization...

  var API_KEY = "AIzaSyBujKTRw5uIXp_NHZgjYVDtBy1dbyNuGEM";

  return function (target) {

    var targetItem = typeof target == "string" ? document.querySelector(target) : target;
    var queryMgr = QueryManager();
    var geocoder = new google.maps.Geocoder();

    $(targetItem).typeahead({
      hint: true,
      highlight: true,
      minLength: 4,
      classNames: {
        menu: 'tt-dropdown-menu'
      }
    }, {
      name: 'search-results',
      display: function display(item) {
        return item.formatted_address;
      },
      limit: 10,
      source: function source(q, sync, async) {
        geocoder.geocode({ address: q }, function (results, status) {
          async(results);
        });
      }
    }).on('typeahead:selected', function (obj, datum) {
      if (datum) {
        var geometry = datum.geometry;
        queryMgr.updateLocation(geometry.location.lat(), geometry.location.lng());
        //  map.fitBounds(geometry.bounds? geometry.bounds : geometry.viewport);
      }
    });

    return {
      $target: $(targetItem),
      target: targetItem
    };
  };
}(jQuery);

var initializeAutocompleteCallback = function initializeAutocompleteCallback() {
  //console.log(("Autocomplete has been initialized"));
  //console.log((AutocompleteManager("input[name='search-location']")););
};
"use strict";

/* This loads and manages the list! */

var ListManager = function ($) {
  return function () {
    var targetList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "#events-list";

    var $target = typeof targetList === 'string' ? $(targetList) : targetList;

    var renderEvent = function renderEvent(item) {

      var date = moment(item.start_datetime).format("dddd • MMM DD h:mma");
      return "\n      <li class='" + item.event_type + "' data-lat='" + item.lat + "' data-lng='" + item.lng + "'>\n        <div class=\"type-event\">\n          <ul class=\"event-types-list\">\n            <li>" + item.event_type + "</li>\n          </ul>\n          <h2><a href=\"" + item.url + "\">" + item.title + "</a></h2>\n          <h4>" + date + "</h4>\n          <div class=\"address-area\">\n            <p>" + item.venue + "</p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + item.url + "\" class=\"btn btn-primary\">RSVP</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    var renderGroup = function renderGroup(item) {

      return "\n      <li>\n        <div class=\"type-group\">\n          <h2><a href=\"/\">" + (item.title || "Group") + "</a></h2>\n          <div class=\"group-details-area\">\n            <p>Colorado, USA</p>\n            <p>" + (item.details || "350 Colorado is working locally to help build the global\n               350.org movement to solve the climate crisis and transition\n               to a clean, renewable energy future.") + "\n            </p>\n          </div>\n          <div class=\"call-to-action\">\n            <a href=\"" + item.url + "\" class=\"btn btn-primary\">Get Involved</a>\n          </div>\n        </div>\n      </li>\n      ";
    };

    return {
      $list: $target,
      updateFilter: function updateFilter(p) {
        if (!p) return;

        // Remove Filters
        //console.log(("ENTERED!"););
        $target.removeProp("class");
        $target.addClass(p.filter.join(" "));
      },
      populateList: function populateList() {
        //using window.EVENT_DATA
        //console.log(("Populating --> ", window.EVENTS_DATA));
        var $eventList = window.EVENTS_DATA.map(function (item) {
          return item.event_type !== 'Group' ? renderEvent(item) : renderGroup(item);
        });
        $target.find('ul li').remove();
        $target.find('ul').append($eventList);
      }
    };
  };
}(jQuery);
'use strict';

var MapManager = function ($) {
  return function () {
    var map = L.map('map').setView([34.88593094075317, 5.097656250000001], 2);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors • <a href="//350.org">350.org</a>'
    }).addTo(map);

    return {
      $map: map,
      setCenter: function setCenter() {
        var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [34.88593094075317, 5.097656250000001];
        var zoom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        //console.log(("XXX"););
        map.setView(center, zoom);
      },
      update: function update(p) {
        if (!p || !p.lat || !p.lng) return;
        //console.log(("TTT", p););
        map.setView(L.latLng(p.lat, p.lng), 10);
      }
    };
  };
}(jQuery);
'use strict';

var QueryManager = function ($) {
  return function () {
    var targetForm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "form#filters-form";

    var $target = typeof targetForm === 'string' ? $(targetForm) : targetForm;
    var lat = null;
    var lng = null;

    $target.on('submit', function (e) {
      e.preventDefault();
      lat = $target.find("input[name=lat]").val();
      lng = $target.find("input[name=lng]").val();

      var form = $.deparam($target.serialize());
      delete form['search-location'];

      window.location.hash = $.param(form);
    });

    $(document).on('change', '.filter-item input[type=checkbox]', function () {
      $target.trigger('submit');
    });

    return {
      initialize: function initialize(callback) {
        if (window.location.hash.length > 0) {
          var params = $.deparam(window.location.hash.substring(1));
          $target.find("input[name=lat]").val(params.lat);
          $target.find("input[name=lng]").val(params.lng);

          if (params.filter) {
            $target.find(".filter-item input[type=checkbox]").removeProp("checked");
            params.filter.forEach(function (item) {
              //console.log((".filter-item input[type=checkbox][value=" + item + "]"););
              $target.find(".filter-item input[type=checkbox][value='" + item + "']").prop("checked", true);
            });
          }
        }

        if (callback && typeof callback === 'function') {
          callback();
        }
      },
      getParameters: function getParameters() {
        var parameters = $.deparam($target.serialize());
        delete parameters['search-location'];

        return parameters;
      },
      updateLocation: function updateLocation(lat, lng) {
        $target.find("input[name=lat]").val(lat);
        $target.find("input[name=lng]").val(lng);
        $target.trigger('submit');
      },
      triggerSubmit: function triggerSubmit() {
        $target.trigger('submit');
      }
    };
  };
}(jQuery);
'use strict';

(function ($) {

  // 1. google maps geocode

  // 2. focus map on geocode (via lat/lng)
  var queryManager = QueryManager();
  queryManager.initialize();

  var initParams = queryManager.getParameters();
  var mapManager = MapManager();

  var listManager = ListManager();

  if (initParams.lat && initParams.lng) {
    mapManager.setCenter([initParams.lat, initParams.lng]);
  }

  // This will trigger the list update method
  $(document).on('trigger-list-update', function (event, options) {
    listManager.populateList();
  });

  $(document).on('trigger-list-filter-update', function (event, options) {
    //console.log(("XXXX"););
    listManager.updateFilter(options);
  });

  $(document).on('trigger-map-update', function (event, options) {
    mapManager.setCenter([options.lat, options.lng]);
  });

  $(window).on("hashchange", function () {
    var hash = window.location.hash;
    if (hash.length == 0) return;
    var parameters = $.deparam(hash.substring(1));

    $(document).trigger('trigger-list-filter-update', parameters);
    $(document).trigger('trigger-map-update', parameters);
  });

  // 3. markers on map

  // 4. filter out items in activity-area

  // 5. get map elements

  // 6. get Group data

  // 7. present group elements

  $.ajax({
    url: 'https://dnb6leangx6dc.cloudfront.net/output/350org.js.gz', //'|**DATA_SOURCE**|',
    dataType: 'script',
    cache: true,
    success: function success(data) {
      //console.log((window.EVENT_DATA));
      $(document).trigger('trigger-list-update');
      $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
      // $(document).trigger('trigger-map-update');
    }
  });

  setTimeout(function () {
    $(document).trigger('trigger-list-filter-update', queryManager.getParameters());
  }, 1000);
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzZXMvYXV0b2NvbXBsZXRlLmpzIiwiY2xhc3Nlcy9saXN0LmpzIiwiY2xhc3Nlcy9tYXAuanMiLCJjbGFzc2VzL3F1ZXJ5LmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIkF1dG9jb21wbGV0ZU1hbmFnZXIiLCIkIiwiQVBJX0tFWSIsInRhcmdldCIsInRhcmdldEl0ZW0iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJxdWVyeU1nciIsIlF1ZXJ5TWFuYWdlciIsImdlb2NvZGVyIiwiZ29vZ2xlIiwibWFwcyIsIkdlb2NvZGVyIiwidHlwZWFoZWFkIiwiaGludCIsImhpZ2hsaWdodCIsIm1pbkxlbmd0aCIsImNsYXNzTmFtZXMiLCJtZW51IiwibmFtZSIsImRpc3BsYXkiLCJpdGVtIiwiZm9ybWF0dGVkX2FkZHJlc3MiLCJsaW1pdCIsInNvdXJjZSIsInEiLCJzeW5jIiwiYXN5bmMiLCJnZW9jb2RlIiwiYWRkcmVzcyIsInJlc3VsdHMiLCJzdGF0dXMiLCJvbiIsIm9iaiIsImRhdHVtIiwiZ2VvbWV0cnkiLCJ1cGRhdGVMb2NhdGlvbiIsImxvY2F0aW9uIiwibGF0IiwibG5nIiwiJHRhcmdldCIsImpRdWVyeSIsImluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayIsIkxpc3RNYW5hZ2VyIiwidGFyZ2V0TGlzdCIsInJlbmRlckV2ZW50IiwiZGF0ZSIsIm1vbWVudCIsInN0YXJ0X2RhdGV0aW1lIiwiZm9ybWF0IiwiZXZlbnRfdHlwZSIsInVybCIsInRpdGxlIiwidmVudWUiLCJyZW5kZXJHcm91cCIsImRldGFpbHMiLCIkbGlzdCIsInVwZGF0ZUZpbHRlciIsInAiLCJyZW1vdmVQcm9wIiwiYWRkQ2xhc3MiLCJmaWx0ZXIiLCJqb2luIiwicG9wdWxhdGVMaXN0IiwiJGV2ZW50TGlzdCIsIndpbmRvdyIsIkVWRU5UU19EQVRBIiwibWFwIiwiZmluZCIsInJlbW92ZSIsImFwcGVuZCIsIk1hcE1hbmFnZXIiLCJMIiwic2V0VmlldyIsInRpbGVMYXllciIsImF0dHJpYnV0aW9uIiwiYWRkVG8iLCIkbWFwIiwic2V0Q2VudGVyIiwiY2VudGVyIiwiem9vbSIsInVwZGF0ZSIsImxhdExuZyIsInRhcmdldEZvcm0iLCJlIiwicHJldmVudERlZmF1bHQiLCJ2YWwiLCJmb3JtIiwiZGVwYXJhbSIsInNlcmlhbGl6ZSIsImhhc2giLCJwYXJhbSIsInRyaWdnZXIiLCJpbml0aWFsaXplIiwiY2FsbGJhY2siLCJsZW5ndGgiLCJwYXJhbXMiLCJzdWJzdHJpbmciLCJmb3JFYWNoIiwicHJvcCIsImdldFBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidHJpZ2dlclN1Ym1pdCIsInF1ZXJ5TWFuYWdlciIsImluaXRQYXJhbXMiLCJtYXBNYW5hZ2VyIiwibGlzdE1hbmFnZXIiLCJldmVudCIsIm9wdGlvbnMiLCJhamF4IiwiZGF0YVR5cGUiLCJjYWNoZSIsInN1Y2Nlc3MiLCJkYXRhIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFDQSxJQUFNQSxzQkFBdUIsVUFBU0MsQ0FBVCxFQUFZO0FBQ3ZDOztBQUVBLE1BQU1DLFVBQVUseUNBQWhCOztBQUVBLFNBQU8sVUFBQ0MsTUFBRCxFQUFZOztBQUVqQixRQUFNQyxhQUFhLE9BQU9ELE1BQVAsSUFBaUIsUUFBakIsR0FBNEJFLFNBQVNDLGFBQVQsQ0FBdUJILE1BQXZCLENBQTVCLEdBQTZEQSxNQUFoRjtBQUNBLFFBQU1JLFdBQVdDLGNBQWpCO0FBQ0EsUUFBSUMsV0FBVyxJQUFJQyxPQUFPQyxJQUFQLENBQVlDLFFBQWhCLEVBQWY7O0FBRUFYLE1BQUVHLFVBQUYsRUFBY1MsU0FBZCxDQUF3QjtBQUNaQyxZQUFNLElBRE07QUFFWkMsaUJBQVcsSUFGQztBQUdaQyxpQkFBVyxDQUhDO0FBSVpDLGtCQUFZO0FBQ1ZDLGNBQU07QUFESTtBQUpBLEtBQXhCLEVBUVU7QUFDRUMsWUFBTSxnQkFEUjtBQUVFQyxlQUFTLGlCQUFDQyxJQUFEO0FBQUEsZUFBVUEsS0FBS0MsaUJBQWY7QUFBQSxPQUZY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QUNqQjtBQUNBaEgsUUFBRUksUUFBRixFQUFZdUYsT0FBWixDQUFvQixxQkFBcEI7QUFDQTNGLFFBQUVJLFFBQUYsRUFBWXVGLE9BQVosQ0FBb0IsNEJBQXBCLEVBQWtEVyxhQUFhSCxhQUFiLEVBQWxEO0FBQ0E7QUFDRDtBQVRJLEdBQVA7O0FBWUFjLGFBQVcsWUFBTTtBQUNmakgsTUFBRUksUUFBRixFQUFZdUYsT0FBWixDQUFvQiw0QkFBcEIsRUFBa0RXLGFBQWFILGFBQWIsRUFBbEQ7QUFDRCxHQUZELEVBRUcsSUFGSDtBQUlELENBbEVELEVBa0VHM0QsTUFsRUgiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vL0FQSSA6QUl6YVN5QnVqS1RSdzV1SVhwX05IWmdqWVZEdEJ5MWRieU51R0VNXG5jb25zdCBBdXRvY29tcGxldGVNYW5hZ2VyID0gKGZ1bmN0aW9uKCQpIHtcbiAgLy9Jbml0aWFsaXphdGlvbi4uLlxuXG4gIGNvbnN0IEFQSV9LRVkgPSBcIkFJemFTeUJ1aktUUnc1dUlYcF9OSFpnallWRHRCeTFkYnlOdUdFTVwiO1xuXG4gIHJldHVybiAodGFyZ2V0KSA9PiB7XG5cbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdHlwZW9mIHRhcmdldCA9PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpIDogdGFyZ2V0O1xuICAgIGNvbnN0IHF1ZXJ5TWdyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG5cbiAgICAkKHRhcmdldEl0ZW0pLnR5cGVhaGVhZCh7XG4gICAgICAgICAgICAgICAgaGludDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBoaWdobGlnaHQ6IHRydWUsXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAgIG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzZWFyY2gtcmVzdWx0cycsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogKGl0ZW0pID0+IGl0ZW0uZm9ybWF0dGVkX2FkZHJlc3MsXG4gICAgICAgICAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24gKHEsIHN5bmMsIGFzeW5jKXtcbiAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7IGFkZHJlc3M6IHEgfSwgZnVuY3Rpb24gKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgIGFzeW5jKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkub24oJ3R5cGVhaGVhZDpzZWxlY3RlZCcsIGZ1bmN0aW9uIChvYmosIGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgaWYoZGF0dW0pXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdmFyIGdlb21ldHJ5ID0gZGF0dW0uZ2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICBxdWVyeU1nci51cGRhdGVMb2NhdGlvbihnZW9tZXRyeS5sb2NhdGlvbi5sYXQoKSwgZ2VvbWV0cnkubG9jYXRpb24ubG5nKCkpO1xuICAgICAgICAgICAgICAgICAgLy8gIG1hcC5maXRCb3VuZHMoZ2VvbWV0cnkuYm91bmRzPyBnZW9tZXRyeS5ib3VuZHMgOiBnZW9tZXRyeS52aWV3cG9ydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cblxuICAgIHJldHVybiB7XG4gICAgICAkdGFyZ2V0OiAkKHRhcmdldEl0ZW0pLFxuICAgICAgdGFyZ2V0OiB0YXJnZXRJdGVtXG4gICAgfVxuICB9XG5cbn0oalF1ZXJ5KSk7XG5cbmNvbnN0IGluaXRpYWxpemVBdXRvY29tcGxldGVDYWxsYmFjayA9ICgpID0+IHtcbiAgLy9jb25zb2xlLmxvZygoXCJBdXRvY29tcGxldGUgaGFzIGJlZW4gaW5pdGlhbGl6ZWRcIikpO1xuICAvL2NvbnNvbGUubG9nKChBdXRvY29tcGxldGVNYW5hZ2VyKFwiaW5wdXRbbmFtZT0nc2VhcmNoLWxvY2F0aW9uJ11cIikpOyk7XG59O1xuIiwiLyogVGhpcyBsb2FkcyBhbmQgbWFuYWdlcyB0aGUgbGlzdCEgKi9cblxuY29uc3QgTGlzdE1hbmFnZXIgPSAoKCQpID0+IHtcbiAgcmV0dXJuICh0YXJnZXRMaXN0ID0gXCIjZXZlbnRzLWxpc3RcIikgPT4ge1xuICAgIGNvbnN0ICR0YXJnZXQgPSB0eXBlb2YgdGFyZ2V0TGlzdCA9PT0gJ3N0cmluZycgPyAkKHRhcmdldExpc3QpIDogdGFyZ2V0TGlzdDtcblxuICAgIGNvbnN0IHJlbmRlckV2ZW50ID0gKGl0ZW0pID0+IHtcblxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQoaXRlbS5zdGFydF9kYXRldGltZSkuZm9ybWF0KFwiZGRkZCDigKIgTU1NIEREIGg6bW1hXCIpO1xuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaSBjbGFzcz0nJHtpdGVtLmV2ZW50X3R5cGV9JyBkYXRhLWxhdD0nJHtpdGVtLmxhdH0nIGRhdGEtbG5nPScke2l0ZW0ubG5nfSc+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ0eXBlLWV2ZW50XCI+XG4gICAgICAgICAgPHVsIGNsYXNzPVwiZXZlbnQtdHlwZXMtbGlzdFwiPlxuICAgICAgICAgICAgPGxpPiR7aXRlbS5ldmVudF90eXBlfTwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIiR7aXRlbS51cmx9XCI+JHtpdGVtLnRpdGxlfTwvYT48L2gyPlxuICAgICAgICAgIDxoND4ke2RhdGV9PC9oND5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkcmVzcy1hcmVhXCI+XG4gICAgICAgICAgICA8cD4ke2l0ZW0udmVudWV9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxsLXRvLWFjdGlvblwiPlxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7aXRlbS51cmx9XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnlcIj5SU1ZQPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIGNvbnN0IHJlbmRlckdyb3VwID0gKGl0ZW0pID0+IHtcblxuICAgICAgcmV0dXJuIGBcbiAgICAgIDxsaT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInR5cGUtZ3JvdXBcIj5cbiAgICAgICAgICA8aDI+PGEgaHJlZj1cIi9cIj4ke2l0ZW0udGl0bGUgfHwgYEdyb3VwYH08L2E+PC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtZGV0YWlscy1hcmVhXCI+XG4gICAgICAgICAgICA8cD5Db2xvcmFkbywgVVNBPC9wPlxuICAgICAgICAgICAgPHA+JHtpdGVtLmRldGFpbHMgfHwgYDM1MCBDb2xvcmFkbyBpcyB3b3JraW5nIGxvY2FsbHkgdG8gaGVscCBidWlsZCB0aGUgZ2xvYmFsXG4gICAgICAgICAgICAgICAzNTAub3JnIG1vdmVtZW50IHRvIHNvbHZlIHRoZSBjbGltYXRlIGNyaXNpcyBhbmQgdHJhbnNpdGlvblxuICAgICAgICAgICAgICAgdG8gYSBjbGVhbiwgcmVuZXdhYmxlIGVuZXJneSBmdXR1cmUuYH1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FsbC10by1hY3Rpb25cIj5cbiAgICAgICAgICAgIDxhIGhyZWY9XCIke2l0ZW0udXJsfVwiIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCI+R2V0IEludm9sdmVkPC9hPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgICBgXG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAkbGlzdDogJHRhcmdldCxcbiAgICAgIHVwZGF0ZUZpbHRlcjogKHApID0+IHtcbiAgICAgICAgaWYoIXApIHJldHVybjtcblxuICAgICAgICAvLyBSZW1vdmUgRmlsdGVyc1xuICAgICAgICAvL2NvbnNvbGUubG9nKChcIkVOVEVSRUQhXCIpOyk7XG4gICAgICAgICR0YXJnZXQucmVtb3ZlUHJvcChcImNsYXNzXCIpO1xuICAgICAgICAkdGFyZ2V0LmFkZENsYXNzKHAuZmlsdGVyLmpvaW4oXCIgXCIpKVxuICAgICAgfSxcbiAgICAgIHBvcHVsYXRlTGlzdDogKCkgPT4ge1xuICAgICAgICAvL3VzaW5nIHdpbmRvdy5FVkVOVF9EQVRBXG4gICAgICAgIC8vY29uc29sZS5sb2coKFwiUG9wdWxhdGluZyAtLT4gXCIsIHdpbmRvdy5FVkVOVFNfREFUQSkpO1xuICAgICAgICB2YXIgJGV2ZW50TGlzdCA9IHdpbmRvdy5FVkVOVFNfREFUQS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0uZXZlbnRfdHlwZSAhPT0gJ0dyb3VwJyA/IHJlbmRlckV2ZW50KGl0ZW0pIDogcmVuZGVyR3JvdXAoaXRlbSk7XG4gICAgICAgIH0pXG4gICAgICAgICR0YXJnZXQuZmluZCgndWwgbGknKS5yZW1vdmUoKTtcbiAgICAgICAgJHRhcmdldC5maW5kKCd1bCcpLmFwcGVuZCgkZXZlbnRMaXN0KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59KShqUXVlcnkpO1xuIiwiXG5jb25zdCBNYXBNYW5hZ2VyID0gKCgkKSA9PiB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnKS5zZXRWaWV3KFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCAyKTtcblxuICAgIEwudGlsZUxheWVyKCdodHRwOi8ve3N9LnRpbGUub3NtLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3NtLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMg4oCiIDxhIGhyZWY9XCIvLzM1MC5vcmdcIj4zNTAub3JnPC9hPidcbiAgICB9KS5hZGRUbyhtYXApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICRtYXA6IG1hcCxcbiAgICAgIHNldENlbnRlcjogKGNlbnRlciA9IFszNC44ODU5MzA5NDA3NTMxNywgNS4wOTc2NTYyNTAwMDAwMDFdLCB6b29tID0gMTApID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygoXCJYWFhcIik7KTtcbiAgICAgICAgbWFwLnNldFZpZXcoY2VudGVyLCB6b29tKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IChwKSA9PiB7XG4gICAgICAgIGlmICghcCB8fCAhcC5sYXQgfHwgIXAubG5nICkgcmV0dXJuO1xuICAgICAgICAvL2NvbnNvbGUubG9nKChcIlRUVFwiLCBwKTspO1xuICAgICAgICBtYXAuc2V0VmlldyhMLmxhdExuZyhwLmxhdCwgcC5sbmcpLCAxMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoalF1ZXJ5KTtcbiIsImNvbnN0IFF1ZXJ5TWFuYWdlciA9ICgoJCkgPT4ge1xuICByZXR1cm4gKHRhcmdldEZvcm0gPSBcImZvcm0jZmlsdGVycy1mb3JtXCIpID0+IHtcbiAgICBjb25zdCAkdGFyZ2V0ID0gdHlwZW9mIHRhcmdldEZvcm0gPT09ICdzdHJpbmcnID8gJCh0YXJnZXRGb3JtKSA6IHRhcmdldEZvcm07XG4gICAgbGV0IGxhdCA9IG51bGw7XG4gICAgbGV0IGxuZyA9IG51bGw7XG5cbiAgICAkdGFyZ2V0Lm9uKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGF0ID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbCgpO1xuICAgICAgbG5nID0gJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbCgpO1xuXG4gICAgICB2YXIgZm9ybSA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgIGRlbGV0ZSBmb3JtWydzZWFyY2gtbG9jYXRpb24nXTtcblxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAkLnBhcmFtKGZvcm0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJy5maWx0ZXItaXRlbSBpbnB1dFt0eXBlPWNoZWNrYm94XScsICgpID0+IHtcbiAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemU6IChjYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSAkLmRlcGFyYW0od2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpKVxuICAgICAgICAgICR0YXJnZXQuZmluZChcImlucHV0W25hbWU9bGF0XVwiKS52YWwocGFyYW1zLmxhdCk7XG4gICAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sbmddXCIpLnZhbChwYXJhbXMubG5nKTtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZmlsdGVyKSB7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1cIikucmVtb3ZlUHJvcChcImNoZWNrZWRcIik7XG4gICAgICAgICAgICBwYXJhbXMuZmlsdGVyLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coKFwiLmZpbHRlci1pdGVtIGlucHV0W3R5cGU9Y2hlY2tib3hdW3ZhbHVlPVwiICsgaXRlbSArIFwiXVwiKTspO1xuICAgICAgICAgICAgICAkdGFyZ2V0LmZpbmQoXCIuZmlsdGVyLWl0ZW0gaW5wdXRbdHlwZT1jaGVja2JveF1bdmFsdWU9J1wiICsgaXRlbSArIFwiJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjayAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0UGFyYW1ldGVyczogKCkgPT4ge1xuICAgICAgICB2YXIgcGFyYW1ldGVycyA9ICQuZGVwYXJhbSgkdGFyZ2V0LnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgZGVsZXRlIHBhcmFtZXRlcnNbJ3NlYXJjaC1sb2NhdGlvbiddO1xuXG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJzO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZUxvY2F0aW9uOiAobGF0LCBsbmcpID0+IHtcbiAgICAgICAgJHRhcmdldC5maW5kKFwiaW5wdXRbbmFtZT1sYXRdXCIpLnZhbChsYXQpO1xuICAgICAgICAkdGFyZ2V0LmZpbmQoXCJpbnB1dFtuYW1lPWxuZ11cIikudmFsKGxuZyk7XG4gICAgICAgICR0YXJnZXQudHJpZ2dlcignc3VibWl0Jyk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclN1Ym1pdDogKCkgPT4ge1xuICAgICAgICAkdGFyZ2V0LnRyaWdnZXIoJ3N1Ym1pdCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSkoalF1ZXJ5KTtcbiIsIihmdW5jdGlvbigkKSB7XG5cbiAgLy8gMS4gZ29vZ2xlIG1hcHMgZ2VvY29kZVxuXG4gIC8vIDIuIGZvY3VzIG1hcCBvbiBnZW9jb2RlICh2aWEgbGF0L2xuZylcbiAgY29uc3QgcXVlcnlNYW5hZ2VyID0gUXVlcnlNYW5hZ2VyKCk7XG4gICAgICAgIHF1ZXJ5TWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgY29uc3QgaW5pdFBhcmFtcyA9IHF1ZXJ5TWFuYWdlci5nZXRQYXJhbWV0ZXJzKCk7XG4gIGNvbnN0IG1hcE1hbmFnZXIgPSBNYXBNYW5hZ2VyKCk7XG5cbiAgY29uc3QgbGlzdE1hbmFnZXIgPSBMaXN0TWFuYWdlcigpO1xuXG4gIGlmKGluaXRQYXJhbXMubGF0ICYmIGluaXRQYXJhbXMubG5nKSB7XG4gICAgbWFwTWFuYWdlci5zZXRDZW50ZXIoW2luaXRQYXJhbXMubGF0LCBpbml0UGFyYW1zLmxuZ10pO1xuICB9XG5cbiAgLy8gVGhpcyB3aWxsIHRyaWdnZXIgdGhlIGxpc3QgdXBkYXRlIG1ldGhvZFxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIGxpc3RNYW5hZ2VyLnBvcHVsYXRlTGlzdCgpO1xuICB9KTtcblxuICAkKGRvY3VtZW50KS5vbigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCAoZXZlbnQsIG9wdGlvbnMpID0+IHtcbiAgICAvL2NvbnNvbGUubG9nKChcIlhYWFhcIik7KTtcbiAgICBsaXN0TWFuYWdlci51cGRhdGVGaWx0ZXIob3B0aW9ucyk7XG4gIH0pXG5cbiAgJChkb2N1bWVudCkub24oJ3RyaWdnZXItbWFwLXVwZGF0ZScsIChldmVudCwgb3B0aW9ucykgPT4ge1xuICAgIG1hcE1hbmFnZXIuc2V0Q2VudGVyKFtvcHRpb25zLmxhdCwgb3B0aW9ucy5sbmddKTtcbiAgfSk7XG5cbiAgJCh3aW5kb3cpLm9uKFwiaGFzaGNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgY29uc3QgcGFyYW1ldGVycyA9ICQuZGVwYXJhbShoYXNoLnN1YnN0cmluZygxKSk7XG5cbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCd0cmlnZ2VyLWxpc3QtZmlsdGVyLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICAgICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScsIHBhcmFtZXRlcnMpO1xuICB9KVxuXG4gIC8vIDMuIG1hcmtlcnMgb24gbWFwXG5cbiAgLy8gNC4gZmlsdGVyIG91dCBpdGVtcyBpbiBhY3Rpdml0eS1hcmVhXG5cbiAgLy8gNS4gZ2V0IG1hcCBlbGVtZW50c1xuXG4gIC8vIDYuIGdldCBHcm91cCBkYXRhXG5cbiAgLy8gNy4gcHJlc2VudCBncm91cCBlbGVtZW50c1xuXG4gICQuYWpheCh7XG4gICAgdXJsOiAnaHR0cHM6Ly9kbmI2bGVhbmd4NmRjLmNsb3VkZnJvbnQubmV0L291dHB1dC8zNTBvcmcuanMuZ3onLCAvLyd8KipEQVRBX1NPVVJDRSoqfCcsXG4gICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgIGNhY2hlOiB0cnVlLFxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PiB7XG4gICAgICAvL2NvbnNvbGUubG9nKCh3aW5kb3cuRVZFTlRfREFUQSkpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LXVwZGF0ZScpO1xuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgICAgIC8vICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3RyaWdnZXItbWFwLXVwZGF0ZScpO1xuICAgIH1cbiAgfSk7XG5cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJChkb2N1bWVudCkudHJpZ2dlcigndHJpZ2dlci1saXN0LWZpbHRlci11cGRhdGUnLCBxdWVyeU1hbmFnZXIuZ2V0UGFyYW1ldGVycygpKTtcbiAgfSwgMTAwMCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
