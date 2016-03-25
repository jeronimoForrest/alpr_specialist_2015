var WS_PROTOCOL = 'http'
var WS_HOST = '10.0.0.1'
var WS_PORT = '9000'
var WS_API_VERSION = 'v1/'
var WS_ROUTE = '/api/'
var WS_URL = WS_PROTOCOL + '://' + WS_HOST + ':' + WS_PORT + WS_ROUTE + WS_API_VERSION

var TBL_HEADER_ARR = [];
TBL_HEADER_ARR[0] = ['id', 'Id'];
TBL_HEADER_ARR[1] = ['date', 'Date'];
TBL_HEADER_ARR[2] = ['plate', 'Plate Number'];
TBL_HEADER_ARR[3] = ['proc_time_ms', 'Elapsed Time'];
TBL_HEADER_ARR[4] = ['confidence', 'Best Guess'];
TBL_HEADER_ARR[5] = ['hash', 'Photo'];

$(document).ready(function () {
	getResults();
});

function getResults() {
    $('#alpr-results-add').empty();
    var results = [];
    var tblTitle = 'ALPR Results';
    var tblId = 'alpr-results';

    var tblHeaders = '';
    for (var i = 0; i < TBL_HEADER_ARR.length; i++) {
        tblHeaders += '<th>' + TBL_HEADER_ARR[i][1] + '</th>';
    }

    var tblHtml = '';

    tblHtml += '<h3>' + tblTitle + '</h3>';
    tblHtml += '<div class="table-responsive" style="overflow-x: auto; overflow-y: auto;">';
    tblHtml += '<table id="' + tblId + '" cellpadding="0" cellspacing="0" border="0" width="100%" class="table table-striped table-bordered table-hover table-condensed">';
    tblHtml += '<thead>';
    tblHtml += '<tr>';
    tblHtml += tblHeaders;
    tblHtml += '</tr>';
    tblHtml += '</thead>';
    tblHtml += '<tfoot>';
    tblHtml += '<tr>';
    tblHtml += tblHeaders;
    tblHtml += '</tr>';
    tblHtml += '</tfoot>';
    tblHtml += '<tbody></tbody>';
    tblHtml += '</table>';
    tblHtml += '</div>';

    $('#alpr-results-add').html(tblHtml);

    $('#' + tblId + ' tfoot th').each( function () {
        var title = $('#' + tblId + ' thead th').eq( $(this).index() ).text();
        $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
    } );

    var table = $('#' + tblId).DataTable({
    dom: 'C<"clear">lfrtip',
    stateSave: true,
    // save the state for the session only
    "stateDuration": -1,
    "pagingType": "full_numbers",
    "columns": [
        { "data": TBL_HEADER_ARR[0][0] },
        { "data": TBL_HEADER_ARR[1][0] },
        { "data": TBL_HEADER_ARR[2][0] },
        { "data": TBL_HEADER_ARR[3][0],
	  "render": function (data, type, full, meta) {
	      ret = parseInt(data).toFixed(0) + " ms";
	      return ret;
          }
	},
        { "data": TBL_HEADER_ARR[4][0],
          "render": function (data, type, full, meta) {
              ret = data.toFixed(2) + "%";
	      return ret
          }
        },
        { "data": TBL_HEADER_ARR[5][0],
          "render": function (data, type, full, meta) {
              ret =  "<img src=/images/" + data[0] + "/" + data + " width='100' height='100'>";
              return ret;
          }
        }
    ],
    colVis: {
        restore: "Restore",
        showAll: "Show all"
    }
    });

    var reqUrl = WS_URL + 'results'

    function draw_data() {
        $.getJSON( reqUrl, function(json) {
            if (json.length) {
                table.clear();
                table.rows.add(json).draw();
            }
        })
    }

    setInterval(draw_data, 1000);

    return table;
}
