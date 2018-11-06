(function () {

    angular
        .module('loginApp')
        .service('apiService', APIService);

    /* @ngInject */
    function APIService($rootScope, $http, $q, $window) {
        this.get = function (url, headers = {}) {
            var defer = $q.defer();
            $http({
                method: 'GET',
                url,
                headers
            }).then(function(response) {
                defer.resolve(response.data);
            }, function(err) {
                if(err.status === 401) {
                    $window.location.href = '/';
                }
                defer.reject(err);
            });
            return defer.promise;
        };

        this.post = function (url, body, headers = {}) {
            var defer = $q.defer();
            $http({
                method: 'POST',
                url,
                data: body,
                headers
            }).then(function(response) {
                defer.resolve(response.data);
            }, function(err) {
                if(err.status === 401) {
                    $window.location.href = '/';
                }
                defer.reject(err);
            });
            return defer.promise;
        };

        this.put = function (url, body, headers = {}) {
            var defer = $q.defer();
            $http({
                method: 'PUT',
                url,
                data: body,
                headers
            }).then(function(response) {
                defer.resolve(response.data);
            }, function(err) {
                if(err.status === 401) {
                    $window.location.href = '/';
                }
                defer.reject(err);
            });
            return defer.promise;
        };
    }

}());