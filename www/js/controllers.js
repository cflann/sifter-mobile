// App controllers will go here :)
angular.module('sifter.controllers', [])

.controller('DashCtrl', function($scope, $location, $ionicLoading, $ionicPopup, Camera, ImgUpload, SifterAPI) {

  $scope.imageURL = 'Hello world';
  $scope.imageClassification;
  $scope.imageDescription;
  $scope.hasTrash = false;
  var temp;


  $scope.process = function() {
    console.log('Initiating Camera intent');
    Camera.takePhoto({
      destinationType : navigator.camera.DestinationType.DATA_URL
    })
    .then(function(encodedImage) {
      // show loading screen while awaiting response from server
      $scope.showLoading('Uploading...');
      // upload image to Cloudinary storage
      return ImgUpload.uploadImage(encodedImage);
    }, function(err) {
      // hide loading screen if something goes wrong
      $scope.hideLoading();
      console.error('CAMERA ERROR:', err);
    })
    .then(function(response) {
      console.log('SUCCESSFUL UPLOAD:', response);
      // set our most recently scanned item url
      temp = transformURL(response.data.url, 1000);
      // change loading message
      $scope.showLoading('Classifying...');
      // forward resulting url to server for classification
      return SifterAPI.postImgUrl(response.data);
    })
    .then(function(response) {
      console.log('SUCCESSFUL CLASSIFICATION:', response);
      var data = response.data;
      $scope.hideLoading();
      // set info for "Recently Sifted" card
      $scope.imageClassification = data.classification.toUpperCase();
      $scope.imageDescription = data.description.name.toUpperCase();
      $scope.imageURL = temp;
      $scope.showClassification(capitalize(data.classification));
      // show our most recently scanned image
      $scope.hasTrash = true;
    })
    .catch(function(err) {
      console.error('ERROR:', err);
      $scope.hideLoading();
    });
  };

  // displays an ionic loading screen
  $scope.showLoading = function(message) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><div style="margin-top:5px">'+message+'</div>'
    });
  };

  // hides our ionic loading screen
  $scope.hideLoading = function(){
    $ionicLoading.hide();
  };

  // display our result as an ionic popup
  $scope.showClassification = function(classification) {
    var confirm = $ionicPopup.confirm({
      title: classification,
      template: '<img class="popup-image" src="'+images[classification]+'"><div>Scan another item?</div>',
      buttons: [
        { text: 'Cancel',
          onTap: function() {
            return false;
          }
        },
        {
          text: '<i class="icon ion-camera"></i>',
          type: 'button-positive',
          onTap: function() {
            return true;
          }
        }
      ]
    });

    // check if the user would like to scan another item
    confirm.then(function(res) {
      if (res) {
        console.log('Scanning another item');
        $scope.getPhoto();
      } else {
        console.log('Done scanning items');
        // TODO: refresh cards

      }
    })
  };

  // capitalize a string
  var capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  };

  // Cloudinary allows you do apply transformations before grabbing
  // them. Here, we are getting a square (size x size) version of our
  // image, retaining the original proportions (cropping the image).
  var transformURL = function(url, size) {
    var index = url.indexOf('/upload/') + 8;
    var endIndex = url.indexOf('/', index);
    var start = url.substr(0, index);
    var end = url.substr(endIndex);
    return start + 'w_' + size + ',h_' + size + ',c_fill' + end;
  };

  var images = {
    'Compost': './img/compostee.png',
    'Recycle': './img/recyclee.png',
    'Landfill': './img/trashee.png'
  };

});
