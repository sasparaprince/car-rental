// export.js
// const XLSX = require('xlsx');
import { MongoClient } from 'mongodb';

export function exportToExcel() {
  MongoClient.connect('mongodb://127.0.0.1:27017/Car-Rental', function(err, db) {
    if (err) throw err;
    var collection = db.collection('cardbs');
    collection.find().toArray(function(err, data) {
      if (err) throw err;
      var workbook = XLSX.utils.book_new();
      var sheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
      XLSX.writeFile(workbook, 'data.xlsx');
      db.close();
    });
  });
}
