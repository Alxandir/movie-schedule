(function () {

    angular
        .module('myApp')
        .service('apiService', APIService);

    /* @ngInject */
    function APIService($rootScope, $http, $q) {
        this.get = function (url, headers) {
            var defer = $q.defer();
            $http({
                method: 'GET',
                url,
                headers
            }).then(function successCallback(response) {
                defer.resolve(response.data);
            }, function errorCallback(response) {
                defer.reject(response);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
            return defer.promise;
        };

        this.post = function (url, body, headers) {
            var defer = $q.defer();
            $http({
                method: 'POST',
                url,
                data: body,
                headers
            }).then(function(response) {
                defer.resolve(response.data);
            }, function(err) {
                defer.reject(err);
            });
            return defer.promise;
        };

        this.put = function (url, body, headers) {
            var defer = $q.defer();
            $http({
                method: 'PUT',
                url,
                data: body,
                headers
            }).then(function(response) {
                defer.resolve(response.data);
            }, function(err) {
                defer.reject(err);
            });
            return defer.promise;
        };
    }

}());