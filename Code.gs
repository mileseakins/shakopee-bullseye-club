/** Read-only public feed for Shakopee Bullseye Club.
 * Create from the Google Sheet via Extensions > Apps Script.
 * Never put private information in the five public source tabs.
 */
const PUBLIC_TABS = {
  players: 'Players', teams: 'Teams', schedule: 'Schedule',
  results: 'Results', awards: 'Awards'
};
function doGet(e) {
  const callback = (e && e.parameter && e.parameter.callback) || '';
  // Only allow the exact callback expected by the website.
  if (callback !== 'receiveLeagueData') {
    return ContentService.createTextOutput('Callback not allowed');
  }
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const result = {};
    Object.keys(PUBLIC_TABS).forEach(key => {
      const sheet = book.getSheetByName(PUBLIC_TABS[key]);
      if (!sheet) throw new Error('Missing sheet: ' + PUBLIC_TABS[key]);
      const values = sheet.getDataRange().getDisplayValues();
      const headers = values.shift();
      result[key] = values.filter(row => row.some(v => String(v).trim()))
        .map(row => Object.fromEntries(headers.map((h,i) => [h, row[i] || ''])));
    });
    return ContentService.createTextOutput(callback+'('+JSON.stringify(result)+');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch(err) {
    return ContentService.createTextOutput(callback+'('+JSON.stringify({error:String(err.message)})+');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}
