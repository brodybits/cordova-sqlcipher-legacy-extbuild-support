/* 'use strict'; */

var MYTIMEOUT = 12000;

var DEFAULT_SIZE = 5000000; // max to avoid popup in safari/ios

var isWindows = /Windows /.test(navigator.userAgent);
var isAndroid = !isWindows && /Android/.test(navigator.userAgent);

var pluginScenarioList = [ isAndroid ? 'Plugin-sqlite-connector' : 'Plugin', 'Plugin-android.database' ];

var pluginScenarioCount = isAndroid ? 2 : 1;

var mytests = function() {

  for (var i=0; i<pluginScenarioCount; ++i) {

    describe(pluginScenarioList[i] + ': pre-populated test(s)', function() {
      var scenarioName = pluginScenarioList[i];
      var suiteName = scenarioName + ': ';
      var isOldDatabaseImpl = (i === 1);

      it(suiteName + 'preliminary cleanup',
        function(done) {
          expect(true).toBe(true);
          window.sqlitePlugin.deleteDatabase({name: 'pre.db', location: 0}, done, done);
        }, MYTIMEOUT);

      it(suiteName + 'Pre-populated database test',
        function(done) {
          var dbc1 = window.sqlitePlugin.openDatabase({
            name: 'pre.db',
            location: 0,
            createFromLocation: 1,
            androidDatabaseImplementation: isOldDatabaseImpl ? 2 : 0
          });

          expect(dbc1).toBeDefined()

          var check1 = false;

          dbc1.transaction(function(tx) {

            expect(tx).toBeDefined()

            tx.executeSql('SELECT * from tt', [], function(tx, res) {
              expect(res.rows.item(0).testcol).toEqual('Test-Value');
              check1 = true;

              // try some changes:
              tx.executeSql('DELETE FROM tt');
              tx.executeSql('INSERT INTO tt VALUES (?)', ['new-value']);
            });
          }, function(e) {
            expect(false).toBe(true);
            dbc1.close();
            done();
          }, function() {
            expect(check1).toBe(true);
            dbc1.close(function() {
              // try opening it again:
              var dbc2 = window.sqlitePlugin.openDatabase({
                name: 'pre.db',
                location: 0,
                createFromLocation: 1,
                androidDatabaseImplementation: isOldDatabaseImpl ? 2 : 0
              });

              var check2 = false;

              dbc2.transaction(function(tx) {
                expect(tx).toBeDefined()

                // verify that the changes were not overwritten:
                tx.executeSql('SELECT * from tt', [], function(tx, res) {
                  expect(res.rows.item(0).testcol).toEqual('new-value');
                  check2 = true;
                });
              }, function(e) {
                expect(false).toBe(true);
                dbc2.close();
                done();
              }, function() {
                expect(check2).toBe(true);
                dbc2.close();
                done();
              });
            });
          });
        }, MYTIMEOUT);

    });
  };
}

if (window.hasBrowser) mytests();
else exports.defineAutoTests = mytests;

/* vim: set expandtab : */
