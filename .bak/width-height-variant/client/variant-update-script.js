/**
  * rangeToJSON
  * @summary create json file from Google Speadsheet
  * @param {String} columnName -
  * @param {String} rowName -
  * @param {Number} initRow -
  * @param {Number} initCol -
  * @param {Number} numRows -
  * @param {Number} numCols -
  * @return {String} new json RC variants object
*/
function rangeToJSON(columnName, rowName, initRow, initCol, numRows, numCols) {
  var result = [];
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(initRow, initCol, numRows, numCols);
  var widths = sheet.getRange(initRow - 1, initCol, 1, numCols).getValues()[0];
  var heights = sheet.getRange(initRow, initCol - 1, numRows, 1).getValues().reduce(function(finalArray, row){
    return finalArray.concat(row);
  }, []);
  for (var i = 0; i < numRows; i++) {
    for (var j = 0; j < numCols; j++) {
      var cell = range.getCell(i + 1,j + 1);
      var item = {};
      item.value = cell.getValue();
      item[rowName] = heights[i];
      item[columnName] = widths[j];
      result.push(item);
    }
  }

  return JSON.stringify(result, null, '  ');
}
