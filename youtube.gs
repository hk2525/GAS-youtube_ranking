function getChannelData() {

  /****************************/
  /*  const element = document.querySelector(`[itemprop="channelId"]`);
  /*  const content = element.getAttribute("content");
  /*  console.log(content);
  /****************************/
  let channelIds = [
    "UCJcegeACQ9-2GxprHeaEb8Q", //shintaro
    "UClVxlTdjXCH02L9WtiPu_rg", //kanekin
    "UCdV_Sc1tEENX5LOzB-YLiaQ", //jin
    "UCRvM4zFmDz2cEiuk7d9C-3w", //na-suke
    "UCCJel9mmTsxDU9RiCwdiLiA", //saiyaman
    "UCuhPVNbY5AATKsU5RSEhbCQ", //yamasawa
    "UCb-YblEIoA8fdgfVhgG4tBA", //yokokawa
    "UCl4e200EZm7NXq_iaYSXfeg", //protan
    "UCHoOFVQAhK-QyoXgf0iaZIg", //azami
    
  ];


  for( let i=0; i<channelIds.length-1;i++){
    let j;
    console.log(i);
    console.log(channelIds.length);
    for( j=channelIds.length-1; j>i; j--){
      let results = YouTube.Channels.list("snippet,statistics", { id: channelIds[j] });
      let i_subscriberCount =  Number(results.items[0].statistics.subscriberCount).toLocaleString();
      results = YouTube.Channels.list("snippet,statistics", { id: channelIds[j-1] });
      let j_subscriberCount =  Number(results.items[0].statistics.subscriberCount).toLocaleString();
      if( j_subscriberCount > i_subscriberCount ){
        let tmp = channelIds[j-1];
        channelIds[j-1] = channelIds[j];
        channelIds[j] = tmp;
        //console.log(j_subscriberCount + ">" + i_subscriberCount);
        //console.log(channelIds[j] + ">" + channelIds[i]);
      }
    }
  }

  for( let i in channelIds){
    const results = YouTube.Channels.list("snippet,statistics", { id: channelIds[i] });
    const statistics = results.items[0].statistics;
    if(0){
      console.log("チャンネル名: " + results.items[0].snippet.title);
      console.log("登録者数: " + Number(statistics.subscriberCount).toLocaleString());
      console.log("全動画数: " + Number(statistics.videoCount).toLocaleString());
      console.log("全再生数: " + Number(statistics.viewCount).toLocaleString());
    }else{
      console.log("チャンネル名: " + results.items[0].snippet.title + "," +
      "登録者数: " + Number(statistics.subscriberCount).toLocaleString() + "," +
      "全動画数: " + Number(statistics.videoCount).toLocaleString() + "," +
      "全再生数: " + Number(statistics.viewCount).toLocaleString());

    }
  }

}

/**
 * Creates a spreadsheet containing daily view counts, watch-time metrics,
 * and new-subscriber counts for a channel's videos.
 */
function createReport() {
  // Retrieve info about the user's YouTube channel.
  const channels = YouTube.Channels.list('id,contentDetails', {
    mine: true
  });
  const channelId = "UCJcegeACQ9-2GxprHeaEb8Q"; //shintaro

  // Retrieve analytics report for the channel.
  const oneMonthInMillis = 1000 * 60 * 60 * 24 * 30;
  const today = new Date();
  const lastMonth = new Date(today.getTime() - oneMonthInMillis);

  const metrics = [
    'views',
    'estimatedMinutesWatched',
    'averageViewDuration',
    'subscribersGained'
  ];
  const result = YouTubeAnalytics.Reports.query({
    ids: 'channel==' + channelId,
    startDate: formatDateString(lastMonth),
    endDate: formatDateString(today),
    metrics: metrics.join(','),
    dimensions: 'day',
    sort: 'day'
  });

  if (!result.rows) {
    console.log('No rows returned.');
    return;
  }
  const spreadsheet = SpreadsheetApp.create('YouTube Analytics Report');
  const sheet = spreadsheet.getActiveSheet();

  // Append the headers.
  const headers = result.columnHeaders.map((columnHeader)=> {
    return formatColumnName(columnHeader.name);
  });
  sheet.appendRow(headers);

  // Append the results.
  sheet.getRange(2, 1, result.rows.length, headers.length)
      .setValues(result.rows);

  console.log('Report spreadsheet created: %s',
      spreadsheet.getUrl());
}

/**
 * Converts a Date object into a YYYY-MM-DD string.
 * @param {Date} date The date to convert to a string.
 * @return {string} The formatted date.
 */
function formatDateString(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Formats a column name into a more human-friendly name.
 * @param {string} columnName The unprocessed name of the column.
 * @return {string} The formatted column name.
 * @example "averageViewPercentage" becomes "Average View Percentage".
 */
function formatColumnName(columnName) {
  let name = columnName.replace(/([a-z])([A-Z])/g, '$1 $2');
  name = name.slice(0, 1).toUpperCase() + name.slice(1);
  return name;
}