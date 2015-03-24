// App services will go here :)

angular.module('sifter.services', [])

.factory('Camera', ['$q', function($q) {
  var takePhoto = function(options) {
    var q = $q.defer();

      // use cordova camera plugin to take a picture
      navigator.camera.getPicture(function(result) {
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
  };

  return {
    takePhoto: takePhoto
  };
}])

.factory('ImgUpload', ['$http', 'Cloudinary', function($http, Cloudinary) {

  // Upload image to Cloudinary storage
  // api docs at http://cloudinary.com/documentation/upload_images#remote_upload
  var uploadImage = function(imageURI) {
    var timestamp = +new Date();

    // return a promise to get url from cloudinary
    return $http.post(Cloudinary.url, {
    // return $http.post('http://www.mockr.co/1/cflann/images', {
      // need to specify base64 encoding (see http://stackoverflow.com/questions/24014937/uploading-base64-hashed-image-to-cloudinary
      // and http://en.wikipedia.org/wiki/Data_URI_scheme#JavaScript)
      file: "data:image/jpeg;base64," + imageURI,
      api_key: Cloudinary.apiKey,
      timestamp: timestamp,
      signature: Cloudinary.getSignature(timestamp)
    });
  };

  return {
    uploadImage: uploadImage
  };
}])

.factory('SifterAPI', ['$http', function($http) {

  // Send image url to sifter's backend API
  var postImgUrl = function(data) {
    // return promise anticipating server response
    // return $http.post('http://www.mockr.co/1/cflann/items', {
    return $http.post('https://evening-castle-4681.herokuapp.com/api/imgurl', {
      locale: 'en_US',
      imgurl: data.url // TODO: double check this against Cloudinary API
    });
  };

  return {
    postImgUrl: postImgUrl
  };
}]);
