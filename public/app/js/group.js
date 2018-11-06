angular.module('myApp').controller('GroupController', function ($scope, apiService) {
    $scope.$on('getGroup', function (e) {
        $scope.getGroup();
    });

    $scope.getGroup = function () {
        apiService.get('/api/groups').then(result => {
            $scope.group = result;
        }).catch(err => {
            console.log(err);
        })
    }

    function copyToClipboard(element) {
        // create temp element
        var copyElement = document.createElement("span");
        copyElement.appendChild(document.createTextNode(element));
        copyElement.id = 'tempCopyToClipboard';
        angular.element(document.body.append(copyElement));

        // select the text
        var range = document.createRange();
        range.selectNode(copyElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        // copy & cleanup
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        copyElement.remove();
    }

    $scope.toClipboard = function () {
        copyToClipboard($scope.group.id);
    }
});
