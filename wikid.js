var db;
var jQT = $.jQTouch({
    icon: 'wikid-icon.png',
    startupScreen: 'wikid-startup.png',
    statusBar: 'black'
});
var query;

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
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO dictionary (english, spanish) VALUES (?, ?);',
                ['hello', 'hola'],
                function(){},
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
    query = 'SELECT * FROM dictionary WHERE english GLOB \'' + searchString + '*\' ' + 'ORDER BY english LIMIT ' + numberOfResults + ';';
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                query,
                [],
                function (transaction, result) {
                    var searchResults = $('#searchResults ul');
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
                            newEntryRow.find('.english').text(row.english);
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

