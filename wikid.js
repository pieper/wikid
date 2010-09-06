var db;
var jQT = $.jQTouch({
    icon: 'wikid-icon.png',
    startupScreen: 'wikid-startup.png',
    statusBar: 'black'
});

$(document).ready(function() {
    $('#home form').submit(search);
    $('#settings form').submit(saveSettings);
    $('#settings').bind('pageAnimationStart', loadSettings);

    var version = '0.1';
    var displayName = 'Wikid';
    var maxSize = 65536;
    db = openDatabase('wikid', version, displayName, maxSize);

    if (localStorage.numberOfResults == undefined) {
        localStorage.numberOfResults = 10
    }

    // load the database if it hasn't be loaded yet
    var query = 'SELECT * FROM dictionary WHERE english = \'Man\';';
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                query,
                [],
                function (transaction, result) {
                    if (result.rows.length <= 0 ) {
                        loadDatabase();
                    }
                },
                errorHandler
            );
        }
    );
});


function saveSettings() {
    localStorage.numberOfResults = $('#NumberOfResults').val();
    jQT.goBack();
    return false;
}

function loadSettings() {
    $('#NumberOfResults').val(localStorage.numberOfResults);
}

function search() {
    var searchString = $('#searchString').val();
    var numberOfResults = localStorage.numberOfResults;
    var query = 'SELECT * FROM dictionary WHERE english GLOB \'' + searchString + '*\' ' + ' OR spanish GLOB \'' + searchString + '*\' ORDER BY english LIMIT ' + numberOfResults + ';';
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                query,
                [],
                function (transaction, result) {
                    $('li').remove(':contains("...")');
                    if (result.rows.length <= 0 ) {
                        var newEntryRow = $('#resultTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.appendTo(searchResults);
                        newEntryRow.find('.english').text("No Matches");
                        newEntryRow.find('.spanish').text("");
                    } else {
                        for (var i=0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            var newEntryRow = $('#resultTemplate').clone();
                            newEntryRow.removeAttr('id');
                            newEntryRow.removeAttr('style');
                            newEntryRow.data('entryId', row.id);
                            newEntryRow.data('type', 'dynamic');
                            newEntryRow.appendTo(searchResults);
                            newEntryRow.find('.english').text(row.english + "   ...   ");
                            newEntryRow.find('.spanish').text(row.spanish);
                            ;
                        }
                        if (result.rows.length > numberOfResults-1) {
                            var newEntryRow = $('#resultTemplate').clone();
                            newEntryRow.removeAttr('id');
                            newEntryRow.removeAttr('style');
                            newEntryRow.appendTo(searchResults);
                            newEntryRow.find('.english').text("More...");
                            newEntryRow.find('.spanish').text("");
                        }
                    }
                },
                errorHandler
            );
        }
    );
    return false;
}

function errorHandler(transaction, error) {
    alert('Oops. Error was '+error.message+' (Code '+error.code+')');
    return true;
}


function loadDictionaryItem(eng, esp) {
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO dictionary (english, spanish) VALUES (?, ?);',
                [eng, esp],
                function(){},
                errorHandler
            );
        }
    );
}

function loadDatabase () {
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'DROP TABLE dictionary'
            );
        }
    );
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS dictionary ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                ' english DATE NOT NULL, ' +
                ' spanish INTEGER NOT NULL );'
            );
        }
    );

    loadEn2Es();
}
