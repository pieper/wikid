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

    var shortName = 'Wikid';
    var version = '0.1';
    var displayName = 'Wikid';
    var maxSize = 65536;
    db = openDatabase('wikid', version, displayName, maxSize);

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
                ['h', 'h'],
                function(){},
                errorHandler
            );
        }
    );
});

function saveSettings() {
    localStorage.age = $('#NumberOfResults').val();
    jQT.goBack();
    return false;
}

function loadSettings() {
    $('#NumberOfResults').val(localStorage.age);
}

function search() {
    var searchString = $('#searchString').val();
    var numberOfResults = $('#NumberOfResults').val();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM dictionary WHERE english = ? ORDER BY english LIMIT ?;',
                [searchString, numberOfResults],
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        var newEntryRow = $('#resultTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.data('entryId', row.id);
                        newEntryRow.data('type', 'dynamic');
                        newEntryRow.appendTo('#searchResults ul');
                        newEntryRow.find('.english').text(row.english);
                        newEntryRow.find('.spanish').text(row.spanish);
                        ;
                    }
                    if (result.rows.length > numberOfResults-1) {
                        var newEntryRow = $('#resultTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.appendTo('#searchResults ul');
                        newEntryRow.find('.english').text("More...");
                        newEntryRow.find('.spanish').text("");
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

