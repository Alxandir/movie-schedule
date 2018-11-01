exports.parseQuery = function(query){
    var selector = {};
    var queries = query.split('&');
    for (var i = 0; i < queries.length; i++) {
        var item = queries[i];
        if (item.indexOf('.') > -1) {
            var tempSelector = {};
            var overall = item.split('=')[0];
            var subs = overall.split('.').length - 1;
            var value = item.split('=')[1];


            tempSelector[overall.split('.')[subs]] = value;
            console.log(tempSelector);
            for (var j = subs - 1; j > -1; j--) {
                var temp = {};
                var field = item.split('.')[j];
                temp["$elemMatch"] = tempSelector;
                console.log(temp);
                tempSelector = {};
                if (j == 0) {
                    selector[field] = temp;
                } else {
                    tempSelector[field] = temp;
                }
                console.log(tempSelector);
            }
        } else {
            var field = item.split('=')[0];
            var value = item.split('=')[1];
            selector[field] = value;
        }
    }
    return selector;
}