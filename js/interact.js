import {
  showSignals,
  zoomAutoscale,
  zoomFit,
  zoomOut,
  zoomIn,
  removeAllSignals,
  dbg_setEnableUpdateRenderRange,
  dbg_setEnableRender,
  moveCursorTo,
  getCursorTime,
  getHighlightedSignal
} from './wave.js';

import {
  getTimeAnyTransition
} from './core.js';

import {
  simDB,
} from './core.js';

import {
  waveformDB
} from './core/WaveformDB.js';
import { showTree } from './tree.js';

// TODO should be moved somewhere else.
export var config = {};


$(".demo-file-button").click(function () {
  $.ajax({
    url: "parse-vcd",
    type: "POST",
    data: JSON.stringify({
      fname: $(this).attr('data-file'),
      other_fields: {
        a: 1,
        b: null
      }
    }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: initShow
  })
});

$("#zoom-fit").click(() => {
  zoomFit();
});

$("#zoom-autoscale").click(() => {
  zoomAutoscale();
});

$("#zoom-in").click(() => {
  zoomIn();
});

$("#zoom-out").click(() => {
  zoomOut();
});

$("#remove-all").click(() => {
  removeAllSignals();
});

$("#cursor-to-0").click(() => {
  moveCursorTo(0);
});

$("#cursor-to-end").click(() => {
  moveCursorTo(simDB.now);
});

$("#cursor-to-prev-transition").click(() => {
  const tCurr = getCursorTime();
  const sig = getHighlightedSignal();
  const tNew = getTimeAnyTransition(sig.simObj, tCurr, -1);
  moveCursorTo(tNew);
});

$("#cursor-to-next-transition").click(() => {
  const tCurr = getCursorTime();
  const sig = getHighlightedSignal();
  const tNew = getTimeAnyTransition(sig.simObj, tCurr, +1);
  moveCursorTo(tNew);
});

$( ".resizable-col" ).resizable({
  handles: "e"
  });

$("#dbg_updateRenderRange").click(() => {
  dbg_setEnableUpdateRenderRange($("#dbg_updateRenderRange").is(":checked"));
});

$("#dbg_enableRender").click(() => {
  dbg_setEnableRender($("#dbg_enableRender").is(":checked"));
});

$("#file-open-button").click(() => {
  $("#file-open-shadow").click();
});

$("#fileopenmenu").click(() => {
  $("#file-open-shadow").click();
});

$("#file-open-shadow").on('change', openFile);

function vcdpy2simDb(parsedContent) {
  parsedContent["signals"] = parsedContent["children"];
  delete parsedContent["children"];
  
  return parsedContent;
}

$.ajax({
  url: 'defaults.json',
  dataType: 'json',
  success: function (data) {
    config = data;

    $( ".resizable-col" ).resizable({
      handles: "e"
      });
  },
  error: function (data, textStatus, errorThrown) {
    alert(`While getting defaults.json: ${textStatus} ${errorThrown}`);
  }
})

function initShow(data){
  console.log(data);
  simDB.init(vcdpy2simDb(data));
  waveformDB.addAllWaveSignal();
  simDB.updateDBInitialX();
  showTree();

  console.log(simDB);

  setTimeout(() => {
    showSignals()
  }, 0)
}

function openFile(event) {
  var input = event.target;
  var reader = new FileReader();
  reader.readAsText(input.files[0], "UTF-8");
  reader.onload = function (evt) {
    console.log(evt.target.result);
    
    $.ajax({
      url: "parse-vcd",
      type: "POST",
      data: JSON.stringify({
        fname: input.files[0].name,
        content: evt.target.result
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: initShow
    })

  }
}


$(function() {
  $.contextMenu({
      selector: '.signal-context-menu', 
      callback: function(key, options) {
        // The element what has been right-clicked, (which opened the context menu)
        const element = options.$trigger;
        var waveformRow = d3.select(element).datum();
        console.log(waveformRow);
        switch (key) {
          case 'remove':
            waveformDB.removeRow(waveformRow)
            showSignals(false);
            break;
          default:
            break;
          } 
      },
      zIndex: 1100,
      items: {
          "remove": {name: "Remove", icon: "delete"},
          "sep1": "---------",
          "radix": {name: "Radix", icon: "Radix"},
          "waveStyle": {name: "Wave Style", icon: "waveStyle"},
      }
  });
});
